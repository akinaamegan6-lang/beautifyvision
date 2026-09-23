from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import certifi
import os
import json
import logging
import base64
import re
import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient

# Corrige automatiquement l'erreur SSL "CERTIFICATE_VERIFY_FAILED" que macOS
# peut renvoyer quand Python ne trouve pas de certificats racine valides.
# Plus besoin de faire `export SSL_CERT_FILE=...` a la main avant de lancer uvicorn.
os.environ.setdefault("SSL_CERT_FILE", certifi.where())

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from catalog import CATALOG, CATEGORIES  # noqa: E402
from auth import build_router as build_auth_router, seed_admin  # noqa: E402

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "")

# MongoDB
mongo_client = AsyncIOMotorClient(os.environ["MONGO_URL"], tlsCAFile=certifi.where())
db = mongo_client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Auth router
auth_router, current_user = build_auth_router(db)
api_router.include_router(auth_router)

@app.on_event("startup")
async def _startup():
    await seed_admin(db)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ============ Schemas ============
class Product(BaseModel):
    id: str
    category: str
    parent: str
    name: str
    brand: str
    price: float
    rating: float
    reviews: int
    image: str
    tags: List[str] = []
    skin_types: List[str] = []
    hair_types: List[str] = []
    benefits: List[str] = []
    color_hex: Optional[str] = None
    zone: Optional[str] = None
    affiliate_url: str = "#"


BLOG_CATEGORIES = {"skincare", "maquillage", "cheveux", "corps", "ingredients", "conseils"}


class Article(BaseModel):
    id: str
    title: str
    slug: str
    category: str
    excerpt: str
    image: Optional[str] = None
    hero_image: Optional[str] = None
    read_minutes: int = 5
    published_at: str
    chapo: Optional[str] = None
    blocks: List[dict] = []
    # SEO : balise <title> et meta description dediees. Si absentes (vieil
    # article, ou creees hors API), le front retombe sur title/excerpt.
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None


class ArticleCreate(BaseModel):
    title: str
    category: str
    excerpt: str
    image: Optional[str] = None
    hero_image: Optional[str] = None
    read_minutes: int = 5
    chapo: Optional[str] = None
    blocks: List[dict] = []
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None


class Comment(BaseModel):
    id: str
    article_id: str
    name: str
    text: str
    created_at: str


class CommentCreate(BaseModel):
    name: str
    text: str


class AISelectRequest(BaseModel):
    prompt: str = ""
    skin_tone_hex: str = "#E2BFA0"
    undertone: str = "neutral"  # warm | cool | neutral
    budget_max: float = 200.0


class AISelectProduct(BaseModel):
    product_id: str
    zone: str  # lips | eyes | cheeks | face
    color_hex: str
    reason: str


class AISelectResponse(BaseModel):
    products: List[AISelectProduct]
    summary: str


class ApplyMakeupRequest(BaseModel):
    image_base64: str  # raw base64, no data:image prefix
    colors: dict  # {lips: "#hex", eyes: "#hex", cheeks: "#hex"}
    look_description: str = ""


class ApplyMakeupResponse(BaseModel):
    image_base64: str
    mime_type: str = "image/png"


# ============ Routes ============
@api_router.get("/")
async def root():
    return {"app": "BeautifyVision", "version": "1.0.0"}


@api_router.get("/categories")
async def get_categories():
    return CATEGORIES


@api_router.get("/products", response_model=List[Product])
async def list_products(
    category: Optional[str] = None,
    parent: Optional[str] = None,
    min_price: float = 0,
    max_price: float = 1000,
    sort: str = "price_asc",
    search: Optional[str] = None,
):
    items = [p for p in CATALOG]
    if category:
        items = [p for p in items if p["category"] == category]
    if parent:
        items = [p for p in items if p["parent"] == parent]
    items = [p for p in items if min_price <= p["price"] <= max_price]
    if search:
        s = search.lower()
        items = [p for p in items if s in p["name"].lower() or s in p["brand"].lower()]

    if sort == "price_asc":
        items.sort(key=lambda p: p["price"])
    elif sort == "price_desc":
        items.sort(key=lambda p: -p["price"])
    elif sort == "rating":
        items.sort(key=lambda p: -p["rating"])
    elif sort == "popular":
        items.sort(key=lambda p: -p["reviews"])
    return items


@api_router.get("/products/top", response_model=List[Product])
async def top_products(parent: str = "cosmetiques", limit: int = 10):
    items = [p for p in CATALOG if p["parent"] == parent]
    items.sort(key=lambda p: (-p["rating"], -p["reviews"]))
    return items[:limit]


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    for p in CATALOG:
        if p["id"] == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")


