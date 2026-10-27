"""
Import du flux Awin DocMorris FR (parapharmacie) dans la base MongoDB de
Beautify Vision, SANS creer de doublons avec les produits deja presents
(Perfumeria Comas, Hairlust...).

Usage :
    python3 scripts/import_docmorris_feed.py /chemin/vers/datafeed_2923665.csv-2 --dry-run
    python3 scripts/import_docmorris_feed.py /chemin/vers/datafeed_2923665.csv-2

Options :
    --dry-run            analyse tout, ecrit les rapports, N'ECRIT RIEN en base
    --existing-csv PATH  ancien flux (par defaut ../datafeed_2923665.csv) : sert de
                         reference pour reperer les produits deja presents
    --no-db-check        ne pas lire la base pour la comparaison (hors dry-run)
    --cap N              max de produits importes PAR CATEGORIE (defaut 0 = AUCUNE limite)
    --cap-makeup N       idem pour les categories de maquillage "cosmetiques" (defaut 0 = aucune limite)

Ce que fait le script :
  1. Ne garde que les rayons DocMorris qui correspondent aux categories du
     site (visage, yeux, levres, corps, solaire, cheveux, mains, pieds,
     deodorants, gommages, cosmetiques naturels).
  2. Ecarte : hommes / rasage, parfums, outils et accessoires (pinces,
     brosses, eponges...), coffrets, complements alimentaires, soins
     medicaux (cors, verrues...), produits sans vraie photo, prix aberrants.
  3. Regroupe les doublons INTERNES de DocMorris (meme produit liste jusqu'a
     10 fois, ou en plusieurs contenances / teintes) et garde une seule fiche,
     de preference celle dont la photo est en francais (fr_FR).
  4. Compare chaque produit retenu aux produits DEJA presents (ancien flux
     + base) avec une comparaison "intelligente" des noms : marque retiree du
     nom, contenances et ponctuation ignorees ("(+)" == "+"), mots de liaison
     ignores, pluriels/accords ignores. Si le produit existe deja, il n'est
     PAS importe.
  5. Classe chaque produit dans la taxonomie du site (memes slugs que le menu)
     et l'ajoute dans MongoDB (collection "products") avec un id stable.
  6. Ecrit scripts/import_docmorris_report.txt (resume) et
     scripts/docmorris_doublons.csv (liste des produits ecartes car deja
     presents, avec le produit existant correspondant, pour verification).
"""
import csv
import difflib
import html
import importlib.util
import os
import re
import sys
import types
import unicodedata
import uuid
from collections import Counter, defaultdict
from pathlib import Path

csv.field_size_limit(10 ** 9)

HERE = Path(__file__).resolve().parent


# ---------------------------------------------------------------------------
# Reutilise les regles de classification / extraction du premier importeur
# (stubs si pymongo / dotenv absents : utile pour un --dry-run hors venv)
# ---------------------------------------------------------------------------
def _load_awin():
    for mod, attrs in (("pymongo", ["MongoClient"]), ("dotenv", ["load_dotenv"])):
        try:
            __import__(mod)
        except Exception:
            stub = types.ModuleType(mod)
            for a in attrs:
                setattr(stub, a, lambda *a, **k: None)
            sys.modules[mod] = stub
    spec = importlib.util.spec_from_file_location("import_awin_feed", HERE / "import_awin_feed.py")
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


awin = _load_awin()
norm_text = awin.norm_text


# ---------------------------------------------------------------------------
# 1) Rayons DocMorris retenus  (chemin = merchant_product_category_path)
#    cle = (niveau1, niveau2) normalises ; valeur = niveau 3 autorises
#    (None = tous) ou interdits (ensemble prefixe par "!")
# ---------------------------------------------------------------------------
BEAUTE = "beaute et cosmetique"
ALLOWED_PATHS = {
    (BEAUTE, "visage"): "!coffrets et trousses|kits a offrir|calendriers de l'avent",
    (BEAUTE, "yeux"): None,
    (BEAUTE, "levres"): None,
    (BEAUTE, "corps"): "anti-cellulite|anti-vergetures|huiles|hydratation|maquillage|poitrine|produits raffermissants|minceur",
    (BEAUTE, "cou et decollete"): None,
    (BEAUTE, "protection solaire"): "protection solaire pour le corps|protection solaire pour le visage|protection solaire pour les enfants|ecran solaire en stick",
    ("cosmetiques naturels", "soins visage et corps"): None,
    ("hygiene", "cheveux"): "ampoules|anti-chute de cheveux|apres-shampooing|apres-shampooing sans rincage|gel pour cheveux|laques|lotion|masque|mousses|shampooing|shampooing sec|soin|serum",
    ("hygiene", "mains et ongles"): "hydratation|soin",
    ("hygiene", "soin des pieds"): "hydratation|gommage|soin",
    ("hygiene", "soins pour le corps"): "deodorants|gommages|hygiene|peau atopique",
}
# "Pour hommes", parfums, coffrets, accessoires, colorations, hygiene
# intime/buccale, sante, orthopedie, bebe... ne sont dans aucune des listes
# ci-dessus => ecartes d'office.


