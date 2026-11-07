"""
Import du flux Effiliation Beauty Success (beautysuccess.fr) dans la base
MongoDB de Beautify Vision, SANS creer de doublons avec les produits deja
presents (anciens flux Awin, DocMorris, base de production).

Usage :
    python3 scripts/import_beautysuccess_feed.py /chemin/products_405179742-2.csv --dry-run
    python3 scripts/import_beautysuccess_feed.py /chemin/products_405179742-2.csv

Options :
    --dry-run            analyse tout, ecrit les rapports, N'ECRIT RIEN en base
    --check-db           (avec --dry-run) lit quand meme la base pour la comparaison
                         (lecture seule) : c'est le test le plus fiable avant l'import
    --existing-csv PATH  ancien flux Awin (defaut ../datafeed_2923665.csv)
    --no-db-check        ne pas lire la base (hors dry-run)

Ce que fait le script :
  1. Ne garde que le maquillage (teint, levres, yeux, sourcils), le soin visage,
     le soin corps et bain, le soin cheveux et les produits "beaute responsable"
     qui sont de vrais soins/maquillages.
  2. Ecarte : parfums, hommes, vernis et soins des ongles, accessoires et
     pinceaux, coffrets / kits / cadeaux, recharges, complements alimentaires,
     produits sans photo, prix aberrants.
  3. Regroupe les doublons INTERNES (meme produit en plusieurs contenances ou
     liste plusieurs fois).
  4. Compare chaque produit aux produits DEJA presents (ancien flux + DocMorris
     + base) avec la meme comparaison "intelligente" que l'import DocMorris :
     marque retiree du nom, contenances/ponctuation/pluriels ignores. Si le
     produit existe deja, il n'est PAS importe.
  5. Classe chaque produit dans la taxonomie du site (memes slugs que le menu)
     et l'ajoute dans MongoDB (collection "products") avec un id stable
     (relancer le script met a jour, ne duplique pas).
  6. Ecrit des rapports : import_beautysuccess_report.txt (resume),
     beautysuccess_doublons.csv (ecartes car deja presents),
     beautysuccess_quasi_doublons.csv (importes mais ressemblants : a verifier),
     beautysuccess_a_importer.csv (liste de ce qui est importe).
"""
import csv
import html
import importlib.util
import os
import re
import sys
import uuid
from collections import Counter, defaultdict
from pathlib import Path

csv.field_size_limit(10 ** 9)
HERE = Path(__file__).resolve().parent


def _load_dm():
    spec = importlib.util.spec_from_file_location("import_docmorris_feed", HERE / "import_docmorris_feed.py")
    m = importlib.util.module_from_spec(spec)
    sys.modules["import_docmorris_feed"] = m
    spec.loader.exec_module(m)
    return m


dm = _load_dm()
awin = dm.awin
norm = awin.norm_text

SOURCE = "effiliation"
MERCHANT = "Beauty Success"

# ---------------------------------------------------------------------------
# 1) Rayons retenus (category_level3 du flux)
# ---------------------------------------------------------------------------
KEEP_L3 = {"maquillage", "soin visage", "soin corps et bain", "soin cheveux", "nos produits responsables", "parapharmacie"}
# Rayons sans interet pour le site. Tout autre rayon (ex. "Marques > Shiseido",
# "Soldes", "Promos", rayon vide) est classe d'apres le NOM du produit.
EXCLUDE_L3 = {"parfum", "idees cadeaux", "homme", "accessoires", "calendriers de l'avent", "enfant", "mini budget maxi beaute"}
DROP_L4 = {"ongles", "pinceaux et accessoires", "accessoire", "accessoires", "complement alimentaire",
           "compléments alimentaires", "complements alimentaires", "epilation et decoloration", "massage"}
