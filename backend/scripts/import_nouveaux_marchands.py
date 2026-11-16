"""
Import du flux Awin "nouveaux marchands" (Cosmetiere, Blissim, Dr Pierre Ricaud)
dans la base MongoDB de Beautify Vision, SANS creer de doublons avec les produits
deja presents (Perfumeria, DocMorris, Beauty Success, Hairlust, anciens imports).

Usage :
    python3 scripts/import_nouveaux_marchands.py /chemin/datafeed_29236654.csv --dry-run
    python3 scripts/import_nouveaux_marchands.py /chemin/datafeed_29236654.csv

Options :
    --dry-run              analyse tout, ecrit les rapports, N'ECRIT RIEN en base
    --existing-json PATH   liste des produits deja en base (par defaut scripts/existing_products.json,
                           creee par scripts/export_existing_products.py)
    --check-db             (avec --dry-run) lit la base en lecture seule pour la comparaison
    --keep-shades          garde une fiche par teinte pour TOUS les produits (par defaut, une seule fiche
                           par produit pour teint / poudre / base / mascara ; une fiche par teinte pour
                           rouges a levres, blush, palettes, eyeliners, sourcils, enlumineurs)

Ce que fait le script :
  1. Ne garde QUE ce qui rentre dans une categorie du site (soin visage, yeux, levres, brume / eau
     thermale, demaquillant, solaire, corps, mains, pieds, deodorant, gommage, cheveux, maquillage...).
     Ecarte : parfums et brumes parfumees, brosses / accessoires / trousses / appareils, coffrets / kits /
     recharges / multipacks, vernis et soins des ongles, colorations, hommes, bebes / enfants,
     dentaire, hygiene intime, sante / complements, produits sans photo, prix aberrants.
  2. Comprend les noms en francais, anglais et espagnol (traduction des mots-cles avant comparaison).
  3. Regroupe les doublons INTERNES du flux (meme produit en plusieurs contenances / teintes).
  4. Compare chaque produit a ce qui est DEJA en base : code-barres (EAN) d'abord (fiable, independant
     de la langue), puis noms "intelligents" (marque retiree, contenances ignorees, synonymes FR/EN/ES).
  5. Classe dans la taxonomie du site et ajoute dans MongoDB (collection "products", id stable : relancer
     met a jour, ne duplique pas).
  6. Ecrit des rapports dans scripts/ : nouveaux_marchands_report.txt, nouveaux_marchands_doublons.csv,
     nouveaux_marchands_quasi_doublons.csv, nouveaux_marchands_a_importer.csv.
"""
import csv
import difflib
import html
import importlib.util
import json
import os
import re
import sys
import unicodedata
import uuid
from collections import Counter, defaultdict
from pathlib import Path

csv.field_size_limit(10 ** 9)
HERE = Path(__file__).resolve().parent


def _load(modname, filename):
    spec = importlib.util.spec_from_file_location(modname, HERE / filename)
    m = importlib.util.module_from_spec(spec)
    sys.modules[modname] = m
    spec.loader.exec_module(m)
    return m


bs = _load("import_beautysuccess_feed", "import_beautysuccess_feed.py")
dm = bs.dm
awin = dm.awin
norm = awin.norm_text

MERCHANTS = {"129677": "Cosmétière", "15574": "Blissim", "6977": "Dr Pierre Ricaud"}

