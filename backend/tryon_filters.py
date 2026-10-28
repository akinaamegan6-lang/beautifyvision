"""Filtres de cohérence pour l'essayage IA (fonctions pures, testables).

- Accessoires / outils (pince à épiler, griffe de crabe, ciseaux...) : jamais
  des produits de soin ou de maquillage, donc jamais proposés sur le site.
- Baumes à lèvres « soin » : ne colorent pas, donc pas des rouges à lèvres.
- Couleurs inhabituelles demandées (lèvres vertes, joues bleues...) : on ne
  propose un produit pour cette zone que si sa teinte est confirmée (mot de
  couleur dans le nom ou color_hex proche). Sinon aucun produit, aucun point.
"""
import colorsys
import re
import unicodedata
from typing import Dict, List, Optional


def norm(text: str) -> str:
    t = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode("ascii")
    return t.strip().lower()


# --------------------------------------------------------------------------
# Accessoires / outils : hors sujet (ni soin, ni maquillage)
# --------------------------------------------------------------------------
ACCESSORY_RE = re.compile(
    r"\b(pinces?|tweezers?|griffes? de crabe|ciseaux|coupe[- ]?ongles?|taille[- ]?crayons?|"
    r"recourbe[- ]?cils|tondeuses?|rasoirs?|peignes?|barrettes?|elastiques?|epingles?|"
    r"bigoudis?|seche[- ]?cheveux|lisseurs?|epilateurs?)\b"
)


def is_accessory(name: str) -> bool:
    return bool(ACCESSORY_RE.search(norm(name)))


# --------------------------------------------------------------------------
# Baumes à lèvres de soin (pas de couleur) : pas des rouges à lèvres
# --------------------------------------------------------------------------
_BALM_RE = re.compile(
    r"\b(baume|baumes|balm|balms|lip ?care|soin|soins|stick hydratant|protecteur|protection|"
    r"repulpant|gommage|scrub|masque|beurre de|cold cream|cicatrisant|reparateur)\b"
)
_TINT_RE = re.compile(r"\b(teint|teinte|teintee?|tinted|tint|color|colour|couleur|rouge|gloss|lipstick)\b")


def is_plain_lip_balm(name: str) -> bool:
    n = norm(name)
    return bool(_BALM_RE.search(n)) and not _TINT_RE.search(n)


# --------------------------------------------------------------------------
# Couleurs inhabituelles demandées par zone
# --------------------------------------------------------------------------
ZONE_WORDS: Dict[str, List[str]] = {
    "lips": ["bouche", "levres", "levre", "rouge a levres", "lipstick", "gloss", "lip"],
    "cheeks": ["joues", "joue", "blush"],
    "liner": ["eyeliner", "liner"],
    "lashes": ["cils", "mascara"],
    "brows": ["sourcils", "sourcil"],
}

# Famille -> (mots de couleur, libellé affiché). Volontairement limité aux
# teintes vraiment inhabituelles (le rose, le rouge, le nude, le prune, le
# marron... existent partout et restent gérés par l'IA de sélection).
FAMILIES: Dict[str, Dict] = {
    "vert": {"words": ["vert", "verte", "verts", "vertes", "green", "emeraude", "kaki", "olive", "menthe", "sauge"], "hue": (75, 170)},
    "bleu": {"words": ["bleu", "bleue", "bleus", "bleues", "blue", "turquoise", "marine", "navy", "cyan", "azur"], "hue": (180, 260)},
    "jaune": {"words": ["jaune", "jaunes", "yellow", "moutarde"], "hue": (45, 70)},
    "violet": {"words": ["violet", "violette", "violets", "violettes", "purple", "lilas", "lavande"], "hue": (262, 320)},
    "blanc": {"words": ["blanc", "blanche", "blancs", "blanches", "white"], "hue": None},
    "noir": {"words": ["noir", "noire", "noirs", "noires", "black"], "hue": None},
}
# Le noir est courant pour eyeliner et mascara : on ne l'exige que pour les lèvres et les joues.
FAMILY_ZONES = {
    "vert": {"lips", "cheeks", "liner", "lashes", "brows"},
    "bleu": {"lips", "cheeks", "liner", "lashes", "brows"},
    "jaune": {"lips", "cheeks", "liner", "lashes", "brows"},
    "violet": {"lips", "cheeks", "liner", "lashes", "brows"},
    "blanc": {"lips", "cheeks", "liner", "lashes", "brows"},
    "noir": {"lips", "cheeks"},
}


def _word_positions(text: str, words: List[str]) -> List[tuple]:
    out = []
    for w in words:
        for m in re.finditer(r"(?<![a-z])" + re.escape(w) + r"(?![a-z])", text):
            out.append((m.start(), w))
    return out


def requested_unusual_colors(prompt: str) -> List[Dict[str, str]]:
    """Retourne [{zone, family, word}] pour chaque couleur inhabituelle
    explicitement associée à une zone dans la demande (ex. « bouche verte »
    -> lips/vert). La couleur est rattachée à la zone la plus proche, dans la
    même proposition."""
    found: Dict[tuple, Dict[str, str]] = {}
    for clause in re.split(r"[,.;!?\n]| et | puis | avec ", norm(prompt)):
        if not clause.strip():
            continue
        zones = []
        for z, words in ZONE_WORDS.items():
            zones += [(pos, z) for pos, _ in _word_positions(clause, words)]
        if not zones:
            continue
        for fam, spec in FAMILIES.items():
            for pos, word in _word_positions(clause, spec["words"]):
                zone = min(zones, key=lambda zp: abs(zp[0] - pos))[1]
                if zone in FAMILY_ZONES[fam]:
                    found[(zone, fam)] = {"zone": zone, "family": fam, "word": word}
    return list(found.values())


def _hue_ok(hex_color: Optional[str], family: str) -> bool:
    if not hex_color or not re.fullmatch(r"#[0-9a-fA-F]{6}", hex_color):
        return False
    r, g, b = (int(hex_color[i:i + 2], 16) / 255 for i in (1, 3, 5))
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    if family == "noir":
        return v < 0.2
    if family == "blanc":
        return s < 0.12 and v > 0.88
    lo, hi = FAMILIES[family]["hue"]
    return s >= 0.25 and v >= 0.2 and lo <= h * 360 <= hi


def product_matches_family(product: dict, family: str) -> bool:
    """Vrai seulement si la teinte du produit est confirmée : mot de couleur
    de la famille dans le nom, ou color_hex dans la bonne plage de teinte."""
    name = norm(product.get("name", ""))
    if _word_positions(name, FAMILIES[family]["words"]):
        return True
    return _hue_ok(product.get("color_hex"), family)


def conflicts_for(product: dict, zone: str, requested: List[Dict[str, str]]) -> Optional[Dict[str, str]]:
    """Si la demande exige une couleur inhabituelle pour cette zone et que le
    produit ne la confirme pas, renvoie la demande en conflit."""
    for req in requested:
        if req["zone"] == zone and not product_matches_family(product, req["family"]):
            return req
    return None