RE_BAD_L5 = re.compile(r"vernis|ongles|dissolvant|faux cils|complement|accessoire|pinceau|set vernis|epilation")
RE_NAILS = re.compile(
    r"vernis (a|pour) ongles|\bvernis\b(?!.*levres)|dissolvant|base coat|top coat|durcisseur|soin des ongles|"
    r"cuticule|manucure|nail|faux ongles|huile (verte|ongles)|ongles tres abimes"
)

RE_REFILL = re.compile(r"\b(recharge|recharges|refill|refills)\b")
# Produits "a verser dans le bain" (parfum d'ambiance, plaisir) : pas des soins de la peau
RE_BATH_SALTS = re.compile(
    r"\b(sels?|perles?|cubes?|bombes?|boules?|cristaux|galets?|tablettes?|carres?|poudre|pourdre)\b.*\bbain\b|"
    r"\bbain\b.*\b(sels?|perles?|cubes?|bombes?|cristaux|galets?|effervescents?)\b|"
    r"huile (de|pour le) bain|lait de bain|bain lacte|bain de pieds|effervescent|bain moussant enfant"
)
RE_BAIN_MOUSSANT = re.compile(r"bain moussant")
RE_PERFUMED = re.compile(r"\b(brume parfumee|brume pour le corps|eau fraiche|eau parfumee|parfum pour|perfume|bougie|diffuseur)\b")


def exclusion_reason(name, l4, g5):
    n = norm(name)
    if dm.RE_MEN.search(n):
        return "homme/rasage"
    if dm.RE_PERFUME.search(n) or RE_PERFUMED.search(n):
        return "parfum"
    if RE_REFILL.search(n):
        return "recharge (le produit principal est deja liste)"
    if dm.RE_TOOLS.search(n):
        return "outil/accessoire/coffret/kit"
    if dm.RE_SUPPLEMENT.search(n):
        return "complement alimentaire"
    if RE_BATH_SALTS.search(n) or (RE_BAIN_MOUSSANT.search(n) and not re.search(r"douche|gel", n)):
        return "produits de bain (sels, bombes, huiles et laits de bain...)"
    if norm(l4) in {norm(x) for x in DROP_L4} or RE_BAD_L5.search(norm(g5)) or RE_NAILS.search(n):
        return "ongles / accessoires / hors categories du site"
    return None


# ---------------------------------------------------------------------------
# 2) Classification
# ---------------------------------------------------------------------------
def gpath(row):
    return [norm(s).strip() for s in (row.get("google_product_category") or "").split(">")]


TINT_WORDS = re.compile(r"teinte|tinted|\btint\b|couleur|colore|nuance|glow|shine|gloss|rouge")


def is_tinted(n):
    return bool(TINT_WORDS.search(n))


def has_shade(n):
    """Vrai si le nom contient un numero/une teinte (ex. "N°3 Charming", "10 Keep It Glowy")."""
    t = re.sub(r"\d+(?:[.,]\d+)?\s?(?:ml|g|gr|cl|l)\b", " ", n)
    return bool(re.search(r"(?:^|\s)n[°o]\s?\d{1,3}\b|\s\d{1,3}\s+[a-z]{3,}", t))


# Produits "teint" ranges a tort en soin / base / poudre : ce sont des fonds de teint.
RE_FOUNDATION = re.compile(
    r"fond de teint|cushion|tinted moisturizer|skin tint|creme teintee|soin teinte|bb creme|bb cream|cc creme|cc cream|"
    r"serum de teint|fluide teinte|skin illusion|teint idole.*(fond|fluide)"
)
RE_SUN = re.compile(r"solaire|\bsun\b|\bspf ?(30|50)")


