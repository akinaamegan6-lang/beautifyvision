"""
Import d'un flux produits Awin (CSV) dans la base MongoDB de Beautify Vision.

Usage :
    python3 scripts/import_awin_feed.py /chemin/vers/datafeed_XXXX.csv

- Lit le CSV (format export Awin standard).
- Ecarte ce qui n'est pas un vrai produit beaute pour Beautify Vision
  (parfums, linge de maison, accessoires/outils, complements alimentaires,
  sante sexuelle, vernis a ongles, teintures capillaires, produits sans
  marque).
- Classe chaque produit restant dans une (parent, categorie) de la taxonomie
  deja utilisee par le site, a partir de mots-cles reels trouves dans le nom
  / la description / le chemin de categorie Awin.
- Deduit des tags/types de peau/types de cheveux/bienfaits UNIQUEMENT quand
  le mot-cle correspondant apparait vraiment dans le texte du produit (pas
  d'invention : si rien n'est trouve, le champ reste vide).
- Upsert chaque produit dans MongoDB (collection "products"), avec un id
  stable (aw_product_id) pour pouvoir relancer l'import plusieurs fois sans
  creer de doublons.
- Ecrit un rapport (compte par categorie, produits ecartes) dans
  scripts/import_report.txt pour verification.

Note notes/avis : ce flux Awin ne contient aucune vraie note pour les
produits beaute. En attendant de vraies notes clients, chaque produit importe
recoit une note par defaut (RATING_DEFAULT) et 0 avis, plutot que d'inventer
un historique d'avis qui n'existe pas.
"""
import csv
import html
import os
import re
import sys
import unicodedata
import uuid
from collections import Counter

from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

RATING_DEFAULT = 4.0


def norm_text(s):
    """Minuscule, sans accents, entites HTML decodees. Utilise pour TOUTES
    les comparaisons de mots-cles, cote texte produit ET cote mot-cle, pour
    que "sérum"/"serum", "crème"/"creme", "Étuis"/"etui" se matchent entre
    eux sans avoir a lister chaque variante."""
    s = html.unescape(s or "")
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.lower()


REVIEWS_DEFAULT = 0

# Taille (en pixels) demandee au CDN d'images Awin (images2.productserve.com).
# Le flux fournit des vignettes 200x200 : trop petites pour les grandes cartes
# produit du site, elles y apparaissent floues/pixelisees une fois agrandies.
IMAGE_TARGET_SIZE = 600


def upgrade_image_url(url):
    """Demande une image plus grande et sans fond blanc ajoute au CDN Awin.

    Le flux fournit des URLs du type :
      https://images2.productserve.com/?w=200&h=200&bg=white&trim=5&t=letterbox&url=...&feedId=...&k=...
    On ne modifie QUE w=, h= et bg= par un remplacement de texte simple : on ne
    touche jamais a url=/feedId=/k= (la signature k pourrait ne plus
    correspondre si on les reencodait). bg=transparent retire le cadre blanc
    que le CDN ajoutait autour du produit pour completer le carre demande,
    ce qui laisse apparaitre le fond (degrade rose/bleu) des cartes du site
    au lieu d'un bloc blanc. Les URLs qui ne viennent pas de ce CDN (ou sans
    ces parametres) sont renvoyees telles quelles.
    """
    if not url or "productserve.com" not in url:
        return url
    url = re.sub(r'([?&]w=)\d+', r'\g<1>' + str(IMAGE_TARGET_SIZE), url)
    url = re.sub(r'([?&]h=)\d+', r'\g<1>' + str(IMAGE_TARGET_SIZE), url)
    url = re.sub(r'([?&]bg=)[^&]*', r'\g<1>transparent', url)
    return url

# ---------------------------------------------------------------------------
# 1) Merchants / categories completement hors sujet pour Beautify Vision
# ---------------------------------------------------------------------------
EXCLUDE_MERCHANTS = {"ANITA & ZAHA"}  # linge de maison / mobilier

