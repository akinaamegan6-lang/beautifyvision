"""Génération du PDF « Mon bilan Beautify Vision » (diagnostic + routine / produit).

Le gabarit s'inspire du visuel « Mon bilan cheveux » : en-tête avec logo et
pastille de titre, carte de profil, cartes ingrédients / préoccupations, cartes
produits numérotées, conseils, prochaines étapes, vagues et pied de page.

Entrée : un dict `data` (déjà nettoyé par l'API) et `products` (id -> dict produit,
avec éventuellement `image_bytes`). Sortie : les octets du PDF.
Les liens affiliés sont de vrais liens PDF cliquables.
"""
from __future__ import annotations

import io
import math
import os
from typing import Any, Dict, List, Optional

from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as rl_canvas

ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
W, H = A4
M = 28.0                    # marge latérale
CW = W - 2 * M              # largeur utile
FOOT = 66.0                 # hauteur réservée au pied de page

PINK = HexColor("#FEC4D2")
PINK_D = HexColor("#F2709C")
PINK_L = HexColor("#FFF1F5")
PINK_M = HexColor("#FDE0E8")
BLUE = HexColor("#79C1E0")
BLUE_D = HexColor("#3B8FB8")
BLUE_L = HexColor("#EAF5FB")
BLUE_M = HexColor("#D5ECF7")
INK = HexColor("#1D1D22")
GREY = HexColor("#62626B")
GREY_L = HexColor("#9A9AA3")
LOGO_PINK = HexColor("#F58BA8")

_FONTS_DONE = False


def _register_fonts() -> None:
    global _FONTS_DONE
    if _FONTS_DONE:
        return
    fd = os.path.join(ASSETS, "fonts")
    for name, f in [
        ("P", "Poppins-Regular.ttf"), ("PL", "Poppins-Light.ttf"),
        ("PM", "Poppins-Medium.ttf"), ("PB", "Poppins-Bold.ttf"),
        ("BI", "BodoniModa-MediumItalic.ttf"),
    ]:
        pdfmetrics.registerFont(TTFont(name, os.path.join(fd, f)))
    _FONTS_DONE = True


_ICON_CACHE: Dict[str, ImageReader] = {}


def _icon(name: str, tone: str) -> Optional[ImageReader]:
    key = f"{name}--{tone}"
    if key not in _ICON_CACHE:
        path = os.path.join(ASSETS, "icons", key + ".png")
        if not os.path.exists(path):
            path = os.path.join(ASSETS, "icons", f"sparkle--{tone}.png")
        _ICON_CACHE[key] = ImageReader(path)
    return _ICON_CACHE[key]


def _alpha(c: rl_canvas.Canvas, color, a: float) -> None:
    c.setFillColor(color)
    c.setFillAlpha(a)


def _price(v: Any) -> str:
    try:
        return f"{float(v):.2f}".replace(".", ",") + " €"
    except (TypeError, ValueError):
        return ""


def _tw(text: str, font: str, size: float, spacing: float = 0.0) -> float:
    return pdfmetrics.stringWidth(text, font, size) + spacing * max(len(text) - 1, 0)


def _text(c, x, y, text, font="P", size=9, color=INK, spacing=0.0, anchor="l") -> None:
    w = _tw(text, font, size, spacing)
    if anchor == "c":
        x -= w / 2
    elif anchor == "r":
        x -= w
    t = c.beginText(x, y)
    t.setFont(font, size)
    t.setFillColor(color)
    t.setCharSpace(spacing)
    t.textOut(text)
    c.drawText(t)


def _wrap(text: str, font: str, size: float, width: float) -> List[str]:
    return simpleSplit(text or "", font, size, width) or [""]


def _paragraph(c, x, y, text, width, font="P", size=8.5, color=GREY, leading=None, max_lines=None) -> float:
    """Écrit un paragraphe depuis y (haut) ; renvoie la hauteur utilisée."""
    leading = leading or size * 1.42
    lines = _wrap(text, font, size, width)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1].rstrip(" .,;") + "…"
    for i, ln in enumerate(lines):
        _text(c, x, y - size - i * leading + (leading - size) / 2, ln, font, size, color)
    return len(lines) * leading


# ----------------------------------------------------------------- formes
def _round_rect(c, x, y, w, h, r, fill=None, stroke=None, lw=0.8, alpha=1.0) -> None:
    c.saveState()
    if fill is not None:
        c.setFillColor(fill)
        c.setFillAlpha(alpha)
    if stroke is not None:
        c.setStrokeColor(stroke)
        c.setLineWidth(lw)
    c.roundRect(x, y, w, h, r, stroke=1 if stroke is not None else 0, fill=1 if fill is not None else 0)
    c.restoreState()


def _card(c, x, y, w, h, r=14, fill=white, stroke=None, shadow=True) -> None:
    """Carte arrondie avec ombre douce (y = bas de la carte)."""
    if shadow:
        for i, a in enumerate((0.035, 0.03, 0.025)):
            _round_rect(c, x - i, y - 1.5 - i * 1.2, w + 2 * i, h + 2 * i, r + i, fill=PINK_D, alpha=a)
    _round_rect(c, x, y, w, h, r, fill=fill, stroke=stroke)