# ---------------------------------------------------------------------------
# 1) Traduction des mots-cles EN / ES -> FR (sur texte normalise, sans accents)
#    Sert a la classification ET a la comparaison avec les produits existants.
# ---------------------------------------------------------------------------
TR = [
    (r"\bfoundation\b", "fond de teint"), (r"\bbase de maquillaje\b|\bmaquillaje fluido\b", "fond de teint"),
    (r"\bconcealer\b|\bcorrector\b", "anti cernes"),
    (r"\blip ?stick\b|\blabial(es)?\b|\bbarra de labios\b", "rouge a levres"),
    (r"\blip ?gloss\b|\blip oil\b", "gloss"), (r"\blip ?liner\b|\blip pencil\b|\blip crayon\b|\blapiz de labios\b", "crayon levres"),
    (r"\beye ?shadow\b|\bsombra(s)? de ojos\b|\bsombra\b", "ombre a paupieres"),
    (r"\beye ?liner\b", "eyeliner"), (r"\beye pencil\b|\blapiz de ojos\b|\beye crayon\b|\bkohl\b", "crayon yeux"),
    (r"\beye ?brow\b|\bbrows?\b|\bcejas?\b", "sourcils"),
    (r"\bface powder\b|\bloose powder\b|\bsetting powder\b|\bpressed powder\b|\bpolvos?\b|\bpowder\b", "poudre"),
    (r"\bhighlighter\b|\billuminator\b|\bluminizer\b|\biluminador\b", "enlumineur"),
    (r"\bbronzing powder\b|\bbronzer\b|\bbronceador\b", "bronzer"), (r"\bcolorete\b|\bcheek\b", "blush"),
    (r"\bsetting spray\b|\bfixing spray\b|\bfixing mist\b|\bprimer\b|\bprebase\b", "primer"),
    (r"\bnight cream\b|\bcrema de noche\b", "creme de nuit"), (r"\bday cream\b|\bcrema de dia\b", "creme de jour"),
    (r"\beye cream\b|\beye contour\b|\bcontorno de ojos\b|\beye gel\b|\beye serum\b|\bunder.?eye\b", "contour des yeux"),
    (r"\bface cream\b|\bfacial cream\b|\bcrema facial\b", "creme visage"), (r"\bfacial\b|\bface\b|\bfaciales\b", "visage"),
    (r"\bcream\b|\bcrema\b|\bcremas\b", "creme"), (r"\bmoisturi[sz](er|ing)\b|\bhidratante\b|\bhydrating\b|\bhydration\b", "hydratant"),
    (r"\bcleanser\b|\blimpiadora\b|\blimpiador\b|\bface wash\b|\bcleansing (gel|foam|milk)\b", "nettoyant"),
    (r"\bmicellar (water|solution)\b|\bagua micelar\b|\bmicellar\b", "eau micellaire"),
    (r"\bmake-?up remover\b|\bdesmaquillante\b|\bcleansing (oil|balm|water)\b", "demaquillant"),
    (r"\btoner\b|\btonico\b|\btonic\b", "tonique"), (r"\bfacial mist\b|\bface mist\b|\bthermal water\b|\bagua termal\b|\bhydrosol\b|\brose water\b", "brume visage"),
    (r"\bmasks?\b|\bmascarilla\b", "masque"), (r"\bsheet mask\b", "masque"),
    (r"\bscrub\b|\bexfoliating\b|\bexfoliant\b|\bpeeling\b|\bpeel\b|\bexfoliante\b", "gommage"),
    (r"\bshampoo\b|\bchampu\b|\bshampooing\b", "shampoing"), (r"\bdry shampoing\b|\bchampu seco\b", "shampoing sec"),
    (r"\bconditioner\b|\bacondicionador\b|\bdetangler\b|\bdetangling\b", "apres shampoing"),
    (r"\bhair oil\b|\baceite capilar\b", "huile cheveux"), (r"\bhair (mask|treatment)\b", "masque cheveux"),
    (r"\bhair ?spray\b", "spray coiffant"), (r"\blacquer\b|\blaca\b", "laque"), (r"\bpomade\b|\bhair wax\b", "cire coiffante"),
    (r"\bhair gel\b", "gel coiffant"), (r"\btexturi[sz]ing\b", "texturisant"), (r"\bhair paste\b", "pate coiffante"),
    (r"\bmake ?-?up base\b|\bbase de maquillaje\b", "base maquillage"), (r"\banticernes\b", "anti cernes"),
    (r"\boil\b|\baceite\b", "huile"), (r"\bserum\b|\bsuero\b", "serum"), (r"\bampoule\b|\bampolla\b", "ampoule"),
    (r"\bbody lotion\b|\bloci[oó]n corporal\b|\bleche corporal\b|\bbody milk\b", "lait corps"), (r"\bbody butter\b|\bmanteca\b", "beurre corporel"),
    (r"\bbody\b|\bcorporal\b", "corps"), (r"\bhand cream\b|\bhand lotion\b|\bcrema de manos\b|\bhands?\b|\bmanos\b", "mains"),
    (r"\bfoot\b|\bfeet\b|\bpies\b", "pieds"),
    (r"\bshower (gel|cream|oil)\b|\bgel de ba[nñ]o\b|\bgel de ducha\b|\bbath gel\b|\bshower\b|\bgel de douche\b|\bcreme de douche\b|\bhuile de douche\b|\bgel douche\b", "gel douche"),
    (r"\bsoap\b|\bjabon\b", "savon"), (r"\bdeodorant\b|\bdesodorante\b|\bantiperspirant\b|\banti-?transpirant\b", "deodorant"),
    (r"\bsunscreen\b|\bsun cream\b|\bsun lotion\b|\bprotector solar\b|\bsun milk\b|\bsun protection\b|\bsun care\b|\bsun\b|\bsolar\b", "creme solaire"),
    (r"\bafter ?sun\b|\bapres soleil\b", "apres soleil"), (r"\bself.?tan(ning)?\b|\btanning (drops|mousse|lotion)\b|\bautobronceador\b", "autobronzant"),
    (r"\bsensitive\b|\bsensible\b", "sensible"), (r"\banti-?aging\b|\banti-?age\b|\banti-?arrugas\b|\bwrinkle\b|\blifting\b", "anti age"),
    (r"\brepair(ing)?\b|\breparador\b|\brestorative\b", "reparateur"), (r"\bnourishing\b|\bnutritivo\b|\bnutri\b", "nourrissant"),
    (r"\bsoothing\b|\bcalmante\b|\bcalming\b", "apaisant"), (r"\bbrightening\b|\billuminating\b|\bradiance\b|\bglow\b", "eclat"),
    (r"\bfirming\b|\breafirmante\b", "raffermissant"), (r"\bpurifying\b|\bpurificante\b", "purifiant"),
    (r"\bmattifying\b|\bmatte\b|\bmatt\b", "mat"), (r"\bsmoothing\b|\balisador\b", "lissant"),
    (r"\bconcentrated\b|\bconcentrado\b", "concentre"), (r"\bsplash\b", ""),
    (r"\bhair fall\b|\bhairfall\b|\bcaida\b", "chute cheveux"), (r"\bbalsamo\b", "baume"), (r"\bphotoprotect\w*\b|\bfotoprotect\w*\b", "creme solaire"),
    (r"\bhair loss\b|\banti-?hair loss\b|\banti-?fall\b|\banticaida\b|\bhair growth\b", "anti chute"),
    (r"\bscalp\b", "cuir chevelu"), (r"\bhair\b|\bcabello\b|\bpelo\b", "cheveux"),
    (r"\blips?\b|\blabios\b", "levres"), (r"\beyes?\b|\bojos\b", "yeux"), (r"\bcuerpo\b", "corps"), (r"\bbruma\b", "brume"),
    (r"\bleche\b|\bmilk\b", "lait"), (r"\blocion\b", "lotion"), (r"\bespuma\b", "mousse"), (r"\bfluido\b", "fluide"),
    (r"\breparadora\b", "reparatrice"), (r"\bpiel\b", "peau"), (r"\bbalm\b", "baume"), (r"\btreatment\b|\btratamiento\b", "soin"),
    (r"\bbody wash\b", "gel douche"), (r"\bleave.?in\b|\bsin aclarado\b|\bsans rincage\b", "sans rincage"),
    (r"\btinted\b|\bcolorete\b", "teinte"), (r"\bseca\b|\bseco\b|\bdry\b", "sec"), (r"\bpestanas\b|\blashes\b", "cils"), (r"\bnr\b|\bn[º°o]\.?(?=\s?\d)", " "), (r"\bwaterproof\b|\blong-?lasting\b|\blasting\b", " "),
]
TR_C = [(re.compile(a), b) for a, b in TR]


def translate(n_norm):
    t = n_norm
    for rx, rep in TR_C:
        t = rx.sub(rep, t)
    t = t.replace("-", " ").replace("_", " ")
    return re.sub(r"\s+", " ", t).strip()