EXCLUDE_CATEGORY_NAME = {
    "Fragrance", "Furniture Accessories", "Bedding", "Pillowcases & Shams",
    "Duvet Covers", "Bed Sheets", "General Household", "Furniture",
}

# Deuxieme niveau du chemin merchant_category a exclure (accessoires /
# outils / complements / hors-sujet) même si category_name n'est pas filtré.
# NB: "hair styling tool" (sans le "s" final) et "hairbrush" (sans "es")
# sont volontairement des racines courtes : elles doivent matcher aussi bien
# "Hair Styling Tools" que "Hair Styling Tool Accessories", et aussi bien
# "Combs & Brushes" (deja couvert par "combs & brushes") que "Hairbrushes &
# Combs" (ordre inverse, qui echappait a l'ancienne liste) sans avoir a lister
# toutes les combinaisons d'ordre des mots.
EXCLUDE_PATH_CONTAINS = [
    "etui", "hair styling tool", "hair pins", "combs & brushes", "hairbrush",
    "hair accessories", "headband", "gift card", "vitamins", "supplements",
    "sante sexuelle", "santé sexuelle", "supplementation", "coloration et decoloration",
    "coloration et décoloration", "ongles", "nail",
    # Outils de coiffage / accessoires capillaires divers (pas des produits
    # de soin : rien a appliquer, rien a recommander dans un quiz beaute)
    "hair curler", "ponytail holder", "hair pin",
    # Articles hors beaute presents dans le flux de certains marchands
    # (linge de bain/lit, bagagerie) qui se glissaient dans les resultats
    # (ex: une housse de couette classee a tort comme masque capillaire)
    "travel bottle", "toiletry bag", "tote bag", "shower visor", "shower cap",
    "soap dish", "towel", "pillowcase", "duvet", "bed sheet", "decor",
]