def _sparkle(c, cx, cy, r, color, alpha=1.0) -> None:
    c.saveState()
    c.setFillColor(color)
    c.setFillAlpha(alpha)
    p = c.beginPath()
    k = 0.22
    p.moveTo(cx, cy + r)
    p.curveTo(cx + r * k, cy + r * k, cx + r * k, cy + r * k, cx + r, cy)
    p.curveTo(cx + r * k, cy - r * k, cx + r * k, cy - r * k, cx, cy - r)
    p.curveTo(cx - r * k, cy - r * k, cx - r * k, cy - r * k, cx - r, cy)
    p.curveTo(cx - r * k, cy + r * k, cx - r * k, cy + r * k, cx, cy + r)
    c.drawPath(p, stroke=0, fill=1)
    c.restoreState()


def _heart(c, cx, cy, s, color, alpha=1.0, stroke_only=False) -> None:
    c.saveState()
    c.setFillColor(color)
    c.setStrokeColor(color)
    c.setFillAlpha(alpha)
    c.setLineWidth(1)
    p = c.beginPath()
    p.moveTo(cx, cy - s)
    p.curveTo(cx - s * 1.6, cy - s * 0.1, cx - s * 0.9, cy + s * 1.0, cx, cy + s * 0.35)
    p.curveTo(cx + s * 0.9, cy + s * 1.0, cx + s * 1.6, cy - s * 0.1, cx, cy - s)
    c.drawPath(p, stroke=1 if stroke_only else 0, fill=0 if stroke_only else 1)
    c.restoreState()


def _check(c, cx, cy, s, color, lw=1.4) -> None:
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(lw)
    c.setLineCap(1)
    c.setLineJoin(1)
    p = c.beginPath()
    p.moveTo(cx - s * 0.55, cy)
    p.lineTo(cx - s * 0.12, cy - s * 0.45)
    p.lineTo(cx + s * 0.6, cy + s * 0.5)
    c.drawPath(p, stroke=1, fill=0)
    c.restoreState()


def _arrow(c, x, y, w, color, lw=1.5) -> None:
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(lw)
    c.setLineCap(1)
    c.setLineJoin(1)
    c.line(x, y, x + w, y)
    p = c.beginPath()
    p.moveTo(x + w - 3.2, y + 3.2)
    p.lineTo(x + w, y)
    p.lineTo(x + w - 3.2, y - 3.2)
    c.drawPath(p, stroke=1, fill=0)
    c.restoreState()


def _icon_disc(c, cx, cy, r, name, tone) -> None:
    """Rond clair (teinte de l'icône, en plus clair) + pictogramme au centre."""
    c.saveState()
    c.setFillColor(PINK_M if tone == "pink" else BLUE_M)
    c.circle(cx, cy, r, stroke=0, fill=1)
    c.restoreState()
    s = r * 1.05
    c.drawImage(_icon(name, tone), cx - s / 2, cy - s / 2, s, s, mask="auto")


def _wave(c, pts, color, alpha) -> None:
    c.saveState()
    c.setFillColor(color)
    c.setFillAlpha(alpha)
    p = c.beginPath()
    p.moveTo(*pts[0])
    for seg in pts[1:]:
        if len(seg) == 2:
            p.lineTo(*seg)
        else:
            p.curveTo(*seg)
    p.close()
    c.drawPath(p, stroke=0, fill=1)
    c.restoreState()


# ----------------------------------------------------------------- logos
def _logo(c, x, y, size, anchor="c") -> float:
    a, b = "Beautify", "Vision"
    wa = _tw(a, "PB", size)
    wb = _tw(b, "BI", size * 1.02)
    total = wa + wb
    if anchor == "c":
        x -= total / 2
    elif anchor == "r":
        x -= total
    _text(c, x, y, a, "PB", size, LOGO_PINK)
    _text(c, x + wa, y, b, "BI", size * 1.02, BLUE)
    return total


def _logo_bv(c, x, y, size) -> None:
    _text(c, x, y, "B", "PB", size, LOGO_PINK)
    _text(c, x + _tw("B", "PB", size) - 1, y, "V", "BI", size * 1.05, BLUE)