def classify_makeup(name, l4, g5):
    n = norm(name)
    g = norm(g5)
    if (("baume" in g and "levre" in g) or re.search(r"baume|soin des levres|lip balm|lip care|huile a levres|lip oil|repulp", n)) \
            and ("levre" in (n + " " + norm(l4) + " " + g) or "lip" in n) \
            and not re.search(r"rouge a levres|lipstick|encre", n):
        return "rouge-a-levres" if (is_tinted(n) or has_shade(n)) else "soin-levres"
    table = [
        (r"rouge a levres|gloss|vernis et encre|crayon a levres|levres", "rouge-a-levres"),
        (r"fond de teint|bb et cc|bb cream|cc cream|anti-?cernes|correcteur", "fond-de-teint-cosmetique"),
        (r"poudre bronzante|bronzer|terracotta|contour", "blush"),
        (r"blush|fard a joues", "blush"),
        (r"illuminateur|enlumin|highlighter", "highlighter"),
        (r"poudre", "poudre"),
        (r"^bases?$|base|primer", "primer"),
        (r"mascara", "mascara"),
        (r"eyeliner|crayon|kajal", "eyeliner"),
        (r"ombre|palette|fard a paupieres", "palette-yeux"),
        (r"sourcil|brow", "sourcils"),
    ]
    for rx, slug in table:
        if re.search(rx, g):
            return slug
    # repli : mots du nom
    kw = [
        (r"rouge a levres|lipstick|gloss|encre a levres|crayon a levres|lip liner|lip tint", "rouge-a-levres"),
        (r"fond de teint|foundation|bb cream|cc cream|cc creme|bb creme|anti-?cernes|correcteur|concealer", "fond-de-teint-cosmetique"),
        (r"bronzer|poudre bronzante|contouring|contour", "blush"),
        (r"blush|fard a joues", "blush"),
        (r"illuminateur|enlumineur|highlighter|strobing", "highlighter"),
        (r"poudre", "poudre"),
        (r"primer|base de teint|base lissante|base maquillage|fixateur|setting", "primer"),
        (r"mascara", "mascara"),
        (r"eyeliner|crayon (yeux|khol)|kajal|liner", "eyeliner"),
        (r"palette|ombre a paupieres|fard a paupieres|eyeshadow", "palette-yeux"),
        (r"sourcil|brow", "sourcils"),
    ]
    for rx, slug in kw:
        if re.search(rx, n):
            return slug
    return None


def classify_visage(name, l4, g5):
    n, g, l = norm(name), norm(g5), norm(l4)
    if re.search(r"autobronzant|self.?tan", n):
        return "autobronzant"
    if "solaire" in l or re.search(r"solaire|sunscreen|\bsun\b", n):
        return "creme-solaire-visage"
    if re.search(r"d[eé]maquillant|demaquillant|micellaire|makeup remover|huile (demaquillante|nettoyante)|baume (demaquillant|nettoyant)", n):
        return "demaquillant"
    if re.search(r"nettoyant|gel lavant|mousse lavante|savon|cleanser|cleansing|creme lavante|pain nettoyant", n):
        return "nettoyant"
    if re.search(r"rouge a levres|lipstick|gloss", n):
        return "rouge-a-levres"
    if re.search(r"\byeux\b|contour des yeux|eye (cream|contour|serum|gel)", n) and not re.search(r"masque|patch", n):
        return "contour-yeux"
    if re.search(r"levres|\blip\b", n):
        return classify_makeup(name, l4, "baume levres") if re.search(r"baume|huile|soin|gommage|lip", n) else "soin-levres"
    if re.search(r"masque|mask|patch", n) or "masque" in g:
        return "masque"
    if re.search(r"gommage|peeling|exfoli|scrub", n) or "gommage" in g:
        return "exfoliant"
    if re.search(r"tonique|toner|lotion|brume|hydrolat|eau (florale|thermale)|essence", n) or "lotion et tonique" in g:
        return "brume"
    if "contour des yeux" in g:
        return "contour-yeux"
    if "serum" in g or re.search(r"serum|ampoule|concentre|elixir|cure\b", n) or any(k in g for k in ("anti-taches", "detox")):
        return "serum"
    if re.search(r"\bhuile\b|\boil\b", n):
        return "huile-visage"
    return "creme-hydratante"


