"""Glowmatch backend API tests."""
import os
import base64
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://9ec43242-002a-409d-9fed-3ef398847c18.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

# Tiny valid JPEG (1x1 white pixel)
TINY_JPEG_B64 = (
    "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB"
    "AQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB"
    "AQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEA"
    "AAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhED"
    "EQA/AL+AH//Z"
)


# ============ Catalog/category tests ============
class TestCatalog:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["app"] == "Glowmatch"
        assert "version" in d

    def test_categories(self):
        r = requests.get(f"{API}/categories", timeout=15)
        assert r.status_code == 200
        d = r.json()
        for key in ("visage", "corps", "cosmetiques"):
            assert key in d
            assert "products" in d[key]
            assert "problems" in d[key]
            assert isinstance(d[key]["products"], list)
            assert len(d[key]["products"]) > 0

    def test_products_by_category(self):
        r = requests.get(f"{API}/products", params={"category": "rouge-a-levres"}, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        for p in items:
            assert p["category"] == "rouge-a-levres"
            assert p["parent"] == "cosmetiques"

    def test_products_filter_price(self):
        r = requests.get(
            f"{API}/products",
            params={"parent": "cosmetiques", "min_price": 20, "max_price": 50},
            timeout=15,
        )
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        for p in items:
            assert p["parent"] == "cosmetiques"
            assert 20 <= p["price"] <= 50

    def test_top_products(self):
        r = requests.get(f"{API}/products/top", params={"parent": "cosmetiques", "limit": 10}, timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert 1 <= len(items) <= 10
        ratings = [p["rating"] for p in items]
        assert ratings == sorted(ratings, reverse=True) or all(
            ratings[i] >= ratings[i+1] - 0.0001 for i in range(len(ratings)-1)
        )

    def test_product_by_id(self):
        # fetch any product first
        r = requests.get(f"{API}/products", params={"parent": "cosmetiques"}, timeout=15)
        pid = r.json()[0]["id"]
        r2 = requests.get(f"{API}/products/{pid}", timeout=15)
        assert r2.status_code == 200
        assert r2.json()["id"] == pid

    def test_product_invalid_id(self):
        r = requests.get(f"{API}/products/invalid-id", timeout=15)
        assert r.status_code == 404


# ============ AI endpoints ============
class TestAI:
    def test_ai_select_products(self):
        payload = {
            "prompt": "nude natural look",
            "skin_tone_hex": "#E2BFA0",
            "undertone": "neutral",
            "budget_max": 80,
        }
        r = requests.post(f"{API}/ai/select-products", json=payload, timeout=120)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "products" in d and "summary" in d
        assert isinstance(d["summary"], str) and len(d["summary"]) > 0
        prods = d["products"]
        assert 3 <= len(prods) <= 5, f"Got {len(prods)} products"

        # validate each product references real catalog ids and required fields
        cat = requests.get(f"{API}/products", params={"parent": "cosmetiques"}, timeout=15).json()
        valid_ids = {p["id"] for p in cat}
        for item in prods:
            assert item["product_id"] in valid_ids
            assert item["zone"] in ("lips", "eyes", "cheeks", "face")
            assert item["color_hex"].startswith("#")
            assert "reason" in item

    def test_ai_apply_makeup(self):
        payload = {
            "image_base64": TINY_JPEG_B64,
            "colors": {"lips": "#A85060", "eyes": "#B5634A", "cheeks": "#F2A48A"},
            "look_description": "nude terracotta look",
        }
        r = requests.post(f"{API}/ai/apply-makeup", json=payload, timeout=180)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "image_base64" in d
        assert "mime_type" in d
        assert d["mime_type"].startswith("image/")
        # base64 must decode
        try:
            base64.b64decode(d["image_base64"], validate=False)
        except Exception as e:
            pytest.fail(f"image_base64 not decodable: {e}")
        assert len(d["image_base64"]) > 100