# ----------------------------------------------------------------- document
class Recap:
    def __init__(self, data: Dict[str, Any], products: Dict[str, Dict[str, Any]]):
        _register_fonts()
        self.d = data
        self.products = products
        self.buf = io.BytesIO()
        self.c = rl_canvas.Canvas(self.buf, pagesize=A4)
        self.c.setTitle(data.get("doc_title") or "Mon bilan Beautify Vision")
        self.c.setAuthor("Beautify Vision")
        self.c.setSubject("Récapitulatif de ton diagnostic beauté")
        self.page = 0
        self.y = H
        self._new_page()

    # -- pages
    def _footer(self) -> None:
        c = self.c
        _wave(c, [(0, 0), (0, 40), (140, 58, 260, 22, 380, 40), (470, 52, 540, 32, W, 44), (W, 0)], BLUE_M, 1)
        _wave(c, [(0, 0), (0, 30), (130, 46, 250, 10, 360, 28), (460, 42, 540, 22, W, 32), (W, 0)], PINK_M, 1)
        _logo_bv(c, M, 16, 20)
        _heart(c, M + 36, 24, 3.2, PINK_D, 0.9)
        words = "CONSEILS   •   ROUTINES   •   BEAUTÉ   •   BIEN-ÊTRE"
        _text(c, W / 2, 18, words, "PM", 5.8, INK, spacing=1.3, anchor="c")
        _text(c, W / 2, 28, f"{self.page}", "P", 6.5, GREY_L, anchor="c")
        wl = _logo(c, W - M - 10, 16, 12, anchor="r")
        _heart(c, W - M - 2, 20, 3, PINK_D, 0.9, stroke_only=True)

    def _background(self) -> None:
        c = self.c
        c.setFillColor(HexColor("#FFFBFC"))
        c.rect(0, 0, W, H, stroke=0, fill=1)
        if self.page == 1:
            _wave(c, [(W, H), (W, H - 130), (470, H - 150, 380, H - 96, 300, H - 108), (230, H - 118, 190, H - 70, 150, H)], BLUE_M, 1)
            _wave(c, [(0, H), (0, H - 105), (110, H - 135, 210, H - 70, 330, H - 92), (450, H - 112, 520, H - 80, W, H - 96), (W, H)], PINK_M, 0.9)
        else:
            _wave(c, [(W, H), (W, H - 56), (470, H - 70, 400, H - 36, 330, H - 46), (290, H - 52, 250, H - 24, 220, H)], BLUE_M, 1)
            _wave(c, [(0, H), (0, H - 42), (140, H - 62, 260, H - 30, 380, H - 44), (480, H - 56, 540, H - 36, W, H - 46), (W, H)], PINK_M, 0.9)
        self._footer()

    def _new_page(self) -> None:
        if self.page > 0:
            self.c.showPage()
        self.page += 1
        self._background()
        c = self.c
        if self.page == 1:
            _logo(c, W / 2, H - 50, 31)
            title = (self.d.get("title") or "MON BILAN BEAUTÉ").upper()
            tw = _tw(title, "PB", 11, 3.2)
            pw = tw + 46
            _round_rect(c, W / 2 - pw / 2, H - 90, pw, 25, 12.5, fill=white, stroke=PINK, lw=1.2)
            _text(c, W / 2, H - 82, title, "PB", 11, INK, spacing=3.2, anchor="c")
            _sparkle(c, M + 14, H - 40, 9, PINK_D, 0.75)
            _sparkle(c, M + 38, H - 70, 5, BLUE, 0.8)
            _sparkle(c, W - M - 16, H - 44, 10, BLUE, 0.7)
            _heart(c, W - M - 40, H - 76, 5, PINK_D, 0.7)
            _heart(c, M + 66, H - 54, 4, PINK_D, 0.55)
            self.y = H - 112
        else:
            _logo(c, M, H - 30, 14, anchor="l")
            _text(c, W - M, H - 29, (self.d.get("title") or "").upper(), "PM", 6.5, GREY, spacing=1.6, anchor="r")
            self.y = H - 62

    def need(self, h: float) -> None:
        if self.y - h < FOOT:
            self._new_page()

    # -- blocs
    def heading(self, lead: str, accent: str, note: Optional[str] = None, extra: float = 0) -> None:
        c = self.c
        self.need(70 + extra)
        size = 21
        wl = _tw(lead.upper() + " ", "PB", size)
        wa = _tw(accent.upper(), "BI", size * 1.05)
        if wl + wa > CW:
            size = 17
        base = self.y - size
        _text(c, M, base, lead.upper() + " ", "PB", size, INK)
        _text(c, M + _tw(lead.upper() + " ", "PB", size), base, accent.upper(), "BI", size * 1.05, PINK_D)
        used = size + 8
        if note:
            h = _paragraph(c, M, base - 10, note, CW - 24, size=8.3, color=GREY)
            used += h + 6
        self.y -= used + 6

    def sub_heading(self, text: str, tone="pink", extra: float = 0) -> None:
        self.need(34 + extra)
        c = self.c
        col = PINK_D if tone == "pink" else BLUE_D
        _text(c, M, self.y - 10, text.upper(), "PB", 8.2, col, spacing=1.6)
        tw = _tw(text.upper(), "PB", 8.2, 1.6)
        c.saveState()
        c.setStrokeColor(PINK if tone == "pink" else BLUE)
        c.setLineWidth(0.8)
        c.line(M + tw + 10, self.y - 7, W - M, self.y - 7)
        c.restoreState()
        self.y -= 24

    # ---- diagnostic
    def _list_h(self, items, w) -> float:
        return 34 + sum(len(_wrap(t, "P", 8.2, w - 52)) * 10.6 + 5 for t in items) + 8

    def _list_card(self, x, top, w, title, items, tone) -> float:
        c = self.c
        h = self._list_h(items, w)
        _card(c, x, top - h, w, h, r=12, fill=BLUE_L if tone == "blue" else PINK_L, shadow=False)
        col = BLUE_D if tone == "blue" else PINK_D
        _text(c, x + 14, top - 20, title.upper(), "PB", 7.4, col, spacing=1.2)
        yy = top - 34
        for t in items:
            lines = _wrap(t, "P", 8.2, w - 52)
            _check(c, x + 20, yy - 6, 4.2, col)
            for k, ln in enumerate(lines):
                _text(c, x + 34, yy - 9 - k * 10.6, ln, "P", 8.2, INK)
            yy -= len(lines) * 10.6 + 5
        return h

    def profile_block(self) -> None:
        rows = self.d.get("diagnostic") or []
        concerns = self.d.get("concerns") or []
        likes = self.d.get("ingredients") or []
        side = bool(concerns or likes)
        beside = side and len(rows) <= 6          # petites listes : cartes à droite ; sinon sous la carte
        c = self.c

        main_w = (CW - 12 - 168) if beside else CW
        ncols = 2 if main_w > 400 else 1
        pad = 16
        col_gap = 16
        col_w = (main_w - 2 * pad - (ncols - 1) * col_gap) / ncols
        txt_w = col_w - 46
        heights = []
        for r in rows:
            lines = _wrap(r["text"], "P", 8.4, txt_w)
            heights.append(12 + len(lines) * 11.6 + 10)
        cols: List[List[int]] = [[] for _ in range(ncols)]
        tot = sum(heights)
        acc = 0.0
        ci = 0
        for i, h in enumerate(heights):
            if ncols > 1 and ci < ncols - 1 and acc + h / 2 > tot / ncols:
                ci += 1
                acc = 0.0
            cols[ci].append(i)
            acc += h
        col_h = [sum(heights[i] for i in col) for col in cols]
        title_h = 30
        main_h = title_h + (max(col_h) if col_h else 0) + pad

        side_w = 168
        side_h = 0.0
        if beside:
            if likes:
                side_h += self._list_h(likes, side_w) + 10
            if concerns:
                side_h += self._list_h(concerns, side_w)
        total_h = max(main_h, side_h)

        self.need(min(total_h, 600))
        top = self.y
        _card(c, M, top - main_h, main_w, main_h)
        _text(c, M + pad, top - 21, (self.d.get("profile_title") or "TON PROFIL").upper(), "PB", 9.2, INK, spacing=2.2)
        for ci, col in enumerate(cols):
            x0 = M + pad + ci * (col_w + col_gap)
            yy = top - title_h - 6
            for i in col:
                r = rows[i]
                tone = "pink" if i % 2 == 0 else "blue"
                h = heights[i]
                _icon_disc(c, x0 + 15, yy - 15, 15, r.get("icon") or "sparkle", tone)
                _text(c, x0 + 40, yy - 8, r.get("cap") or "", "PB", 7.4, INK)
                _paragraph(c, x0 + 40, yy - 11, r["text"], txt_w, size=8.4, color=GREY, leading=11.6)
                yy -= h

        if beside:
            sx = M + main_w + 12
            sy = top
            if likes:
                sy -= self._list_card(sx, sy, side_w, self.d.get("ingredients_title") or "Tes ingrédients préférés", likes, "blue") + 10
            if concerns:
                self._list_card(sx, sy, side_w, self.d.get("concerns_title") or "Tes préoccupations", concerns, "pink")
            self.y = top - total_h - 22
        elif side:
            self.y = top - main_h - 12
            hh = max(
                (self._list_h(likes, (CW - 12) / 2 if concerns else CW) if likes else 0),
                (self._list_h(concerns, (CW - 12) / 2 if likes else CW) if concerns else 0),
            )
            self.need(hh + 6)
            top2 = self.y
            if likes and concerns:
                w2 = (CW - 12) / 2
                self._list_card(M, top2, w2, self.d.get("ingredients_title") or "Tes ingrédients préférés", likes, "blue")
                self._list_card(M + w2 + 12, top2, w2, self.d.get("concerns_title") or "Tes préoccupations", concerns, "pink")
            elif likes:
                self._list_card(M, top2, CW, self.d.get("ingredients_title") or "Tes ingrédients préférés", likes, "blue")
            else:
                self._list_card(M, top2, CW, self.d.get("concerns_title") or "Tes préoccupations", concerns, "pink")
            self.y = top2 - hh - 22
        else:
            self.y = top - main_h - 22

    # ---- cartes produits
    def _product_card(self, x, y_top, w, h, item: Dict[str, Any], idx: int, tone: str, numbered=True) -> None:
        c = self.c
        p = self.products.get(item.get("product_id"))
        bg = PINK_L if tone == "pink" else BLUE_L
        edge = PINK if tone == "pink" else BLUE
        accent = PINK_D if tone == "pink" else BLUE_D
        _round_rect(c, x, y_top - h, w, h, 12, fill=bg, stroke=edge, lw=0.6)
        # en-tête
        label = (item.get("slot") or "").upper()
        cx = x + 14
        if numbered:
            c.saveState()
            c.setFillColor(PINK_D if tone == "pink" else BLUE)
            c.circle(cx + 7, y_top - 17, 8.5, stroke=0, fill=1)
            c.restoreState()
            _text(c, cx + 7, y_top - 19.8, f"{idx:02d}", "PB", 6.8, white, anchor="c")
            tx = cx + 22
        else:
            tx = cx
        lines = _wrap(label, "PB", 8.3, w - (tx - x) - 12)
        _text(c, tx, y_top - 20, lines[0], "PB", 8.3, INK, spacing=0.4)
        sub = item.get("subtitle") or ""
        if sub:
            _text(c, tx, y_top - 30, sub[:42], "P", 6.8, accent)
        if not p:
            _text(c, x + w / 2, y_top - h / 2, "Produit indisponible", "P", 8, GREY, anchor="c")
            return
        # image
        ih = 104
        ix, iy = x + 10, y_top - 40 - ih
        _round_rect(c, ix, iy, w - 20, ih, 9, fill=white)
        img = p.get("image_bytes")
        if img:
            try:
                ir = ImageReader(io.BytesIO(img))
                iw0, ih0 = ir.getSize()
                sc = min((w - 20 - 14) / iw0, (ih - 12) / ih0)
                dw, dh = iw0 * sc, ih0 * sc
                c.drawImage(ir, ix + (w - 20 - dw) / 2, iy + (ih - dh) / 2, dw, dh, mask="auto")
            except Exception:
                img = None
        if not img:
            _icon_disc(c, ix + (w - 20) / 2, iy + ih / 2, 22, "sparkle", tone)
        url = p.get("affiliate_url") or ""
        if url.startswith("http"):
            c.linkURL(url, (ix, iy, ix + w - 20, iy + ih), relative=0, thickness=0)
        # textes
        ty = iy - 8
        brand = (p.get("brand") or "").upper()[:30]
        _text(c, x + 12, ty - 7, brand, "PB", 6.6, accent, spacing=0.8)
        nlines = _wrap(p.get("name") or "", "PM", 8.2, w - 24)[:3]
        for k, ln in enumerate(nlines):
            _text(c, x + 12, ty - 19 - k * 10.2, ln + ("…" if k == 2 and len(_wrap(p.get("name") or "", "PM", 8.2, w - 24)) > 3 else ""), "PM", 8.2, INK)
        yy = ty - 19 - 3 * 10.2 - 3
        score = item.get("score")
        if score:
            _text(c, x + 12, yy - 6, f"Compatibilité {int(score)} %", "PM", 6.8, accent)
        # prix + bouton
        by = y_top - h + 12
        _text(c, x + 12, by + 5, _price(p.get("price")), "PB", 11.5, INK)
        bw, bh = 74, 20
        bx = x + w - 12 - bw
        _round_rect(c, bx, by - 1, bw, bh, 10, fill=PINK, stroke=None)
        _text(c, bx + bw / 2 - 4, by + 5.2, "Voir le produit", "PB", 6.9, INK, anchor="c")
        _arrow(c, bx + bw - 14, by + 8.7, 8, INK, 1.0)
        if url.startswith("http"):
            c.linkURL(url, (bx, by - 1, bx + bw, by + bh - 1), relative=0, thickness=0)

    def product_grid(self, items: List[Dict[str, Any]], numbered=True, start=1) -> None:
        cols = 3
        gap = 10
        cw = (CW - gap * (cols - 1)) / cols
        ch = 252
        i = 0
        n = len(items)
        while i < n:
            self.need(ch + 12)
            row = items[i:i + cols]
            for j, it in enumerate(row):
                idx = start + i + j
                tone = "pink" if (i + j) % 2 == 0 else "blue"
                self._product_card(M + j * (cw + gap), self.y, cw, ch, it, idx, tone, numbered)
            self.y -= ch + 12
            i += cols

    def featured(self, item: Dict[str, Any]) -> None:
        """Grande carte du produit n°1 (quiz produit / problème)."""
        c = self.c
        p = self.products.get(item.get("product_id"))
        if not p:
            return
        h = 196
        self.need(h + 14)
        top = self.y
        _card(c, M, top - h, CW, h, r=16, fill=white, stroke=PINK)
        # image
        iw = 190
        _round_rect(c, M + 10, top - h + 10, iw, h - 20, 12, fill=white, stroke=PINK_M, lw=0.8)
        img = p.get("image_bytes")
        if img:
            try:
                ir = ImageReader(io.BytesIO(img))
                w0, h0 = ir.getSize()
                sc = min((iw - 24) / w0, (h - 44) / h0)
                c.drawImage(ir, M + 10 + (iw - w0 * sc) / 2, top - h + 10 + (h - 20 - h0 * sc) / 2, w0 * sc, h0 * sc, mask="auto")
            except Exception:
                img = None
        if not img:
            _icon_disc(c, M + 10 + iw / 2, top - h / 2, 30, "sparkle", "pink")
        url = p.get("affiliate_url") or ""
        if url.startswith("http"):
            c.linkURL(url, (M + 10, top - h + 10, M + 10 + iw, top - 10), relative=0, thickness=0)
        # texte
        tx = M + iw + 30
        tw_ = CW - iw - 44
        label = item.get("subtitle") or "Recommandé pour toi"
        lw = _tw(label.upper(), "PB", 6.8, 0.8) + 18
        _round_rect(c, tx, top - 30, lw, 16, 8, fill=PINK)
        _text(c, tx + 9, top - 25.3, label.upper(), "PB", 6.8, INK, spacing=0.8)
        score = item.get("score")
        if score:
            _text(c, M + CW - 16, top - 26, f"{int(score)} %", "PB", 17, PINK_D, anchor="r")
            _text(c, M + CW - 16, top - 36, "compatibilité", "P", 6.5, GREY, anchor="r")
        _text(c, tx, top - 48, (p.get("brand") or "").upper()[:34], "PB", 7.4, BLUE_D, spacing=1.2)
        yy = top - 52
        for ln in _wrap(p.get("name") or "", "PB", 12.2, tw_)[:3]:
            _text(c, tx, yy - 12, ln, "PB", 12.2, INK)
            yy -= 15
        reasons = item.get("reasons") or ""
        if reasons:
            yy -= 4
            used = _paragraph(c, tx, yy, "Pourquoi ce choix ? " + reasons, tw_, size=8, color=GREY, leading=11, max_lines=4)
            yy -= used
        by = top - h + 18
        _text(c, tx, by + 4, _price(p.get("price")), "PB", 17, INK)
        bw, bh = 118, 26
        bx = M + CW - 16 - bw
        _round_rect(c, bx, by - 3, bw, bh, 13, fill=PINK)
        _text(c, bx + bw / 2 - 6, by + 5, "Voir le produit", "PB", 8.2, INK, anchor="c")
        _arrow(c, bx + bw - 22, by + 9.6, 9, INK, 1.1)
        if url.startswith("http"):
            c.linkURL(url, (bx, by - 3, bx + bw, by - 3 + bh), relative=0, thickness=0)
        self.y = top - h - 18

    def message(self, text: str) -> None:
        c = self.c
        lines = _wrap(text, "P", 9, CW - 40)
        h = len(lines) * 13 + 26
        self.need(h + 10)
        _card(c, M, self.y - h, CW, h, r=12, fill=PINK_L, shadow=False)
        for k, ln in enumerate(lines):
            _text(c, M + 20, self.y - 22 - k * 13, ln, "P", 9, INK)
        self.y -= h + 16

    def total_band(self, total: float, count: int) -> None:
        c = self.c
        h = 44
        self.need(h + 12)
        _card(c, M, self.y - h, CW, h, r=14, fill=white, stroke=PINK)
        _text(c, M + 20, self.y - 26, f"Coût estimé de ta routine complète ({count} produit{'s' if count > 1 else ''})", "P", 9, GREY)
        _text(c, M + CW - 20, self.y - 29, _price(total), "PB", 17, INK, anchor="r")
        self.y -= h + 16

    # ---- conseils, étapes, citation
    def tips(self) -> None:
        tips = self.d.get("tips") or []
        if not tips:
            return
        c = self.c
        n = len(tips)
        gap = 8
        pad = 10
        cw = (CW - 2 * pad - gap * (n - 1)) / n
        tl = [_wrap(t["title"], "PB", 7.8, cw - 16)[:2] for t in tips]
        xl = [_wrap(t["text"], "P", 7.4, cw - 18) for t in tips]
        inner = max(52 + len(tl[i]) * 9.5 + 6 + len(xl[i]) * 9.6 + 12 for i in range(n))
        h = 34 + inner + pad
        self.need(h + 16)
        top = self.y
        _card(c, M, top - h, CW, h, r=14, fill=PINK_L, shadow=False)
        _text(c, M + 18, top - 22, "NOS CONSEILS POUR DE MEILLEURS RÉSULTATS", "PB", 8.4, INK, spacing=1.8)
        for i, t in enumerate(tips):
            x = M + pad + i * (cw + gap)
            cx = x + cw / 2
            _card(c, x, top - h + pad, cw, inner, r=10, fill=white, shadow=False)
            _icon_disc(c, cx, top - 34 - 24, 17, t.get("icon") or "sparkle", "pink" if i % 2 == 0 else "blue")
            yy = top - 34 - 52
            for k, ln in enumerate(tl[i]):
                _text(c, cx, yy - k * 9.5, ln, "PB", 7.8, INK, anchor="c")
            yy -= len(tl[i]) * 9.5 + 3
            for k, ln in enumerate(xl[i]):
                _text(c, cx, yy - 6 - k * 9.6, ln, "P", 7.4, GREY, anchor="c")
        self.y -= h + 16

    def next_steps(self) -> None:
        steps = self.d.get("next_steps") or []
        if not steps:
            return
        c = self.c
        wlines = [_wrap(s, "P", 8.4, CW - 80) for s in steps]
        h = 40 + sum(len(l) * 11.4 + 6 for l in wlines) + 10
        quote = self.d.get("quote")
        qh = 0
        if quote:
            ql = _wrap(quote, "BI", 10.5, CW - 110)
            qh = len(ql) * 13.5 + 26
        self.need(h + qh + 20)
        top = self.y
        _card(c, M, top - h, CW, h, r=14, fill=BLUE_L, shadow=False)
        _text(c, M + 18, top - 23, "TES PROCHAINES ÉTAPES", "PB", 8.4, INK, spacing=1.8)
        yy = top - 36
        for ls in wlines:
            c.saveState()
            c.setFillColor(white)
            c.circle(M + 26, yy - 6.5, 7.5, stroke=0, fill=1)
            c.restoreState()
            _check(c, M + 26, yy - 6.5, 3.6, BLUE_D, 1.3)
            for k, ln in enumerate(ls):
                _text(c, M + 42, yy - 9 - k * 11.4, ln, "P", 8.4, INK)
            yy -= len(ls) * 11.4 + 6
        self.y = top - h - 12
        if quote:
            _card(c, M, self.y - qh, CW, qh, r=18, fill=PINK_M, shadow=False)
            _heart(c, M + 30, self.y - qh / 2, 9, PINK_D, 0.85, stroke_only=True)
            for k, ln in enumerate(ql):
                _text(c, W / 2, self.y - 21 - k * 13.5, ln, "BI", 10.5, PINK_D, anchor="c")
            _heart(c, M + CW - 30, self.y - qh / 2, 7, PINK_D, 0.8)
            self.y -= qh + 14

    def fine_print(self) -> None:
        notes = []
        if self.d.get("disclaimer"):
            notes.append(self.d["disclaimer"])
        notes.append("Les produits sont proposés à titre indicatif d'après tes réponses ; ce document ne remplace pas l'avis d'un professionnel de santé ou d'un dermatologue.")
        notes.append("Les liens de ce document sont des liens affiliés : Beautify Vision peut percevoir une commission si tu achètes via ces liens, sans surcoût pour toi. Les prix sont indicatifs et peuvent varier.")
        text = "  ".join(notes)
        lines = _wrap(text, "PL", 6.6, CW)
        h = len(lines) * 8.6 + 6
        self.need(h + 6)
        for k, ln in enumerate(lines):
            _text(self.c, M, self.y - 8 - k * 8.6, ln, "PL", 6.6, GREY_L)
        self.y -= h

    def build(self) -> bytes:
        d = self.d
        self.profile_block()
        for blk in d.get("blocks", []):
            kind = blk["type"]
            if kind == "heading":
                self.heading(blk["lead"], blk["accent"], blk.get("note"), blk.get("extra", 0))
            elif kind == "subheading":
                self.sub_heading(blk["text"], blk.get("tone", "pink"), blk.get("extra", 0))
            elif kind == "grid":
                self.product_grid(blk["items"], numbered=blk.get("numbered", True), start=blk.get("start", 1))
            elif kind == "featured":
                self.featured(blk["item"])
            elif kind == "message":
                self.message(blk["text"])
            elif kind == "total":
                self.total_band(blk["total"], blk["count"])
        self.tips()
        self.next_steps()
        self.fine_print()
        self.c.showPage()
        self.c.save()
        return self.buf.getvalue()


