"""
Script ponctuel : cree (ou met a jour) 12 articles de blog directement en
base, sans passer par l'API (donc sans avoir besoin d'un token admin).
A lancer une seule fois depuis le dossier backend :

    source venv/bin/activate
    python3 seed_blog_batch2.py

Attention : ce script se connecte au MONGO_URL defini dans backend/.env,
qui est le meme cluster Atlas que celui utilise en production. Les articles
seront donc visibles en local ET sur beautifyvision.fr des leur creation.
"""
import os
from datetime import datetime, timezone
from pathlib import Path

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

os.environ.setdefault("SSL_CERT_FILE", certifi.where())

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

client = MongoClient(os.environ["MONGO_URL"], tlsCAFile=certifi.where())
db = client[os.environ["DB_NAME"]]

# ---------------------------------------------------------------------------
# Produits Awin reels (extraits du flux datafeed_2923665.csv), un dict reutilise
# tel quel dans les blocs "products" de plusieurs articles.
# ---------------------------------------------------------------------------
P = {
    "cicaplast": {"name": "Baume ultra réparateur Cicaplast Baume B5+ SPF50 40 ml", "brand": "LA ROCHE POSAY", "rating": 4.0, "reviews": 0, "price": 12.5, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F134645-1_s.webp&feedId=97867&k=5d065a7e42f6b6c7404f86fdd5278d0e48872cbf", "affiliate_url": "https://www.awin1.com/pclick.php?p=39179013815&a=2923665&m=105475"},
    "cicabio": {"name": "Crème ultra-réparatrice SPF50+ Cicabio 40 ml", "brand": "BIODERMA", "rating": 4.0, "reviews": 0, "price": 11.0, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F137413-1_s.webp&feedId=97867&k=d05e4a41a6fce5424099db161eaea317fc3dff72", "affiliate_url": "https://www.awin1.com/pclick.php?p=39179014300&a=2923665&m=105475"},
    "cicalfate": {"name": "Cicalfate+ Spf50+ 30 ml", "brand": "Avène", "rating": 4.0, "reviews": 0, "price": 12.0, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F136556-1_s.webp&feedId=97867&k=cb3edc44f9c184c3d831cd1bc4b058127e928a94", "affiliate_url": "https://www.awin1.com/pclick.php?p=39179013990&a=2923665&m=105475"},
    "pore_refiner": {"name": "Sebium Pore Refiner 30 ml", "brand": "BIODERMA", "rating": 4.0, "reviews": 0, "price": 14.5, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F9411-1_s.webp&feedId=97867&k=5eeed87de2b8e0ab9651c5be50611816c2d44834", "affiliate_url": "https://www.awin1.com/pclick.php?p=39179009654&a=2923665&m=105475"},
    "sensibio_gel": {"name": "Sensibio DS+ Gel Nettoyan 200 ml", "brand": "BIODERMA", "rating": 4.0, "reviews": 0, "price": 13.5, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F9421-1_s.webp&feedId=97867&k=54f16c9645c1a1f7b8474378869e35dc4257f242", "affiliate_url": "https://www.awin1.com/pclick.php?p=44079959266&a=2923665&m=105475"},
    "serum_antiimperfections": {"name": "Sérum Anti-imperfections 30 ml", "brand": "Embryolisse", "rating": 4.0, "reviews": 0, "price": 18.2, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F132845-1_s.webp&feedId=97867&k=8864febf978fe53458b5215ab66a2c0fd6691dfc", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813652168&a=2923665&m=105475"},
    "correct_conceal": {"name": "Correct &amp; Conceal", "brand": "ESSENCE", "rating": 4.0, "reviews": 0, "price": 2.49, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F140345-1_s.webp&feedId=97867&k=737bca092886c82fca63ea0aa1672ae4b4c02cb2", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813652961&a=2923665&m=105475"},
    "nars_foundation": {"name": "Light Reflecting Foundation", "brand": "NARS", "rating": 4.0, "reviews": 0, "price": 49.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F124347-1_s.webp&feedId=97867&k=1d6748e391b26ff47261866ab9c2e6916a55b834", "affiliate_url": "https://www.awin1.com/pclick.php?p=43334110981&a=2923665&m=105475"},
    "clarins_3dot": {"name": "3-Dot Liner Black 0.7 ml", "brand": "Clarins", "rating": 4.0, "reviews": 0, "price": 23.5, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F42442-1_s.webp&feedId=97867&k=e6e1da7b995780270896419d73129e4ca55ce67d", "affiliate_url": "https://www.awin1.com/pclick.php?p=39179009602&a=2923665&m=105475"},
    "clarins_crayon": {"name": "Crayon Eyeliner Waterproof", "brand": "Clarins", "rating": 4.0, "reviews": 0, "price": 16.5, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F94853-1_s.webp&feedId=97867&k=577afa5bcafe245768cdd2e3e67d0a999acd2815", "affiliate_url": "https://www.awin1.com/pclick.php?p=41366819415&a=2923665&m=105475"},
    "lancome_drama": {"name": "L'Absolu Rouge Drama Matte", "brand": "LANCÔME", "rating": 4.0, "reviews": 0, "price": 29.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F119077-1_s-a5636fb4.webp&feedId=97867&k=558fc04b169a6c061cad36396b6baf3c158b40ce", "affiliate_url": "https://www.awin1.com/pclick.php?p=46127731511&a=2923665&m=105475"},
    "nars_lipstick": {"name": "Lipstick", "brand": "NARS", "rating": 4.0, "reviews": 0, "price": 28.0, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F124255-1_s.webp&feedId=97867&k=19669404b86ad869bae037e4d6aea7a783f15f6e", "affiliate_url": "https://www.awin1.com/pclick.php?p=39179012307&a=2923665&m=105475"},
    "clarins_skinillusion": {"name": "Skin Illusion Full Coverage", "brand": "Clarins", "rating": 4.0, "reviews": 0, "price": 34.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F142541-1_s.webp&feedId=97867&k=58abb1a7d42b98d7fbdda18cc8e3621371ce3227", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813652982&a=2923665&m=105475"},
    "ducray_antichute": {"name": "Anaphase Shampooing Antichute 200 ml", "brand": "DUCRAY", "rating": 4.0, "reviews": 0, "price": 14.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F145093-1_s.webp&feedId=97867&k=97aac748aaebdc844859a32956bf1982999d1de4", "affiliate_url": "https://www.awin1.com/pclick.php?p=44079959258&a=2923665&m=105475"},
    "ducray_anacaps": {"name": "Anacaps Reactiv Add-on Alimentation 90 ud", "brand": "DUCRAY", "rating": 4.0, "reviews": 0, "price": 39.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F143315-1_s.webp&feedId=97867&k=ff288f3f55b13a0417691237fbf04911861be246", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813651949&a=2923665&m=105475"},
    "evoluderm_ricin": {"name": "Lotion Capilar avec huile de Ricino 100 ml", "brand": "EVOLUDERM", "rating": 4.0, "reviews": 0, "price": 3.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F131015-1_s.webp&feedId=97867&k=c8c5d51f702430a360a052bb0048cbd00a90f55c", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813652068&a=2923665&m=105475"},
    "loreal_curl": {"name": "Shampooing Curl Expression", "brand": "EXPERT- LOREAL", "rating": 4.0, "reviews": 0, "price": 25.0, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F121513-1_s.webp&feedId=97867&k=3a4f02d54ea8cad24c551332bc67fc062703e8de", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813651931&a=2923665&m=105475"},
    "byphasse_boucles": {"name": "Boucles Crème Capilar 250 ml", "brand": "BYPHASSE", "rating": 4.0, "reviews": 0, "price": 2.3, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F35909-1_s.webp&feedId=97867&k=fbf5b8edd805bc4126f4195609376f582ce335db", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813652055&a=2923665&m=105475"},
    "evoluderm_huile": {"name": "Huile Précieuse Mascarilla 1 L", "brand": "EVOLUDERM", "rating": 4.0, "reviews": 0, "price": 5.5, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F72868-1_s.webp&feedId=97867&k=022eaf3c845bb7224a3a728a8cc5b66a839b61f2", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813652065&a=2923665&m=105475"},
    "cerave_creme": {"name": "Crème Hydratante", "brand": "CeraVe", "rating": 4.0, "reviews": 0, "price": 13.1, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F93568-1_s.webp&feedId=97867&k=cba7b65e25060c99c2363a297e3ac9ae89ca6ae9", "affiliate_url": "https://www.awin1.com/pclick.php?p=43398278958&a=2923665&m=105475"},
    "cerave_lotion": {"name": "Lotion d'hydratation intense 473 ml", "brand": "CeraVe", "rating": 4.0, "reviews": 0, "price": 20.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F145458-1_s.webp&feedId=97867&k=eb985250c244c682ce0146046afb8448de0e7fac", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813653015&a=2923665&m=105475"},
    "avene_coldcream": {"name": "Cold Cream Crème 40 ml", "brand": "Avène", "rating": 4.0, "reviews": 0, "price": 9.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F13270-1_s.webp&feedId=97867&k=ea3618cf8f44c6074d173b0fab7ec3c7bb37b66b", "affiliate_url": "https://www.awin1.com/pclick.php?p=39179008521&a=2923665&m=105475"},
    "alqvimia_estrias": {"name": "Body Oil Anti-Estrias 150 ml", "brand": "ALQVIMIA", "rating": 4.0, "reviews": 0, "price": 57.3, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F108710-1_s.webp&feedId=97867&k=18dfac83b456899d64c41bacca12ba692e493e62", "affiliate_url": "https://www.awin1.com/pclick.php?p=39179010317&a=2923665&m=105475"},
    "biooil": {"name": "Gel pour peau sèche", "brand": "BIO-OIL", "rating": 4.0, "reviews": 0, "price": 16.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F99947-1_s.webp&feedId=97867&k=e7fb6958e92718bc1cb1d75f37a277648599aa86", "affiliate_url": "https://www.awin1.com/pclick.php?p=43407453296&a=2923665&m=105475"},
    "clarins_firming": {"name": "Body Firming Crème 200 ml", "brand": "Clarins", "rating": 4.0, "reviews": 0, "price": 45.0, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F118716-1_s.webp&feedId=97867&k=1880bafc1d75bcaa4224771ad80f8e83ecddbfd3", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813647036&a=2923665&m=105475"},
    "martiderm_hydra": {"name": "Ampoules Proteos Hydra Plus 30 uds", "brand": "MARTIDERM", "rating": 4.0, "reviews": 0, "price": 36.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F122079-1_s.webp&feedId=97867&k=6d222355dd9d9b03e3f36a19f5e183b57f2caa86", "affiliate_url": "https://www.awin1.com/pclick.php?p=39179012768&a=2923665&m=105475"},
    "martiderm_liposome": {"name": "Ampoules Proteus Liposome", "brand": "MARTIDERM", "rating": 4.0, "reviews": 0, "price": 36.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F122087-1_s.webp&feedId=97867&k=023dbe6e4a2d85806f0c2444b73fc0f0d721552b", "affiliate_url": "https://www.awin1.com/pclick.php?p=39179012773&a=2923665&m=105475"},
    "cosrx_snail": {"name": "Advanced Snail 96 Fluide 100 ml", "brand": "COSRX", "rating": 4.0, "reviews": 0, "price": 21.25, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F144979-1_s.webp&feedId=97867&k=c29732ef05671c599860a93349fb3e561dc9f0ae", "affiliate_url": "https://www.awin1.com/pclick.php?p=41795689784&a=2923665&m=105475"},
    "bioderma_hydrabio": {"name": "Hydrabio Hyalu+Serum 30 ml", "brand": "BIODERMA", "rating": 4.0, "reviews": 0, "price": 22.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F131518-1_s.webp&feedId=97867&k=2e111160ff59aaeb6cd91b9b08923291062f0aee", "affiliate_url": "https://www.awin1.com/pclick.php?p=39179013959&a=2923665&m=105475"},
    "garancia_eclair": {"name": "Éclair de Lune La Froudoyante Crème Antimanchas 30 ml", "brand": "GARANCIA", "rating": 4.0, "reviews": 0, "price": 29.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F135223-1_s.webp&feedId=97867&k=4ea913450edeff8822d12f741c4f687cd6b9ab2f", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813652208&a=2923665&m=105475"},
    "uriage_bariesun": {"name": "Bariésun Fluide Ultraléger SPF50+ 30 ml", "brand": "URIAGE", "rating": 4.0, "reviews": 0, "price": 9.4, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F144877-1_s.webp&feedId=97867&k=badee23af503ed066ebf945bb7efe60203668a03", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813653263&a=2923665&m=105475"},
    "cerave_nettoyeur": {"name": "Nettoyeur mousseux", "brand": "CeraVe", "rating": 4.0, "reviews": 0, "price": 10.4, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F93563-1_s.webp&feedId=97867&k=96f962f4fd7a1567b77db3271428699eba10e03f", "affiliate_url": "https://www.awin1.com/pclick.php?p=43398278955&a=2923665&m=105475"},
    "caudalie_vinhydra": {"name": "Vinhydra Gel Nettoyant Hydratant 150 ml", "brand": "Caudalie", "rating": 4.0, "reviews": 0, "price": 16.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F145460-1_s.webp&feedId=97867&k=2ed5732abc3f90148d717133bbe2be2ef37d0f77", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813652140&a=2923665&m=105475"},
}


def pblock(*keys):
    return {"type": "products", "items": [P[k] for k in keys]}


ARTICLES = [

# ---------------------------------------------------------------------- #1
{
    "id": "barriere-cutanee-abimee",
    "slug": "barriere-cutanee-abimee-signes-comment-reparer",
    "category": "skincare",
    "title": "Barrière cutanée abîmée :\nles {{signes}} et comment la réparer",
    "excerpt": "Tiraillements, rougeurs, picotements au moindre produit : voici comment reconnaître une barrière cutanée abîmée et la routine simple pour la reconstruire.",
    "chapo": "Une peau qui réagit soudain à tout, qui tire ou qui brille par endroits sans raison apparente : c'est souvent le signe d'une barrière cutanée fragilisée. Bonne nouvelle, elle se répare, à condition de revenir à l'essentiel.",
    "meta_title": "Barrière cutanée abîmée : signes et routine pour la réparer",
    "meta_description": "Rougeurs, tiraillements, sensibilité soudaine : découvrez les signes d'une barrière cutanée abîmée et la routine skinimaliste pour la réparer durablement.",
    "image": "/image/hero-barriere-cutanee.png",
    "hero_image": "/image/hero-barriere-cutanee.png",
    "read_minutes": 7,
    "published_at": "2026-10-01T09:00:00Z",
    "blocks": [
        {"type": "heading2", "text": "Qu'est-ce que la barrière cutanée exactement ?"},
        {"type": "paragraph", "text": "La barrière cutanée, c'est la couche la plus superficielle de l'épiderme : un assemblage de cellules (les cornéocytes) maintenues entre elles par un \"ciment\" lipidique fait de {{céramides}}, d'acides gras et de cholestérol. Son rôle est simple mais essentiel : garder l'eau à l'intérieur de la peau et empêcher les irritants, polluants et bactéries d'entrer. Quand ce ciment s'appauvrit, la barrière devient poreuse dans les deux sens : l'eau s'évapore plus vite (peau déshydratée) et les agressions extérieures pénètrent plus facilement (peau réactive)."},
        {"type": "image", "src": "/image/inline-barriere-cutanee-routine.png", "caption": "Une routine simplifiée, centrée sur la réparation, suffit à restaurer le confort cutané."},
        {"type": "heading2", "text": "Les signes qui doivent alerter"},
        {"type": "paragraph", "text": "Une barrière abîmée se reconnaît à plusieurs signaux, souvent combinés : des tiraillements qui persistent même après l'application d'une crème, des rougeurs diffuses, des zones rugueuses ou qui pèlent, une sensation de picotement ou de brûlure avec des produits auparavant bien tolérés, et parfois un aspect paradoxalement brillant par endroits (la peau sur-produit du sébum pour compenser la perte en eau). Si votre crème habituelle se met soudain à piquer, c'est rarement le produit qui a changé : c'est votre barrière."},
        {"type": "heading2", "text": "Les causes les plus fréquentes"},
        {"type": "steps", "items": [
            "La sur-exfoliation : trop d'acides (AHA, BHA) ou de rétinoïdes, trop souvent, sans laisser le temps à la peau de se renouveler.",
            "Un nettoyage trop agressif : eau très chaude, nettoyants moussants qui décapent le film hydrolipidique.",
            "Le froid et le chauffage : l'air sec de l'hiver accélère la perte en eau transépidermique.",
            "Le stress et le manque de sommeil, qui ralentissent le renouvellement cellulaire.",
            "L'accumulation de plusieurs actifs puissants en même temps (vitamine C forte + rétinol + acides, par exemple).",
        ]},
        {"type": "heading2", "text": "La routine pour réparer sa barrière"},
        {"type": "paragraph", "text": "La règle d'or : on simplifie. Pendant 2 à 6 semaines, on met en pause les actifs exfoliants et les rétinoïdes, et on revient à une routine courte centrée sur la réparation. Un nettoyant sans savon, à l'eau tiède, suffit matin et soir. Sur peau encore humide, on applique un soin réparateur riche en céramides et en panthénol comme le " + "" },
        {"type": "paragraph", "text": "[[Baume ultra réparateur Cicaplast Baume B5+ SPF50|https://www.awin1.com/pclick.php?p=39179013815&a=2923665&m=105475]] de La Roche-Posay, qui protège aussi du soleil pendant la phase de réparation, ou la [[Crème ultra-réparatrice Cicabio|https://www.awin1.com/pclick.php?p=39179014300&a=2923665&m=105475]] de Bioderma. Pour les zones très sensibilisées (ailes du nez, coins de bouche), le [[Cicalfate+ SPF50+|https://www.awin1.com/pclick.php?p=39179013990&a=2923665&m=105475]] d'Avène apaise et protège en même temps."},
        {"type": "tips", "items": [
            "Pas plus de 3-4 produits dans la routine pendant la phase de réparation.",
            "On réintroduit les actifs un par un, une à deux semaines d'écart, jamais tous en même temps.",
            "Le SPF n'est pas négociable : une barrière abîmée est plus sensible aux UV.",
        ]},
        {"type": "heading2", "text": "Combien de temps pour retrouver une peau apaisée ?"},
        {"type": "paragraph", "text": "Pour une barrière légèrement fragilisée, comptez 2 à 4 semaines de routine simplifiée pour retrouver un confort normal. Si les signes sont plus marqués (eczéma réactivé, rougeurs persistantes), il faut parfois 6 à 8 semaines, et un avis dermatologique est recommandé si rien ne s'améliore. Côté accessoires, une taie d'oreiller en satin et un humidificateur dans la chambre limitent les frottements et la déshydratation nocturne, deux petits réglages qui accélèrent la récupération."},
    ],
},

# ---------------------------------------------------------------------- #2
{
    "id": "pores-dilates-ce-qui-marche",
    "slug": "pores-dilates-ce-qui-marche-vraiment",
    "category": "skincare",
    "title": "Pores dilatés :\nce qui {{marche vraiment}}",
    "excerpt": "Niacinamide, acide salicylique, rétinoïdes... on fait le tri entre ce qui affine réellement l'apparence des pores et ce qui ne sert à rien.",
    "chapo": "Les pores ne se ferment pas comme un robinet, mais leur apparence peut vraiment s'améliorer. Voici ce que montrent les études et l'expérience, sans les promesses marketing.",
    "meta_title": "Pores dilatés : les solutions qui fonctionnent vraiment",
    "meta_description": "Niacinamide, BHA, rétinoïdes, argile : découvrez ce qui affine réellement l'apparence des pores dilatés, et les mythes à laisser de côté.",
    "image": "/image/hero-pores-dilates.png",
    "hero_image": "/image/hero-pores-dilates.png",
    "read_minutes": 6,
    "published_at": "2026-10-02T09:00:00Z",
    "blocks": [
        {"type": "heading2", "text": "Pourquoi certains pores sont plus visibles"},
        {"type": "paragraph", "text": "La taille d'un pore est en grande partie génétique, mais son apparence dépend de facteurs qu'on peut influencer : une production de sébum importante qui l'étire de l'intérieur, une perte d'élasticité cutanée avec l'âge qui l'empêche de se \"refermer\" visuellement, des comédons qui le dilatent encore plus, ou encore une déshydratation qui pousse la peau à sur-produire du sébum en compensation. Comprendre la cause aide à choisir la bonne stratégie plutôt que d'empiler les produits."},
        {"type": "heading2", "text": "Ce qui marche vraiment"},
        {"type": "steps", "items": [
            "La niacinamide : elle régule la production de sébum et renforce la barrière cutanée, avec des études solides à 2-5% de concentration.",
            "L'acide salicylique (BHA) : liposoluble, il nettoie l'intérieur du pore en profondeur, là où les nettoyants classiques n'accèdent pas.",
            "Les rétinoïdes : en stimulant le renouvellement cellulaire, ils améliorent la texture et l'élasticité autour du pore sur le moyen terme.",
            "Le SPF au quotidien : le photo-vieillissement est l'une des premières causes de perte d'élasticité qui dilate les pores avec le temps.",
            "Une hydratation adaptée (non comédogène) : contre-intuitif, mais une peau bien hydratée produit moins de sébum compensatoire.",
        ]},
        {"type": "paragraph", "text": "Côté routine, le [[Sebium Pore Refiner|https://www.awin1.com/pclick.php?p=39179009654&a=2923665&m=105475]] de Bioderma est justement formulé pour cibles les pores et le brillant du T-zone, à associer à un nettoyant doux comme le [[Sensibio DS+ Gel Nettoyant|https://www.awin1.com/pclick.php?p=44079959266&a=2923665&m=105475]]. Sur peau mixte à tendance imperfections, le [[Sérum Anti-imperfections|https://www.awin1.com/pclick.php?p=42813652168&a=2923665&m=105475]] d'Embryolisse complète bien la routine en soirée."},
        {"type": "heading2", "text": "Ce qui ne sert (presque) à rien"},
        {"type": "paragraph", "text": "Les patchs nasaux très agressifs donnent une satisfaction immédiate mais peuvent irriter et, à force, dilater davantage le pore qu'ils prétendent resserrer. Les masques à l'argile absorbent temporairement l'excès de sébum et resserrent l'aspect visuel pendant quelques heures, mais l'effet n'est pas durable : c'est un geste ponctuel avant un événement, pas une solution de fond. Enfin, aucun pore ne se \"referme\" définitivement : on parle toujours d'amélioration de l'apparence, jamais de fermeture physique."},
        {"type": "tips", "items": [
            "Une routine régulière sur 8 à 12 semaines est nécessaire avant de juger un résultat.",
            "On introduit niacinamide et BHA progressivement pour éviter l'irritation qui, elle, dilate vraiment les pores.",
        ]},
    ],
},

# ---------------------------------------------------------------------- #3
{
    "id": "cheveux-pousser-plus-vite",
    "slug": "comment-faire-pousser-ses-cheveux-plus-vite",
    "category": "cheveux",
    "title": "Comment faire pousser\nses cheveux {{plus vite}}",
    "excerpt": "La pousse est surtout génétique, mais un cuir chevelu sain et moins de casse font une vraie différence visible. Voici la méthode réaliste.",
    "chapo": "Personne ne peut doubler la vitesse de pousse des cheveux, mais presque tout le monde peut réduire la casse qui donne l'impression que les cheveux ne poussent pas. Voici ce qui compte vraiment.",
    "meta_title": "Comment faire pousser ses cheveux plus vite : la méthode réaliste",
    "meta_description": "Cuir chevelu, alimentation, casse aux pointes : découvrez ce qui influence réellement la pousse des cheveux et la routine à adopter.",
    "image": "/image/hero-pousse-cheveux.png",
    "hero_image": "/image/hero-pousse-cheveux.png",
    "read_minutes": 6,
    "published_at": "2026-10-05T09:00:00Z",
    "blocks": [
        {"type": "heading2", "text": "La vérité sur la vitesse de pousse"},
        {"type": "paragraph", "text": "En moyenne, un cheveu pousse d'environ 1 à 1,5 cm par mois, et cette vitesse est déterminée par le follicule pileux : elle est en grande partie génétique et ne peut pas être \"accélérée\" au sens strict. Ce qui change réellement la perception, c'est la casse : des cheveux qui cassent aux pointes au même rythme qu'ils poussent à la racine donnent l'illusion de ne jamais gagner en longueur. La vraie stratégie, c'est donc de maximiser la pousse à la racine ET de minimiser la casse."},
        {"type": "heading2", "text": "Un cuir chevelu sain, la base de tout"},
        {"type": "paragraph", "text": "Le follicule a besoin d'une bonne irrigation sanguine pour fonctionner à son rythme optimal. Un massage du cuir chevelu de quelques minutes, à sec ou avec une huile, stimule cette microcirculation. En cas de chute visible, un shampooing ciblé comme l'[[Anaphase Shampooing Antichute|https://www.awin1.com/pclick.php?p=44079959258&a=2923665&m=105475]] de Ducray aide à limiter la perte avant même de parler de pousse. Les compléments alimentaires comme [[Anacaps Reactiv|https://www.awin1.com/pclick.php?p=42813651949&a=2923665&m=105475]] apportent les nutriments (biotine, zinc, acides aminés) qui soutiennent le cycle capillaire de l'intérieur."},
        {"type": "heading2", "text": "Limiter la casse : le vrai levier"},
        {"type": "steps", "items": [
            "Réduire la chaleur (lisseur, sèche-cheveux) ou toujours utiliser un protecteur thermique.",
            "Démêler des pointes vers la racine, jamais l'inverse, avec un peigne à dents larges.",
            "Éviter les élastiques trop serrés et les coiffures tirantes au quotidien.",
            "Couper régulièrement les pointes fourchues avant qu'elles ne remontent la fibre.",
            "Nourrir la fibre avec une huile capillaire riche en acides gras, traditionnellement utilisée pour renforcer la fibre et limiter la casse.",
        ]},
        {"type": "paragraph", "text": "Côté soin, la [[Lotion capillaire à l'huile de ricin|https://www.awin1.com/pclick.php?p=42813652068&a=2923665&m=105475]] d'Evoluderm est une option simple et économique à appliquer en massage avant le shampooing."},
        {"type": "heading2", "text": "Et l'alimentation ?"},
        {"type": "paragraph", "text": "Le cheveu est fait principalement de kératine, une protéine : une alimentation pauvre en protéines, en fer ou en zinc peut ralentir le cycle de pousse ou fragiliser la fibre. Ce n'est pas une solution miracle, mais une carence corrigée peut redonner au cheveu les conditions pour pousser à son rythme normal, sans l'entraver."},
        {"type": "tips", "items": [
            "Patience : un résultat visible sur la longueur prend au minimum 3 à 6 mois.",
            "La régularité du massage et des soins compte plus que l'intensité d'une seule séance.",
        ]},
    ],
},

# ---------------------------------------------------------------------- #4
{
    "id": "cheveux-crepus-porosite",
    "slug": "cheveux-crepus-porosite-routine",
    "category": "cheveux",
    "title": "Comment prendre soin de ses cheveux crépus\nen fonction de sa {{porosité}} ?",
    "excerpt": "Faible, moyenne ou haute porosité : la cuticule du cheveu détermine quelle routine d'hydratation fonctionne vraiment pour vos boucles.",
    "chapo": "Deux cheveux crépus peuvent réagir très différemment aux mêmes produits. La clé, c'est la porosité : à quel point la cuticule laisse entrer et sortir l'humidité.",
    "meta_title": "Cheveux crépus et porosité : quelle routine adopter",
    "meta_description": "Test de porosité, méthode LOC/LCO, produits adaptés : la routine d'hydratation à adopter selon la porosité de vos cheveux crépus.",
    "image": "/image/hero-cheveux-crepus-porosite.png",
    "hero_image": "/image/hero-cheveux-crepus-porosite.png",
    "read_minutes": 7,
    "published_at": "2026-10-06T09:00:00Z",
    "blocks": [
        {"type": "heading2", "text": "Qu'est-ce que la porosité capillaire ?"},
        {"type": "paragraph", "text": "La porosité décrit à quel point la cuticule (la couche externe du cheveu, faite d'écailles) est ouverte ou fermée. Un cheveu à forte porosité a des écailles très ouvertes : il absorbe vite l'eau et les soins, mais les perd tout aussi vite. Un cheveu à faible porosité a des écailles serrées : il résiste à l'hydratation, mais la retient longtemps une fois qu'elle est entrée. Les cheveux crépus sont souvent à forte porosité du fait des manipulations et de la chaleur répétées, mais pas toujours : un test simple à la maison permet de vérifier (un cheveu propre déposé dans un verre d'eau flotte en surface s'il est à faible porosité, et descend rapidement s'il est à forte porosité)."},
        {"type": "heading2", "text": "Routine pour une forte porosité"},
        {"type": "paragraph", "text": "L'objectif est de combler les écailles ouvertes et de sceller l'hydratation le plus vite possible. La méthode LOC (Liquid, Oil, Cream) fonctionne bien : eau ou lait hydratant, puis huile pour sceller, puis crème pour la définition. Les protéines (en masque une fois par mois environ) aident à combler temporairement la cuticule. Le [[Shampooing Curl Expression|https://www.awin1.com/pclick.php?p=42813651931&a=2923665&m=105475]] de L'Oréal Expert, formulé pour les boucles et frisures, et la [[Crème Boucles|https://www.awin1.com/pclick.php?p=42813652055&a=2923665&m=105475]] de Byphasse sont de bonnes bases pour sceller l'hydratation sans alourdir."},
        {"type": "heading2", "text": "Routine pour une faible porosité"},
        {"type": "paragraph", "text": "Ici, le problème inverse : les produits riches restent en surface et peuvent créer un effet de dépôt (\"build-up\"). On privilégie des textures légères, on applique la chaleur douce (serviette tiède, bonnet chauffant) pour ouvrir temporairement la cuticule avant l'application d'un soin, et on limite les protéines qui, en excès, rendent le cheveu rigide. Une huile légère comme l'[[Huile Précieuse|https://www.awin1.com/pclick.php?p=42813652065&a=2923665&m=105475]] d'Evoluderm s'applique en petite quantité sur cheveux humides plutôt qu'en couche épaisse."},
        {"type": "steps", "items": [
            "Test de porosité au verre d'eau : flotte = faible porosité, descend vite = forte porosité.",
            "Forte porosité : méthode LOC, protéines régulières, huiles et beurres pour sceller.",
            "Faible porosité : textures légères, chaleur douce pour ouvrir la cuticule, protéines avec modération.",
        ]},
        {"type": "tips", "items": [
            "La porosité peut changer avec le temps (coloration, chaleur, saison) : on refait le test régulièrement.",
            "Un cheveu qui reste frisé/sec malgré beaucoup de soins signale souvent un excès de protéines, pas un manque d'hydratation.",
        ]},
    ],
},

# ---------------------------------------------------------------------- #5
{
    "id": "peau-seche-corps-hiver",
    "slug": "peau-tres-seche-du-corps-en-hiver-la-routine",
    "category": "corps",
    "title": "Peau très sèche du corps en hiver :\nla {{routine}}",
    "excerpt": "Air sec, chauffage, douches chaudes : l'hiver met la peau du corps à rude épreuve. Voici la routine pour retrouver du confort.",
    "chapo": "Tiraillements, plaques rugueuses, démangeaisons : la peau du corps souffre particulièrement en hiver. Quelques ajustements simples suffisent à restaurer le confort cutané.",
    "meta_title": "Peau très sèche du corps en hiver : la routine qui marche",
    "meta_description": "Douche, nettoyant, application de crème : découvrez la routine complète pour apaiser une peau du corps très sèche pendant l'hiver.",
    "image": "/image/hero-peau-seche-hiver.png",
    "hero_image": "/image/hero-peau-seche-hiver.png",
    "read_minutes": 6,
    "published_at": "2026-10-08T09:00:00Z",
    "blocks": [
        {"type": "heading2", "text": "Pourquoi la peau du corps se dessèche autant en hiver"},
        {"type": "paragraph", "text": "Le froid extérieur et le chauffage intérieur assèchent l'air ambiant, ce qui accélère l'évaporation de l'eau contenue dans la peau. Les douches chaudes, plus tentantes par temps froid, dissolvent le film hydrolipidique protecteur. Résultat : une peau qui tire, parfois des plaques rugueuses sur les jambes, les bras ou les coudes, et dans les cas marqués des démangeaisons. Ce phénomène touche tout le monde à des degrés différents, mais s'aggrave avec l'âge, la génétique et certaines conditions comme la xérose."},
        {"type": "heading2", "text": "La routine étape par étape"},
        {"type": "steps", "items": [
            "Douche tiède (pas chaude) et courte, 5 à 10 minutes maximum.",
            "Nettoyant surgras ou sans savon plutôt qu'un gel douche moussant classique.",
            "Application de la crème dans les 3 minutes après la douche, sur peau encore légèrement humide, pour emprisonner l'eau.",
            "Une à deux fois par semaine maximum, exfoliation douce pour éliminer les cellules mortes sans irriter.",
            "Un humidificateur dans les pièces chauffées pour limiter l'assèchement de l'air ambiant.",
        ]},
        {"type": "paragraph", "text": "Pour le corps, on choisit des textures riches en céramides et en urée comme la [[Crème Hydratante|https://www.awin1.com/pclick.php?p=43398278958&a=2923665&m=105475]] de CeraVe, ou en format grand volume la [[Lotion d'hydratation intense|https://www.awin1.com/pclick.php?p=42813653015&a=2923665&m=105475]], toujours de CeraVe, pratique pour une application quotidienne sur tout le corps. Sur les zones les plus sensibles (mains, visage exposé au froid), le [[Cold Cream|https://www.awin1.com/pclick.php?p=39179008521&a=2923665&m=105475]] d'Avène offre une protection renforcée contre le froid vif."},
        {"type": "tips", "items": [
            "Une sortie dans le froid juste après la douche favorise les gerçures : on laisse la peau se réchauffer avant de sortir.",
            "Les textiles synthétiques frottent et irritent une peau déjà sensibilisée : on privilégie coton et matières douces.",
        ]},
    ],
},

# ---------------------------------------------------------------------- #6
{
    "id": "vergetures-prevenir-attenuer",
    "slug": "vergetures-prevenir-et-attenuer",
    "category": "corps",
    "title": "Vergetures :\nprévenir et {{atténuer}}",
    "excerpt": "Grossesse, croissance, musculation : les vergetures apparaissent quand la peau s'étire vite. Voici ce qui aide réellement à les prévenir et à les atténuer.",
    "chapo": "Les vergetures ne s'effacent jamais complètement, mais leur apparition peut être limitée et leur aspect nettement amélioré avec les bons gestes, au bon moment.",
    "meta_title": "Vergetures : comment les prévenir et les atténuer",
    "meta_description": "Hydratation, massage, moment d'intervention : découvrez ce qui aide vraiment à prévenir l'apparition des vergetures et à atténuer leur aspect.",
    "image": "/image/hero-vergetures.png",
    "hero_image": "/image/hero-vergetures.png",
    "read_minutes": 6,
    "published_at": "2026-10-09T09:00:00Z",
    "blocks": [
        {"type": "heading2", "text": "Pourquoi les vergetures apparaissent"},
        {"type": "paragraph", "text": "Une vergeture se forme quand la peau s'étire plus vite que sa capacité naturelle à s'adapter : le derme se rompt par endroits, laissant des marques linéaires. Les situations les plus fréquentes sont la grossesse, les poussées de croissance à l'adolescence, une prise ou perte de poids rapide, et la musculation intensive. La génétique joue un rôle important dans la prédisposition : certaines peaux, plus élastiques, en développent très peu malgré un étirement important."},
        {"type": "heading2", "text": "Prévenir : le bon réflexe avant l'étirement"},
        {"type": "paragraph", "text": "Quand un étirement rapide est prévisible (grossesse, programme de prise de masse), hydrater quotidiennement en amont améliore la souplesse cutanée et réduit le risque. Le massage, au-delà de l'hydratation elle-même, stimule la micro-circulation et aide la peau à mieux absorber les actifs. L'[[huile Anti-Estrias|https://www.awin1.com/pclick.php?p=39179010317&a=2923665&m=105475]] d'Alqvimia, pensée spécifiquement pour cet usage, s'applique en massage circulaire sur ventre, hanches et poitrine dès les premiers mois de grossesse."},
        {"type": "heading2", "text": "Atténuer : agir selon l'âge de la vergeture"},
        {"type": "paragraph", "text": "Une vergeture récente, encore rouge ou violacée, répond beaucoup mieux aux soins qu'une vergeture ancienne devenue blanche et nacrée : c'est le moment d'agir le plus efficacement. Le [[Gel pour peau sèche|https://www.awin1.com/pclick.php?p=43407453296&a=2923665&m=105475]] de Bio-Oil, utilisé en massage quotidien, améliore la texture et l'élasticité de la zone. Pour une action plus globale sur la fermeté de la peau, la [[Crème Raffermissante Corps|https://www.awin1.com/pclick.php?p=42813647036&a=2923665&m=105475]] de Clarins complète bien une routine anti-vergetures sur le long terme."},
        {"type": "tips", "items": [
            "Les vergetures matures (blanches) ne disparaissent jamais totalement avec des soins topiques seuls : le laser en cabinet reste la seule option pour un effacement marqué.",
            "La régularité du massage quotidien compte davantage que le prix du produit utilisé.",
        ]},
    ],
},

# ---------------------------------------------------------------------- #7
{
    "id": "pdrn-nouvel-actif",
    "slug": "pdrn-nouvel-actif-dont-tout-le-monde-parle",
    "category": "ingredients",
    "title": "PDRN :\nc'est quoi ce nouvel {{actif}} dont tout le monde parle ?",
    "excerpt": "Venu de la médecine régénérative coréenne, le PDRN s'est imposé dans les sérums et ampoules. Explications sur un actif encore jeune en cosmétique.",
    "chapo": "Le PDRN a d'abord fait ses preuves en esthétique injectable avant d'arriver dans les sérums grand public. Que peut-on vraiment en attendre en version topique ?",
    "meta_title": "PDRN en cosmétique : qu'est-ce que c'est et à quoi ça sert",
    "meta_description": "PDRN, extrait d'ADN de saumon : origine, bénéfices revendiqués et limites de cet actif régénérant devenu tendance dans la skincare coréenne.",
    "image": "/image/hero-pdrn.png",
    "hero_image": "/image/hero-pdrn.png",
    "read_minutes": 6,
    "published_at": "2026-10-12T09:00:00Z",
    "blocks": [
        {"type": "heading2", "text": "D'où vient le PDRN"},
        {"type": "paragraph", "text": "Le PDRN (polydéoxyribonucléotide) est un fragment d'ADN, généralement extrait de laitance de saumon, utilisé depuis plusieurs années en Corée du Sud dans des protocoles esthétiques injectables (le fameux \"salmon DNA skin booster\") pour ses propriétés régénérantes et anti-inflammatoires. Devant son succès, l'industrie cosmétique en a décliné des versions topiques : sérums, ampoules et patchs, pensés pour un usage quotidien à la maison, sans aiguille."},
        {"type": "heading2", "text": "Ce que l'actif est censé apporter"},
        {"type": "steps", "items": [
            "Stimulation de la régénération cellulaire et de la production de collagène.",
            "Propriétés anti-inflammatoires qui apaisent les rougeurs et les peaux sensibilisées.",
            "Amélioration de l'éclat et de la fermeté perçue de la peau.",
            "Un effet \"réparateur\" après une agression (soleil, exfoliation, procédure esthétique).",
        ]},
        {"type": "image", "src": "/image/inline-pdrn-application.png", "caption": "En version topique, le PDRN est proposé en sérums et ampoules à appliquer au quotidien."},
        {"type": "heading2", "text": "Ce qu'il faut garder en tête"},
        {"type": "paragraph", "text": "Les données les plus solides sur le PDRN concernent sa forme injectable, en contexte médical encadré : c'est là que les études cliniques sont les plus nombreuses. La version cosmétique topique, elle, est plus récente et dispose de preuves plus limitées, la molécule ayant plus de mal à pénétrer la peau sous cette forme. Cela ne veut pas dire qu'elle est inutile, mais qu'il faut la considérer comme un actif prometteur plutôt que comme un remplaçant direct de la version injectable."},
        {"type": "paragraph", "text": "Dans notre catalogue, on ne trouve pas encore de sérum purement PDRN, mais plusieurs références jouent sur la même promesse de régénération active : les [[Ampoules Proteos Hydra Plus|https://www.awin1.com/pclick.php?p=39179012768&a=2923665&m=105475]] et les [[Ampoules Proteus Liposome|https://www.awin1.com/pclick.php?p=39179012773&a=2923665&m=105475]] de Martiderm, conçues pour la réparation et l'hydratation intense, ou le [[Advanced Snail 96 Fluide|https://www.awin1.com/pclick.php?p=41795689784&a=2923665&m=105475]] de COSRX, dont la mucine d'escargot est un autre actif réparateur coréen, lui largement documenté."},
        {"type": "tips", "items": [
            "Un actif \"tendance\" n'est pas automatiquement un actif inefficace : donnez-lui le temps d'être mieux étudié en version topique avant de juger.",
            "En cas de doute sur une procédure injectable, l'avis d'un professionnel de santé reste indispensable.",
        ]},
    ],
},

# ---------------------------------------------------------------------- #8
{
    "id": "niacinamide-bienfaits-melange",
    "slug": "niacinamide-bienfaits-avec-quoi-ne-pas-melanger",
    "category": "ingredients",
    "title": "Niacinamide :\nles bienfaits et avec quoi {{ne pas la mélanger}}",
    "excerpt": "Sébum, pores, taches, barrière cutanée : la niacinamide fait presque tout. Mais certaines associations méritent d'être évitées ou espacées.",
    "chapo": "Devenue un incontournable des routines skincare, la niacinamide (vitamine B3) a des bénéfices bien documentés. Voici comment en profiter sans les erreurs d'association les plus courantes.",
    "meta_title": "Niacinamide : bienfaits et associations à éviter",
    "meta_description": "Régulation du sébum, pores, taches : les bienfaits de la niacinamide, la concentration idéale, et les actifs avec lesquels l'espacer plutôt que la mélanger.",
    "image": "/image/hero-niacinamide.png",
    "hero_image": "/image/hero-niacinamide.png",
    "read_minutes": 6,
    "published_at": "2026-10-13T09:00:00Z",
    "blocks": [
        {"type": "heading2", "text": "Les bienfaits documentés de la niacinamide"},
        {"type": "paragraph", "text": "La niacinamide, aussi appelée vitamine B3, agit sur plusieurs fronts à la fois : elle régule la production de sébum, atténue l'apparence des pores dilatés, unifie le teint en limitant la formation de taches, apaise les rougeurs grâce à son effet anti-inflammatoire, et renforce la barrière cutanée en stimulant la synthèse de céramides. C'est l'un des rares actifs à convenir à presque tous les types de peau, y compris les peaux sensibles, à condition de bien choisir sa concentration."},
        {"type": "heading2", "text": "Quelle concentration choisir"},
        {"type": "paragraph", "text": "La plupart des études montrent une efficacité optimale entre 2% et 5% de concentration. Au-delà de 10%, le risque d'irritation ou de rougeurs transitoires augmente sans bénéfice supplémentaire prouvé pour la majorité des peaux. Mieux vaut une concentration modérée utilisée régulièrement qu'une forte concentration abandonnée après une mauvaise réaction."},
        {"type": "heading2", "text": "Avec quoi éviter de la mélanger"},
        {"type": "steps", "items": [
            "La vitamine C pure (acide ascorbique) à pH bas : en théorie, elle peut réagir avec la niacinamide et réduire l'efficacité des deux. Les formules modernes stabilisées limitent ce risque, mais par précaution on les espace (vitamine C le matin, niacinamide le soir).",
            "Les AHA/BHA à pH très acide : appliqués en même temp, ils peuvent diminuer l'efficacité de la niacinamide. On les alterne plutôt matin/soir ou jour/nuit.",
            "Le zinc en très forte dose sous forme pure : rarement un souci en cosmétique classique, mais à surveiller dans les compléments alimentaires combinés.",
        ]},
        {"type": "paragraph", "text": "Pour l'intégrer sans prise de tête, le [[Hydrabio Hyalu+ Sérum|https://www.awin1.com/pclick.php?p=39179013959&a=2923665&m=105475]] de Bioderma associe niacinamide et acide hyaluronique dans une formule déjà équilibrée. Sur peau à tendance imperfections, le [[Sérum Anti-imperfections|https://www.awin1.com/pclick.php?p=42813652168&a=2923665&m=105475]] d'Embryolisse est une bonne option, et pour cibler les taches pigmentaires, [[Éclair de Lune|https://www.awin1.com/pclick.php?p=42813652208&a=2923665&m=105475]] de Garancia complète la routine du soir."},
        {"type": "tips", "items": [
            "En cas de doute sur une association d'actifs, la règle simple est : on espace matin/soir plutôt que d'annuler un produit.",
            "Les premiers résultats visibles sur les pores et le grain de peau apparaissent généralement après 4 à 8 semaines d'usage régulier.",
        ]},
    ],
},

# ---------------------------------------------------------------------- #9
{
    "id": "maquillage-halloween-facile",
    "slug": "maquillage-halloween-facile-idees-a-faire-soi-meme",
    "category": "maquillage",
    "title": "Maquillage Halloween facile :\nidées à faire {{soi-même}}",
    "excerpt": "Pas besoin d'un kit de maquillage SFX pour un look Halloween réussi. Trois idées simples à réaliser avec des produits que vous avez probablement déjà.",
    "chapo": "Chat noir glamour, vampire chic ou poupée de porcelaine : voici trois maquillages Halloween accessibles, pensés pour être réalisés en moins de 30 minutes.",
    "meta_title": "Maquillage Halloween facile : 3 idées à faire soi-même",
    "meta_description": "Chat noir, vampire chic, poupée cassée : découvrez 3 idées de maquillage Halloween faciles à réaliser soi-même, étape par étape, avec les bons produits.",
    "image": "/image/hero-maquillage-halloween.png",
    "hero_image": "/image/hero-maquillage-halloween.png",
    "read_minutes": 6,
    "published_at": "2026-10-15T09:00:00Z",
    "blocks": [
        {"type": "heading2", "text": "La base commune à tous les looks"},
        {"type": "paragraph", "text": "Avant de penser au thème, on prépare une base propre : un teint unifié, pas forcément couvrant, et un {{eyeliner précis}} qui servira de fil conducteur pour la plupart des motifs graphiques (moustaches de chat, toiles d'araignée, fissures de porcelaine). Le [[Correct & Conceal|https://www.awin1.com/pclick.php?p=42813652961&a=2923665&m=105475]] d'Essence camoufle les imperfections sans alourdir, et le [[Light Reflecting Foundation|https://www.awin1.com/pclick.php?p=43334110981&a=2923665&m=105475]] de NARS apporte un fini lumineux qui flatte tous les thèmes, du plus doux au plus sombre."},
        {"type": "heading2", "text": "Idée 1 : le chat noir glamour"},
        {"type": "steps", "items": [
            "Un eyeliner ailé plus marqué que d'habitude, précis sur les traits fins.",
            "Quelques moustaches fines dessinées au crayon noir depuis le coin de la bouche.",
            "Un nez rose/noir stylisé avec un peu de blush et de liner.",
            "Une bouche nude ou légèrement rosée pour ne pas surcharger le regard.",
        ]},
        {"type": "paragraph", "text": "Pour un trait net sur ce genre de motif graphique, le [[3-Dot Liner|https://www.awin1.com/pclick.php?p=39179009602&a=2923665&m=105475]] de Clarins est particulièrement précis."},
        {"type": "heading2", "text": "Idée 2 : le vampire chic"},
        {"type": "paragraph", "text": "Un teint pâle et lumineux (on évite le bronzer), un regard légèrement fumé en gris ou prune, et une bouche forte en [[L'Absolu Rouge Drama Matte|https://www.awin1.com/pclick.php?p=46127731511&a=2923665&m=105475]] de Lancôme, qu'on peut légèrement estomper au centre pour un effet \"mordu\". Quelques touches de liner rouge très fin aux commissures des lèvres accentuent l'effet sans tomber dans l'excès."},
        {"type": "heading2", "text": "Idée 3 : la poupée de porcelaine cassée"},
        {"type": "paragraph", "text": "Un teint très pâle et mat, des joues rondes et roses façon poupée, de grands cils, et des \"fissures\" fines dessinées au [[Crayon Eyeliner Waterproof|https://www.awin1.com/pclick.php?p=41366819415&a=2923665&m=105475]] de Clarins sur une joue ou le front, avec un soupçon de rouge aux intersections pour un effet cassé crédible. La bouche reste rosée et discrète, type [[Lipstick|https://www.awin1.com/pclick.php?p=39179012307&a=2923665&m=105475]] de NARS dans un ton nude-rosé."},
        {"type": "tips", "items": [
            "On teste toujours un motif graphique sur le dos de la main avant de se lancer sur le visage.",
            "Un démaquillant à l'huile retire bien plus facilement liner et faux motifs en fin de soirée.",
            "On évite les paillettes libres trop près de l'œil sans protection, pour le confort en fin de soirée.",
        ]},
    ],
},

# ---------------------------------------------------------------------- #10
{
    "id": "trouver-sous-ton-peau",
    "slug": "comment-trouver-son-sous-ton-de-peau",
    "category": "maquillage",
    "title": "Comment trouver son sous-ton de peau\n(chaud, froid, {{neutre}})",
    "excerpt": "Un fond de teint qui tire sur l'orange ou qui \"fait masque\" ? Le problème vient souvent du sous-ton, pas de la teinte elle-même.",
    "chapo": "Le sous-ton est la nuance sous-jacente de la peau, invisible à l'œil nu mais déterminante pour choisir un fond de teint qui se fond vraiment. Voici comment l'identifier en quelques minutes.",
    "meta_title": "Comment trouver son sous-ton de peau : chaud, froid ou neutre",
    "meta_description": "Test des veines, des bijoux, du papier blanc : découvrez comment identifier votre sous-ton de peau pour choisir enfin le bon fond de teint.",
    "image": "/image/hero-sous-ton-peau.png",
    "hero_image": "/image/hero-sous-ton-peau.png",
    "read_minutes": 6,
    "published_at": "2026-10-16T09:00:00Z",
    "blocks": [
        {"type": "heading2", "text": "Sous-ton et teint : deux choses différentes"},
        {"type": "paragraph", "text": "Le teint, c'est la couleur visible de la peau, qui varie avec le soleil ou les saisons. Le {{sous-ton}}, lui, est la nuance sous-jacente, stable toute l'année : chaud (reflets jaunes, dorés, pêche), froid (reflets roses, bleutés, rouges) ou neutre (un mélange équilibré des deux). C'est lui qui détermine si un fond de teint se fond parfaitement ou laisse un effet masque orangé ou grisâtre."},
        {"type": "heading2", "text": "Trois tests simples à faire chez soi"},
        {"type": "steps", "items": [
            "Le test des veines au poignet, à la lumière du jour : vertes = sous-ton chaud, bleues/violettes = sous-ton froid, un mélange des deux = sous-ton neutre.",
            "Le test des bijoux : si l'or flatte davantage votre peau, le sous-ton est plutôt chaud ; si c'est l'argent, plutôt froid ; les deux vous vont bien = neutre.",
            "Le test du papier blanc : face à une feuille blanche neutre, la peau paraît jaunâtre (chaud), rosée/bleutée (froid), ou ni l'un ni l'autre (neutre).",
        ]},
        {"type": "paragraph", "text": "Aucun test n'est infaillible seul : on croise au moins deux résultats avant de conclure. Si le constat reste ambigu, direction les deux premiers, 99% des peaux sont soit chaudes, soit froides, le sous-ton neutre étant plus rare qu'on ne le pense."},
        {"type": "heading2", "text": "Choisir son fond de teint une fois le sous-ton identifié"},
        {"type": "paragraph", "text": "Avec une large gamme de nuances, le [[Light Reflecting Foundation|https://www.awin1.com/pclick.php?p=43334110981&a=2923665&m=105475]] de NARS permet d'affiner facilement entre une teinte à dominante chaude ou froide. Pour une couvrance plus modulable au quotidien, le [[Skin Illusion Full Coverage|https://www.awin1.com/pclick.php?p=42813652982&a=2923665&m=105475]] de Clarins s'adapte bien aussi aux peaux neutres, difficiles à cerner."},
        {"type": "tips", "items": [
            "On teste toujours la teinte sur la mâchoire, à la lumière naturelle, jamais sur le poignet.",
            "On compare au moins deux nuances voisines : l'œil seul se trompe souvent de quelques tons.",
        ]},
    ],
},

# ---------------------------------------------------------------------- #11
{
    "id": "routine-skincare-petit-budget",
    "slug": "routine-skincare-petit-budget-moins-de-30-euros",
    "category": "conseils",
    "title": "Routine skincare petit budget :\nl'essentiel à moins de {{30 €}}",
    "excerpt": "Une routine efficace ne demande pas un budget élevé. Voici les 3 étapes vraiment indispensables, réunies pour moins de 30 euros.",
    "chapo": "Nettoyer, hydrater, protéger : ce sont les trois seuls gestes qui comptent vraiment au quotidien. Voici une routine complète et honnête pour moins de 30 euros.",
    "meta_title": "Routine skincare petit budget : l'essentiel à moins de 30€",
    "meta_description": "Nettoyant, crème, SPF : découvrez une routine skincare complète et efficace pour moins de 30 euros, sans sacrifier l'essentiel.",
    "image": "/image/hero-routine-petit-budget.png",
    "hero_image": "/image/hero-routine-petit-budget.png",
    "read_minutes": 5,
    "published_at": "2026-10-19T09:00:00Z",
    "blocks": [
        {"type": "heading2", "text": "Trois gestes suffisent, le reste est optionnel"},
        {"type": "paragraph", "text": "Sérums ciblés, essences, multiples actifs : la routine en 10 étapes fait vendre, mais ce n'est pas elle qui protège réellement la peau sur le long terme. Trois gestes couvrent l'essentiel : {{nettoyer}} sans décaper, {{hydrater}} pour maintenir la barrière cutanée, et {{protéger}} du soleil, premier facteur de vieillissement cutané évitable."},
        {"type": "heading2", "text": "La routine à moins de 30 €"},
        {"type": "paragraph", "text": "Le matin, on nettoie avec le [[Nettoyeur Moussant|https://www.awin1.com/pclick.php?p=43398278955&a=2923665&m=105475]] de CeraVe (10,40 €), qui respecte la barrière cutanée sans la dessécher. On termine avec le [[Bariésun Fluide Ultraléger SPF50+|https://www.awin1.com/pclick.php?p=42813653263&a=2923665&m=105475]] d'Uriage (9,40 €), une protection solaire légère qui ne laisse pas de film gras sous le maquillage. Le soir, après le même nettoyant, le [[Cold Cream|https://www.awin1.com/pclick.php?p=39179008521&a=2923665&m=105475]] d'Avène (9,90 €) nourrit en profondeur pendant la nuit. Total : 29,70 €, pour une routine qui tient plusieurs mois si elle est dosée correctement (une noisette suffit à chaque application)."},
        {"type": "steps", "items": [
            "Matin : nettoyant doux + SPF (même par temps couvert).",
            "Soir : nettoyant doux + crème nourrissante.",
            "Un tube de SPF de 30 ml dure environ 1 mois en application quotidienne correcte.",
        ]},
        {"type": "heading2", "text": "Ce qui compte autant que le prix"},
        {"type": "paragraph", "text": "Changer sa taie d'oreiller régulièrement, boire suffisamment d'eau, dormir assez et résister à l'envie de triturer les boutons sont des gestes gratuits qui ont un impact réel sur l'état de la peau, souvent sous-estimé face aux produits. Mieux vaut une routine simple appliquée avec régularité qu'une routine ambitieuse abandonnée après deux semaines."},
        {"type": "tips", "items": [
            "Un produit multi-usage (comme un cold cream, utilisable sur les lèvres et les zones sèches) rentabilise mieux le budget.",
            "Le SPF reste la meilleure dépense anti-âge, bien avant n'importe quel sérum premium.",
        ]},
    ],
},

# ---------------------------------------------------------------------- #12
{
    "id": "peau-mixte-quelle-routine",
    "slug": "peau-mixte-quelle-routine-adopter",
    "category": "conseils",
    "title": "Peau mixte :\nquelle {{routine}} adopter ?",
    "excerpt": "Zone T brillante, joues plus sèches : la peau mixte demande une routine qui traite chaque zone différemment, sans sur-assécher ni sur-nourrir.",
    "chapo": "Front, nez et menton gras, joues plus sèches ou normales : la peau mixte est l'une des plus fréquentes, et l'une des plus mal comprises. Voici comment l'équilibrer.",
    "meta_title": "Peau mixte : la routine à adopter zone par zone",
    "meta_description": "Zone T et joues n'ont pas les mêmes besoins. Découvrez la routine adaptée à la peau mixte, sans sur-assécher ni sur-nourrir.",
    "image": "/image/hero-peau-mixte.png",
    "hero_image": "/image/hero-peau-mixte.png",
    "read_minutes": 6,
    "published_at": "2026-10-20T09:00:00Z",
    "blocks": [
        {"type": "heading2", "text": "Pourquoi la peau mixte est particulière"},
        {"type": "paragraph", "text": "La peau mixte combine une {{zone T}} (front, nez, menton) plus grasse et brillante, et des joues normales à sèches. Cette répartition s'explique par une densité de glandes sébacées plus élevée au centre du visage. L'erreur classique est de traiter tout le visage de la même façon : un nettoyant trop asséchant sur l'ensemble du visage pousse la zone T à produire encore plus de sébum en compensation, tandis que les joues, elles, se dessèchent davantage."},
        {"type": "heading2", "text": "La routine zone par zone"},
        {"type": "steps", "items": [
            "Un nettoyant doux sur tout le visage, qui n'agresse ni la zone T ni les joues.",
            "Un soin régulateur de sébum appliqué uniquement sur la zone T.",
            "Une hydratation légère et non comédogène sur l'ensemble du visage, davantage insistée sur les joues.",
            "Une protection solaire non grasse au quotidien, pour ne pas relancer la production de sébum compensatoire.",
        ]},
        {"type": "paragraph", "text": "Pour le nettoyage, le [[Vinhydra Gel Nettoyant Hydratant|https://www.awin1.com/pclick.php?p=42813652140&a=2923665&m=105475]] de Caudalie convient bien à l'ensemble du visage. Sur la zone T, le [[Sebium Pore Refiner|https://www.awin1.com/pclick.php?p=39179009654&a=2923665&m=105475]] de Bioderma régule l'excès de sébum, tandis que le [[Hydrabio Hyalu+ Sérum|https://www.awin1.com/pclick.php?p=39179013959&a=2923665&m=105475]], toujours de Bioderma, hydrate en douceur le reste du visage, joues comprises."},
        {"type": "heading2", "text": "Le multi-masking, un bon réflexe hebdomadaire"},
        {"type": "paragraph", "text": "Une fois par semaine, on peut appliquer un masque à l'argile uniquement sur la zone T pour absorber l'excès de sébum, et un masque hydratant sur les joues au même moment. Cette technique, appelée multi-masking, respecte les besoins différents de chaque zone en une seule séance plutôt que de choisir un compromis qui ne convient vraiment à aucune des deux."},
        {"type": "tips", "items": [
            "On évite de sur-nettoyer la zone T : deux nettoyages par jour suffisent, davantage irrite sans réduire durablement le sébum.",
            "La répartition zone T / joues peut évoluer avec les saisons : la peau mixte est souvent plus grasse en été, plus sèche en hiver.",
        ]},
    ],
},
]

# ---------------------------------------------------------------------------
# Execution : upsert par slug, comme seed_blog_demo.py
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    for article in ARTICLES:
        slug = article["slug"]
        result = db.articles.update_one({"slug": slug}, {"$set": article}, upsert=True)
        if result.upserted_id:
            print(f"Article cree : {slug}")
        else:
            print(f"Article mis a jour : {slug}")
        print(f"   -> visible sur /blog/{slug}")

    print(f"\n{len(ARTICLES)} articles traites.")