# ---------------------------------------------------------------------------
# 2) Taxonomie Beautify Vision (slug -> parent) + mots-cles de classification
#    Ordre = priorite : le premier slug dont un mot-cle matche l'emporte.
# ---------------------------------------------------------------------------
CATEGORY_RULES = [
    # --- Desambiguisation corps vs visage (a tester AVANT les regles visage
    # generiques comme "serum"/"creme" qui matchent sur de simples mots bruts
    # et attraperaient a tort des produits corps dont le fil de categorie Awin
    # dit explicitement "Corporel(le) > Hydratation" etc.) ---
    ("creme-corps", "corps", ["corporel > hydratation", "corporelle > hydratation", "corps > hydratation", "body > moisturis"]),

    # --- Cheveux (specifique avant generique) ---
    ("shampoing-sec", "cheveux", ["shampoing sec", "shampooing sec", "dry shampoo"]),
    ("apres-shampoing", "cheveux", ["après-shampoing", "apres-shampoing", "après shampoing", "conditioner", "démêlant cheveux"]),
    ("masque-cheveux", "cheveux", ["masque cheveux", "masque capillaire", "hair mask"]),
    ("soin-anti-chute", "cheveux", ["anti-chute", "anti chute", "chute de cheveux", "hair loss", "densifiant cheveux"]),
    ("soin-cuir-chevelu", "cheveux", ["cuir chevelu", "scalp"]),
    ("soin-cheveux-colores", "cheveux", ["cheveux colorés", "protège couleur", "protege couleur", "color protect"]),
    ("huile-cheveux", "cheveux", ["huile cheveux", "huile capillaire", "hair oil"]),
    ("serum-cheveux", "cheveux", ["sérum cheveux", "serum cheveux", "sérum capillaire"]),
    ("spray-coiffant", "cheveux", ["spray coiffant", "spray cheveux", "mousse coiffante", "gel coiffant", "laque cheveux", "crème coiffante", "styling"]),
    ("shampoing", "cheveux", ["shampoing", "shampooing", "shampoo"]),

    # --- Maquillage (cosmetiques) ---
    ("mascara", "cosmetiques", ["mascara"]),
    ("eyeliner", "cosmetiques", ["eyeliner", "crayon yeux", "crayon khol", "khol", "kohl", "crayon d'œil", "crayon d'oeil", "crayon doeil", "liner yeux", "feutre eyeliner"]),
    # "palette" seul est trop generique (ex: une description de gloss ou de
    # blush qui dit juste "disponible dans une palette de tons" matchait a
    # tort) : on exige un vrai mot-cle "palette d'yeux/de fards".
    ("palette-yeux", "cosmetiques", ["palette yeux", "palette de fards", "palette d'ombres", "eye palette", "eyeshadow palette", "fard à paupières", "fard a paupieres", "ombre à paupières", "> ombres", "eyeshadow"]),
    ("sourcils", "cosmetiques", ["sourcils", "eyebrow", "crayon sourcils", "gel sourcils", "poudre sourcils"]),
    ("highlighter", "cosmetiques", ["highlighter", "enlumineur", "illuminateur teint", "strobing"]),
    ("blush", "cosmetiques", ["blush", "bronzer", "bronzant", "bronzants", "terre cuite", "blush poudre"]),
    ("contouring", "cosmetiques", ["contouring", "stick de contour", "palette de contouring"]),
    ("poudre", "cosmetiques", ["poudre libre", "poudre compacte", "poudres compactes", "poudre matifiante", "poudre de teint", "setting powder", "poudre fixante", "fixateur de maquillage", "fixateurs de maquillage"]),
    ("primer", "cosmetiques", ["primer", "base maquillage", "base teint", "base de teint", "> bases", "> base"]),
    ("fond-de-teint-cosmetique", "cosmetiques", ["fond de teint", "fonds de teint", "fonds fluides", "fond fluide", "foundation", "correcteur de teint", "> correcteurs", "> correcteur", "concealer", "anti-cernes"]),
    ("rouge-a-levres", "cosmetiques", ["rouge à lèvres", "rouge a levres", "lipstick", "gloss", "lip gloss", "crayon lèvres", "crayon levres", "crayon a levres", "crayons a levres", "lip pencil", "lip liner"]),

    # --- Visage (specifique avant generique) ---
    ("creme-solaire-visage", "visage", ["solaire visage", "spf visage", "écran solaire visage", "protection solaire visage"]),
    ("contour-yeux", "visage", ["contour des yeux", "contour yeux", "soin yeux", "eye contour", "eye cream", "anti-cernes yeux"]),
    ("soin-levres", "visage", ["baume à lèvres", "baume levres", "> baumes", "stick lèvres", "stick levres", "soin lèvres", "soin levres", "lip balm", "lip repair", "beurre à lèvres"]),
    ("demaquillant", "visage", ["démaquillant", "demaquillant", "eau micellaire", "lotion démaquillante", "makeup remover", "lait démaquillant"]),
    ("exfoliant", "visage", ["exfoliant visage", "gommage visage", "peeling visage", "scrub visage", "gommage doux visage"]),
    ("masque", "visage", ["masque visage", "masque en tissu", "sheet mask", "masque purifiant", "masque hydratant visage", "masque à l'argile"]),
    ("huile-visage", "visage", ["huile visage", "huile sèche visage", "face oil", "huile sublime visage"]),
    ("brume", "visage", ["brume", "eau thermale", "spray visage", "mist"]),
    ("fond-de-teint", "visage", ["bb cream", "cc cream", "crème teintée"]),
    ("serum", "visage", ["sérum", "serum", "booster peau", "ampoule visage"]),
    ("nettoyant", "visage", ["nettoyant visage", "gel nettoyant", "mousse nettoyante", "savon visage", "cleanser", "lait nettoyant", "pain nettoyant"]),
    ("creme-hydratante", "visage", ["crème", "creme", "fluide hydratant", "émulsion visage", "emulsion visage", "day cream", "night cream", "soin hydratant visage"]),

    # --- Corps (specifique avant generique) ---
    ("creme-solaire-corps", "corps", ["solaire corps", "spf corps", "protection solaire corps", "sun body", "après-soleil", "apres-soleil"]),
    ("gel-douche", "corps", ["gel douche", "savon corps", "shower gel", "savon liquide corps"]),
    ("deodorant", "corps", ["déodorant", "deodorant", "anti-transpirant", "antiperspirant"]),
    ("autobronzant", "corps", ["autobronzant", "self tan", "bronzant sans soleil"]),
    ("vergetures", "corps", ["vergetures", "stretch mark"]),
    ("soin-mains", "corps", ["soin mains", "crème mains", "creme mains", "hand cream"]),
    ("soin-pieds", "corps", ["soin pieds", "soin pied", "crème pieds", "foot cream"]),
    ("gommage-corps", "corps", ["gommage corps", "scrub corps", "exfoliant corps", "body scrub"]),
    ("huile-corps", "corps", ["huile corps", "huile sèche corps", "body oil"]),
    ("lait-corporel", "corps", ["lait corporel", "lait hydratant corps", "body lotion", "body milk"]),
    ("beurre-corporel", "corps", ["beurre corporel", "body butter", "beurre karité corps", "beurre karite corps"]),
    ("creme-corps", "corps", ["crème corps", "creme corps", "body cream", "hydratant corps", "lotion corps"]),
]

