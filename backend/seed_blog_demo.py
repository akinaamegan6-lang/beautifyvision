"""
Script ponctuel : cree (ou met a jour) l'article de demo "Skincare coreenne"
directement en base, sans passer par l'API (donc sans avoir besoin d'un
token admin). A lancer une seule fois depuis le dossier backend :

    source venv/bin/activate
    python seed_blog_demo.py

Attention : ce script se connecte au MONGO_URL defini dans backend/.env,
qui est le meme cluster Atlas que celui utilise en production. L'article
sera donc visible en local ET sur beautifyvision.fr des sa creation.
"""
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

# Corrige automatiquement l'erreur SSL "CERTIFICATE_VERIFY_FAILED" que macOS
# peut renvoyer quand Python ne trouve pas de certificats racine valides.
# Plus besoin de faire `export SSL_CERT_FILE=...` a la main dans le terminal.
os.environ.setdefault("SSL_CERT_FILE", certifi.where())

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

client = MongoClient(os.environ["MONGO_URL"], tlsCAFile=certifi.where())
db = client[os.environ["DB_NAME"]]

SLUG = "skincare-coreenne-le-guide-complet"

article = {
    "id": "art_demo_skincare_kr",
    "title": "Skincare coréenne :\n{{le guide complet}}\npour une peau lumineuse",
    "slug": SLUG,
    "category": "skincare",
    "excerpt": "Découvrez les principes de la skincare coréenne, ses étapes incontournables, les meilleurs ingrédients et nos conseils pour adapter cette routine à votre peau.",
    "chapo": "Découvrez les principes de la skincare coréenne, ses étapes incontournables, les meilleurs ingrédients et nos conseils pour adapter cette routine à votre peau.",
    # SEO : balise <title> et meta description dediees a cet article.
    "meta_title": "Skincare coréenne : le guide complet | Beautify Vision",
    "meta_description": "Skincare coréenne : découvrez les 10 étapes de la routine K-beauty, les ingrédients incontournables et nos conseils pour une peau lumineuse et hydratée.",
    "image": "/image/miniature-skincare-corenne.png",
    "hero_image": "/image/skincare-corenne-article-hero.png",
    "read_minutes": 6,
    "published_at": datetime(2025, 9, 12, tzinfo=timezone.utc).isoformat(),
    "blocks": [
        {"type": "heading2", "text": "1. Qu'est-ce que {{la skincare coréenne}} ?"},
        {"type": "paragraph", "text": "La skincare coréenne, ou K-beauty, est une approche de soin de la peau venue de Corée du Sud qui met l'accent sur la prévention, l'hydratation et la douceur. L'objectif : une peau saine, éclatante et bien équilibrée sur le long terme."},
        {"type": "image", "src": "/image/image-llustration-skincare coréenne.png", "caption": None},

        {"type": "heading2", "text": "2. {{Les 10 étapes}} de la routine coréenne"},
        {"type": "paragraph", "text": "La routine coréenne est souvent composée de plusieurs étapes, qui peuvent être adaptées selon votre type de peau et vos besoins."},
        {"type": "steps", "items": [
            "Démaquillage (huile)",
            "Nettoyage (gel ou mousse)",
            "Exfoliation (1 à 2 fois par semaine)",
            "Lotion tonique",
            "Essence",
            "Sérum",
            "Masque (1 à 3 fois par semaine)",
            "Contour des yeux",
            "Crème hydratante",
            "Protection solaire (le matin)",
        ]},

        {"type": "heading2", "text": "3. Les {{ingrédients phares}}"},
        {"type": "paragraph", "text": "La K-beauty mise sur des ingrédients innovants et naturels, adaptés à tous les types de peau."},
        {"type": "ingredients", "items": [
            {"name": "Centella Asiatica", "description": "Apaise et répare la peau.", "image": "/image/Centella-Asiatica.png"},
            {"name": "Acide hyaluronique", "description": "Hydrate en profondeur.", "image": "/image/Acide-hyaluronique.png"},
            {"name": "Thé vert", "description": "Antioxydant et purifiant.", "image": "/image/Thé-vert.png"},
            {"name": "Extrait de riz", "description": "Illumine le teint et unifie la peau.", "image": "/image/Extrait-de-riz.png"},
        ]},

        {"type": "heading2", "text": "4. Quels {{produits}} choisir ?"},
        {"type": "paragraph", "text": "Il existe de nombreuses marques de skincare coréenne. Voici quelques incontournables pour commencer une routine efficace :"},
        {"type": "products", "items": [
            {
                "name": "BHA Blackhead Exfoliant Facial 100 ml", "brand": "COSRX", "rating": 4.0, "reviews": 0,
                "price": 23.5,
                "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F145148-1_s.webp&feedId=97867&k=a14a7099d203e72b30ed40d3f8195a40e67f5079",
                "affiliate_url": "https://www.awin1.com/pclick.php?p=41795689789&a=2923665&m=105475",
            },
            {
                "name": "Advanced Snail 96 Fluide 100 ml", "brand": "COSRX", "rating": 4.0, "reviews": 0,
                "price": 21.25,
                "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F144979-1_s.webp&feedId=97867&k=c29732ef05671c599860a93349fb3e561dc9f0ae",
                "affiliate_url": "https://www.awin1.com/pclick.php?p=41795689784&a=2923665&m=105475",
            },
            {
                "name": "Airy Fit Masque Facial Textile de Karité 19 g", "brand": "MISSHA", "rating": 4.0, "reviews": 0,
                "price": 2.5,
                "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F145489-1_s.webp&feedId=97867&k=cb27e68318b0d4bd4afbafd755713562ad6abd8f",
                "affiliate_url": "https://www.awin1.com/pclick.php?p=41795689806&a=2923665&m=105475",
            },
            {
                "name": "Aqua Sun Gel Solar SPF50+ 50 ml", "brand": "MISSHA", "rating": 4.0, "reviews": 0,
                "price": 13.5,
                "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F145480-1_s.webp&feedId=97867&k=b775bc77a10ce7f690e94e0c9e59b374837e7a39",
                "affiliate_url": "https://www.awin1.com/pclick.php?p=41795689800&a=2923665&m=105475",
            },
            {
                "name": "Blueberry Crème Hydratant Intensive 55 ml", "brand": "FRUDIA", "rating": 4.0, "reviews": 0,
                "price": 22.9,
                "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F145605-1_s.webp&feedId=97867&k=00abb15087e27490f80fa12871e43e5d5e26fb42",
                "affiliate_url": "https://www.awin1.com/pclick.php?p=41795689813&a=2923665&m=105475",
            },
            {
                "name": "Pomegranate Tonic Hydratant 195 ml", "brand": "FRUDIA", "rating": 4.0, "reviews": 0,
                "price": 17.0,
                "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F145595-1_s.webp&feedId=97867&k=bab77f2f416ee3bcd9a8739e79ebcdf7680366fb",
                "affiliate_url": "https://www.awin1.com/pclick.php?p=41795689809&a=2923665&m=105475",
            },
            {
                "name": "Centella Cleansing Balm 80 g", "brand": "ERBORIAN", "rating": 4.0, "reviews": 0,
                "price": 28.0,
                "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F121960-1_s.webp&feedId=97867&k=44ad98938fd022ac3963056c9f40e3327e811d21",
                "affiliate_url": "https://www.awin1.com/pclick.php?p=42813652909&a=2923665&m=105475",
            },
            {
                "name": "BB Crème Clair 40 ml", "brand": "ERBORIAN", "rating": 4.0, "reviews": 0,
                "price": 37.5,
                "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F129211-1_s-da95ddd0.webp&feedId=97867&k=2741df46e0f56254645989adb5e4ce28692b6bef",
                "affiliate_url": "https://www.awin1.com/pclick.php?p=44079960970&a=2923665&m=105475",
            },
        ]},

        {"type": "heading2", "text": "5. Nos {{conseils}} pour bien adopter la routine"},
        {"type": "tips", "items": [
            "Commencez par les étapes essentielles (nettoyage, hydratation, protection solaire).",
            "Adaptez les produits à votre type de peau.",
            "Soyez régulière et patiente : les résultats prennent du temps.",
            "Évitez de multiplier les nouveaux produits en même temps.",
        ]},
    ],
}

result = db.articles.update_one({"slug": SLUG}, {"$set": article}, upsert=True)
if result.upserted_id:
    print(f"Article cree : {SLUG}")
else:
    print(f"Article mis a jour : {SLUG}")

print(f"-> visible sur /blog/{SLUG}")