def classify_corps(name, l4, g5):
    n, g, l = norm(name), norm(g5), norm(l4)
    if re.search(r"demaquillant|nettoyant visage|pores|imperfections", n) or ("visage" in n and "corps" not in n):
        return classify_visage(name, l4, g5)
    if "visage" in n and re.search(r"solaire|spf", n):
        return "creme-solaire-visage"
    if "autobronzant" in g or re.search(r"autobronzant|self.?tan", n):
        return "autobronzant"
    if "solaire" in l or "apres-soleil" in g or re.search(r"solaire|spf|apres[- ]soleil|sunscreen", n):
        return "creme-solaire-corps"
    if "deodorant" in l or re.search(r"deodorant|anti[- ]?transpirant|roll[- ]?on", n):
        return "deodorant"
    if "gommage" in l or re.search(r"gommage|scrub|exfoli", n):
        return "gommage-corps"
    if "anti-vergetures" in g or re.search(r"vergeture", n):
        return "vergetures"
    if "mains" in g or re.search(r"\bmains?\b|ongles|manucure", n):
        return "soin-mains"
    if "pieds" in g or re.search(r"\bpieds?\b|talons?", n):
        return "soin-pieds"
    if "bain et hygiene" in l or "gel douche" in g or "savon" in g or re.search(r"gel douche|savon|creme de douche|huile de douche|huile lavante|bain|douche", n):
        return "gel-douche"
    if re.search(r"\bbeurre\b|butter", n):
        return "beurre-corporel"
    if "huile" in g or re.search(r"\bhuile\b|\boil\b", n):
        return "huile-corps"
    if re.search(r"\blait\b|body lotion|milk", n):
        return "lait-corporel"
    return "creme-corps"


def classify_cheveux(name, l4, g5):
    n, l = norm(name), norm(l4)
    if re.search(r"shampoo?ing sec|dry shampoo", n):
        return "shampoing-sec"
    if re.search(r"anti[- ]?chute|chute de cheveux|densif|hair loss|croissance", n):
        return "soin-anti-chute"
    if re.search(r"cuir chevelu|scalp", n):
        return "soin-cuir-chevelu"
    if re.search(r"cheveux colores|color|blond|violet|decolor|meches", n):
        return "soin-cheveux-colores"
    if re.search(r"apres[- ]?shampoo?ing|conditioner|demelant", n) or "apres-shampoing" in l:
        return "apres-shampoing"
    if re.search(r"shampoo?ing", n) or l == "shampoing":
        return "shampoing"
    if re.search(r"masque|mask|bain d.huile|soin (profond|nutri|repar)", n):
        return "masque-cheveux"
    if re.search(r"huile|oil|elixir", n):
        return "huile-cheveux"
    if re.search(r"serum|ampoule", n):
        return "serum-cheveux"
    if "coiffant" in l or re.search(r"laque|spray|mousse|gel coiffant|cire coiffante|pate|creme coiffante|texturisant|lotion|lissant|boucles|boucle|curl", n):
        return "spray-coiffant"
    return "masque-cheveux"


def classify_row(row, name):
    l3, l4 = norm(row.get("category_level3")), norm(row.get("category_level4"))
    g = gpath(row)
    g5 = g[4] if len(g) > 4 else ""
    g6 = g[5] if len(g) > 5 else ""
    gdeep = (g5 + " " + g6).strip()
    n = norm(name)
    if l3 == "maquillage":
        slug = classify_makeup(name, l4, gdeep)
    elif l3 == "soin visage":
        slug = classify_visage(name, l4, gdeep)
    elif l3 == "soin corps et bain":
        slug = classify_corps(name, l4, gdeep)
    elif l3 == "soin cheveux":
        slug = classify_cheveux(name, l4, gdeep)
    elif l3 == "parapharmacie":
        slug = classify_corps(name, l4, gdeep) if "corps" in l4 or "solaire" in l4 else classify_visage(name, l4, gdeep)
    elif l3 == "nos produits responsables":
        top = g[3] if len(g) > 3 else ""
        sub = norm(row.get("category_level4"))
        if "maquillage" in (sub + " " + gdeep) or re.search(r"rouge a levres|mascara|fond de teint|blush|eyeliner|crayon", n):
            slug = classify_makeup(name, l4, gdeep)
        elif re.search(r"shampoo?ing|cheveux|apres-shampoing", n):
            slug = classify_cheveux(name, l4, gdeep)
        elif re.search(r"corps|gel douche|savon|deodorant|mains|pieds|lait", n):
            slug = classify_corps(name, l4, gdeep)
        elif re.search(r"visage|serum|creme|masque|nettoyant|tonique|contour", n):
            slug = classify_visage(name, l4, gdeep)
        else:
            slug = None
    else:
        slug = classify_by_name(name, l4, gdeep)
    if slug and RE_FOUNDATION.search(n) and not RE_SUN.search(n) and not re.search(r"demaquillant|nettoyant|masque", n):
        slug = "fond-de-teint-cosmetique"
    return slug


