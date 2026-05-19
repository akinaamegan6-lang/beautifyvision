"""
Import Sephora products CSV into Supabase.
Table cible : sephora_products
Upsert par batch de 100, déduplication sur la colonne id.

Usage :
    python3 import_sephora.py

Dépendances :
    pip3 install pandas requests
"""

import json
import re
import sys
import unicodedata
from pathlib import Path

import pandas as pd
import requests

# ── Config ────────────────────────────────────────────────────────────────────

SUPABASE_URL = "https://wdoaanrpbudegpcrreah.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkb2FhbnJwYnVkZWdwY3JyZWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTIyMDQzOSwiZXhwIjoyMDk0Nzk2NDM5fQ.kh_E4ixxYT2o8pJ4nFQooKx6M6D1yzGweyN3qr3jlFU"
TABLE = "sephora_products"
BATCH_SIZE = 100
CSV_PATH = Path(__file__).parent / "backend" / "Sephora products.csv"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def _parse_json_safe(val, default):
    if not isinstance(val, str) and pd.isna(val):
        return default
    try:
        return json.loads(val)
    except Exception:
        return default


def _normalize(s: str) -> str:
    s = s.lower().replace("-", " ").replace("_", " ")
    return unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode("ascii")


def _compute_smart_tags(name, description, more_info, ingredients, promo_tags):
    promo_str = " ".join(promo_tags).lower()
    desc_lower = (description or "").lower()
    more_lower = (more_info or "").lower()
    ingr_lower = (ingredients or "").lower()
    full_text = f"{name.lower()} {promo_str} {desc_lower} {more_lower}"

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


# ── CSV parsing ───────────────────────────────────────────────────────────────

def parse_csv(path: Path) -> list[dict]:
    df = pd.read_csv(path)
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
            category_path = " > ".join(b.get("name", "") for b in breadcrumbs if isinstance(b, dict))
        else:
            category, category_path = "", ""

        promo_tags = _parse_json_safe(row.get("tags"), [])
        promo_tags = [t for t in promo_tags if isinstance(t, str)] if isinstance(promo_tags, list) else []

        description = str(row.get("description", "") or "")
        more_info = str(row.get("more_information", "") or "")
        ingredients_str = str(row.get("ingredients", "") or "")

        url = str(row.get("url", ""))
        slug = url.split("/p/")[-1].rsplit(".html", 1)[0]
        parts = slug.rsplit("-", 1)
        if len(parts) == 2 and parts[-1].isdigit():
            slug = parts[0]
        name_raw = str(row.get("name", "") or "").strip()
        name = name_raw if name_raw and name_raw != "nan" else re.sub(r"-+", " ", slug).strip().title()

        smart_tags = _compute_smart_tags(name, description, more_info, ingredients_str, promo_tags)

        products.append({
            "id": str(row["id"]),
            "name": name,
            "brand": brand,
            "price": price,
            "rating": rating,
            "reviews": total_count,
            "category": category,
            "category_path": category_path,
            "tags": smart_tags,
            "ingredients": ingredients_str,
            "image": image,
            "affiliate_url": url,
        })

    return products


# ── Supabase upsert ───────────────────────────────────────────────────────────

def upsert_batch(records: list[dict]) -> None:
    url = f"{SUPABASE_URL}/rest/v1/{TABLE}"
    resp = requests.post(url, headers=HEADERS, json=records, timeout=30)
    if resp.status_code not in (200, 201):
        print(f"  ✗ Erreur HTTP {resp.status_code} : {resp.text[:200]}")
        resp.raise_for_status()


def main():
    if not CSV_PATH.exists():
        print(f"CSV introuvable : {CSV_PATH}")
        sys.exit(1)

    print(f"Lecture du CSV : {CSV_PATH}")
    products = parse_csv(CSV_PATH)
    # Dédupliquer sur id (garder la dernière occurrence)
    seen = {}
    for p in products:
        seen[p["id"]] = p
    products = list(seen.values())
    print(f"{len(products)} produits après déduplication.\n")

    total = len(products)
    inserted = 0
    errors = 0

    for i in range(0, total, BATCH_SIZE):
        batch = products[i: i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE
        print(f"Batch {batch_num}/{total_batches} ({len(batch)} lignes)...", end=" ", flush=True)
        try:
            upsert_batch(batch)
            inserted += len(batch)
            print("✓")
        except Exception as e:
            errors += len(batch)
            print(f"✗ ({e})")

    print(f"\nTerminé : {inserted} insérés/mis à jour, {errors} erreurs.")


if __name__ == "__main__":
    main()
