from fastapi import FastAPI, APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import ast
import asyncio
import json
import os
import logging
import random
import re
import unicodedata
import uuid
import pandas as pd
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel, Field

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from catalog import CATALOG, CATEGORIES, OBF_PRODUCTS, fetch_obf_products  # noqa: E402

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ============ Sephora France CSV loader ============

def _normalize(s: str) -> str:
    s = s.lower().replace("-", " ").replace("_", " ")
    return unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode("ascii")


def _parse_json_safe(val, default):
    if not isinstance(val, str) and pd.isna(val):
        return default
    try:
        return json.loads(val)
    except Exception:
        return default


def _compute_smart_tags(name: str, description: str, more_info: str, ingredients: str, promo_tags: list) -> list[str]:
    promo_str = " ".join(promo_tags).lower()
    desc_lower = (description or "").lower()
    more_lower = (more_info or "").lower()
    ingr_lower = (ingredients or "").lower()
    # Full marketing text (not ingredients) for skin/benefit/claim checks
    full_text = f"{name.lower()} {promo_str} {desc_lower} {more_lower}"

    # Tag 1 — Skin type
    if any(w in full_text for w in ["grasse", "oily"]):
        skin_tag = "Peau grasse"
    elif any(w in full_text for w in ["sèche", "seche", "dry"]):
        skin_tag = "Peau sèche"
    elif any(w in full_text for w in ["sensible", "sensitive"]):
        skin_tag = "Peau sensible"
    elif any(w in full_text for w in ["mixte", "combination"]):
        skin_tag = "Peau mixte"
    else:
        skin_tag = "Peau normale"

    # Tag 2 — Benefit
    if "hydrat" in full_text:
        benefit_tag = "Hydratation intense"
    elif any(w in full_text + ingr_lower for w in ["anti-âge", "anti-age", "antiaging", "retinol", "rétinol"]):
        benefit_tag = "Anti-âge"
    elif any(w in full_text for w in ["éclat", "eclat", "glow"]):
        benefit_tag = "Éclat & teint unifié"
    elif any(w in full_text for w in ["apaisant", "apaisante", "soothing"]):
        benefit_tag = "Apaisant"
    elif "matif" in full_text:
        benefit_tag = "Matifiant"
    elif any(w in full_text for w in ["répar", "repar", "repair"]):
        benefit_tag = "Réparateur"
    elif any(w in full_text + ingr_lower for w in ["spf", "solaire"]):
        benefit_tag = "Protecteur (SPF)"
    else:
        benefit_tag = "Soin quotidien"

    # Tag 3 — Ingredient / preference (paraben/silicone checked in marketing text only)
    if "vegan" in full_text:
        ingr_tag = "Vegan"
    elif "cruelty" in full_text:
        ingr_tag = "Cruelty-free"
    elif "paraben" in full_text:
        ingr_tag = "Sans paraben"
    elif "silicone" in full_text:
        ingr_tag = "Sans silicone"
    elif "hyaluroni" in ingr_lower:
        ingr_tag = "Acide hyaluronique"
    elif any(w in ingr_lower for w in ["retinol", "rétinol", "retinyl"]):
        ingr_tag = "Avec rétinol"
    elif "niacinamide" in ingr_lower:
        ingr_tag = "Avec niacinamide"
    else:
        ingr_tag = "Naturelle / Bio"

    return [skin_tag, benefit_tag, ingr_tag]