# ---------------------------------------------------------------------------
# 2) Exclusions : tout ce qui n'a pas de categorie sur le site
# ---------------------------------------------------------------------------
RE_EXCL = [
    ("parfum / brume parfumee / bougie", re.compile(
        r"\b(eau de (parfum|toilette|cologne)|edp|edt|perfumes?|parfums?|fragrances?|cologne|colonia|body mist|hair mist|"
        r"hair (and|&) body mist|body spray|eau fraiche|splash|bougie|candle|diffuser|diffuseur|room spray|pillow mist|"
        r"perfumed|fragrance sticks|mini fragrance|air freshener|ambientador|incense|incienso)\b")),
    ("homme / rasage", re.compile(r"\b(men|man|mens|men's|homme|hommes|for him|pour lui|hombre|barbe|beard|shav\w*|razor|rasage|aftershave|barber|gentleman)\b")),
    ("bebe / enfant", re.compile(r"\b(baby|babies|bebe|bebes|kids?|children'?s?|child|infant|junior|enfants?|pediatric\w*|nino|ninos|infantil|toddler)\b")),
    ("recharge", re.compile(r"\b(refills?|recharges?|recambio|spare parts?|replacement)\b")),
    ("box / decouverte / divers non-soin", re.compile(
        r"\b(box|boite|decouverte|discovery|beauty blender|blender|brumisateur|rechargeable|point g|orgasm|excitation|stimulant|"
        r"intima|sexe?|sexual|erotic\w*|raser|talc|talqu\w*|interprox|interdental|pads?|compresas?|evax|tampon|serviette\w*|"
        r"maison juliette|routine|mystere|surprise|abonnement|calendrier\w*|gants?|applicateurs?|pochons?|pochettes?|eponges?|sisal|"
        r"sels de bain|bath salts?|bath bomb\w*|bombes? de bain|gym toner|massage drainage|don de|"
        r"eyelash|refectocil|lash (lift|curl)|night curls|curlers?|pimple|acne patch|mighty patch|spot (squad|patch)|geske|smart app|"
        r"ultrasonic|sonica|led mask|bexident|encias|clorhexidin\w*|chlorhexidin\w*|gingiv\w*|aftas|topic[oa]|eccema|eczema|picor|"
        r"nettoyant mains|hand wash|lave mains|gel mains|intimes?|uomo)\b")),
    ("coffret / kit / pack / cadeau", re.compile(
        r"\b(coffret\w*|kits?|sets?|gift\w*|cadeaux?|case|trousse\w*|pcs|pieces?|duo|trio|travel( size)?|voyage|minis?|samples?|"
        r"echantillons?|calendar|advent|bundle|pack|packs|lot|lote|estuche|stick pack)\b|\bx ?\d+ ?(un|units?)\b|\b\d+ ?x ?\d+")),
    ("outil / accessoire / appareil", re.compile(
        r"\b(brush(es)?|cepillo|comb|peine|peigne|dryer|secador|straightener|plancha|curler|curling|iron|clipper|trimmer|tweezers?|"
        r"pinzas|scissors|tijeras|mirror|espejo|sponges?|esponja|puff|applicators?|pouch|bag|bags|neceser|toiletry|dispenser|"
        r"hair ?bands?|scrunchies?|headbands?|clips?|pins?|cotton pads?|cotton|algodon|discs?|disques?|wipes?|toallitas|gloves?|"
        r"guantes|towel|toalla|bonnet|turban|electric|device|appliance|lamp|laser|roller|rollers|gua sha|massager|spatula|"
        r"sharpener|false (eye)?lashes|eyelash curler|lash curler|lash glue|nail file|buffer|pumice|loofah|apron|cape|"
        r"hair (rollers?|extensions?|pieces?)|wig|diffusers?|sprayer|bottle|tumbler|sachet|dosing|pump|hairpiece|wax strips?)\b")),
    ("coloration / decoloration cheveux", re.compile(
        r"\b(hair colou?r\w*|hair dye|coloration|colou?r(ing)? (cream|kit|lotion)|permanent colou?r|bleach\w*|developer|oxidant\w*|"
        r"oxigenada|shades eq|root (touch|retouch)\w*|colorsmetique|nutri colou?r|colou?r gloss|dye|tint(e|ing)? (hair|cheveux)|"
        r"lightener|demi.?permanent|hair chalk|colou?r (filters|depositing)|bond ?(inside|multiplier|maintenance)|touch.?up)\b")),
    ("ongles / vernis", re.compile(r"\b(nails?|enamel|gel iq|manicure|manucure|cuticle\w*|polish remover|vernis|ongles|unas|esmalte\w*|nail polish|top coat|base coat)\b")),
    ("dentaire / hygiene intime / sante / complements", re.compile(
        r"\b(toothpaste|toothbrush|tooth|teeth|dental|dentifrice|mouthwash|mouth|floss|denture|enjuague|bucal|oral|gum|gingival|"
        r"whitening mouth|condoms?|lubric\w*|intimate|intimo|vaginal|feminine hygiene|sanitary|tampons?|incontinence|menstrual|pregnancy|"
        r"hemorrhoids?|wart|verruca|callus|corns?|blisters?|plasters?|dressings?|gauze|gasa|bandage|insoles?|heel|thermometer|"
        r"supplements?|vitamins?|capsules?|tablets?|comprimidos?|gummies|drinkable|infusion|syrup|jarabe|collagen powder|protein|"
        r"omega|probiotics?|magnesium|calcium|minerals?|forte pharma|lice|pediculicide|antifungal|mycosis|herpes|cold sore|analgesic|"
        r"muscle pain|pomada|ointment|nasal|eye drops|contact lens|saline|sleeping|stain remover|detergent|insecticide|mosquito|"
        r"toilet|papel higienico|pañuelos|pa[nñ]uelos|diaper|pañal|slimming|adelgazante|anti.?cellulite|cellulite|minceur|fat burner|"
        r"hemorroides|compeed|durex|scholl|fisiocrem|hand sanitizer|sanitizing|antibacterial|disinfect\w*|alcohol (gel|wipes)|hidroalcoholico)\b")),
    ("epilation / rasage", re.compile(r"\b(wax|waxing|depilat\w*|epilat\w*|hair removal|cire|cera depilatoria|shaving)\b")),
    ("serum cils / sourcils (pas du maquillage)", re.compile(r"\b(lash|lashes|eyelash|pestañas|pestanas|brow|eyebrow|sourcils)\b.*\b(serum|growth|booster|conditioner|treatment|activator|growing)\b|\blash growth\b")),
    ("lunettes / divers", re.compile(r"\b(sunglasses|glasses|gafas|lunettes|lenses|frame|keychain|stickers?|socks|calcetines|hat|gorro|watch)\b")),
    ("cheveux : appareil / accessoire / salon", re.compile(r"\b(hair (straight\w*|dryer|curler)|airwrap|ghd|babyliss|parlux|barber|barbero|keratin treatment kit|salon (use|size)|backbar|litre|1000 ?ml|1 ?l\b|\b\d{4} ?ml)\b")),
]


def exclusion_reason(name_n, translated):
    for label, rx in RE_EXCL:
        if rx.search(name_n) or rx.search(translated):
            if label.startswith("ongles") and re.search(r"\b(hand|hands|mains|manos|cream|creme)\b", name_n):
                continue  # creme mains & ongles : categorie "soin mains"
            if label.startswith("homme") and re.search(r"\bwomen\b|\bfemme\b|\bwoman\b", name_n):
                pass
            return label
    # tailles professionnelles tres grandes (1 L et plus) : produits de salon
    m = re.search(r"(\d+(?:[.,]\d+)?)\s?(ml|l|g|kg)\b", name_n)
    if m:
        v = float(m.group(1).replace(",", "."))
        if (m.group(2) == "l" and v >= 1) or (m.group(2) == "ml" and v >= 900 and not re.search(r"shampoo|shampoing|gel|body|lotion|gel douche|savon|soap", name_n)):
            return "format professionnel / salon"
    return None


# ---------------------------------------------------------------------------
# 3) Classification
# ---------------------------------------------------------------------------

def dom_from_cat(merchant_id, cat):
    c = norm(cat).strip()
    if merchant_id == "129677":
        return {"maquillage": "makeup", "cheveux": "hair", "cosmetiques pour le visage": "face",
                "cosmetique corporelle": "body", "soins solaires": "sun", "hygiene": "body"}.get(c)
    if merchant_id == "6977":
        return {"soins du visage": "face", "maquillage": "makeup", "soins du corps": "body", "capillaires": "hair",
                "hygiene": "body"}.get(c)
    return None


def R(p):
    return re.compile(p)


HAIR_WORD = R(r"cheveux|capillaire|shampo|apres shampoing|cuir chevelu|boucles|\bcurl|keratin|coiffant|\bcoiffage")
BODY_WORD = R(r"\bcorps\b|\bmains?\b|\bpieds?\b|deodorant|douche|vergeture|talons?|jambes|bain moussant|\bsavon")
FACE_WORD = R(r"visage|\bjour\b|\bnuit\b|anti age|anti rides|rides|\bpeau\b|peaux|teint|eclat|pores|imperfections|\bacne\b|taches|collagene|retinol|vitamine c|hyaluron|niacinamide")
SKIN_NOUN = R(r"creme|baume|fluide|lotion|emulsion|gel creme|soin|\bgel\b|hydrat")
SOFT_FACE = R(r"hydrat|nourr|apais|repar|cica|sensible|\bsec\b|peaux|lift|confort|anti|barriere|equilibr|matif|\bpur")


def hair_slug(t, weak=False):
    if R(r"shampoing sec").search(t):
        return "shampoing-sec"
    if R(r"anti chute|chute de|antichute|croissance|growth|pousse des").search(t):
        return "soin-anti-chute"
    if R(r"cuir chevelu|pellicul|dandruff").search(t):
        return "soin-cuir-chevelu"
    if R(r"cheveux colores|\bcolor|couleur|blond|violet|\bsilver|argent|decolor|meches|dyed|colorat").search(t) and not weak:
        return "soin-cheveux-colores"
    if R(r"apres shampoing|demelant|sans rincage|conditioner").search(t):
        return "apres-shampoing"
    if R(r"shampoing").search(t) or R(r"^bain\b").search(t):
        return "shampoing"
    if R(r"sheet|patch|visage|facial").search(t):
        return None
    if R(r"masque|bain d huile|traitement|\bcure\b|soin (profond|nutri|repar|intensi|restruct)|restructur|reconstruct|perfector|repair|reparat").search(t):
        return "masque-cheveux"
    if R(r"huile|elixir").search(t):
        return "huile-cheveux"
    if R(r"serum|ampoule").search(t):
        return "serum-cheveux"
    rx = r"laque|spray|mousse|gel\b|cire|pate|texturis|boucles|curl|lissant|fixant|finition|coiffant|modelant|ondulation|frizz"
    if R(rx).search(t):
        return "spray-coiffant"
    return None


