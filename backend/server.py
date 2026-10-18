from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse, Response
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
products_col = db["products"]


def _normalize_text(text: str) -> str:
    import unicodedata
    t = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    return t.strip().lower()


def dedupe_variants(items):
    """Fusionne les doublons du flux Awin qui sont en fait LE MEME produit.

    Le flux Awin liste parfois une reference plusieurs fois sous des
    aw_product_id differents (variantes de teinte/taille, ou carrement des
    lignes dupliquees cote marchand) alors que le nom, la marque et la photo
    sont identiques. Sans ce filtre, un produit comme "Effecernes New"
    (LANCOME) pouvait apparaitre 3-4 fois d'affilee, a l'identique, dans les
    resultats de recommandation. On ne garde que la premiere occurrence par
    (categorie, marque, nom normalise) - le nom est normalise (minuscule,
    accents retires, texte apres une virgule ou avant une parenthese ignore)
    pour qu'une vraie variante de taille/teinte explicite dans le nom (ex:
    "Effecernes New 15 ml" vs "Effecernes New") reste bien distincte.
    """
    seen = set()
    deduped = []
    for p in items:
        name_key = _normalize_text(re.sub(r"[,(].*$", "", p.get("name", "")).strip())
        key = (p.get("category"), _normalize_text(p.get("brand", "")), name_key)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(p)
    return deduped


async def get_catalog():
    """Catalogue de produits servi par l'API.

    Lit la collection Mongo "products" (les vrais produits importes depuis le
    flux Awin via scripts/import_awin_feed.py). Si cette collection est encore
    vide (import pas encore lance), on retombe sur l'ancien catalogue de demo
    (catalog.CATALOG) pour que le site reste fonctionnel en attendant.
    """
    items = await products_col.find({}).to_list(length=20000)
    if not items:
        return CATALOG
    for it in items:
        it.pop("_id", None)
    return dedupe_variants(items)


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
    out_of_budget: List[AISelectProduct] = []
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
    items = await get_catalog()
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


# Produits a exclure du "Top" : leur photo source chez le marchand est
# nativement minuscule (ex: 70x70px pour LA ROSEE Stick Corrector), donc
# notre upscale CDN vers une grande vignette reste flou quoi qu'on fasse -
# ce n'est pas reparable cote code, seul le marchand peut fournir une photo
# plus grande. On les exclut du Top (ou la photo est affichee en grand) pour
# qu'un produit avec une photo nette prenne leur place.
LOW_RES_IMAGE_PRODUCTS = {
    ("la rosee", "stick corrector anti-imperfections"),
}