def classify_by_name(name, l4, g):
    """Rayon inconnu (marque, soldes, promos...) : on devine d'apres le nom."""
    n = norm(name)
    if re.search(r"rouge a levres|gloss|encre a levres|crayon a levres|lip |mascara|eyeliner|fond de teint|anti-?cernes|"
                 r"correcteur|blush|poudre (libre|compacte|bronzante|de teint|matifiante)|illuminateur|enlumineur|"
                 r"palette|ombre a paupieres|fard|sourcil|primer|bb cream|cc cream|crayon yeux|crayon khol|bronzer", n):
        return classify_makeup(name, l4, g)
    if re.search(r"shampoo?ing|apres-shampoo?ing|cheveux|masque capillaire|conditioner", n):
        return classify_cheveux(name, l4, g)
    if re.search(r"gel douche|lait (pour le )?corps|creme (pour le )?corps|huile (pour le )?corps|beurre (pour le )?corps|"
                 r"corps|gommage corps|deodorant|savon|\bmains?\b|\bpieds?\b|body|solaire corps|autobronzant", n):
        return classify_corps(name, l4, g)
    if re.search(r"serum|creme|soin|masque|nettoyant|demaquillant|micellaire|tonique|lotion|contour|gommage|peeling|"
                 r"hydratant|visage|yeux|eau thermale|brume|huile|solaire|spf|baume|cleanser|ampoule|essence|pain", n):
        return classify_visage(name, l4, g)
    return None


COLOR_SLUGS = {"rouge-a-levres", "blush", "palette-yeux", "eyeliner", "highlighter", "sourcils"}

PARENT_OF = {s: p for s, p, _ in awin.CATEGORY_RULES}
PARENT_OF.update({
    "fond-de-teint-cosmetique": "cosmetiques", "poudre": "cosmetiques", "blush": "cosmetiques", "highlighter": "cosmetiques",
    "primer": "cosmetiques", "mascara": "cosmetiques", "eyeliner": "cosmetiques", "palette-yeux": "cosmetiques",
    "sourcils": "cosmetiques", "rouge-a-levres": "cosmetiques", "contouring": "cosmetiques",
    "soin-levres": "visage", "demaquillant": "visage", "brume": "visage", "nettoyant": "visage", "exfoliant": "visage",
    "masque": "visage", "serum": "visage", "creme-hydratante": "visage", "contour-yeux": "visage", "huile-visage": "visage",
    "creme-solaire-visage": "visage",
    "creme-corps": "corps", "huile-corps": "corps", "gommage-corps": "corps", "lait-corporel": "corps",
    "beurre-corporel": "corps", "soin-mains": "corps", "soin-pieds": "corps", "deodorant": "corps",
    "autobronzant": "corps", "vergetures": "corps", "creme-solaire-corps": "corps", "gel-douche": "corps",
    "shampoing": "cheveux", "apres-shampoing": "cheveux", "masque-cheveux": "cheveux", "huile-cheveux": "cheveux",
    "serum-cheveux": "cheveux", "spray-coiffant": "cheveux", "shampoing-sec": "cheveux", "soin-anti-chute": "cheveux",
    "soin-cheveux-colores": "cheveux", "soin-cuir-chevelu": "cheveux",
})