LIP_BRANDS = ("liposan", "labello", "carmex", "blistex", "eos", "burts bees")


def classify(name_n, t, merchant_id, cat, brand_n="", brand_hair=False):
    """Classement STRICT : renvoie un slug du site, ou None (produit ecarte). t = nom traduit SANS la marque."""
    dom = dom_from_cat(merchant_id, cat)
    t = re.sub(r"oil control|oil free|sans huile|sin aceite", "controle sebum", t)
    hair = bool(HAIR_WORD.search(t))
    # fond de teint / maquillage avec SPF : maquillage, pas solaire
    if R(r"fond de teint|foundation|makeup spf|moisturi[sz]ing makeup|\bcc creme|\bbb creme|cushion|skin tint").search(t + " " + name_n) \
            and not R(r"creme solaire|sunscreen|apres soleil|after sun").search(t):
        return "fond-de-teint-cosmetique"

    # ----------------------------------------------------------- cheveux
    if hair:
        return hair_slug(t)
    if (dom == "hair" or dom is None) and brand_hair and not FACE_WORD.search(t) and not BODY_WORD.search(t):
        sl = hair_slug(t, weak=True)
        if sl:
            return sl
    if brand_hair and dom != "face" and dom != "body" and not FACE_WORD.search(t) and not BODY_WORD.search(t):
        return None  # marque purement capillaire : tout ce qui n'est pas un soin cheveux identifie est ecarte

    # ----------------------------------------------------------- autobronzant / solaire
    if R(r"autobronzant|self tan|bronzing (drops|mousse)").search(t):
        return "autobronzant"
    if R(r"creme solaire|solaire|\bspf ?\d*|\bfps ?\d*|apres soleil|\bsun|protection (solaire|uv)|sunscreen|photoprotect").search(t):
        if R(r"levres").search(t) or brand_n in LIP_BRANDS:
            return "soin-levres"
        if R(r"creme de jour|\bday\b|anti rides|anti age|\blift\b|\bnuit\b|night").search(t) and not R(r"solaire|sunscreen|\bsun\b|photoprotect|apres soleil|protect").search(t):
            return "creme-hydratante"
        if (R(r"visage|facial|\bface\b|\bteinte\b|fluide|\bjour\b|rides|anti age|\bpeau\b|serum|\bperfect|\bspot|stain|tache") .search(t)
                or FACE_WORD.search(t)) and not R(r"corps|body").search(t):
            return "creme-solaire-visage"
        return "creme-solaire-corps"

    # ----------------------------------------------------------- maquillage (mots forts)
    if brand_n in LIP_BRANDS and not R(r"gloss|rouge").search(t):
        return "soin-levres"
    if dom == "makeup" and R(r"\brouge\b|\bink\b|liquid velvet|velvet matte|superstay matte").search(t) and not R(r"yeux|cils|joues|ongles").search(t):
        return "rouge-a-levres"
    if dom == "makeup" and R(r"\bshadows?\b|\beyeshadows?\b").search(t):
        return "palette-yeux"
    if R(r"sourcils").search(t):
        return "sourcils"
    if R(r"\bmascara\b|\bcils\b") .search(t) and not R(r"creme|serum|soin").search(t):
        return "mascara"
    if R(r"crayon levres|rouge a levres|\bgloss\b|lip ?tint|lip ?ink|satin ink|vinyl ink|encre (a )?levres|laque levres|lipstick|lip stain|"
         r"lip (sorbet|butter|slip|plump\w*)|baume liquide repulpant|repulpant.*levres|baume (teinte )?levres? (et )?joues").search(t):
        return "rouge-a-levres"
    if R(r"fond de teint|anti.?cernes|\bbb creme|\bcc creme|cushion|skin tint|embellisseur de teint|teint equilibre|tinted beautifier").search(t) \
            and not R(r"demaquillant|nettoyant|masque").search(t):
        return "fond-de-teint-cosmetique"
    if R(r"base maquillage").search(t):
        return "fond-de-teint-cosmetique" if re.search(r"\b\d{2,3}(\.\d)?[nwc]?\b", name_n) else "primer"
    if R(r"ombre a paupieres|fard a paupieres|palette").search(t):
        return "palette-yeux"
    if R(r"eyeliner|crayon.*yeux|crayon yeux|kajal|khol|\bliner\b").search(t):
        return "eyeliner"
    if R(r"enlumineur|highlighter|strobing").search(t):
        return "highlighter"
    if R(r"\bblush\b|fard a joues|bronzer|poudre bronzante|contouring|\bjoues\b|terre de soleil").search(t):
        return "blush"
    if R(r"\bprimer\b|base lissante|base (visage|teint)|brume fixatrice|spray fixateur|setting").search(t):
        return "primer"
    if R(r"\bpoudre\b").search(t) and not brand_hair and not R(r"nettoy|exfoli|enzym|masque|shampo|cheveux|talc|corps|pieds|bain|lavante|cleans").search(t):
        return "poudre"

    # ----------------------------------------------------------- visage / corps
    body = bool(BODY_WORD.search(t)) or dom == "body"
    face_hint = bool(FACE_WORD.search(t)) or dom == "face"

    if R(r"demaquillant|eau micellaire|huile (nettoyante|micellaire)|cleaning oil|baume nettoyant|lait demaquillant").search(t):
        return "demaquillant"
    if R(r"contour (des )?yeux|contour yeux|soin (des )?yeux|creme yeux|gel yeux|serum yeux|regard\b").search(t) \
            and not R(r"masque|patch|ombre|crayon|mascara").search(t):
        return "contour-yeux"
    if R(r"masque|\bpatch|\bpatchs|sheet|hydrogel|peel off").search(t):
        return "masque"
    if R(r"gommage|exfoli|peeling|\bscrub").search(t):
        return "gommage-corps" if body and not R(r"visage").search(t) else "exfoliant"
    if R(r"deodorant|\bdeo\b|roll on|antitranspirant|anti transpirant").search(t):
        return "deodorant"
    if R(r"gel douche|creme (de )?douche|huile (de )?douche|huile lavante|bain moussant|\bdouche\b|\bsavon\b") .search(t):
        return "gel-douche" if (body or not R(r"visage").search(t)) else "nettoyant"
    if R(r"nettoyant|gel lavant|mousse lavante|creme lavante|lait nettoyant|\bwash\b|cleans").search(t):
        return "gel-douche" if (body and not R(r"visage").search(t)) else "nettoyant"
    if R(r"vergeture").search(t):
        return "vergetures"
    if R(r"\blevres\b|\blip\b").search(t):
        return "soin-levres" if R(r"baume|soin|gommage|masque|huile|beurre|\bbalm\b").search(t) else None
    if R(r"brume"):
        pass
    if R(r"brume").search(t):
        return "brume" if (R(r"visage|facial|eau|hydrat|thermale|tonique").search(t) and not R(r"corps|cheveux|parfum|oreiller|linge|pillow").search(t)) else None
    if R(r"tonique|\btoner\b|eau de beaute|eau de soin|eau thermale|eau florale|hydrolat|lotion (tonique|visage)|\bessence\b").search(t):
        return "brume" if not body else None
    if R(r"\bmains?\b").search(t) and SKIN_NOUN.search(t):
        return "soin-mains"
    if R(r"\bpieds?\b|talons?").search(t) and SKIN_NOUN.search(t):
        return "soin-pieds"
    if body and not R(r"visage").search(t):
        if R(r"beurre").search(t):
            return "beurre-corporel"
        if R(r"\blait\b|lotion|emulsion").search(t):
            return "lait-corporel"
        if R(r"huile").search(t):
            return "huile-corps"
        if SKIN_NOUN.search(t) or R(r"\burea|reparatrice|hydrat").search(t):
            return "creme-corps"
        return None
    if R(r"serum|ampoule|concentre|elixir|booster|\bcure\b|activateur").search(t):
        return "serum"
    if R(r"\bhuile\b").search(t):
        return "huile-visage" if (face_hint or R(r"visage|\bsec\b").search(t)) else None
    if SKIN_NOUN.search(t) and (face_hint or (dom is None and SOFT_FACE.search(t))):
        return "creme-hydratante"
    return None