def _load_sephora_fr_csv() -> list[dict]:
    csv_path = ROOT_DIR / "Sephora products.csv"
    if not csv_path.exists():
        logger.warning("Sephora products.csv not found at %s", csv_path)
        return []
    try:
        df = pd.read_csv(csv_path)
        products = []
        for _, row in df.iterrows():
            brand_obj = _parse_json_safe(row.get("brand"), {})
            brand = brand_obj.get("name", "") if isinstance(brand_obj, dict) else ""

            raw_price = str(row.get("actual_price", "") or "").replace('"', "").replace("€", "").strip()
            try:
                price = float(raw_price)
            except ValueError:
                price = None

            images = _parse_json_safe(row.get("images"), [])
            image = images[0] if isinstance(images, list) and images else ""

            rating_obj = _parse_json_safe(row.get("rating"), {})
            if isinstance(rating_obj, dict):
                overall = rating_obj.get("overall") or 0
                total_count = int(rating_obj.get("total_count") or 0)
            else:
                overall, total_count = 0, 0
            rating = round(float(overall), 1) if overall else None

            breadcrumbs = _parse_json_safe(row.get("breadcrumbs"), [])
            if isinstance(breadcrumbs, list) and breadcrumbs:
                category = breadcrumbs[-1].get("name", "") if isinstance(breadcrumbs[-1], dict) else ""
                category_path = " > ".join(
                    b.get("name", "") for b in breadcrumbs if isinstance(b, dict)
                )
            else:
                category, category_path = "", ""

            promo_tags = _parse_json_safe(row.get("tags"), [])
            promo_tags = [t for t in promo_tags if isinstance(t, str)] if isinstance(promo_tags, list) else []

            description = str(row.get("description", "") or "")
            more_info = str(row.get("more_information", "") or "")

            url = str(row.get("url", ""))
            slug = url.split("/p/")[-1].rsplit(".html", 1)[0]
            parts = slug.rsplit("-", 1)
            if len(parts) == 2 and parts[-1].isdigit():
                slug = parts[0]
            name_raw = str(row.get("name", "") or "").strip()
            name = name_raw if name_raw and name_raw != "nan" else re.sub(r"-+", " ", slug).strip().title()

            ingredients_str = str(row.get("ingredients", "") or "")
            smart_tags = _compute_smart_tags(name, description, more_info, ingredients_str, promo_tags)

            products.append({
                "id": str(row["id"]),
                "name": name,
                "brand": brand,
                "price": price,
                "rating": rating,
                "reviews": total_count,
                "category": category,
                "tags": smart_tags,
                "ingredients": ingredients_str,
                "image": image,
                "affiliate_url": url,
                "_category_norm": _normalize(category_path),
            })
        logger.info("Loaded %d Sephora France products", len(products))
        return products
    except Exception as exc:
        logger.error("Failed to load Sephora France CSV: %s", exc)
        return []


SEPHORA_FR_PRODUCTS: list[dict] = _load_sephora_fr_csv()


# ============ Schemas ============

class SephoraProduct(BaseModel):
    id: str
    name: str
    brand: str
    price: Optional[float] = None
    rating: Optional[float] = None
    reviews: int = 0
    category: str = ""
    tags: List[str] = []
    ingredients: Optional[str] = None
    image: str = ""
    affiliate_url: str = "#"


class SephoraProductsResponse(BaseModel):
    total: int
    page: int
    limit: int
    pages: int
    products: List[SephoraProduct]


class OBFProduct(BaseModel):
    id: str
    name: str
    brand: Optional[str] = None
    image_url: Optional[str] = None
    category: str
    ingredients: Optional[str] = None
    price: Optional[float] = None


class OBFProductsResponse(BaseModel):
    total: int
    page: int
    page_size: int
    pages: int
    products: List[OBFProduct]


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


# ============ Startup ============

async def _load_obf_background(target: int = 2000) -> None:
    try:
        await fetch_obf_products(target)
    except Exception as exc:
        logger.error("OBF background import failed: %s", exc)


@app.on_event("startup")
async def startup_load_obf() -> None:
    asyncio.create_task(_load_obf_background(2000))


# ============ Routes ============
@api_router.get("/")
async def root():
    return {"app": "BeautifyVision", "version": "1.0.0"}


@api_router.get("/categories")
async def get_categories():
    return CATEGORIES