def path_segments(path):
    return [norm_text(s).strip() for s in (path or "").split(">")]


def path_allowed(path):
    segs = path_segments(path)
    if len(segs) < 2:
        return False
    rule = ALLOWED_PATHS.get((segs[0], segs[1]), "__missing__")
    if rule == "__missing__":
        return False
    if rule is None:
        return True
    seg3 = segs[2] if len(segs) > 2 else ""
    if rule.startswith("!"):
        return seg3 not in set(rule[1:].split("|"))
    return seg3 in set(rule.split("|"))


# ---------------------------------------------------------------------------
# 2) Exclusions par nom
# ---------------------------------------------------------------------------
RE_MEN = re.compile(r"\b(homme|hommes|men|man|for men|pour lui|barbe|rasage|raser|rasoir|after ?shave|aftershave|apres[- ]rasage)\b")
RE_PERFUME = re.compile(r"\b(eau de (parfum|toilette|cologne)|eau fraiche|colonia|body mist|perfume|edp|edt)\b|\bparfum (pour|de)\b|\bcologne\b")
RE_TOOLS = re.compile(
    r"\b(pince|pinces|brosse|brosses|peigne|peignes|eponge|eponges|pinceau|pinceaux|miroir|trousse|trousses|"
    r"coupe|lime|limes|ciseaux|taille[- ]crayon|recourbe|bigoudis?|seche[- ]cheveux|lisseur|fer a|tondeuse|"
    r"gant|gants|boule|boules|coton|cotons|disque|disques|bonnet|bandeau|elastiques?|barrette|barrettes|epingle|"
    r"diffuseur|applicateur|spatule|accessoires?|pochette|vanity|houppette|blender|tampons?|serviettes?|"
    r"coffret|coffrets|kit|kits|set|calendrier|calendar|bracelet|sac|sacs|rouleau|roller|gua sha|masseur|"
    r"epilateur|cire|bandes? de cire|cire epilatoire|depilatoire|epilation|jade)\b"
)
RE_SUPPLEMENT = re.compile(
    r"\b(complement|complements|gelules?|comprimes?|buvables?|sachets?|gummies|sirop|"
    r"tisane|infusion|poudre a boire|cure de|brule[- ]graisse|draineur|probiotiques?)\b"
)
RE_MEDICAL = re.compile(
    r"\b(poux|verrues?|mycose|champignon|herpes|boutons? de fievre|hemorroides?|cors|durillons?|oignons?|"
    r"callosites?|callicide|calus|callus|orteils?|pansements?|antifongique|rape)\b"
)
RE_SPANISH = re.compile(
    r"\b(crema|champu|aceite|mascarilla|desodorante|hidratante|piel|labial|labiales|cabello|uds|"
    r"gel de bano|protector solar|locion|leche|limpiadora?|desmaquillante|contorno|pelo|manos|pies|"
    r"jabon|crema|sin|con|para|facial|solar corporal|spray solar|ojos)\b"
)
RE_BAD_IMAGE = re.compile(r"undefined|null|noimage|no_image|placeholder", re.I)


def exclusion_reason(row, name, path):
    n = norm_text(name)
    if RE_MEN.search(n):
        return "homme/rasage"
    if RE_PERFUME.search(n):
        return "parfum"
    if RE_TOOLS.search(n):
        return "outil/accessoire/coffret"
    if RE_SUPPLEMENT.search(n):
        return "complement alimentaire"
    if RE_MEDICAL.search(n):
        return "soin medical"
    img = (row.get("merchant_image_url") or "")
    if not img or RE_BAD_IMAGE.search(img):
        return "sans photo valide"
    return None