def not_real_makeup(name_n, slug):
    if bs.PARENT_OF.get(slug) != "cosmetiques":
        return False
    return bool(R(r"\b(soin|serum|creme (hydratante|visage|jour|nuit)|nettoyant|demaquillant|shampo|huile (visage|corps))\b").search(name_n)) \
        and not R(r"fond de teint|rouge|mascara|blush|poudre|primer|palette|eyeliner|crayon|gloss").search(name_n)


# ---------------------------------------------------------------------------
# 4) Nettoyage du nom, teintes
# ---------------------------------------------------------------------------
def fix_moji(x):
    x = x or ""
    if "Ã" in x or "â€" in x:
        try:
            return x.encode("cp1252").decode("utf-8")
        except Exception:
            try:
                return x.encode("latin-1").decode("utf-8")
            except Exception:
                return x
    return x


def clean_name(raw, brand):
    t = html.unescape(html.unescape(fix_moji(raw or "").strip()))
    t = re.sub(r"[​-‏⁠﻿\xa0]+", " ", t)
    t = re.sub(r"\s*&amp;?\s*", " & ", t, flags=re.I)
    t = re.sub(r"\s+", " ", t).strip(" -–")
    # "Mixa Mixa Panthenol ..." -> "Mixa Panthenol ..."
    words = t.split(" ")
    bw = (brand or "").split(" ")
    k = len(bw)
    if k and [w.lower() for w in words[:k]] == [w.lower() for w in bw] and [w.lower() for w in words[k:2 * k]] == [w.lower() for w in bw]:
        t = " ".join(words[k:])
    # "- Marque" en fin de nom (Blissim, Ricaud)
    t = re.sub(r"\s+[-–]\s+" + re.escape(brand or "~") + r"\s*$", "", t, flags=re.I)
    t = re.sub(r"\s+[-–]\s+Dr\.? Pierre Ricaud\s*$", "", t, flags=re.I)
    t = re.sub(r"\b(\d+)\s?(Un|Und|Unds|Unit|Units|Uds?|Unidades)\b\.?", "", t, flags=re.I)
    t = re.sub(r"\bNr\b\.?\s?", "N°", t)
    t = re.sub(r"\s+([,.;])", r"\1", t)
    return re.sub(r"\s+", " ", t).strip(" -–")


SHADE_CUT = re.compile(r"(?:\bN°\s?\d|\bn[ro]\.?\s?\d|\b\d{1,3}[a-z]?\s?-\s?[a-zA-Z]|\b\d{2,3}\s[A-Z][a-z]+)")
SIZE_RX = re.compile(r"\b\d+(?:[.,]\d+)?\s?(?:ml|g|gr|cl|l)\b", re.I)
SHADE_WORDS = set("""neutral warm cool alabaster ivory beige sand porcelain nude honey golden natural light medium dark deep tan rose pink
peach caramel vanilla buff bisque fair cream amber almond chestnut mocha espresso cocoa sable doree fonce claire clair noisette
black brown blue green red coral plum berry mauve nude transparent translucent universal""".split())


def cut_shade(name):
    m = SHADE_CUT.search(name)
    if not m or m.start() < 8:
        return name
    base = name[:m.start()].strip(" -–")
    size = SIZE_RX.search(name[m.start():])
    return (base + (" " + size.group(0).replace(" ", "") if size else "")).strip()


# ---------------------------------------------------------------------------
# 5) Comparaison : jetons "intelligents" sur texte traduit
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Comparaison de deux produits (noms deja traduits en francais)
# ---------------------------------------------------------------------------
EXCL_FAM = [
    ("shampoing sec", R(r"shampoing sec")), ("apres", R(r"apres shampoing|conditioner|demelant")),
    ("shampoing", R(r"shampoing")), ("masque", R(r"masque|\bmask")), ("serum", R(r"serum")), ("ampoule", R(r"ampoule")),
    ("huile", R(r"\bhuile|\boil\b")), ("mousse", R(r"mousse|foam")), ("nettoyant", R(r"nettoyant|cleans|\bwash\b")),
    ("demaquillant", R(r"demaquillant|micellaire|makeup remover")), ("gommage", R(r"gommage|exfoli|peeling|scrub")),
    ("tonique", R(r"tonique|\btoner\b|\blotion\b")), ("deodorant", R(r"deodorant|\bdeo\b")), ("gel douche", R(r"gel douche|shower")),
    ("contour", R(r"contour (des )?yeux|yeux|\beye")), ("levres", R(r"levres|\blip")),
]
SIZE_RX2 = re.compile(r"(\d+(?:[.,]\d+)?)\s?(ml|cl|l|g|gr|kg)\b")


STRICT_FAM = {"gel douche", "deodorant", "shampoing", "apres", "shampoing sec", "masque"}
FORMS = [("spray", R(r"spray|pistola|vaporisateur|\bmist\b|brume")), ("stick", R(r"\bstick|barra\b|crayon")), ("fluide", R(r"fluide|\bfluid")),
         ("lait", R(r"\blait\b|\bmilk|leche")), ("huile", R(r"\bhuile|\boil\b|aceite")), ("gel", R(r"\bgel\b")),
         ("creme", R(r"creme|cream|crema")), ("mousse", R(r"mousse|foam|espuma"))]


def forms_of(t):
    return {n for n, rx in FORMS if rx.search(t)}


def families(t):
    f = {n for n, rx in EXCL_FAM if rx.search(t)}
    if "apres" in f or "shampoing sec" in f:
        f.discard("shampoing")
    return f


def sizes_of(name_n):
    out = set()
    for v, u in SIZE_RX2.findall(name_n):
        x = float(v.replace(",", "."))
        if u == "l":
            x *= 1000
        if u == "cl":
            x *= 10
        if u == "kg":
            x *= 1000
        out.add(round(x))
    return out


def nums_of(name_n):
    t = SIZE_RX2.sub(" ", name_n)
    t = re.sub(r"spf ?\d+\+?", " ", t)
    t = re.sub(r"\d+(?:[.,]\d+)?\s?%", " ", t)
    t = re.sub(r"\b(?:n|no|nr)\.?\s?(?=\d)", " ", t)
    return {x.lstrip("0") or "0" for x in re.findall(r"(?<![a-z0-9.])\d{1,3}(?:\.\d+)?(?![a-z0-9])", t)}