def build_recap_pdf(data: Dict[str, Any], products: Dict[str, Dict[str, Any]]) -> bytes:
    return Recap(data, products).build()


# ----------------------------------------------------------------- composition
TIPS = {
    "skin": [
        {"icon": "sparkle", "title": "Un nouveau soin à la fois", "text": "Ajoute un produit par semaine pour repérer ce que ta peau tolère vraiment."},
        {"icon": "sun", "title": "Protège-toi du soleil", "text": "Un SPF 50 chaque matin aide à prévenir taches et vieillissement."},
        {"icon": "clock", "title": "Sois régulier", "text": "Compte 4 à 8 semaines d'utilisation avant de juger les résultats d'un soin."},
        {"icon": "leaf", "title": "Teste avant d'adopter", "text": "Fais un essai sur le poignet 24 h avant d'appliquer un nouvel actif."},
    ],
    "hair": [
        {"icon": "drop", "title": "Hydrate régulièrement", "text": "L'hydratation est la clé de cheveux souples et plus faciles à coiffer."},
        {"icon": "moon", "title": "Protège tes cheveux la nuit", "text": "Un bonnet ou une taie en satin ou en soie limite les frottements et la casse."},
        {"icon": "waves", "title": "Démêle en douceur", "text": "Privilégie un peigne à dents larges sur cheveux mouillés, des pointes vers les racines."},
        {"icon": "fire", "title": "Limite la chaleur", "text": "Espace les appareils chauffants et utilise une protection thermique."},
    ],
}
QUOTES = {
    "skin": "Une routine adaptée aujourd'hui, une peau plus belle et plus équilibrée demain !",
    "hair": "Des cheveux en bonne santé aujourd'hui, pour encore plus de longueur demain !",
}
NEXT = {
    "skin": [
        "Adopter cette routine pendant au moins 8 semaines.",
        "Observer les résultats et ajuster si besoin.",
        "Garder un rythme régulier pour une peau plus saine et plus équilibrée.",
    ],
    "hair": [
        "Adopter cette routine pendant au moins 8 semaines.",
        "Observer les résultats et ajuster si besoin.",
        "Garder un rythme régulier pour des cheveux plus forts et en meilleure santé.",
    ],
}