# ---------------------------------------------------------------------------
# 3) Classification : rayon DocMorris + mots-cles du nom
# ---------------------------------------------------------------------------
DROP = ("__drop__", None)
PATH_DEFAULT = [
    ((BEAUTE, "visage", "maquillage", "base de maquillage"), ("fond-de-teint-cosmetique", "cosmetiques")),
    ((BEAUTE, "visage", "maquillage", "correcteurs"), ("fond-de-teint-cosmetique", "cosmetiques")),
    ((BEAUTE, "visage", "maquillage", "poudres"), ("poudre", "cosmetiques")),
    ((BEAUTE, "visage", "maquillage", "anti-rides et anti-age"), ("creme-hydratante", "visage")),
    ((BEAUTE, "visage", "maquillage", "sans huile"), ("fond-de-teint-cosmetique", "cosmetiques")),
    ((BEAUTE, "visage", "maquillage", None), (None, "cosmetiques")),
    ((BEAUTE, "visage", "nettoyant visage", "lotions toniques"), ("brume", "visage")),
    ((BEAUTE, "visage", "nettoyant visage", "eaux de soin"), ("brume", "visage")),
    ((BEAUTE, "visage", "nettoyant visage", None), ("nettoyant", "visage")),
    ((BEAUTE, "visage", "gommages", None), ("exfoliant", "visage")),
    ((BEAUTE, "visage", "masques", None), ("masque", "visage")),
    ((BEAUTE, "visage", "anti-taches", None), ("serum", "visage")),
    ((BEAUTE, "visage", "action immediate", None), ("serum", "visage")),
    ((BEAUTE, "visage", None, None), ("creme-hydratante", "visage")),
    ((BEAUTE, "yeux", "contour des yeux", None), ("contour-yeux", "visage")),
    ((BEAUTE, "yeux", "patchs", None), ("contour-yeux", "visage")),
    ((BEAUTE, "yeux", "cils", None), ("mascara", "cosmetiques")),
    ((BEAUTE, "yeux", "sourcils", None), ("sourcils", "cosmetiques")),
    ((BEAUTE, "yeux", "maquillage", None), ("eyeliner", "cosmetiques")),
    ((BEAUTE, "yeux", None, None), (None, "visage")),
    ((BEAUTE, "levres", "maquillage", None), ("rouge-a-levres", "cosmetiques")),
    ((BEAUTE, "levres", None, None), ("soin-levres", "visage")),
    ((BEAUTE, "corps", "maquillage", None), DROP),
    ((BEAUTE, "corps", "huiles", None), ("huile-corps", "corps")),
    ((BEAUTE, "corps", "anti-vergetures", None), ("vergetures", "corps")),
    ((BEAUTE, "corps", None, None), ("creme-corps", "corps")),
    ((BEAUTE, "cou et decollete", None, None), ("creme-hydratante", "visage")),
    ((BEAUTE, "protection solaire", "protection solaire pour le visage", None), ("creme-solaire-visage", "visage")),
    ((BEAUTE, "protection solaire", "ecran solaire en stick", None), ("creme-solaire-visage", "visage")),
    ((BEAUTE, "protection solaire", None, None), ("creme-solaire-corps", "corps")),
    (("cosmetiques naturels", None, None, None), (None, None)),
    (("hygiene", "cheveux", "ampoules", None), ("serum-cheveux", "cheveux")),
    (("hygiene", "cheveux", "anti-chute de cheveux", None), ("soin-anti-chute", "cheveux")),
    (("hygiene", "cheveux", "apres-shampooing", None), ("apres-shampoing", "cheveux")),
    (("hygiene", "cheveux", "apres-shampooing sans rincage", None), ("apres-shampoing", "cheveux")),
    (("hygiene", "cheveux", "gel pour cheveux", None), ("spray-coiffant", "cheveux")),
    (("hygiene", "cheveux", "laques", None), ("spray-coiffant", "cheveux")),
    (("hygiene", "cheveux", "mousses", None), ("spray-coiffant", "cheveux")),
    (("hygiene", "cheveux", "lotion", None), ("serum-cheveux", "cheveux")),
    (("hygiene", "cheveux", "masque", None), ("masque-cheveux", "cheveux")),
    (("hygiene", "cheveux", "shampooing sec", None), ("shampoing-sec", "cheveux")),
    (("hygiene", "cheveux", "shampooing", None), ("shampoing", "cheveux")),
    (("hygiene", "cheveux", "soin", None), ("masque-cheveux", "cheveux")),
    (("hygiene", "cheveux", "serum", None), ("serum-cheveux", "cheveux")),
    (("hygiene", "mains et ongles", None, None), ("soin-mains", "corps")),
    (("hygiene", "soin des pieds", None, None), ("soin-pieds", "corps")),
    (("hygiene", "soins pour le corps", "deodorants", None), ("deodorant", "corps")),
    (("hygiene", "soins pour le corps", "gommages", None), ("gommage-corps", "corps")),
    (("hygiene", "soins pour le corps", "hygiene", None), ("gel-douche", "corps")),
    (("hygiene", "soins pour le corps", "peau atopique", None), ("creme-corps", "corps")),
]


def path_default(path):
    segs = (path_segments(path) + ["", "", "", ""])[:4]
    for key, val in PATH_DEFAULT:
        if all(k is None or k == sg for k, sg in zip(key, segs)):
            return val
    return None, None