@api_router.get("/products", response_model=SephoraProductsResponse)
async def list_products(
    page: int = 1,
    limit: int = 20,
    category: Optional[str] = None,
    budget_max: Optional[float] = None,
    search: Optional[str] = None,
):
    items = list(SEPHORA_FR_PRODUCTS)

    if category:
        cat_norm = _normalize(category)
        items = [p for p in items if cat_norm in p["_category_norm"]]
    if budget_max is not None:
        items = [p for p in items if p["price"] is None or p["price"] <= budget_max]
    if search:
        s = search.lower()
        items = [p for p in items if s in p["name"].lower() or s in p["brand"].lower()]

    total = len(items)
    pages = max(1, (total + limit - 1) // limit)
    page = max(1, min(page, pages))
    offset = (page - 1) * limit

    return SephoraProductsResponse(
        total=total,
        page=page,
        limit=limit,
        pages=pages,
        products=items[offset: offset + limit],
    )


@api_router.get("/products/top", response_model=List[SephoraProduct])
async def top_products(parent: str = "cosmetiques", limit: int = 10):
    items = [p for p in SEPHORA_FR_PRODUCTS if p.get("rating") and p["rating"] > 0]
    items.sort(key=lambda p: (-(p["rating"] or 0), -p["reviews"]))
    return items[:limit]


@api_router.get("/obf/products", response_model=OBFProductsResponse)
async def list_obf_products(
    page: int = 1,
    page_size: int = 20,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    budget_max: Optional[float] = None,
):
    """Return Open Beauty Facts products with pagination and optional filters.

    Filters:
    - category: case-insensitive substring match on the product category
    - brand: case-insensitive substring match on the brand name
    - budget_max: upper price bound (only applies to products that have a price)
    """
    items = list(OBF_PRODUCTS)

    if category:
        c = category.lower()
        items = [p for p in items if c in p["category"].lower()]
    if brand:
        b = brand.lower()
        items = [p for p in items if p.get("brand") and b in p["brand"].lower()]
    if budget_max is not None:
        items = [p for p in items if p["price"] is None or p["price"] <= budget_max]

    total = len(items)
    pages = max(1, (total + page_size - 1) // page_size)
    offset = (page - 1) * page_size
    page_items = items[offset: offset + page_size]

    return OBFProductsResponse(
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
        products=page_items,
    )


@api_router.post("/obf/import")
async def import_obf_products(background_tasks: BackgroundTasks, target: int = 2000):
    """Trigger a fresh import of OBF products in the background."""
    background_tasks.add_task(_load_obf_background, target)
    return {"status": "import started", "target": target}


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    for p in CATALOG:
        if p["id"] == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")


# ============ AI Endpoints (simulation) ============

_LOOK_SUMMARIES = [
    "Un look naturel et lumineux, parfaitement adapté à ton teint.",
    "Une sélection harmonieuse qui sublime ta carnation avec élégance.",
    "Des produits complémentaires pour un look cohérent et radieux.",
    "Un ensemble soigneusement assorti pour révéler ton éclat naturel.",
]


@api_router.post("/ai/select-products", response_model=AISelectResponse)
async def ai_select_products(req: AISelectRequest):
    candidates = [p for p in CATALOG if p["parent"] == "cosmetiques" and p["price"] <= req.budget_max]
    if not candidates:
        candidates = [p for p in CATALOG if p["parent"] == "cosmetiques"]

    # Build one pool per zone then pick one per zone to cover the main areas
    by_zone: dict[str, list] = {}
    for p in candidates:
        z = p.get("zone")
        if z:
            by_zone.setdefault(z, []).append(p)

    selected: list[AISelectProduct] = []
    used_ids: set[str] = set()
    for zone in ("lips", "eyes", "cheeks", "face"):
        pool = [p for p in by_zone.get(zone, []) if p["id"] not in used_ids]
        if pool:
            pick = random.choice(pool)
            used_ids.add(pick["id"])
            selected.append(AISelectProduct(
                product_id=pick["id"],
                zone=zone,
                color_hex=pick.get("color_hex") or "#C68D78",
                reason="Idéal pour compléter ce look",
            ))

    # Fill up to 4 if fewer zones were covered
    if len(selected) < 4:
        remaining = [p for p in candidates if p["id"] not in used_ids and p.get("zone")]
        random.shuffle(remaining)
        for p in remaining[: 4 - len(selected)]:
            selected.append(AISelectProduct(
                product_id=p["id"],
                zone=p.get("zone", "face"),
                color_hex=p.get("color_hex") or "#C68D78",
                reason="Idéal pour compléter ce look",
            ))

    return AISelectResponse(products=selected[:4], summary=random.choice(_LOOK_SUMMARIES))


@api_router.post("/ai/apply-makeup", response_model=ApplyMakeupResponse)
async def ai_apply_makeup(req: ApplyMakeupRequest):
    # Simulation: return the original image unchanged.
    # Real makeup synthesis (Claude + Replicate) will be wired here later.
    return ApplyMakeupResponse(image_base64=req.image_base64, mime_type="image/png")


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