def compose(payload: Dict[str, Any]) -> Dict[str, Any]:
    kind = payload.get("kind") or "produit"
    tk = "hair" if payload.get("tips_kind") == "hair" else "skin"
    d: Dict[str, Any] = {
        "title": payload.get("title") or "Mon bilan beauté",
        "doc_title": payload.get("doc_title") or "Mon bilan Beautify Vision",
        "profile_title": payload.get("profile_title") or "Ton profil",
        "diagnostic": payload.get("diagnostic") or [],
        "concerns": payload.get("concerns") or [],
        "ingredients": payload.get("ingredients") or [],
        "disclaimer": payload.get("disclaimer"),
        "tips": TIPS[tk],
        "next_steps": NEXT[tk],
        "quote": QUOTES[tk],
        "blocks": [],
    }
    blocks = d["blocks"]
    items = payload.get("main_items") or []
    others = payload.get("others") or []
    if kind == "routine":
        blocks.append({"type": "heading", "lead": "Ta routine", "accent": "personnalisée",
                       "note": "Une sélection de produits adaptée à tes besoins. Clique sur « Voir le produit » pour accéder à l'offre.", "extra": 240})
        if not items:
            blocks.append({"type": "message", "text": "Aucun produit n'a été sélectionné pour cette routine."})
        groups: List[str] = []
        for it in items:
            g = it.get("group") or ""
            if g not in groups:
                groups.append(g)
        n = 0
        for g in groups:
            part = [it for it in items if (it.get("group") or "") == g]
            if len(groups) > 1 and g:
                blocks.append({"type": "subheading", "text": g, "tone": "pink" if groups.index(g) % 2 == 0 else "blue", "extra": 252})
            blocks.append({"type": "grid", "items": part, "start": n + 1})
            n += len(part)
        missing = payload.get("missing_steps") or []
        if missing:
            blocks.append({"type": "message", "text": "Aucun produit assez adapté à tes critères n'a été trouvé pour : " + ", ".join(m.lower() for m in missing) + ". Tu peux refaire le quiz de ces produits en élargissant tes critères."})
        if payload.get("total"):
            blocks.append({"type": "total", "total": float(payload["total"]), "count": int(payload.get("total_count") or n)})
        if payload.get("budget_note"):
            blocks.append({"type": "message", "text": payload["budget_note"]})
    else:
        if items and not payload.get("no_match"):
            blocks.append({"type": "heading", "lead": "Ton produit", "accent": "idéal",
                           "note": payload.get("note") or "Le produit qui correspond le mieux à tes réponses.", "extra": 196})
            blocks.append({"type": "featured", "item": items[0]})
        else:
            blocks.append({"type": "heading", "lead": "Tes pistes", "accent": "produits", "extra": 90})
            blocks.append({"type": "message", "text": payload.get("no_match_text") or "Aucun produit ne coche toutes tes cases pour l'instant : voici les propositions les plus proches de tes critères."})
        if others:
            blocks.append({"type": "subheading", "text": "Les 3 autres produits qui pourraient te plaire" if items and not payload.get("no_match") else "Les produits les plus proches", "tone": "blue", "extra": 252})
            blocks.append({"type": "grid", "items": others, "numbered": False})
    return d