FALLBACK_BY_PATH = {
    # quand aucun mot-cle ne matche, on retombe sur le rayon Awin
    "cheveux": ("shampoing", "cheveux"),
    "hair care": ("shampoing", "cheveux"),
    "maquillage": (None, None),  # trop générique pour deviner, on écarte
    "parapharmacie": ("creme-hydratante", "visage"),
    "cosmétique": ("creme-hydratante", "visage"),
    "cosmetique": ("creme-hydratante", "visage"),
}


def classify(product_name, description, merchant_category_path):
    # Le nom + la description ET le fil de categorie Awin (ex: "Maquillage >
    # Yeux > Mascaras à cils") comptent tous les trois comme signal : le fil
    # de categorie seul suffit souvent a identifier le bon type de produit.
    text = norm_text(f"{product_name} {description or ''} {merchant_category_path or ''}")
    for slug, parent, keywords in CATEGORY_RULES:
        for kw in keywords:
            if norm_text(kw) in text:
                return slug, parent
    # repli sur le rayon Awin si rien n'a matché dans le texte
    path_lower = norm_text(merchant_category_path or "")
    top = path_lower.split(">")[0].strip() if path_lower else ""
    fb = FALLBACK_BY_PATH.get(top)
    if fb and fb[0]:
        return fb
    return None, None


# ---------------------------------------------------------------------------
# 3) Tags / types de peau / types de cheveux / bienfaits : UNIQUEMENT si le
#    mot-cle apparait vraiment dans le texte du produit.
# ---------------------------------------------------------------------------
TAG_PATTERNS = {
    "Sans paraben": ["sans paraben"],
    "Sans silicone": ["sans silicone"],
    "Sans sulfate": ["sans sulfate"],
    "Sans parfum": ["sans parfum", "sans fragrance", "fragrance free"],
    "Sans alcool": ["sans alcool"],
    "Vegan": ["vegan"],
    "Cruelty-free": ["cruelty-free", "cruelty free", "non testé sur les animaux"],
    "Bio": ["biologique", "certifié bio", "certifie bio", " bio "],
    "Naturel / Bio": ["naturel", "d'origine naturelle"],
    "Acide hyaluronique": ["acide hyaluronique"],
    "Rétinol": ["rétinol", "retinol"],
    "Niacinamide": ["niacinamide"],
    "Vitamine C": ["vitamine c", "vitamin c"],
    "Vitamine E": ["vitamine e"],
    "Karité": ["karité", "karite"],
    "Argan": ["argan"],
    "Aloe vera": ["aloe vera", "aloé vera"],
    "Huile de coco": ["huile de coco"],
    "Collagène": ["collagène", "collagene"],
    "Kératine": ["kératine", "keratin"],
    "SPF": ["spf", "protection solaire"],
}

