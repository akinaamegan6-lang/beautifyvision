from fastapi import FastAPI, APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import asyncio
import os
import logging
import random
import unicodedata
import uuid
import httpx
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel, Field

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from catalog import CATALOG, CATEGORIES, OBF_PRODUCTS, fetch_obf_products, SUPABASE_URL, SUPABASE_ANON_KEY  # noqa: E402

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ============ Sephora — Supabase loader ============

def _normalize(s: str) -> str:
    s = s.lower().replace("-", " ").replace("_", " ")
    return unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode("ascii")


def _fetch_sephora_from_supabase() -> list[dict]:
    url = f"{SUPABASE_URL}/rest/v1/sephora_products"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    }
    products: list[dict] = []
    offset, limit = 0, 1000
    try:
        while True:
            resp = httpx.get(
                url,
                headers=headers,
                params={"select": "*", "limit": limit, "offset": offset},
                timeout=30,
            )
            resp.raise_for_status()
            batch = resp.json()
            if not batch:
                break
            for p in batch:
                p["_category_norm"] = _normalize(p.get("category_path") or "")
                p.setdefault("tags", [])
            products.extend(batch)
            if len(batch) < limit:
                break
            offset += limit
        logger.info("Loaded %d Sephora products from Supabase", len(products))
    except Exception as exc:
        logger.error("Failed to fetch Sephora products from Supabase: %s", exc)
    return products


SEPHORA_FR_PRODUCTS: list[dict] = _fetch_sephora_from_supabase()


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
