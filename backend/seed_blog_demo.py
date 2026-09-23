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
        {"type": "image", "src": None, "caption": None},

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
            {"name": "Centella Asiatica", "description": "Apaise et répare la peau."},
            {"name": "Acide hyaluronique", "description": "Hydrate en profondeur."},
            {"name": "Thé vert", "description": "Antioxydant et purifiant."},
            {"name": "Extrait de riz", "description": "Illumine le teint et unifie la peau."},
        ]},

        {"type": "heading2", "text": "4. Quels {{produits}} choisir ?"},
        {"type": "paragraph", "text": "Il existe de nombreuses marques de skincare coréenne. Voici quelques incontournables pour commencer une routine efficace :"},
        {"type": "products", "items": [
            {"name": "BHA Blackhead Power Liquid", "brand": "COSRX", "rating": 4.8, "reviews": 1200, "price": 24.0},
            {"name": "Dynasty Cream", "brand": "Beauty of Joseon", "rating": 4.7, "reviews": 892, "price": 27.0},
            {"name": "Relief Sun SPF50+", "brand": "Beauty of Joseon", "rating": 4.9, "reviews": 2100, "price": 19.0},
            {"name": "Madagascar Centella Ampoule", "brand": "SKIN1004", "rating": 4.8, "reviews": 1500, "price": 23.0},
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