# ---------------------------------------------------------------------------
# 3) Produits deja presents
# ---------------------------------------------------------------------------
def existing_from_docmorris_list():
    """Liste des produits DocMorris deja prepares/importes (si la base n'est pas lisible)."""
    p = HERE / "docmorris_a_importer.csv"
    out = []
    if p.exists():
        with open(p, newline="", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                out.append({"brand": r["marque"], "name": r["produit"], "category": r["categorie"], "source": "DocMorris (liste)"})
    return out


def existing_from_db(col):
    out = []
    for d in col.find({}, {"name": 1, "brand": 1, "category": 1, "source_merchant": 1}):
        if (d.get("source_merchant") or "") == MERCHANT:
            continue  # nos propres imports precedents : mis a jour par id
        out.append({"brand": d.get("brand") or "", "name": d.get("name") or "", "category": d.get("category"), "source": "base"})
    return out


def clean_name(title, brand):
    t = html.unescape((title or "").strip())
    for b in (brand, brand.upper(), brand.lower()):
        pref = f"{b} - "
        if t.startswith(pref):
            t = t[len(pref):]
            break
    return re.sub(r"\s+", " ", t).strip()


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = [a for a in sys.argv[1:] if a.startswith("--")]
    if not args:
        print(__doc__)
        sys.exit(1)
    dry_run = "--dry-run" in flags
    existing_csv = str(HERE.parent.parent / "datafeed_2923665.csv")
    if "--existing-csv" in sys.argv:
        existing_csv = sys.argv[sys.argv.index("--existing-csv") + 1]
        if existing_csv in args:
            args.remove(existing_csv)
    csv_path = args[0]

    col = None
    if (not dry_run and "--no-db-check" not in flags) or (dry_run and "--check-db" in flags):
        from pymongo import MongoClient
        from dotenv import load_dotenv
        import certifi
        load_dotenv(HERE.parent / ".env")
        client = MongoClient(os.environ["MONGO_URL"], tlsCAFile=certifi.where())
        col = client[os.environ["DB_NAME"]]["products"]

    stats = Counter()
    inventory_l3 = Counter()
    inventory_brand = Counter()
    excluded_samples = defaultdict(list)
    cands = []
    with open(csv_path, newline="", encoding="utf-8-sig", errors="replace") as f:
        for row in csv.DictReader(f, delimiter=";"):
            stats["lignes lues"] += 1
            l3 = norm(row.get("category_level3"))
            inventory_l3[(row.get("category_level3") or "(vide)").strip()] += 1
            inventory_brand[(row.get("brand") or "").strip()] += 1
            brand = awin.norm_brand(html.unescape(row.get("brand") or ""))
            name = clean_name(row.get("title"), brand)
            if l3 in EXCLUDE_L3 or not l3 and not row.get("title"):
                stats["ecartees : rayon hors categories du site (parfums, hommes, accessoires, coffrets cadeaux...)"] += 1
                continue
            if not name or not brand:
                stats["ecartees : sans nom ou sans marque"] += 1
                continue
            img = (row.get("image_link") or "").strip()
            if not img.startswith("http") or dm.RE_BAD_IMAGE.search(img):
                stats["ecartees : sans photo valide"] += 1
                continue
            try:
                price = float(row.get("price") or 0)
            except ValueError:
                price = 0.0
            if price < 1.0:
                stats["ecartees : prix aberrant (< 1 EUR)"] += 1
                continue
            g = gpath(row)
            reason = exclusion_reason(name, row.get("category_level4"), (g[4] if len(g) > 4 else "") + " " + (g[5] if len(g) > 5 else ""))
            if reason:
                stats[f"ecartees : {reason}"] += 1
                if len(excluded_samples[reason]) < 25:
                    excluded_samples[reason].append(f"{brand} | {name}")
                continue
            slug = classify_row(row, name)
            if not slug:
                stats["ecartees : non classifiees"] += 1
                if len(excluded_samples["non classifie"]) < 40:
                    excluded_samples["non classifie"].append(f"{brand} | {name}")
                continue
            cands.append({"row": row, "name": name, "brand": brand, "price": price, "slug": slug,
                          "parent": PARENT_OF.get(slug, "visage"), "bk": dm.brand_key(brand),
                          "toks": dm.core_tokens(name, brand)})
    stats["candidats apres filtres"] = len(cands)

    # --- doublons internes -------------------------------------------------
    groups = defaultdict(list)
    for c in cands:
        groups[(c["bk"], c["slug"], " ".join(sorted(set(c["toks"]))))].append(c)
    kept = []
    for lst in groups.values():
        lst.sort(key=lambda c: c["price"])
        kept.append(lst[0])
    stats["doublons internes fusionnes (meme produit en plusieurs contenances / liste plusieurs fois)"] = len(cands) - len(kept)
    by_bs = defaultdict(list)
    for c in kept:
        by_bs[(c["bk"], c["slug"])].append(c)
    kept2 = []
    for lst in by_bs.values():
        lst.sort(key=lambda c: (c["name"]))
        chosen = []
        for c in lst:
            # maquillage de couleur (levres, joues, yeux...) : chaque teinte reste une fiche
            # (comme l'existant) ; teint, poudre, base, mascara : une seule fiche par produit
            if c["slug"] not in COLOR_SLUGS and any(dm.same_product((x["toks"], x["name"]), (c["toks"], c["name"])) for x in chosen):
                stats["quasi-doublons internes fusionnes"] += 1
                continue
            chosen.append(c)
        kept2.extend(chosen)
    kept = kept2
    stats["produits Beauty Success uniques"] = len(kept)

    # --- comparaison avec l'existant -----------------------------------------
    existing = dm.existing_from_old_csv(existing_csv)
    stats["deja presents (ancien flux Awin)"] = len(existing)
    if col is not None:
        db_ex = existing_from_db(col)
        stats["deja presents (base de donnees)"] = len(db_ex)
        existing += db_ex
    else:
        dl = existing_from_docmorris_list()
        stats["deja presents (liste DocMorris, a defaut de la base)"] = len(dl)
        existing += dl
    ex_by_brand = defaultdict(list)
    for e in existing:
        ex_by_brand[dm.brand_key(e["brand"])].append({**e, "toks": dm.core_tokens(e["name"], e["brand"])})
    ex_brand_keys = list(ex_by_brand)

    final, dups = [], []
    for c in kept:
        match = None
        for ebk in ex_brand_keys:
            if dm.brand_matches(c["bk"], ebk):
                for e in ex_by_brand[ebk]:
                    if dm.same_product((c["toks"], c["name"]), (e["toks"], e["name"])):
                        match = e
                        break
            if match:
                break
        (dups if match else final).append((c, match) if match else c)
    stats["ecartes car deja presents"] = len(dups)
    stats["PRODUITS A IMPORTER"] = len(final)

    # quasi-doublons (a verifier)
    near = []
    for c in final:
        best = (0.0, None)
        for ebk in ex_brand_keys:
            if dm.brand_matches(c["bk"], ebk):
                for e in ex_by_brand[ebk]:
                    a, b = set(c["toks"]), set(e["toks"])
                    if a and b:
                        j = len(a & b) / len(a | b)
                        if j > best[0]:
                            best = (j, e)
        if best[1] is not None and best[0] >= 0.5:
            near.append((best[0], c, best[1]))
    near.sort(key=lambda t: -t[0])
    stats["importes mais ressemblant a un produit existant (a verifier)"] = len(near)

    # --- documents --------------------------------------------------------------
    docs, per_slug = [], Counter()
    for c in final:
        row = c["row"]
        full_text = f"{c['name']} {row.get('description') or ''}"
        stable_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"beautysuccess-{(row.get('id') or '').strip() or c['name']}"))
        docs.append({
            "id": stable_id,
            "category": c["slug"],
            "parent": c["parent"],
            "name": c["name"],
            "brand": c["brand"],
            "price": round(c["price"], 2),
            "rating": awin.RATING_DEFAULT,
            "reviews": awin.REVIEWS_DEFAULT,
            "image": (row.get("image_link") or "").strip(),
            "tags": awin.extract_matches(full_text, awin.TAG_PATTERNS),
            "skin_types": awin.extract_matches(full_text, awin.SKIN_TYPE_PATTERNS),
            "hair_types": awin.extract_matches(full_text, awin.HAIR_TYPE_PATTERNS),
            "benefits": awin.extract_matches(full_text, awin.BENEFIT_PATTERNS),
            "color_hex": None,
            "zone": awin.CATEGORY_ZONE.get(c["slug"]),
            "affiliate_url": (row.get("link") or "#").strip() or "#",
            "source": SOURCE,
            "source_merchant": MERCHANT,
        })
        per_slug[c["slug"]] += 1

    inserted = updated = 0
    if not dry_run:
        from pymongo import UpdateOne
        total = len(docs)
        for i in range(0, total, 500):
            batch = docs[i:i + 500]
            res = col.bulk_write([UpdateOne({"id": d["id"]}, {"$set": d}, upsert=True) for d in batch], ordered=False)
            inserted += res.upserted_count
            updated += res.matched_count
            print(f"  ... {min(i + 500, total)} / {total} produits ecrits", flush=True)

    # --- rapports --------------------------------------------------------------------
    known_brands = {dm.brand_key(e["brand"]) for e in existing}
    imp_brands = Counter(c["brand"] for c in final)
    new_brands = [b for b in imp_brands if dm.brand_key(b) not in known_brands]
    rep = ["IMPORT BEAUTY SUCCESS" + (" (SIMULATION, rien n'est ecrit en base)" if dry_run else "")]
    rep.append("")
    rep.append("Contenu du flux par rayon :")
    for k, v in inventory_l3.most_common():
        rep.append(f"  {v:5d}  {k}")
    rep.append(f"  -> {len(inventory_brand)} marques dans le flux")
    rep.append("")
    for k, v in stats.items():
        rep.append(f"{v:8d}  {k}")
    if not dry_run:
        rep.append(f"  -> nouveaux : {inserted}, mis a jour : {updated}")
    rep.append("")
    rep.append("Repartition des produits importes par categorie :")
    for slug, n in per_slug.most_common():
        rep.append(f"  {n:5d}  {slug}")
    rep.append("")
    rep.append(f"Marques importees : {len(imp_brands)} dont {len(new_brands)} nouvelles au catalogue")
    rep.append("  Top marques importees : " + ", ".join(f"{b} ({n})" for b, n in imp_brands.most_common(25)))
    rep.append("")
    for reason, lst in excluded_samples.items():
        rep.append(f"Exemples ecartes ({reason}) :")
        rep.extend(f"  - {s}" for s in lst[:15])
        rep.append("")
    text = "\n".join(rep)
    print(text)
    (HERE / "import_beautysuccess_report.txt").write_text(text, encoding="utf-8")
    with open(HERE / "beautysuccess_doublons.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["marque", "produit Beauty Success (ecarte)", "produit deja present", "origine", "categorie"])
        for c, e in dups:
            w.writerow([c["brand"], c["name"], e["name"], e["source"], c["slug"]])
    with open(HERE / "beautysuccess_quasi_doublons.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["ressemblance", "marque", "produit Beauty Success (IMPORTE)", "produit existant le plus proche"])
        for j, c, e in near:
            w.writerow([round(j, 2), c["brand"], c["name"], e["name"]])
    with open(HERE / "beautysuccess_a_importer.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["categorie", "parent", "marque", "produit", "prix"])
        for c in final:
            w.writerow([c["slug"], c["parent"], c["brand"], c["name"], c["price"]])


if __name__ == "__main__":
    main()