# Regles de nom, limitees au rayon DocMorris (parent) : le flux melange
# francais / espagnol / anglais ("Champu", "Mascarilla", "Aceite"...), on
# reconnait donc les mots des trois langues.
EXTRA_RULES = {
    "visage": [
        ("fond-de-teint", r"\b(bb cr[eè]me|bb cream|cc cream|cr[eè]me teint[eé]e)\b"),
        ("exfoliant", r"(gommage|peeling|exfoli|scrub|gommant)"),
        ("masque", r"\b(masque|mascarilla|mask|masques)\b"),
        ("demaquillant", r"(d[eé]maquillant|desmaquillante|micellaire|micelar|makeup remover|make-up remover)"),
        ("brume", r"\b(tonique|tonic|toner|tonico|t[oó]nico|hydrolat|eau florale|eau thermale|agua termal|agua de rosas|brume|mist)\b"),
        ("nettoyant", r"\b(nettoyant|nettoyante|limpiador|limpiadora|cleanser|cleansing|gel lavant|cr[eè]me lavante|lavant|savon|jabon|syndet|pain dermatologique)\b"),
        ("contour-yeux", r"(contour (des )?yeux|contorno de ojos|eye contour|eye cream|yeux)"),
        ("creme-solaire-visage", r"(\bspf\b|\bfps\b|solaire|solar|fotoprotector|photoprotect|\bsun\b)"),
        ("serum", r"\b(serum|ampoule|ampoules|booster|concentre|concentrado|essence)\b"),
        ("huile-visage", r"\b(huile|aceite|oil)\b"),
        ("soin-levres", r"\b(levres|labial|labiales|lip)\b"),
    ],
    "corps": [
        ("autobronzant", r"(autobronzant|self.?tan|autobronceador|bronzeador)"),
        ("deodorant", r"(d[eé]odorant|desodorante|anti[- ]?transpirant|antitranspirante|roll[- ]?on)"),
        ("gel-douche", r"(gel douche|gel de douche|gel de ba[nñ]o|gel bain|shower|savon|jabon|jab[oó]n|cr[eè]me de douche|huile de douche|huile lavante)"),
        ("gommage-corps", r"(gommage|scrub|exfoli)"),
        ("vergetures", r"(vergeture|estria|stretch mark)"),
        ("soin-mains", r"(\bmains?\b|\bmanos?\b|\bhands?\b)"),
        ("soin-pieds", r"(\bpieds?\b|\bpies\b|\bfoot\b|\bfeet\b)"),
        ("creme-solaire-corps", r"(\bspf\b|\bfps\b|solaire|solar|fotoprotector|photoprotect|\bsun\b|apres[- ]soleil|after[- ]?sun|bronzage)"),
        ("beurre-corporel", r"\b(beurre|manteca|butter)\b"),
        ("huile-corps", r"\b(huile|aceite|oil)\b"),
        ("lait-corporel", r"\b(lait|leche|milk|body lotion)\b"),
    ],
    "cheveux": [
        ("shampoing-sec", r"(shampoo?ing sec|champu seco|dry shampoo)"),
        ("soin-cheveux-colores", r"(cheveux color|color protect|protege couleur|cabello te[nñ]ido)"),
        ("masque-cheveux", r"\b(masque|mascarilla|mask)\b"),
        ("apres-shampoing", r"(apr[eè]s[- ]?shampoo?ing|conditioner|acondicionador|d[eé]m[eê]lant)"),
        ("huile-cheveux", r"\b(huile|aceite|oil)\b"),
        ("serum-cheveux", r"\b(serum|ampoule|ampoules)\b"),
    ],
}
# pour ces rayons, le nom ne peut PAS faire changer de categorie
PATH_WINS = {"shampoing", "shampoing-sec", "apres-shampoing", "soin-anti-chute", "spray-coiffant"}


# Garde-fou "vrai maquillage" : dans les categories maquillage ("cosmetiques"),
# on ne veut ni serums de cils/sourcils, ni baumes a levres, huiles, soins, etc.
# (l'essayage IA ne doit manipuler que du maquillage de couleur/teint).
RE_NOT_MAKEUP = re.compile(
    r"\b(serum|baume|balm|scrub|gommage|huile|oil|aceite|ricin|castor|soin|traitement|treatment|"
    r"fortifiant|croissance|growth|pestanas|nettoyant|demaquillant|solaire|sunscreen|creme (hydratante|nourrissante|visage))\b"
)
RE_REAL_MAKEUP = re.compile(
    r"rouge a levres|lipstick|lip ?stick|gloss|mascara|eye ?liner|eyeliner|fond de teint|foundation|correcteur|concealer|"
    r"blush|poudre|powder|ombre|palette|crayon|kajal|highlighter|enlumin|bronz|brow gel|gel sourcils|volumateur|"
    r"fard|teint|primer|base de maquillage|bb cream|cc cream|tinted"
)