@api_router.get("/products/top", response_model=List[Product])
async def top_products(parent: str = "cosmetiques", limit: int = 10):
    catalog = await get_catalog()
    items = [p for p in catalog if p["parent"] == parent]
    items = [
        p for p in items
        if (_normalize_text(p["brand"]), _normalize_text(re.sub(r"[,(].*$", "", p["name"]).strip())) not in LOW_RES_IMAGE_PRODUCTS
    ]
    items.sort(key=lambda p: (-p["rating"], -p["reviews"]))
    # get_catalog() a deja fusionne les variantes du MEME produit
    # (dedupe_variants), donc pas besoin de refaire ce tri ici. Il reste par
    # contre un autre probleme a regler : la plupart des produits Awin
    # partagent la meme note par defaut (RATING_DEFAULT/REVIEWS_DEFAULT, cf.
    # import_awin_feed.py), donc le tri par note ne les depart pas vraiment
    # entre eux. Resultat : le Top finissait domine par la marque qui a le
    # plus de produits dans le catalogue (ex: Essence), meme apres dedup
    # des variantes - tout le "Top 10" pouvait etre la meme marque.
    # On entrelace donc par marque : un produit par marque a la fois (en
    # respectant l'ordre de tri ci-dessus au sein de chaque marque), pour
    # que le Top melange plusieurs marques au lieu d'etre monopolise par
    # celle qui a le plus large catalogue.
    by_brand = {}
    for p in items:
        by_brand.setdefault(p["brand"].strip().lower(), []).append(p)

    result = []
    brands_cycle = list(by_brand.keys())
    while len(result) < limit and any(by_brand[b] for b in brands_cycle):
        for b in brands_cycle:
            bucket = by_brand[b]
            if not bucket:
                continue
            result.append(bucket.pop(0))
            if len(result) >= limit:
                break
    return result


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    catalog = await get_catalog()
    for p in catalog:
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

    # Candidate pool: all cosmetiques products, in and out of budget. We keep
    # over-budget items in the pool (rather than filtering them out entirely)
    # so Claude can optionally surface a good out-of-budget option per zone,
    # instead of simply never knowing such a product exists.
    catalog = await get_catalog()
    candidates = [p for p in catalog if p["parent"] == "cosmetiques"]
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
        "Choisis jusqu'à 3 à 6 produits cosmétiques parmi la liste fournie qui forment un look cohérent, "
        "en couvrant les zones lips, eyes, lashes, brows, liner, cheeks, highlight et face quand c'est pertinent "
        "(lashes = mascara, brows = sourcils, liner = eyeliner, highlight = highlighter, eyes = fard à paupières) — "
        "MAIS RÈGLE ABSOLUE : pour une zone donnée, ne retiens un produit QUE si sa couleur réelle "
        "(son champ color_hex d'origine dans la liste fournie) est raisonnablement proche de la couleur "
        "demandée par l'utilisatrice pour cette zone. Si la demande évoque une couleur inhabituelle "
        "(par exemple un rouge à lèvres vert ou jaune vif) et qu'AUCUN produit de la liste n'a une couleur "
        "proche de celle-ci, N'INCLUS AUCUN PRODUIT pour cette zone plutôt que de proposer le produit le "
        "plus proche en catégorie mais dont la couleur ne correspond pas du tout. Il est préférable de "
        "renvoyer moins de produits mais tous réellement fidèles, plutôt que de faire croire qu'un produit "
        "existant a une couleur qu'il n'a pas. "
        "Le champ color_hex de ta réponse doit toujours être recopié EXACTEMENT depuis le color_hex "
        "d'origine du produit choisi dans la liste fournie, jamais une couleur inventée ou idéalisée. "
        "IMPORTANT sur le budget : la liste de produits fournie contient À LA FOIS des produits dans le "
        "budget et des produits au-dessus du budget indiqué (regarde le champ price de chacun). La liste "
        "principale \"products\" ne doit QUE contenir des produits dont le prix respecte strictement le "
        "budget max indiqué. En plus de cette liste principale, si pour une zone demandée tu ne trouves "
        "un bon produit (couleur proche) QUE au-dessus du budget, tu peux le proposer séparément dans "
        "\"out_of_budget\" (0 à 2 produits maximum), avec le même format, pour que l'utilisatrice sache "
        "qu'une meilleure option existe mais dépasse son budget. Ne mets JAMAIS dans \"out_of_budget\" un "
        "produit qui est déjà dans \"products\", et ne mets dans \"out_of_budget\" que des produits dont "
        "le prix dépasse réellement le budget max. "
        "Format strict :\n"
        "{\n"
        '  "products": [\n'
        '    {"product_id": "<id>", "zone": "lips|eyes|lashes|brows|liner|cheeks|highlight|face", "color_hex": "#RRGGBB (= couleur réelle du produit)", "reason": "<courte raison>"}\n'
        "  ],\n"
        '  "out_of_budget": [\n'
        '    {"product_id": "<id>", "zone": "...", "color_hex": "#RRGGBB", "reason": "<pourquoi, en mentionnant que c\'est hors budget>"}\n'
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
            model="claude-sonnet-5",
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
    oob_products = parsed.get("out_of_budget", [])
    summary = parsed.get("summary", "Look personnalisé BeautifyVision")

    # Validate product_ids exist, and cross-check prices against the actual
    # catalog so we never trust the model's own notion of what's in/out of
    # budget: a "products" entry must truly be within budget, and an
    # "out_of_budget" entry must truly be above it.
    price_by_id = {p["id"]: p["price"] for p in catalog}
    valid_ids = set(price_by_id.keys())

    cleaned = []
    for item in products:
        pid = item.get("product_id")
        if pid in valid_ids and price_by_id[pid] <= req.budget_max:
            cleaned.append(AISelectProduct(
                product_id=pid,
                zone=item.get("zone", "face"),
                color_hex=item.get("color_hex", "#C68D78"),
                reason=item.get("reason", ""),
            ))

    cleaned_ids = {p.product_id for p in cleaned}
    cleaned_oob = []
    for item in oob_products:
        pid = item.get("product_id")
        if pid in valid_ids and pid not in cleaned_ids and price_by_id[pid] > req.budget_max:
            cleaned_oob.append(AISelectProduct(
                product_id=pid,
                zone=item.get("zone", "face"),
                color_hex=item.get("color_hex", "#C68D78"),
                reason=item.get("reason", ""),
            ))
        if len(cleaned_oob) >= 2:
            break

    if not cleaned:
        # Fallback: pick top-rated covering zones, within budget
        seen_zones = set()
        for p in sorted(candidates, key=lambda x: -x.get("rating", 0)):
            z = p.get("zone")
            if z and z not in seen_zones and p["price"] <= req.budget_max:
                cleaned.append(AISelectProduct(
                    product_id=p["id"],
                    zone=z,
                    color_hex=p.get("color_hex") or "#C68D78",
                    reason="Sélection automatique",
                ))
                seen_zones.add(z)
            if len(cleaned) >= 4:
                break

    return AISelectResponse(products=cleaned, out_of_budget=cleaned_oob, summary=summary)