def spfs_of(name_n):
    return set(re.findall(r"spf ?(\d+)", name_n))


RX_DAY, RX_NIGHT = R(r"\bjour\b|\bday\b"), R(r"\bnuit\b|\bnight\b")


def _prep(x):
    if "fam" in x:
        return
    x["spf"] = spfs_of(x["name_n"])
    x["fam"] = families(x["t"])
    x["frm"] = forms_of(x["t"])
    x["num"] = nums_of(x["name_n"])
    x["siz"] = sizes_of(x["name_n"])
    x["day"] = bool(RX_DAY.search(x["t"]))
    x["night"] = bool(RX_NIGHT.search(x["t"]))


def same2(a, b, strict=False, allow_subset=True, internal=False):
    """a, b = dict(toks, name_n, t). True si tres probablement le meme produit."""
    ta, tb = a["toks"], b["toks"]
    if not ta or not tb:
        return False
    _prep(a)
    _prep(b)
    sa_, sb_ = a["spf"], b["spf"]
    if sa_ and sb_ and sa_ != sb_:
        return False
    fa, fb = a["fam"], b["fam"]
    if fa and fb and not (fa <= fb or fb <= fa):
        return False
    if (a["day"] and not a["night"] and b["night"] and not b["day"]) or (b["day"] and not b["night"] and a["night"] and not a["day"]):
        return False
    xa, xb = a["frm"], b["frm"]
    if xa and xb and not (xa & xb):
        return False
    na, nb = a["num"], b["num"]
    if na and nb and not (na <= nb or nb <= na):
        return False
    sa, sb = set(ta), set(tb)
    if sa == sb:
        return True
    jac = len(sa & sb) / len(sa | sb)
    same_size = bool(a["siz"] and b["siz"] and a["siz"] & b["siz"])
    if (fa & STRICT_FAM) != (fb & STRICT_FAM) and jac < 0.85 and not (same_size and jac >= 0.7):
        return False
    if internal:
        return jac >= 0.85
    if strict:
        return jac >= 0.8 and len(sa & sb) >= 4
    if jac >= 0.75:
        return True
    small, big = (sa, sb) if len(sa) <= len(sb) else (sb, sa)
    if small <= big and len(small) >= 2 and (big - small) <= dm.GENERIC:
        return True
    if allow_subset and small <= big and len(small) >= 4:
        return True
    za, zb = a["siz"], b["siz"]
    if jac >= 0.6 and za and zb and za & zb:
        return True
    ra = difflib.SequenceMatcher(None, " ".join(sorted(ta)), " ".join(sorted(tb))).ratio()
    return ra >= 0.92


def pack(name, brand):
    n = norm(name)
    bn = norm(brand or "")
    if bn and bn in n:
        n = n.replace(bn, " ", 1)
    t = translate(n)
    return {"toks": dm.core_tokens(t, brand), "name_n": t, "t": t, "name": name}

def tokens(name, brand):
    return dm.core_tokens(translate(norm(name)), brand)


def norm_ean(x):
    d = re.sub(r"\D", "", x or "")
    return d.lstrip("0") if len(d) >= 8 else ""


def feeds_ean(root, db_ids):
    """EAN des produits DEJA importes, retrouves dans les flux (id stable -> EAN)."""
    out = {}
    def add(ean, ident, label, name):
        e = norm_ean(ean)
        if not e:
            return
        if db_ids is not None and ident not in db_ids:
            return
        out[e] = (name, label)
    p = root / "datafeed_2923665.csv"  # Perfumeria / Hairlust (ancien flux Awin)
    if p.exists():
        with open(p, newline="", encoding="utf-8-sig", errors="replace") as f:
            for r in csv.DictReader(f):
                aw = (r.get("aw_product_id") or "").strip()
                ident = str(uuid.uuid5(uuid.NAMESPACE_URL, f"awin-{aw}")) if aw else None
                add(r.get("ean") or r.get("product_GTIN") or r.get("upc"), ident, "flux Perfumeria", r.get("product_name") or "")
    p = root / "105475-retail-fr_FR.csv"  # Perfumeria (flux Google)
    if p.exists():
        with open(p, newline="", encoding="utf-8-sig", errors="replace") as f:
            for r in csv.DictReader(f):
                ident_a = None
                aw = ""
                m = re.search(r"[?&]p=(\d+)", r.get("aw_deep_link") or "")
                if m:
                    aw = m.group(1)
                    ident_a = str(uuid.uuid5(uuid.NAMESPACE_URL, f"awin-{aw}"))
                ident_b = str(uuid.uuid5(uuid.NAMESPACE_URL, f"perfumeria-{(r.get('id') or '').strip()}"))
                for ident in (ident_a, ident_b):
                    add(r.get("gtin"), ident, "flux Perfumeria (Google)", r.get("title") or "")
    p = root / "products_405179742-2.csv"  # Beauty Success
    if p.exists():
        with open(p, newline="", encoding="utf-8-sig", errors="replace") as f:
            for r in csv.DictReader(f, delimiter=";"):
                ident = str(uuid.uuid5(uuid.NAMESPACE_URL, f"beautysuccess-{(r.get('id') or '').strip() or r.get('title')}"))
                add(r.get("gtin"), ident, "flux Beauty Success", r.get("title") or "")
    return out