def render(payload: Dict[str, Any], products: Dict[str, Dict[str, Any]]) -> bytes:
    return build_recap_pdf(compose(payload), products)


# ----------------------------------------------------------------- nettoyage de l'entrée
def _s(v: Any, n: int = 300) -> str:
    return str(v if v is not None else "").strip()[:n]


def _item(it: Any) -> Dict[str, Any]:
    it = it if isinstance(it, dict) else {}
    try:
        score = max(0, min(100, int(float(it.get("score") or 0))))
    except (TypeError, ValueError):
        score = 0
    return {
        "product_id": _s(it.get("product_id"), 80),
        "slot": _s(it.get("slot"), 60),
        "subtitle": _s(it.get("subtitle"), 60),
        "group": _s(it.get("group"), 60),
        "reasons": _s(it.get("reasons"), 320),
        "score": score,
    }


def sanitize(body: Any) -> Dict[str, Any]:
    """Garde uniquement les champs attendus, tronque les textes et limite les listes."""
    b = body if isinstance(body, dict) else {}
    kind = _s(b.get("kind"), 12)
    out: Dict[str, Any] = {
        "kind": kind if kind in ("routine", "produit", "probleme") else "produit",
        "tips_kind": "hair" if b.get("tips_kind") == "hair" else "skin",
        "title": _s(b.get("title"), 60) or "Mon bilan beauté",
        "doc_title": _s(b.get("doc_title"), 90),
        "profile_title": _s(b.get("profile_title"), 50),
        "concerns_title": _s(b.get("concerns_title"), 40),
        "ingredients_title": _s(b.get("ingredients_title"), 40),
        "note": _s(b.get("note"), 200),
        "no_match": bool(b.get("no_match")),
        "no_match_text": _s(b.get("no_match_text"), 300),
        "disclaimer": _s(b.get("disclaimer"), 420) or None,
        "diagnostic": [
            {"cap": _s(r.get("cap"), 60), "text": _s(r.get("text"), 320), "icon": _s(r.get("icon"), 30) or "sparkle"}
            for r in (b.get("diagnostic") or [])[:30] if isinstance(r, dict) and r.get("text")
        ],
        "concerns": [_s(x, 80) for x in (b.get("concerns") or [])[:30] if x],
        "ingredients": [_s(x, 80) for x in (b.get("ingredients") or [])[:30] if x],
        "main_items": [_item(x) for x in (b.get("main_items") or [])[:40]],
        "missing_steps": [_s(x, 60) for x in (b.get("missing_steps") or [])[:30] if x],
        "budget_note": _s(b.get("budget_note"), 320) if b.get("budget_note") else "",
        "others": [_item(x) for x in (b.get("others") or [])[:6]],
    }
    try:
        out["total"] = round(float(b.get("total") or 0), 2)
        out["total_count"] = int(b.get("total_count") or 0)
    except (TypeError, ValueError):
        out["total"], out["total_count"] = 0, 0
    return out


def product_ids(payload: Dict[str, Any]) -> List[str]:
    ids: List[str] = []
    for it in payload.get("main_items", []) + payload.get("others", []):
        if it["product_id"] and it["product_id"] not in ids:
            ids.append(it["product_id"])
    return ids