@api_router.post("/ai/apply-makeup", response_model=ApplyMakeupResponse)
async def ai_apply_makeup(req: ApplyMakeupRequest):
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY missing")

    from google import genai
    from google.genai import types

    lips = req.colors.get("lips", "")
    eyes = req.colors.get("eyes", "")
    cheeks = req.colors.get("cheeks", "")
    face = req.colors.get("face", "")
    lashes = req.colors.get("lashes", "")
    brows = req.colors.get("brows", "")
    liner = req.colors.get("liner", "")
    highlight = req.colors.get("highlight", "")

    prompt = (
        "Apply realistic, clearly visible makeup to the woman in this photo while keeping her face, "
        "identity, skin tone, hair, background and pose perfectly intact. "
        "Only modify the makeup zones described. The result must be photorealistic and well-blended, "
        "but the makeup itself must be unmistakably visible at a glance — this is a full, well-applied "
        "makeup look, not a barely-there or no-makeup-makeup look. Use full color payoff, not faded or "
        "diluted pigment.\n"
    )
    if lips:
        prompt += f"- Lips: apply a full-coverage {lips} lipstick, richly pigmented with clearly defined, clean edges.\n"
    if eyes:
        prompt += f"- Eyes: apply {eyes} eyeshadow with visible, saturated color across the eyelid, plus a clean, clearly visible eyeliner line.\n"
    if cheeks:
        prompt += f"- Cheeks: apply a noticeably visible {cheeks} blush with strong color payoff on the cheekbones.\n"
    if face:
        prompt += (
            f"- Face: apply a full-coverage {face} foundation. This must be OPAQUE, FULL coverage — "
            "completely conceal freckles, redness, dark spots and skin texture underneath for a smooth, "
            "even, flawless finish. Do not let any freckles or blemishes show through.\n"
        )
    if lashes:
        prompt += (
            "- Lashes: apply mascara for dramatically longer, thicker, more voluminous, clearly "
            "separated eyelashes — the length/volume increase must be obvious, not a subtle touch-up.\n"
        )
    if brows:
        prompt += (
            "- Eyebrows: make them well-defined, neatly shaped and groomed, with a clear, deliberate "
            "filled-in look (natural hair strokes, no harsh blocky shape) — clearly more structured "
            "than a bare, un-groomed brow.\n"
        )
    if liner:
        prompt += f"- Eyeliner: apply a crisp, clearly visible {liner} eyeliner line along the lash line (distinct from any eyeshadow).\n"
    if highlight:
        prompt += (
            f"- Highlighter: apply a {highlight} highlighter with a visible luminous glow on the high "
            "points of the face (top of cheekbones, brow bone, bridge of the nose) — the glow/shimmer "
            "must be clearly noticeable, not flat.\n"
        )
    if req.look_description and ("couvr" in req.look_description.lower() or "coverage" in req.look_description.lower()):
        prompt += (
            "The user explicitly asked for strong/full coverage: make sure any freckles, spots, redness "
            "or skin texture are fully and visibly concealed, not just softened — this should look like a "
            "full-coverage base, not a light tinted moisturizer.\n"
        )
    if req.look_description:
        prompt += (
            f"Overall look requested by the user, in their own words: \"{req.look_description}\".\n"
            "Follow this description literally and precisely, including any unusual or specific "
            "detail it mentions (an unconventional color, a small motif or drawing on a specific "
            "spot, an asymmetric effect, etc.) — do not water it down or normalize it into a generic "
            "makeup look. If this description conflicts with the zone colors above, prioritize what "
            "the user explicitly asked for.\n"
        )
    prompt += "Output a clean portrait, same framing, same person. The makeup should read as an obvious, deliberate transformation when compared to a bare face."

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


# ============ Sitemap (SEO) ============
SITE_URL = "https://beautifyvision.fr"

# Pages statiques a inclure en plus des articles de blog et des pages
# "probleme de peau" (generees depuis CATEGORIES, deja dynamique).
SITEMAP_STATIC_PATHS = ["/", "/blog", "/routine-360", "/essayage-ia"]


def _xml_escape(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


@app.get("/sitemap.xml")
async def sitemap():
    """Sitemap genere dynamiquement : pages statiques, pages "probleme de
    peau" (depuis le catalogue) et tous les articles de blog publies.
    Se met a jour tout seul a chaque nouvel article, sans intervention manuelle.
    Expose aussi via https://beautifyvision.fr/sitemap.xml (rewrite Vercel cote front)."""
    today = datetime.now(timezone.utc).date().isoformat()
    urls = [{"loc": f"{SITE_URL}{p}", "lastmod": today} for p in SITEMAP_STATIC_PATHS]

    for cat in CATEGORIES.values():
        for prob in cat.get("problems", []):
            urls.append({"loc": f"{SITE_URL}/probleme/{prob['slug']}", "lastmod": today})

    cursor = db.articles.find({}, {"_id": 0, "slug": 1, "published_at": 1})
    async for doc in cursor:
        slug = doc.get("slug")
        if not slug:
            continue
        lastmod = (doc.get("published_at") or today)[:10]
        urls.append({"loc": f"{SITE_URL}/blog/{slug}", "lastmod": lastmod})

    body = "\n".join(
        f"  <url><loc>{_xml_escape(u['loc'])}</loc><lastmod>{u['lastmod']}</lastmod></url>"
        for u in urls
    )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{body}\n"
        "</urlset>"
    )
    return Response(content=xml, media_type="application/xml")


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