# ============ AI Endpoints ============
def _extract_json(text: str) -> dict:
    """Best-effort JSON extraction from LLM output."""
    # Try direct
    try:
        return json.loads(text)
    except Exception:
        pass
    # Try fenced
    m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            pass
    # Try first {...}
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            pass
    return {}


@api_router.post("/ai/select-products", response_model=AISelectResponse)
async def ai_select_products(req: AISelectRequest):
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY missing")

    # Candidate pool: cosmetiques within budget
    candidates = [p for p in CATALOG if p["parent"] == "cosmetiques" and p["price"] <= req.budget_max]
    # Keep useful fields only to limit token count
    slim = [
        {
            "id": p["id"],
            "name": p["name"],
            "brand": p["brand"],
            "category": p["category"],
            "price": p["price"],
            "color_hex": p.get("color_hex"),
            "zone": p.get("zone"),
            "tags": p.get("tags", []),
            "benefits": p.get("benefits", []),
        }
        for p in candidates
    ]

    from anthropic import AsyncAnthropic

    system_msg = (
        "Tu es BeautifyVision AI, une experte beauté qui sélectionne des produits de maquillage "
        "adaptés au teint et au look demandé. Tu réponds UNIQUEMENT en JSON valide, sans texte autour. "
        "Choisis 3 à 5 produits cosmétiques parmi la liste fournie qui forment un look cohérent et "
        "couvrent au moins les zones lips, eyes et cheeks quand c'est pertinent. "
        "Format strict :\n"
        "{\n"
        '  "products": [\n'
        '    {"product_id": "<id>", "zone": "lips|eyes|cheeks|face", "color_hex": "#RRGGBB", "reason": "<courte raison>"}\n'
        "  ],\n"
        '  "summary": "<résumé du look en 1 phrase>"\n'
        "}"
    )

    user_text = (
        f"Teint utilisatrice (HEX): {req.skin_tone_hex}\n"
        f"Sous-ton: {req.undertone}\n"
        f"Budget max: {req.budget_max}€\n"
        f"Demande utilisatrice: {req.prompt or 'maquillage qui sublime mon teint naturellement'}\n\n"
        f"Liste des produits disponibles (JSON):\n{json.dumps(slim, ensure_ascii=False)}\n\n"
        "Réponds uniquement avec le JSON demandé."
    )

    client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

    try:
        message = await client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=2000,
            system=system_msg,
            messages=[{"role": "user", "content": user_text}],
        )
        response = "".join(block.text for block in message.content if block.type == "text")
    except Exception as e:
        logger.exception("Claude error: %s", e)
        raise HTTPException(status_code=502, detail=f"AI selection failed: {e}")

    parsed = _extract_json(response)
    products = parsed.get("products", [])
    summary = parsed.get("summary", "Look personnalisé BeautifyVision")

    # Validate product_ids exist
    valid_ids = {p["id"] for p in CATALOG}
    cleaned = []
    for item in products:
        pid = item.get("product_id")
        if pid in valid_ids:
            cleaned.append(AISelectProduct(
                product_id=pid,
                zone=item.get("zone", "face"),
                color_hex=item.get("color_hex", "#C68D78"),
                reason=item.get("reason", ""),
            ))

    if not cleaned:
        # Fallback: pick top-rated covering zones
        seen_zones = set()
        for p in sorted(candidates, key=lambda x: -x.get("rating", 0)):
            z = p.get("zone")
            if z and z not in seen_zones:
                cleaned.append(AISelectProduct(
                    product_id=p["id"],
                    zone=z,
                    color_hex=p.get("color_hex") or "#C68D78",
                    reason="Sélection automatique",
                ))
                seen_zones.add(z)
            if len(cleaned) >= 4:
                break

    return AISelectResponse(products=cleaned, summary=summary)