DEBUG_PAIRS = []


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = [a for a in sys.argv[1:] if a.startswith("--")]
    if not args:
        print(__doc__)
        sys.exit(1)
    dry_run = "--dry-run" in flags
    keep_shades = "--keep-shades" in flags
    existing_json = HERE / "existing_products.json"
    if "--existing-json" in sys.argv:
        existing_json = Path(sys.argv[sys.argv.index("--existing-json") + 1])
        if str(existing_json) in args:
            args.remove(str(existing_json))
    csv_path = args[0]
    root = HERE.parent.parent

    col = None
    if (not dry_run) or "--check-db" in flags:
        from pymongo import MongoClient
        from dotenv import load_dotenv
        import certifi
        load_dotenv(HERE.parent / ".env")
        client = MongoClient(os.environ["MONGO_URL"], tlsCAFile=certifi.where())
        col = client[os.environ["DB_NAME"]]["products"]

    # --- produits deja presents ------------------------------------------
    existing, db_ids = [], None
    stats = Counter()
    if col is not None:
        docs_db = list(col.find({}, {"_id": 0, "id": 1, "name": 1, "brand": 1, "category": 1, "source_merchant": 1}))
        src = "base (lecture directe)"
    elif existing_json.exists():
        docs_db = json.loads(existing_json.read_text(encoding="utf-8"))
        src = f"base (export {existing_json.name})"
    else:
        docs_db = None
        src = None
    if docs_db is not None:
        db_ids = set()
        for d in docs_db:
            if (d.get("source_merchant") or "") in MERCHANTS.values():
                continue  # nos propres imports precedents de CE flux : mis a jour par id
            db_ids.add(d.get("id"))
            existing.append({"brand": d.get("brand") or "", "name": d.get("name") or "", "category": d.get("category"),
                             "source": d.get("source_merchant") or "base"})
        stats[f"produits deja presents ({src})"] = len(existing)
    else:
        old = dm.existing_from_old_csv(str(root / "datafeed_2923665.csv"))
        existing += old
        stats["produits deja presents (ancien flux, FAUTE DE LA BASE : resultats moins fiables)"] = len(old)
        for fn, label in (("docmorris_a_importer.csv", "DocMorris (liste)"), ("beautysuccess_a_importer.csv", "Beauty Success (liste)")):
            p = HERE / fn
            if p.exists():
                with open(p, newline="", encoding="utf-8") as f:
                    for r in csv.DictReader(f):
                        existing.append({"brand": r["marque"], "name": r["produit"], "category": r["categorie"], "source": label})
        stats["produits deja presents (listes DocMorris + Beauty Success)"] = len(existing) - len(old)
    ean_existing = feeds_ean(root, db_ids)
    stats["codes-barres (EAN) deja connus"] = len(ean_existing)

    # marques : forme d'affichage deja utilisee dans le catalogue
    canon = {}
    for e, n in Counter((dm.brand_key(x["brand"]), x["brand"]) for x in existing).most_common():
        canon.setdefault(e[0], e[1])

    ex_by_brand = defaultdict(list)
    for e in existing:
        ex_by_brand[dm.brand_key(e["brand"])].append({**e, **pack(e["name"], e["brand"])})
    ex_brand_keys = list(ex_by_brand)
    ex_all = [x for lst in ex_by_brand.values() for x in lst]
    inv = defaultdict(list)
    for i, x in enumerate(ex_all):
        for tk in set(x["toks"]):
            inv[tk].append(i)
    too_common = {tk for tk, lst in inv.items() if len(lst) > 400}

    # --- lecture et filtrage du flux --------------------------------------
    inventory = Counter()
    excluded_samples = defaultdict(list)
    cands = []
    # marques "capillaires" : au moins 3 produits avec un mot capillaire explicite, et la moitie ou plus de leur catalogue
    hb_tot, hb_hair = Counter(), Counter()
    with open(csv_path, newline="", encoding="utf-8-sig", errors="replace") as f0:
        for r0 in csv.DictReader(f0):
            bk0 = norm(fix_moji(r0.get("brand_name") or ""))
            hb_tot[bk0] += 1
            if HAIR_WORD.search(translate(norm(r0.get("product_name") or ""))):
                hb_hair[bk0] += 1
    hair_brands = {b for b, n in hb_hair.items() if n >= 3 and n / hb_tot[b] >= 0.5}
    with open(csv_path, newline="", encoding="utf-8-sig", errors="replace") as f:
        for row in csv.DictReader(f):
            stats["lignes lues"] += 1
            mid = (row.get("merchant_id") or "").strip()
            if mid not in MERCHANTS:
                stats["ecartees : marchand inconnu"] += 1
                continue
            merchant = MERCHANTS[mid]
            cat = (row.get("merchant_category") or "").strip()
            inventory[(merchant, cat or "(sans rayon)")] += 1
            cn = norm(cat)
            if mid == "129677" and cn not in {"maquillage", "cheveux", "cosmetiques pour le visage", "cosmetique corporelle", "soins solaires", "hygiene"}:
                stats["ecartees : rayon hors categories du site (parfums, sante, bebe, nutrition, maison...)"] += 1
                continue
            if mid == "6977" and (cn in {"id parfums", "parfumage"} or "trousse" in cn):
                stats["ecartees : parfums / coffrets"] += 1
                continue
            brand = awin.norm_brand(html.unescape(fix_moji(row.get("brand_name") or "")))
            if not brand or brand.lower() in {"blissim"}:
                stats["ecartees : sans marque (ou produits maison Blissim : box...)"] += 1
                continue
            name = clean_name(row.get("product_name"), brand)
            if not name:
                stats["ecartees : sans nom"] += 1
                continue
            img = (row.get("merchant_image_url") or row.get("aw_image_url") or "").strip()
            if not img.startswith("http") or dm.RE_BAD_IMAGE.search(img):
                stats["ecartees : sans photo valide"] += 1
                continue
            try:
                price = float(row.get("search_price") or 0)
            except ValueError:
                price = 0.0
            if price < 1.0:
                stats["ecartees : prix aberrant (< 1 EUR)"] += 1
                continue
            n_n = norm(name)
            t = translate(n_n)
            reason = exclusion_reason(n_n, t)
            if reason:
                stats[f"ecartees : {reason}"] += 1
                if len(excluded_samples[reason]) < 30:
                    excluded_samples[reason].append(f"{merchant} | {brand} | {name}")
                continue
            bn = norm(brand)
            t_cls = translate(n_n.replace(bn, " ", 1)) if bn and bn in n_n else t
            slug = classify(n_n, t_cls, mid, cat, bn, bn in hair_brands)
            if not slug:
                stats["ecartees : non classifiees (pas de categorie correspondante sur le site)"] += 1
                if len(excluded_samples["non classifie"]) < 60:
                    excluded_samples["non classifie"].append(f"{merchant} | {brand} | {name}")
                continue
            if not_real_makeup(n_n, slug):
                stats["ecartees : pas du maquillage (soin range en maquillage)"] += 1
                continue
            ean = norm_ean(row.get("ean") or row.get("product_GTIN") or row.get("upc"))
            cands.append({"row": row, "merchant": merchant, "name": name, "brand": canon.get(dm.brand_key(brand), brand),
                          "price": price, "slug": slug, "parent": bs.PARENT_OF.get(slug, "visage"), "ean": ean,
                          "bk": dm.brand_key(brand), "toks": dm.core_tokens(t_cls, brand), "t": t_cls, "name_n": t_cls, "cat": cat})
    stats["candidats apres filtres"] = len(cands)

    # --- doublons internes --------------------------------------------------
    for c in cands:
        if keep_shades or c["slug"] in bs.COLOR_SLUGS:
            c["key_name"] = c["name"]
            c["key_toks"] = c["toks"]
        else:
            c["key_name"] = cut_shade(c["name"])
            kt = tokens(c["key_name"], c["brand"])
            c["key_toks"] = [w for w in kt if w not in SHADE_WORDS and not w.isdigit()] or kt
    groups = defaultdict(list)
    for c in cands:
        groups[(c["bk"], c["slug"], " ".join(sorted(set(c["key_toks"]))))].append(c)
    kept = []
    for lst in groups.values():
        lst.sort(key=lambda c: (c["price"], c["name"]))
        head = lst[0]
        head["eans"] = {x["ean"] for x in lst if x["ean"]}
        head["merged"] = len(lst)
        kept.append(head)
    stats["doublons internes fusionnes (memes produit/contenance, teintes d'un fond de teint, etc.)"] = len(cands) - len(kept)
    by_bs = defaultdict(list)
    for c in kept:
        by_bs[(c["bk"], c["slug"])].append(c)
    kept2 = []
    for lst in by_bs.values():
        lst.sort(key=lambda c: c["name"])
        chosen = []
        for c in lst:
            twin = None
            if c["slug"] not in bs.COLOR_SLUGS or not keep_shades:
                for x in chosen:
                    if c["slug"] in bs.COLOR_SLUGS:
                        continue
                    if same2({"toks": x["key_toks"], "name_n": x["name_n"], "t": x["t"]}, {"toks": c["key_toks"], "name_n": c["name_n"], "t": c["t"]}, internal=True):
                        twin = x
                        break
            if twin is not None:
                if os.environ.get("BV_DEBUG"):
                    DEBUG_PAIRS.append((twin["name"], c["name"]))
                twin["eans"] |= c["eans"]
                twin["merged"] += c["merged"]
                stats["quasi-doublons internes fusionnes"] += 1
                continue
            chosen.append(c)
        kept2.extend(chosen)
    kept = kept2
    stats["produits uniques dans le flux"] = len(kept)

    # --- comparaison avec l'existant -----------------------------------------
    final, dups = [], []
    for c in kept:
        match, how = None, ""
        for e in c.get("eans", set()):
            if e in ean_existing:
                nm, lab = ean_existing[e]
                match, how = {"name": nm, "source": f"{lab} (meme code-barres {e})"}, "ean"
                break
        if match is None:
            cp = {"toks": c["key_toks"], "name_n": c["name_n"], "t": c["t"]}
            cp_full = {"toks": c["toks"], "name_n": c["name_n"], "t": c["t"]}
            for ebk in ex_brand_keys:
                if dm.brand_matches(c["bk"], ebk):
                    for e in ex_by_brand[ebk]:
                        if same2(cp, e) or (c["key_toks"] != c["toks"] and same2(cp_full, e)):
                            match, how = e, "nom"
                            break
                if match:
                    break
        if match is None and len(c["key_toks"]) >= 4:
            cp = {"toks": c["key_toks"], "name_n": c["name_n"], "t": c["t"]}
            cnt = Counter()
            for tk in set(c["key_toks"]) - too_common:
                for i in inv.get(tk, ()):
                    cnt[i] += 1
            for i, k in cnt.most_common(15):
                if k < 4:
                    break
                if same2(cp, ex_all[i], strict=True):
                    match, how = ex_all[i], "nom (marque ecrite autrement)"
                    break
        if match:
            dups.append((c, match, how))
        else:
            final.append(c)
    stats["ecartes car deja presents (code-barres)"] = sum(1 for d in dups if d[2] == "ean")
    stats["ecartes car deja presents (nom, toutes langues)"] = sum(1 for d in dups if d[2].startswith("nom"))
    stats["PRODUITS A IMPORTER"] = len(final)

    # --- quasi-doublons (a verifier) ------------------------------------------
    near = []
    for c in final:
        best = (0.0, None)
        for ebk in ex_brand_keys:
            if dm.brand_matches(c["bk"], ebk):
                for e in ex_by_brand[ebk]:
                    a, b = set(c["key_toks"]), set(e["toks"])
                    if a and b:
                        j = len(a & b) / len(a | b)
                        if j > best[0]:
                            best = (j, e)
        if best[1] is not None and best[0] >= 0.5:
            near.append((best[0], c, best[1]))
    near.sort(key=lambda t: -t[0])
    stats["importes mais ressemblant a un produit existant (a verifier)"] = len(near)

    # --- documents -----------------------------------------------------------------
    docs, per_slug, per_merchant = [], Counter(), Counter()
    for c in final:
        row = c["row"]
        full_text = f"{c['name']} {row.get('description') or ''}"
        aw_id = (row.get("aw_product_id") or "").strip()
        stable_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"awin-{aw_id}" if aw_id else f"awin-{c['name']}-{c['brand']}"))
        image = awin.upgrade_image_url((row.get("aw_image_url") or row.get("merchant_image_url") or "").strip())
        display_name = c["key_name"] if (c["slug"] not in bs.COLOR_SLUGS and not keep_shades and c.get("merged", 1) > 1) else c["name"]
        docs.append({
            "id": stable_id, "category": c["slug"], "parent": c["parent"], "name": display_name, "brand": c["brand"],
            "price": round(c["price"], 2), "rating": awin.RATING_DEFAULT, "reviews": awin.REVIEWS_DEFAULT, "image": image,
            "tags": awin.extract_matches(full_text, awin.TAG_PATTERNS),
            "skin_types": awin.extract_matches(full_text, awin.SKIN_TYPE_PATTERNS),
            "hair_types": awin.extract_matches(full_text, awin.HAIR_TYPE_PATTERNS),
            "benefits": awin.extract_matches(full_text, awin.BENEFIT_PATTERNS),
            "color_hex": None, "zone": awin.CATEGORY_ZONE.get(c["slug"]),
            "affiliate_url": (row.get("aw_deep_link") or "#").strip() or "#",
            "source": "awin", "source_merchant": c["merchant"],
        })
        per_slug[c["slug"]] += 1
        per_merchant[c["merchant"]] += 1
    if os.environ.get("BV_DEBUG"):
        Path(os.environ["BV_DEBUG"]).write_text("\n".join(f"{a}  ==  {b}" for a, b in DEBUG_PAIRS), encoding="utf-8")
    if os.environ.get("BV_DUMP_JSON"):
        Path(os.environ["BV_DUMP_JSON"]).write_text(json.dumps(docs, ensure_ascii=False), encoding="utf-8")

    inserted = updated = 0
    if not dry_run:
        from pymongo import UpdateOne
        total = len(docs)
        for i in range(0, total, 500):
            res = col.bulk_write([UpdateOne({"id": d["id"]}, {"$set": d}, upsert=True) for d in docs[i:i + 500]], ordered=False)
            inserted += res.upserted_count
            updated += res.matched_count
            print(f"  ... {min(i + 500, total)} / {total} produits ecrits", flush=True)

    # --- rapports --------------------------------------------------------------------
    known_brands = {dm.brand_key(e["brand"]) for e in existing}
    imp_brands = Counter(c["brand"] for c in final)
    new_brands = [b for b in imp_brands if dm.brand_key(b) not in known_brands]
    rep = ["IMPORT NOUVEAUX MARCHANDS (Cosmetiere, Blissim, Dr Pierre Ricaud)" + (" (SIMULATION, rien n'est ecrit en base)" if dry_run else "")]
    rep.append("")
    rep.append("Contenu du flux par marchand / rayon :")
    for (m, k), v in sorted(inventory.items(), key=lambda t: (t[0][0], -t[1])):
        rep.append(f"  {v:6d}  {m} : {k}")
    rep.append("")
    for k, v in stats.items():
        rep.append(f"{v:8d}  {k}")
    if not dry_run:
        rep.append(f"  -> nouveaux : {inserted}, mis a jour : {updated}")
    rep.append("")
    rep.append("Produits importes par marchand :")
    for m, n in per_merchant.most_common():
        rep.append(f"  {n:6d}  {m}")
    rep.append("")
    rep.append("Produits importes par categorie :")
    for slug, n in per_slug.most_common():
        rep.append(f"  {n:6d}  {slug}")
    rep.append("")
    rep.append(f"Marques importees : {len(imp_brands)} dont {len(new_brands)} nouvelles au catalogue")
    rep.append("  Top marques importees : " + ", ".join(f"{b} ({n})" for b, n in imp_brands.most_common(30)))
    rep.append("")
    for reason, lst in excluded_samples.items():
        rep.append(f"Exemples ecartes ({reason}) :")
        rep.extend(f"  - {s}" for s in lst[:20])
        rep.append("")
    text = "\n".join(rep)
    print(text)
    (HERE / "nouveaux_marchands_report.txt").write_text(text, encoding="utf-8")
    with open(HERE / "nouveaux_marchands_doublons.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["marchand", "marque", "produit du flux (ecarte)", "produit deja present", "origine", "methode", "categorie"])
        for c, e, how in dups:
            w.writerow([c["merchant"], c["brand"], c["name"], e["name"], e.get("source", ""), how, c["slug"]])
    with open(HERE / "nouveaux_marchands_quasi_doublons.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["ressemblance", "marque", "produit du flux (IMPORTE)", "produit existant le plus proche"])
        for j, c, e in near:
            w.writerow([round(j, 2), c["brand"], c["name"], e["name"]])
    with open(HERE / "nouveaux_marchands_a_importer.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["marchand", "categorie", "parent", "marque", "produit", "prix"])
        for c in final:
            w.writerow([c["merchant"], c["slug"], c["parent"], c["brand"], c["name"], c["price"]])


if __name__ == "__main__":
    main()