def not_real_makeup(name, path):
    n = norm_text(name)
    if "fortifiant" in norm_text(path):
        return True
    if re.search(r"huile de carotte|latex|brow serum|soin blush|blush de peau|soin anti|creme visage", n):
        return True
    return bool(RE_NOT_MAKEUP.search(n)) and not RE_REAL_MAKEUP.search(n)


def classify(name, description, path):
    """1) rayon DocMorris -> categorie par defaut + parent ; 2) mots-cles du
    NOM (francais/espagnol/anglais) propres a ce parent ; 3) regles du premier
    importeur. Le rayon l'emporte toujours sur le parent."""
    dslug, dparent = path_default(path)
    if dslug == "__drop__":
        return None, None
    n = norm_text(name)
    if dslug in PATH_WINS:
        return dslug, dparent
    # priorite aux regles de nom specifiques au parent
    for slug, rx in EXTRA_RULES.get(dparent, []):
        if re.search(rx, n):
            parent = awin_parent(slug)
            # un nom de produit visage ne doit pas atterrir en cosmetiques, etc.
            return slug, parent
    slug, parent = awin.classify(name, "", "")
    if slug and (dparent is None or parent == dparent):
        return slug, parent
    if dslug:
        return dslug, dparent
    if slug and dparent is None:
        return slug, parent
    return None, None


_PARENT = {s: p for s, p, _ in awin.CATEGORY_RULES}


def awin_parent(slug):
    return _PARENT.get(slug, "visage")


# ---------------------------------------------------------------------------
# 4) Comparaison "intelligente" de produits
# ---------------------------------------------------------------------------
STOP = set("""
de du des la le les l d et en a au aux pour avec sans the and of by for with un une
ml cl l g gr kg mg oz fl ud uds unidades unites unite pack lot x ou sur
""".split())

# mots de type de produit : peu discriminants seuls
GENERIC = set("""
creme soin gel lait visage corps peau fluide baume huile serum spray mousse
hydratant hydratante nourrissant nettoyant lotion emulsion
""".split())

SYN = {
    "cream": "creme", "crema": "creme", "cremes": "creme",
    "hidratante": "hydratant", "hydratante": "hydratant", "moisturizing": "hydratant", "hydratants": "hydratant",
    "serums": "serum", "sérum": "serum", "milk": "lait", "balm": "baume", "balsamo": "baume", "bálsamo": "baume",
    "mask": "masque", "masques": "masque", "mascarilla": "masque", "face": "visage", "facial": "visage",
    "body": "corps", "corporel": "corps", "corporelle": "corps",
    "sensibles": "sensible", "sensitive": "sensible",
    "micellar": "micellaire", "micelar": "micellaire", "micellaires": "micellaire", "miceller": "micellaire",
    "shampooing": "shampoing", "shampoo": "shampoing", "champu": "shampoing",
    "apres": "apres", "conditioner": "apres", "after": "apres",
    "protection": "protection", "protector": "protection", "protecteur": "protection", "protectrice": "protection",
    "teinte": "", "shade": "", "couleur": "", "nuance": "",
    "light": "", "medium": "", "claire": "", "doree": "", "fonce": "", "foncee": "",
}

UNIT_RE = re.compile(r"\b\d+(?:[.,]\d+)?\s?(?:ml|cl|l|g|gr|kg|mg|oz|fl ?oz|ud|uds|unidades|unites|capsules|doses?)\b\.?")
MULT_RE = re.compile(r"\b\d+\s?x\s?\d*(?:[.,]\d+)?\b|\bx\s?\d+\b")


def brand_key(brand):
    b = norm_text(brand)
    b = re.sub(r"[^a-z0-9 ]", " ", b)
    b = re.sub(r"^(la|le|les|the|l) ", "", b.strip())
    return re.sub(r"\s+", "", b)


def core_tokens(name, brand):
    t = norm_text(name)
    t = t.replace("&", " ")
    t = re.sub(r"\(\s*\+\s*\)|\[\s*\+\s*\]", "+", t)
    t = UNIT_RE.sub(" ", t)
    t = MULT_RE.sub(" ", t)
    t = t.replace("+", " plus ")
    t = re.sub(r"[^a-z0-9 ]", " ", t)
    toks = t.split()
    # retire la marque repetee dans le nom (tokens consecutifs dont la
    # concatenation == marque, ex. "la roche posay", "rocheposay")
    bk = brand_key(brand)
    if bk:
        changed = True
        while changed and toks:
            changed = False
            for start in range(0, min(len(toks), 3)):
                for k in range(1, 5):
                    seg = "".join(toks[start:start + k])
                    if len(toks[start:start + k]) == k and seg in (bk, "la" + bk, "le" + bk, "les" + bk):
                        del toks[start:start + k]
                        changed = True
                        break
                if changed:
                    break
    out = []
    for w in toks:
        w = SYN.get(w, w)
        if not w or w in STOP:
            continue
        if len(w) > 5 and w.endswith("s"):
            w = w[:-1]
        if len(w) > 5 and w.endswith("e"):
            w = w[:-1]
        out.append(w)
    return out