SKIN_TYPE_PATTERNS = {
    "grasse": ["peau grasse", "peaux grasses"],
    "seche": ["peau sèche", "peau seche", "peaux sèches"],
    "mixte": ["peau mixte", "peaux mixtes"],
    "sensible": ["peau sensible", "peaux sensibles"],
    "normale": ["peau normale"],
    "mature": ["peau mature", "peaux matures"],
    "acneique": ["peau acnéique", "peau acneique", "anti-acné", "anti-acne"],
}

HAIR_TYPE_PATTERNS = {
    "raides": ["cheveux raides"],
    "ondulés": ["cheveux ondulés", "cheveux ondules"],
    "bouclés": ["cheveux bouclés", "cheveux boucles"],
    "frisés": ["cheveux frisés", "cheveux frises"],
    "crépus": ["cheveux crépus", "cheveux crepus"],
    "fins": ["cheveux fins"],
    "épais": ["cheveux épais", "cheveux epais"],
    "colorés": ["cheveux colorés", "cheveux colores"],
    "abîmés": ["cheveux abîmés", "cheveux abimes", "cheveux secs et abîmés"],
    "secs": ["cheveux secs"],
    "gras": ["cheveux gras"],
    "sensibles": ["cuir chevelu sensible"],
}

BENEFIT_PATTERNS = {
    "Hydratation intense": ["hydratation intense", "hyper-hydratant"],
    "Anti-âge": ["anti-âge", "anti-age", "antirides", "anti-rides"],
    "Matifiant": ["matifiant"],
    "Apaisant": ["apaisant", "calmant"],
    "Éclat": ["éclat", "eclat du teint", "teint lumineux", "illuminateur"],
    "Anti-taches": ["anti-taches", "taches pigmentaires", "dépigmentant"],
    "Purifiant": ["purifiant"],
    "Anti-chute": ["anti-chute", "anti chute"],
    "Antipelliculaire": ["antipelliculaire", "pellicules"],
    "Brillance": ["brillance"],
    "Réparateur": ["réparateur", "reparateur", "répare"],
    "Nutrition intense": ["nutrition intense", "nourrissant"],
    "Volume": ["effet volume", "volumateur"],
    "Anti-frisottis": ["anti-frisottis", "frisottis"],
    "Fortifiant": ["fortifiant"],
    "Longue tenue": ["longue tenue", "waterproof"],
    "Protecteur (SPF)": ["spf", "protection solaire"],
}


def extract_matches(text, patterns_dict):
    text = norm_text(text)
    found = []
    for label, patterns in patterns_dict.items():
        for p in patterns:
            if norm_text(p) in text:
                found.append(label)
                break
    return found


