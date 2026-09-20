from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from catalog import CATALOG, CATEGORIES  # noqa: E402
from auth import build_router as build_auth_router, seed_admin  # noqa: E402

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# MongoDB
mongo_client = AsyncIOMotorClient(os.environ["MONGO_URL"])
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
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY missing")

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

    from emergentintegrations.llm.chat import LlmChat, UserMessage

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

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"glowmatch-{uuid.uuid4()}",
        system_message=system_msg,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    try:
        response = await chat.send_message(UserMessage(text=user_text))
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
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY missing")

    from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

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

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"glowmatch-img-{uuid.uuid4()}",
        system_message="You are a virtual makeup artist that edits photos realistically.",
    ).with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])

    msg = UserMessage(text=prompt, file_contents=[ImageContent(req.image_base64)])

    try:
        _text, images = await chat.send_message_multimodal_response(msg)
    except Exception as e:
        logger.exception("Nano Banana error: %s", e)
        raise HTTPException(status_code=502, detail=f"Makeup application failed: {e}")

    if not images:
        # Fallback: return original
        return ApplyMakeupResponse(image_base64=req.image_base64, mime_type="image/png")

    img = images[0]
    return ApplyMakeupResponse(image_base64=img["data"], mime_type=img.get("mime_type", "image/png"))


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