@api_router.post("/ai/apply-makeup", response_model=ApplyMakeupResponse)
async def ai_apply_makeup(req: ApplyMakeupRequest):
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY missing")

    from google import genai
    from google.genai import types

    lips = req.colors.get("lips", "")
    eyes = req.colors.get("eyes", "")
    cheeks = req.colors.get("cheeks", "")

    prompt = (
        "Apply realistic makeup to the woman in this photo while keeping her face, identity, "
        "skin tone, hair, background and pose perfectly intact. "
        "Only modify the makeup zones described. Result must be photorealistic, soft, blended, natural.\n"
    )
    if lips:
        prompt += f"- Lips: apply a {lips} lipstick, smooth and well-defined.\n"
    if eyes:
        prompt += f"- Eyes: apply soft {eyes} eyeshadow on the eyelids and subtle eyeliner.\n"
    if cheeks:
        prompt += f"- Cheeks: blush of color {cheeks} on the cheekbones with a soft glow.\n"
    if req.look_description:
        prompt += f"Overall look: {req.look_description}.\n"
    prompt += "Output a clean portrait, same framing, same person."

    client = genai.Client(api_key=GOOGLE_API_KEY)

    image_bytes = base64.b64decode(req.image_base64)
    input_mime = "image/png" if image_bytes[:8] == b"\x89PNG\r\n\x1a\n" else "image/jpeg"

    try:
        response = await client.aio.models.generate_content(
            model="gemini-3.1-flash-image",
            contents=[
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type=input_mime),
            ],
            config=types.GenerateContentConfig(response_modalities=["Image", "Text"]),
        )
    except Exception as e:
        logger.exception("Nano Banana error: %s", e)
        raise HTTPException(status_code=502, detail=f"Makeup application failed: {e}")

    out_data = None
    out_mime = "image/png"
    candidates = response.candidates or []
    if candidates and candidates[0].content and candidates[0].content.parts:
        for part in candidates[0].content.parts:
            if part.inline_data is not None:
                out_data = part.inline_data.data
                out_mime = part.inline_data.mime_type or "image/png"
                break

    if not out_data:
        # Fallback: return original
        return ApplyMakeupResponse(image_base64=req.image_base64, mime_type="image/png")

    return ApplyMakeupResponse(image_base64=base64.b64encode(out_data).decode("utf-8"), mime_type=out_mime)


# ============ Blog ============
@api_router.get("/blog/articles", response_model=List[Article])
async def list_articles(category: Optional[str] = None, q: Optional[str] = None, limit: int = 50):
    query: dict = {}
    if category and category != "tous":
        query["category"] = category
    if q:
        safe_q = re.escape(q.strip())
        query["$or"] = [
            {"title": {"$regex": safe_q, "$options": "i"}},
            {"excerpt": {"$regex": safe_q, "$options": "i"}},
        ]
    cursor = db.articles.find(query, {"_id": 0}).sort("published_at", -1).limit(limit)
    return await cursor.to_list(length=limit)


def _plain_text(value: Optional[str]) -> str:
    """Enleve la syntaxe interne des titres ('\\n' et '{{...}}') pour obtenir
    du texte brut, utilisable notamment en repli pour les balises SEO."""
    if not value:
        return ""
    text = value.replace("\n", " ")
    text = re.sub(r"\{\{(.+?)\}\}", r"\1", text)
    return text.strip()


@api_router.post("/blog/articles", response_model=Article)
async def create_article(req: ArticleCreate, user: dict = Depends(current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Reserve aux administrateurs")
    if req.category not in BLOG_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Categorie invalide. Attendu: {sorted(BLOG_CATEGORIES)}")
    slug_base = re.sub(r"[^a-z0-9]+", "-", req.title.lower()).strip("-") or "article"
    slug = slug_base
    i = 2
    while await db.articles.find_one({"slug": slug}):
        slug = f"{slug_base}-{i}"
        i += 1
    # SEO : si meta_title / meta_description ne sont pas fournis, on genere
    # un repli automatique a partir du titre et de l'extrait, pour qu'aucun
    # article ne se retrouve jamais sans balises SEO.
    meta_title = req.meta_title or f"{_plain_text(req.title)} | Beautify Vision"
    meta_description = req.meta_description or req.excerpt
    doc = {
        "id": f"art_{uuid.uuid4().hex[:12]}",
        "title": req.title,
        "slug": slug,
        "category": req.category,
        "excerpt": req.excerpt,
        "image": req.image,
        "hero_image": req.hero_image,
        "read_minutes": req.read_minutes,
        "published_at": datetime.now(timezone.utc).isoformat(),
        "chapo": req.chapo,
        "blocks": req.blocks,
        "meta_title": meta_title,
        "meta_description": meta_description,
    }
    await db.articles.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/blog/articles/{slug}", response_model=Article)
async def get_article(slug: str):
    doc = await db.articles.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Article introuvable")
    return doc


@api_router.get("/blog/articles/{article_id}/comments", response_model=List[Comment])
async def list_comments(article_id: str):
    cursor = db.blog_comments.find({"article_id": article_id}, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(length=500)


@api_router.post("/blog/articles/{article_id}/comments", response_model=Comment)
async def create_comment(article_id: str, req: CommentCreate):
    name = req.name.strip()
    text = req.text.strip()
    if not name or not text:
        raise HTTPException(status_code=400, detail="Nom et commentaire requis")
    doc = {
        "id": f"cmt_{uuid.uuid4().hex[:12]}",
        "article_id": article_id,
        "name": name[:80],
        "text": text[:2000],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.blog_comments.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.delete("/blog/articles/{article_id}/comments/{comment_id}")
async def delete_comment(article_id: str, comment_id: str, user: dict = Depends(current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Reserve aux administrateurs")
    await db.blog_comments.delete_one({"id": comment_id, "article_id": article_id})
    return {"ok": True}


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