def norm_brand(name):
    return re.sub(r"\s+", " ", name).strip()


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/import_awin_feed.py /chemin/vers/feed.csv [--dry-run]")
        sys.exit(1)
    csv_path = sys.argv[1]
    dry_run = "--dry-run" in sys.argv[2:]

    products_col = None
    if not dry_run:
        mongo_url = os.environ["MONGO_URL"]
        db_name = os.environ["DB_NAME"]
        client = MongoClient(mongo_url, tlsCAFile=__import__("certifi").where())
        db = client[db_name]
        products_col = db["products"]

    total = 0
    excluded_merchant = 0
    excluded_category = 0
    excluded_path = 0
    excluded_no_brand = 0
    excluded_unclassified = 0
    per_slug = Counter()
    unclassified_samples = []
    docs = []

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += 1
            merchant = (row.get("merchant_name") or "").strip()
            if merchant in EXCLUDE_MERCHANTS:
                excluded_merchant += 1
                continue

            cat_name = (row.get("category_name") or "").strip()
            if cat_name in EXCLUDE_CATEGORY_NAME:
                excluded_category += 1
                continue

            path = (row.get("merchant_category") or "").strip()
            path_norm = norm_text(path)
            if any(norm_text(bad) in path_norm for bad in EXCLUDE_PATH_CONTAINS):
                excluded_path += 1
                continue

            brand = norm_brand(row.get("brand_name") or "")
            if not brand:
                excluded_no_brand += 1
                continue

            name = (row.get("product_name") or "").strip()
            description = (row.get("description") or "").strip()
            if not name:
                continue

            try:
                price = float(row.get("search_price") or 0)
            except ValueError:
                price = 0.0
            if price <= 0:
                continue

            slug, parent = classify(name, description, path)
            if not slug:
                excluded_unclassified += 1
                if len(unclassified_samples) < 40:
                    unclassified_samples.append(f"{brand} | {name} | {path}")
                continue

            full_text = f"{name} {description}"
            tags = extract_matches(full_text, TAG_PATTERNS)
            skin_types = extract_matches(full_text, SKIN_TYPE_PATTERNS)
            hair_types = extract_matches(full_text, HAIR_TYPE_PATTERNS)
            benefits = extract_matches(full_text, BENEFIT_PATTERNS)

            image = upgrade_image_url((row.get("aw_image_url") or row.get("merchant_image_url") or "").strip())
            affiliate_url = (row.get("aw_deep_link") or "#").strip() or "#"

            aw_id = (row.get("aw_product_id") or "").strip()
            stable_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"awin-{aw_id}" if aw_id else f"awin-{name}-{brand}"))

            per_slug[slug] += 1
            docs.append({
                "id": stable_id,
                "category": slug,
                "parent": parent,
                "name": name,
                "brand": brand,
                "price": round(price, 2),
                "rating": RATING_DEFAULT,
                "reviews": REVIEWS_DEFAULT,
                "image": image,
                "tags": tags,
                "skin_types": skin_types,
                "hair_types": hair_types,
                "benefits": benefits,
                "color_hex": None,
                "zone": None,
                "affiliate_url": affiliate_url,
                "source": "awin",
                "source_merchant": merchant,
            })

    # Upsert dans MongoDB (sauf en --dry-run : on analyse sans rien ecrire)
    inserted = 0
    updated = 0
    if not dry_run:
        for doc in docs:
            res = products_col.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
            if res.upserted_id is not None:
                inserted += 1
            else:
                updated += 1

    report = []
    report.append(f"Lignes lues dans le CSV : {total}")
    report.append(f"Ecartees (merchant hors sujet) : {excluded_merchant}")
    report.append(f"Ecartees (categorie hors sujet) : {excluded_category}")
    report.append(f"Ecartees (chemin categorie hors sujet) : {excluded_path}")
    report.append(f"Ecartees (sans marque) : {excluded_no_brand}")
    report.append(f"Ecartees (non classifiees) : {excluded_unclassified}")
    report.append(f"Produits retenus et importes : {len(docs)}")
    report.append(f"  -> nouveaux : {inserted}, mis a jour : {updated}")
    report.append("")
    report.append("Repartition par categorie :")
    for slug, count in per_slug.most_common():
        report.append(f"  {count:5d}  {slug}")
    report.append("")
    report.append("Exemples de produits non classifies (premiers 40) :")
    for s in unclassified_samples:
        report.append(f"  - {s}")

    report_text = "\n".join(report)
    print(report_text)
    with open(Path(__file__).resolve().parent / "import_report.txt", "w", encoding="utf-8") as f:
        f.write(report_text)


if __name__ == "__main__":
    main()