def spf_values(name):
    return set(re.findall(r"spf\s?(\d+)", norm_text(name)))


def same_product(a, b):
    """a, b = (tokens, name). True si c'est tres probablement le meme produit."""
    ta, na = a
    tb, nb = b
    if not ta or not tb:
        return False
    if spf_values(na) != spf_values(nb):
        return False
    sa, sb = set(ta), set(tb)
    if sa == sb:
        return True
    inter = sa & sb
    union = sa | sb
    jac = len(inter) / len(union)
    if jac >= 0.75:
        return True
    # l'un inclus dans l'autre, la difference ne portant que sur des mots
    # generiques (ex "Effaclar K+" vs "Effaclar K+ creme")
    small, big = (sa, sb) if len(sa) <= len(sb) else (sb, sa)
    if small <= big and len(small) >= 2 and (big - small) <= GENERIC:
        return True
    ra = difflib.SequenceMatcher(None, " ".join(sorted(ta)), " ".join(sorted(tb))).ratio()
    return ra >= 0.92


def brand_matches(bk_new, bk_old):
    if not bk_new or not bk_old:
        return False
    if bk_new == bk_old:
        return True
    short, long_ = sorted((bk_new, bk_old), key=len)
    return len(short) >= 5 and long_.startswith(short)


# ---------------------------------------------------------------------------
# 5) Lecture des produits deja presents
# ---------------------------------------------------------------------------
def existing_from_old_csv(csv_path):
    """Reproduit le filtrage du premier importeur sur l'ancien flux, pour
    connaitre les produits deja importes (Comas, Hairlust...)."""
    out = []
    if not csv_path or not Path(csv_path).exists():
        return out
    with open(csv_path, newline="", encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            if (row.get("merchant_name") or "").strip() in awin.EXCLUDE_MERCHANTS:
                continue
            if (row.get("category_name") or "").strip() in awin.EXCLUDE_CATEGORY_NAME:
                continue
            path = (row.get("merchant_category") or "").strip()
            pn = norm_text(path)
            if any(norm_text(bad) in pn for bad in awin.EXCLUDE_PATH_CONTAINS):
                continue
            brand = awin.norm_brand(row.get("brand_name") or "")
            name = (row.get("product_name") or "").strip()
            if not brand or not name:
                continue
            try:
                if float(row.get("search_price") or 0) <= 0:
                    continue
            except ValueError:
                continue
            slug, parent = awin.classify(name, (row.get("description") or "").strip(), path)
            if not slug:
                continue
            out.append({"brand": brand, "name": name, "category": slug, "source": "ancien flux"})
    return out


def existing_from_db(products_col):
    out = []
    for d in products_col.find({}, {"name": 1, "brand": 1, "category": 1, "source_merchant": 1}):
        if "docmorris" in (d.get("source_merchant") or "").lower():
            continue  # nos propres imports precedents : mis a jour par id, pas des doublons
        out.append({"brand": d.get("brand") or "", "name": d.get("name") or "", "category": d.get("category"), "source": "base"})
    return out


# ---------------------------------------------------------------------------
def image_rank(url):
    u = url or ""
    if "fr_FR" in u:
        return 0
    if "es_ES" in u:
        return 2
    return 1


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = [a for a in sys.argv[1:] if a.startswith("--")]
    if not args:
        print(__doc__)
        sys.exit(1)
    csv_path = args[0]
    dry_run = "--dry-run" in flags
    existing_csv = str(HERE.parent.parent / "datafeed_2923665.csv")
    if "--existing-csv" in sys.argv:
        existing_csv = sys.argv[sys.argv.index("--existing-csv") + 1]
        if existing_csv in args:
            args.remove(existing_csv)

    def flag_value(name, default):
        if name in sys.argv:
            v = sys.argv[sys.argv.index(name) + 1]
            if v in args:
                args.remove(v)
            return int(v)
        return default
    cap = flag_value("--cap", 0)
    cap_makeup = flag_value("--cap-makeup", 0)

    products_col = None
    if not dry_run:
        from pymongo import MongoClient
        from dotenv import load_dotenv
        import certifi
        load_dotenv(HERE.parent / ".env")
        client = MongoClient(os.environ["MONGO_URL"], tlsCAFile=certifi.where())
        products_col = client[os.environ["DB_NAME"]]["products"]

    stats = Counter()
    cands = []
    excluded_samples = defaultdict(list)

    with open(csv_path, newline="", encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            stats["lignes lues"] += 1
            path = (row.get("merchant_product_category_path") or "").strip()
            if not path_allowed(path):
                stats["ecartees : rayon hors categories du site (parfums, hommes, sante, bebe, orthopedie...)"] += 1
                continue
            name = html.unescape((row.get("product_name") or "").strip())
            name = re.sub(r"&amp\b\s*", "& ", name)
            brand = awin.norm_brand(html.unescape(row.get("brand_name") or ""))
            if not name or not brand:
                stats["ecartees : sans nom ou sans marque"] += 1
                continue
            try:
                price = float(row.get("search_price") or 0)
            except ValueError:
                price = 0.0
            if price < 1.0:
                stats["ecartees : prix aberrant (< 1 EUR)"] += 1
                continue
            reason = exclusion_reason(row, name, path)
            if reason:
                stats[f"ecartees : {reason}"] += 1
                if len(excluded_samples[reason]) < 25:
                    excluded_samples[reason].append(f"{brand} | {name} | {path}")
                continue
            slug, parent = classify(name, row.get("description") or "", path)
            if not slug:
                stats["ecartees : non classifiees"] += 1
                if len(excluded_samples["non classifie"]) < 40:
                    excluded_samples["non classifie"].append(f"{brand} | {name} | {path}")
                continue
            if parent == "cosmetiques" and not_real_makeup(name, path):
                n_ = norm_text(name)
                if re.search(r"baume|balm", n_) and "levre" in norm_text(name + " " + path):
                    slug, parent = "soin-levres", awin_parent("soin-levres")
                else:
                    stats["ecartees : pas du maquillage (serum cils, huile, soin...)"] += 1
                    continue
            cands.append({
                "row": row, "name": name, "brand": brand, "price": price, "slug": slug, "parent": parent,
                "path": path, "bk": brand_key(brand), "toks": core_tokens(name, brand),
            })
    stats["candidats apres filtres"] = len(cands)

    # --- doublons internes DocMorris -------------------------------------
    groups = defaultdict(list)
    for c in cands:
        groups[(c["bk"], c["slug"], " ".join(sorted(set(c["toks"]))))].append(c)
    kept = []
    for key, lst in groups.items():
        lst.sort(key=lambda c: (image_rank(c["row"].get("merchant_image_url")), c["price"]))
        kept.append(lst[0])
    stats["doublons internes DocMorris fusionnes (meme produit, contenance, teinte ou liste plusieurs fois)"] = len(cands) - len(kept)
    # second passage : quasi-doublons (meme marque + meme categorie + noms tres proches)
    by_bs = defaultdict(list)
    for c in kept:
        by_bs[(c["bk"], c["slug"])].append(c)
    kept2 = []
    for lst in by_bs.values():
        lst.sort(key=lambda c: (image_rank(c["row"].get("merchant_image_url")), c["price"]))
        chosen = []
        for c in lst:
            if any(same_product((x["toks"], x["name"]), (c["toks"], c["name"])) for x in chosen):
                stats["quasi-doublons internes DocMorris fusionnes"] += 1
                continue
            chosen.append(c)
        kept2.extend(chosen)
    kept = kept2
    stats["produits DocMorris uniques"] = len(kept)

    # --- comparaison avec l'existant ---------------------------------------
    existing = existing_from_old_csv(existing_csv)
    stats["produits deja presents (ancien flux)"] = len(existing)
    if products_col is not None and "--no-db-check" not in flags:
        db_ex = existing_from_db(products_col)
        stats["produits deja presents (base)"] = len(db_ex)
        existing += db_ex
    ex_by_brand = defaultdict(list)
    for e in existing:
        bk = brand_key(e["brand"])
        ex_by_brand[bk].append({**e, "toks": core_tokens(e["name"], e["brand"])})
    ex_brand_keys = list(ex_by_brand)

    final, dups = [], []
    for c in kept:
        match = None
        for ebk in ex_brand_keys:
            if brand_matches(c["bk"], ebk):
                for e in ex_by_brand[ebk]:
                    if same_product((c["toks"], c["name"]), (e["toks"], e["name"])):
                        match = e
                        break
            if match:
                break
        if match:
            dups.append((c, match))
        else:
            final.append(c)
    stats["ecartes car deja presents (Comas/Hairlust/base)"] = len(dups)
    stats["PRODUITS A IMPORTER"] = len(final)
    stats["  dont noms ecrits en espagnol (a verifier)"] = sum(1 for c in final if RE_SPANISH.search(norm_text(c["name"])))

    # --- limite par categorie (qualite d'abord) --------------------------------
    brand_freq = Counter(c["bk"] for c in final)
    known_brands = {brand_key(e["brand"]) for e in existing}

    def quality(c):
        return (
            image_rank(c["row"].get("merchant_image_url")),            # photo en francais d'abord
            0 if (c["row"].get("description") or "").strip() else 1,    # fiche avec description
            0 if c["bk"] in known_brands else 1,                        # marque deja au catalogue
            -brand_freq[c["bk"]],                                       # marques bien fournies
            c["name"],
        )

    by_slug = defaultdict(list)
    for c in final:
        by_slug[c["slug"]].append(c)
    stats["avant limite par categorie"] = len(final)
    capped = []
    for slug, lst in by_slug.items():
        limit = cap_makeup if lst[0]["parent"] == "cosmetiques" else cap
        lst.sort(key=quality)
        capped.extend(lst[:limit] if limit else lst)
    final = capped
    stats["PRODUITS IMPORTES APRES LIMITE"] = len(final)

    # --- produits "presque identiques" a un produit existant (pour verification) ---
    near = []
    for c in final:
        best = (0.0, None)
        for ebk in ex_brand_keys:
            if brand_matches(c["bk"], ebk):
                for e in ex_by_brand[ebk]:
                    a, b = set(c["toks"]), set(e["toks"])
                    if a and b:
                        j = len(a & b) / len(a | b)
                        if j > best[0]:
                            best = (j, e)
        if best[1] is not None and best[0] >= 0.5:
            near.append((best[0], c, best[1]))
    near.sort(key=lambda t: -t[0])
    with open(HERE / "docmorris_quasi_doublons.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["ressemblance", "marque", "produit DocMorris (IMPORTE)", "produit existant le plus proche"])
        for j, c, e in near:
            w.writerow([round(j, 2), c["brand"], c["name"], e["name"]])
    stats["importes mais ressemblant a un produit existant (a verifier)"] = len(near)

    # --- documents -----------------------------------------------------------
    docs = []
    per_slug = Counter()
    for c in final:
        row = c["row"]
        full_text = f"{c['name']} {row.get('description') or ''}"
        aw_id = (row.get("aw_product_id") or "").strip()
        stable_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"awin-{aw_id}" if aw_id else f"awin-{c['name']}-{c['brand']}"))
        image = awin.upgrade_image_url((row.get("aw_image_url") or row.get("merchant_image_url") or "").strip())
        docs.append({
            "id": stable_id,
            "category": c["slug"],
            "parent": c["parent"],
            "name": c["name"],
            "brand": c["brand"],
            "price": round(c["price"], 2),
            "rating": awin.RATING_DEFAULT,
            "reviews": awin.REVIEWS_DEFAULT,
            "image": image,
            "tags": awin.extract_matches(full_text, awin.TAG_PATTERNS),
            "skin_types": awin.extract_matches(full_text, awin.SKIN_TYPE_PATTERNS),
            "hair_types": awin.extract_matches(full_text, awin.HAIR_TYPE_PATTERNS),
            "benefits": awin.extract_matches(full_text, awin.BENEFIT_PATTERNS),
            "color_hex": None,
            "zone": awin.CATEGORY_ZONE.get(c["slug"]),
            "affiliate_url": (row.get("aw_deep_link") or "#").strip() or "#",
            "source": "awin",
            "source_merchant": (row.get("merchant_name") or "DocMorris FR").strip(),
        })
        per_slug[c["slug"]] += 1

    inserted = updated = 0
    if not dry_run:
        for d in docs:
            res = products_col.update_one({"id": d["id"]}, {"$set": d}, upsert=True)
            if res.upserted_id is not None:
                inserted += 1
            else:
                updated += 1

    # --- rapports --------------------------------------------------------------
    rep = ["IMPORT DOCMORRIS FR" + (" (SIMULATION, rien n'est ecrit en base)" if dry_run else "")]
    for k, v in stats.items():
        rep.append(f"{v:8d}  {k}")
    if not dry_run:
        rep.append(f"  -> nouveaux : {inserted}, mis a jour : {updated}")
    rep.append("")
    rep.append("Repartition par categorie :")
    for slug, n in per_slug.most_common():
        rep.append(f"  {n:5d}  {slug}")
    rep.append("")
    for reason, lst in excluded_samples.items():
        rep.append(f"Exemples ecartes ({reason}) :")
        rep.extend(f"  - {s}" for s in lst[:15])
        rep.append("")
    text = "\n".join(rep)
    print(text)
    (HERE / "import_docmorris_report.txt").write_text(text, encoding="utf-8")
    with open(HERE / "docmorris_doublons.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["marque", "produit DocMorris (ecarte)", "produit deja present", "origine", "categorie"])
        for c, e in dups:
            w.writerow([c["brand"], c["name"], e["name"], e["source"], c["slug"]])
    with open(HERE / "docmorris_a_importer.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["categorie", "parent", "marque", "produit", "prix", "rayon DocMorris"])
        for c in final:
            w.writerow([c["slug"], c["parent"], c["brand"], c["name"], c["price"], c["path"]])


if __name__ == "__main__":
    main()
