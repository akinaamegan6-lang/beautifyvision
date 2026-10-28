"""Récupération des photos produits pour le PDF « Mon bilan » (côté serveur : pas de CORS)."""
from __future__ import annotations

import asyncio
import io
import logging
from typing import Any, Dict, List
from urllib.parse import parse_qs, urlparse

import httpx
from PIL import Image

log = logging.getLogger("recap")
MAX_BYTES = 4_000_000


def merchant_image_url(url: str) -> str:
    """Comme le site : le CDN Awin renvoie parfois un GIF « No image » de 70x70 ;
    la vraie photo du marchand est dans le paramètre `url=` du lien du CDN."""
    if not url or "productserve.com" not in url:
        return url or ""
    try:
        raw = parse_qs(urlparse(url).query).get("url", [""])[0]
        if raw:
            return "https://" + raw[4:] if raw.startswith("ssl:") else "https://" + raw
    except Exception:  # noqa: BLE001
        pass
    return url


def _to_jpeg(data: bytes) -> bytes | None:
    im = Image.open(io.BytesIO(data))
    im.load()
    if im.size == (70, 70):          # placeholder « No image available »
        return None
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert("RGB")
    im.thumbnail((440, 440))
    out = io.BytesIO()
    im.save(out, "JPEG", quality=86)
    return out.getvalue()


async def _one(client: httpx.AsyncClient, sem: asyncio.Semaphore, p: Dict[str, Any]) -> None:
    img = p.get("image") or ""
    candidates: List[str] = []
    for u in (merchant_image_url(img), img):
        if u and u.startswith("http") and u not in candidates:
            candidates.append(u)
    async with sem:
        for u in candidates:
            try:
                r = await client.get(u)
                if r.status_code != 200 or len(r.content) > MAX_BYTES:
                    continue
                jpg = await asyncio.to_thread(_to_jpeg, r.content)
                if jpg:
                    p["image_bytes"] = jpg
                    return
            except Exception as e:  # noqa: BLE001 - une image manquante ne bloque jamais le PDF
                log.debug("image recap ignorée (%s): %s", u, e)


async def fetch_product_images(products: Dict[str, Dict[str, Any]]) -> None:
    """Ajoute `image_bytes` (JPEG) à chaque produit dont la photo est récupérable."""
    if not products:
        return
    sem = asyncio.Semaphore(8)
    headers = {"User-Agent": "Mozilla/5.0 (compatible; BeautifyVision-recap/1.0)", "Accept": "image/*,*/*;q=0.8"}
    async with httpx.AsyncClient(timeout=7.0, follow_redirects=True, headers=headers) as client:
        await asyncio.gather(*[_one(client, sem, p) for p in products.values()])
