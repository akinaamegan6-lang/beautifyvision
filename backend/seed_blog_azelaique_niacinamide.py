"""
Script ponctuel : cree (ou met a jour) l'article de blog
"acide-azelaique-ou-niacinamide-lequel-choisir" directement en base, sans passer par l'API.
A lancer une seule fois depuis le dossier backend :

    source venv/bin/activate
    python3 seed_blog_azelaique_niacinamide.py

Attention : ce script se connecte au MONGO_URL defini dans backend/.env,
qui est le meme cluster Atlas que celui utilise en production. L'article
sera donc visible en local ET sur beautifyvision.fr des sa creation.
"""
import os
from pathlib import Path

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

os.environ.setdefault("SSL_CERT_FILE", certifi.where())

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

client = MongoClient(os.environ["MONGO_URL"], tlsCAFile=certifi.where())
db = client[os.environ["DB_NAME"]]


# ---- Produits : Perfumeria (flux Awin), DocMorris (Awin), Beauty Success (Effiliation), Hairlust (Awin) ----
P = {
    "cerave_nettoyeur": {"name": "Nettoyeur mousseux", "brand": "CeraVe", "rating": 4.0, "reviews": 0, "price": 10.4, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F93563-1_s.webp&feedId=97867&k=96f962f4fd7a1567b77db3271428699eba10e03f", "affiliate_url": "https://www.awin1.com/pclick.php?p=43398278955&a=2923665&m=105475"},
    "cerave_creme": {"name": "Crème Hydratante", "brand": "CeraVe", "rating": 4.0, "reviews": 0, "price": 13.1, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F93568-1_s.webp&feedId=97867&k=cba7b65e25060c99c2363a297e3ac9ae89ca6ae9", "affiliate_url": "https://www.awin1.com/pclick.php?p=43398278958&a=2923665&m=105475"},
    "uriage_bariesun": {"name": "Bariésun Fluide Ultraléger SPF50+ 30 ml", "brand": "URIAGE", "rating": 4.0, "reviews": 0, "price": 9.4, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F144877-1_s.webp&feedId=97867&k=badee23af503ed066ebf945bb7efe60203668a03", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813653263&a=2923665&m=105475"},
    "pore_refiner": {"name": "Sebium Pore Refiner 30 ml", "brand": "BIODERMA", "rating": 4.0, "reviews": 0, "price": 14.5, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F9411-1_s.webp&feedId=97867&k=5eeed87de2b8e0ab9651c5be50611816c2d44834", "affiliate_url": "https://www.awin1.com/pclick.php?p=39179009654&a=2923665&m=105475"},
    "serum_antiimperfections": {"name": "Sérum Anti-imperfections 30 ml", "brand": "Embryolisse", "rating": 4.0, "reviews": 0, "price": 18.2, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F132845-1_s.webp&feedId=97867&k=8864febf978fe53458b5215ab66a2c0fd6691dfc", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813652168&a=2923665&m=105475"},
    "garancia_eclair": {"name": "Éclair de Lune La Froudoyante Crème Antimanchas 30 ml", "brand": "GARANCIA", "rating": 4.0, "reviews": 0, "price": 29.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F135223-1_s.webp&feedId=97867&k=4ea913450edeff8822d12f741c4f687cd6b9ab2f", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813652208&a=2923665&m=105475"},
    "ducray_antichute": {"name": "Anaphase Shampooing Antichute 200 ml", "brand": "DUCRAY", "rating": 4.0, "reviews": 0, "price": 14.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F145093-1_s.webp&feedId=97867&k=97aac748aaebdc844859a32956bf1982999d1de4", "affiliate_url": "https://www.awin1.com/pclick.php?p=44079959258&a=2923665&m=105475"},
    "ducray_anacaps": {"name": "Anacaps Reactiv Add-on Alimentation 90 ud", "brand": "DUCRAY", "rating": 4.0, "reviews": 0, "price": 39.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F143315-1_s.webp&feedId=97867&k=ff288f3f55b13a0417691237fbf04911861be246", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813651949&a=2923665&m=105475"},
    "evoluderm_ricin": {"name": "Lotion Capilar avec huile de Ricino 100 ml", "brand": "EVOLUDERM", "rating": 4.0, "reviews": 0, "price": 3.9, "image": "https://images2.productserve.com/?w=600&h=600&bg=transparent&trim=5&t=letterbox&url=ssl%3Aperfumeriacomas.com%2Fcdnassets%2Fproducts%2F131015-1_s.webp&feedId=97867&k=c8c5d51f702430a360a052bb0048cbd00a90f55c", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813652068&a=2923665&m=105475"},
    "sesderma_azelac": {"name": "Sesderma Azelac Ru Sérum Clarifiant Visage 30ml", "brand": "Sesderma", "rating": 4.0, "reviews": 0, "price": 32.99, "image": "https://statics.docmorris.fr/static/promofarma/prod/product_images/mpdp/MG27C_es_ES_0.png", "affiliate_url": "https://www.awin1.com/pclick.php?p=29638465477&a=2923665&m=16148"},
    "keracnyl_gel": {"name": "Ducray Keracnyl Gel Moussant Visage et Corps 200ml", "brand": "Ducray", "rating": 4.0, "reviews": 0, "price": 7.39, "image": "https://statics.docmorris.fr/static/promofarma/prod/product_images/mpdp/0C2GP_fr_FR_0.jpg", "affiliate_url": "https://www.awin1.com/pclick.php?p=29638479469&a=2923665&m=16148"},
    "cleanance_hydra": {"name": "Avène Cleanance Hydra Crème Apaisante 40 ml", "brand": "Avène", "rating": 4.0, "reviews": 0, "price": 13.0, "image": "https://statics.docmorris.fr/static/promofarma/prod/product_images/mpdp/VNHGP_fr_FR_0.png", "affiliate_url": "https://www.awin1.com/pclick.php?p=29638481385&a=2923665&m=16148"},
    "effaclar_ai": {"name": "La Roche-Posay Effaclar A.I. 15ml", "brand": "La Roche-Posay", "rating": 4.0, "reviews": 0, "price": 10.49, "image": "https://statics.docmorris.fr/static/promofarma/prod/product_images/mpdp/BNNI1_fr_FR_0.jpeg", "affiliate_url": "https://www.awin1.com/pclick.php?p=29638474085&a=2923665&m=16148"},
    "nuxe_zinc": {"name": "Zinc Power Gelée Nettoyante & Purifiante 150ml", "brand": "Nuxe", "rating": 4.0, "reviews": 0, "price": 18.0, "image": "https://www.beautysuccess.fr/media/catalog/product/6/4/647479050c-nuxe-zinc-power-150ml-visuel_1.jpg", "affiliate_url": "https://track.effiliation.com/servlet/effi.redir?id_compteur=23327756&url=https%3A%2F%2Fwww.beautysuccess.fr%2Fsoin-nuxe-zinc-power-gelee-nettoyante-purifiante-femme-647479050c"},
    "garancia_marabout": {"name": "Marabou-t Potion Magique Anti-imperfections S.o.s Zone T 10ml", "brand": "Garancia", "rating": 4.0, "reviews": 0, "price": 25.0, "image": "https://www.beautysuccess.fr/media/catalog/product/3/8/38h5702y05-garancia-marabou-t-10ml-visuel_1.jpg", "affiliate_url": "https://track.effiliation.com/servlet/effi.redir?id_compteur=23327756&url=https%3A%2F%2Fwww.beautysuccess.fr%2Fsoin-garancia-marabou-t-potion-magique-anti-imperfections-s-o-s-zone-t-femme-38h5702y05"},
    "pilexil": {"name": "Pilexil 150 capsules", "brand": "Pilexil", "rating": 4.0, "reviews": 0, "price": 35.96, "image": "https://statics.docmorris.fr/static/promofarma/prod/product_images/mpdp/ONVMZ_es_ES_0.jpg", "affiliate_url": "https://www.awin1.com/pclick.php?p=29638454169&a=2923665&m=16148"},
    "cystiphane": {"name": "Cystiphane Lotion Anti-Chute 100ml", "brand": "Cystiphane", "rating": 4.0, "reviews": 0, "price": 37.47, "image": "https://statics.docmorris.fr/static/promofarma/prod/product_images/mpdp/4FJUK_fr_FR_0.png", "affiliate_url": "https://www.awin1.com/pclick.php?p=29638467391&a=2923665&m=16148"},
    "lashile_antichute": {"name": "Good Hair Women Anti-chute Cheveux Flacon 60 Gummies", "brand": "Lashilé Beauty", "rating": 4.0, "reviews": 0, "price": 24.9, "image": "https://www.beautysuccess.fr/media/catalog/product/l/a/las6101500-lashile-beauty-good-hair-women-flacon-60-gummies-visuel_1.jpg", "affiliate_url": "https://track.effiliation.com/servlet/effi.redir?id_compteur=23327756&url=https%3A%2F%2Fwww.beautysuccess.fr%2Fsoin-lashile-beauty-good-hair-women-anti-chute-cheveux-femme-las6101500"},
    "lashile_pousse": {"name": "Good Hair Pousse Et Fortification Des Cheveux Cheveux Sublimes", "brand": "Lashilé Beauty", "rating": 4.0, "reviews": 0, "price": 24.9, "image": "https://www.beautysuccess.fr/media/catalog/product/l/a/las6100100-lashile-beauty-good-hair-cheveux-sublimes-visuel_1.jpg", "affiliate_url": "https://track.effiliation.com/servlet/effi.redir?id_compteur=23327756&url=https%3A%2F%2Fwww.beautysuccess.fr%2Fsoin-lashile-beauty-good-hair-pousse-et-fortification-des-cheveux-femme-las6100100"},
    "hl_brush": {"name": "Bamboo Paddle Brush", "brand": "Hairlust", "rating": 4.0, "reviews": 0, "price": 24.95, "image": "https://cdn.shopify.com/s/files/1/0602/8024/2334/products/Goodbyetangles-PaddleBrush_Vinkel1akopier_fa88656a-6014-4c7a-8159-ef5e6032a1c1.jpg?v=1663865778", "affiliate_url": "https://www.awin1.com/pclick.php?p=43468997363&a=2923665&m=27413"},
    "hl_pillow": {"name": "Silky Bamboo Pillowcase, Vert Olive", "brand": "Hairlust", "rating": 4.0, "reviews": 0, "price": 26.95, "image": "https://cdn.shopify.com/s/files/1/0602/8024/2334/products/SilkyBambooPillowcase-OliveGreen_Vinkel1kopier.jpg?v=1663840539", "affiliate_url": "https://www.awin1.com/pclick.php?p=43468997365&a=2923665&m=27413"},
    "hl_detangler": {"name": "Wet Hair Detangler Brush, Blurple", "brand": "Hairlust", "rating": 4.0, "reviews": 0, "price": 9.95, "image": "https://cdn.shopify.com/s/files/1/0602/8024/2334/files/Blurple.jpg?v=1744708696", "affiliate_url": "https://www.awin1.com/pclick.php?p=43468997364&a=2923665&m=27413"},
    "hl_splitfix": {"name": "Split Fix Duo", "brand": "Hairlust", "rating": 4.0, "reviews": 0, "price": 51.9, "image": "https://cdn.shopify.com/s/files/1/0602/8024/2334/products/SplitFix-DUO_Vinkel1_7fef155a-e05a-4a1c-9d42-16321d7b0ba0.jpg?v=1663939774", "affiliate_url": "https://www.awin1.com/pclick.php?p=43468997392&a=2923665&m=27413"},
    "to_niacinamide": {"name": "Niacinamide 10 % + Zinc 1 % Sérum 30 ml", "brand": "The Ordinary", "rating": 4.0, "reviews": 0, "price": 6.09, "image": "https://statics.docmorris.fr/static/promofarma/prod/product_images/mpdp/5F4RBA_fr_FR_0.jpeg", "affiliate_url": "https://www.awin1.com/pclick.php?p=38658113009&a=2923665&m=16148"},
    "anua_niacinamide": {"name": "Niacinamide 10 % + TXA 4 % Sérum Anti-taches 30 ml", "brand": "Anua", "rating": 4.0, "reviews": 0, "price": 21.79, "image": "https://statics.docmorris.fr/static/promofarma/prod/product_images/mpdp/434P1FPF_fr_FR_0.jpeg", "affiliate_url": "https://www.awin1.com/pclick.php?p=44872787368&a=2923665&m=16148"},
    "sesmahal": {"name": "Sesmahal B3 Niacinamide 6 % Sérum Concentré 30 ml", "brand": "Sesderma", "rating": 4.0, "reviews": 0, "price": 20.42, "image": "https://statics.docmorris.fr/static/promofarma/prod/product_images/mpdp/ROTSOO_es_ES_0.png", "affiliate_url": "https://www.awin1.com/pclick.php?p=31947234375&a=2923665&m=16148"},
    "neutrogena_niac": {"name": "Hydro Boost Sérum Niacinamide 30 ml", "brand": "Neutrogena", "rating": 4.0, "reviews": 0, "price": 20.19, "image": "https://statics.docmorris.fr/static/promofarma/prod/product_images/mpdp/WKNCCMC1_fr_FR_0.png", "affiliate_url": "https://www.awin1.com/pclick.php?p=40564440964&a=2923665&m=16148"},
    "boj_propolis": {"name": "Sérum Éclat Propolis & Niacinamide 60 g", "brand": "Beauty Of Joseon", "rating": 4.0, "reviews": 0, "price": 17.0, "image": "https://www.beautysuccess.fr/media/catalog/product/0/7/07j5703205-beauty-of-joseon-propolis-60g-visuel_1.jpg", "affiliate_url": "https://track.effiliation.com/servlet/effi.redir?id_compteur=23327756&url=https%3A%2F%2Fwww.beautysuccess.fr%2Fsoin-beauty-of-joseon-propolis-serum-eclat-propolis-niacinamide-femme-07j5703205"},
    "svr_sunsecure": {"name": "Sun Secure Crème SPF50+ 50 ml", "brand": "SVR", "rating": 4.0, "reviews": 0, "price": 7.49, "image": "https://statics.docmorris.fr/static/promofarma/prod/product_images/mpdp/3EF0N_fr_FR_0.jpeg", "affiliate_url": "https://www.awin1.com/pclick.php?p=29638466243&a=2923665&m=16148"},
    "eucerin_oil": {"name": "Sun Protection Oil Control Dry Touch SPF50+", "brand": "Eucerin", "rating": 4.0, "reviews": 0, "price": 14.5, "image": "https://perfumeriacomas.com/cdnassets/products/120894-1_s.webp", "affiliate_url": "https://www.awin1.com/pclick.php?p=46116095730&a=2923665&m=105475"},
    "nuxe_zinc_serum": {"name": "Zinc Power Sérum Anti-imperfections & Anti-boutons 30ml", "brand": "Nuxe", "rating": 4.0, "reviews": 0, "price": 35.0, "image": "https://www.beautysuccess.fr/media/catalog/product/6/4/647579030c-nuxe-zinc-power-30ml-visuel_1.jpg", "affiliate_url": "https://track.effiliation.com/servlet/effi.redir?id_compteur=23327756&url=https%3A%2F%2Fwww.beautysuccess.fr%2Fsoin-nuxe-zinc-power-serum-anti-imperfections-anti-boutons-femme-647579030c"},
    "cattier_romero": {"name": "Shampooing au Vinaigre de Romarin 250 ml", "brand": "Cattier", "rating": 4.0, "reviews": 0, "price": 6.5, "image": "https://perfumeriacomas.com/cdnassets/products/116818-1_s.webp", "affiliate_url": "https://www.awin1.com/pclick.php?p=45175869005&a=2923665&m=105475"},
    "klorane_quinina": {"name": "Quinine Sérum Fortifiant Antichute 100 ml", "brand": "Klorane", "rating": 4.0, "reviews": 0, "price": 42.5, "image": "https://perfumeriacomas.com/cdnassets/products/145080-1_s.webp", "affiliate_url": "https://www.awin1.com/pclick.php?p=42813652883&a=2923665&m=105475"},
    "phyto_phytocyane": {"name": "Phytocyane Shampooing Antichute Femme 250ml", "brand": "Phyto", "rating": 4.0, "reviews": 0, "price": 12.5, "image": "https://www.beautysuccess.fr/media/catalog/product/p/y/pyt8200401-phyto-phytocyane-250ml-visuel_1.jpg", "affiliate_url": "https://track.effiliation.com/servlet/effi.redir?id_compteur=23327756&url=https%3A%2F%2Fwww.beautysuccess.fr%2Fsoin-phyto-phytocyane-shampooing-antichute-femme-femme-pyt8200401"},
    "phyto_traitement": {"name": "Traitement Antichute Femme Chute Progressive 60ml", "brand": "Phyto", "rating": 4.0, "reviews": 0, "price": 48.5, "image": "https://www.beautysuccess.fr/media/catalog/product/p/y/pyt9300203-phyto-traitement-antichute-femme-60ml-visuel_1.jpg", "affiliate_url": "https://track.effiliation.com/servlet/effi.redir?id_compteur=23327756&url=https%3A%2F%2Fwww.beautysuccess.fr%2Fsoin-phyto-traitement-antichute-femme-chute-progressive-femme-pyt9300203"},
    "pilexil_shampoo": {"name": "Shampooing Anti-Chute 300 ml", "brand": "Pilexil", "rating": 4.0, "reviews": 0, "price": 12.59, "image": "https://statics.docmorris.fr/static/promofarma/prod/product_images/mpdp/XGQUJ_es_ES_0.png", "affiliate_url": "https://www.awin1.com/pclick.php?p=29638454737&a=2923665&m=16148"},
}


def pblock(*keys):
    return {"type": "products", "items": [P[k] for k in keys]}


ARTICLE = {
    "id": "azelaique-vs-niacinamide",
    "slug": "acide-azelaique-ou-niacinamide-lequel-choisir",
    "category": "ingredients",
    "title": "Acide azélaïque ou niacinamide :\nlequel choisir pour {{votre peau}} ?",
    "excerpt": "Boutons, rougeurs, taches, pores : acide azélaïque et niacinamide semblent faire la même chose. Différences, avantages, peut-on les associer, et la routine selon votre type de peau.",
    "chapo": "Ce sont les deux actifs les plus populaires du moment et ils promettent presque la même chose. Alors lequel choisir, faut-il les associer, et dans quel ordre ? Voici un comparatif clair pour décider selon votre peau.",
    "meta_title": "Acide azélaïque ou niacinamide : lequel choisir ?",
    "meta_description": "Acide azélaïque vs niacinamide : différences, bienfaits, peut-on les associer, et la routine selon votre peau (boutons, rougeurs, taches, pores). Comparatif complet.",
    "image": "/image/hero-azelaique-vs-niacinamide.jpg",
    "hero_image": "/image/hero-azelaique-vs-niacinamide.jpg",
    "read_minutes": 10,
    "published_at": "2026-11-18T07:00:00Z",
    "blocks": [
        {"type": "heading2", "text": "Deux actifs, deux rôles différents"},
        {"type": "paragraph", "text": "Sur les étagères comme sur les réseaux, l'acide azélaïque et la niacinamide sont souvent présentés comme interchangeables : tous deux ciblent les boutons, les rougeurs, les taches et le grain de peau. Pourtant, ils n'agissent pas du tout de la même façon, et c'est précisément ce qui les rend complémentaires.\nEn deux mots : la {{niacinamide}} est un régulateur et un réparateur, qui équilibre le sébum et renforce la barrière cutanée. L'{{acide azélaïque}} est plutôt un correcteur, qui agit sur l'inflammation, les bactéries et la pigmentation. Voyons chacun en détail, puis comment choisir."},
        {"type": "heading2", "text": "La niacinamide : le régulateur"},
        {"type": "paragraph", "text": "La niacinamide, ou vitamine B3, aide à réguler la production de sébum, à atténuer l'aspect des pores dilatés, à unifier le teint et à renforcer la barrière cutanée en stimulant la synthèse de céramides. Elle a aussi un effet apaisant. C'est l'un des actifs les mieux tolérés, ce qui explique qu'on la retrouve dans presque tous les types de routines. Les concentrations les plus étudiées se situent entre 2 et 5 %, et jusqu'à 10 % dans les sérums du commerce. Retrouvez le détail dans notre article sur la [[niacinamide et ses associations|/blog/niacinamide-bienfaits-avec-quoi-ne-pas-melanger]]."},
        {"type": "paragraph", "text": "Pour l'essayer à petit prix, la [[Niacinamide 10 % + Zinc 1 % de The Ordinary|https://link.amazon/B0h2WM4Wk]] reste la référence la plus accessible. Pour cibler plus spécifiquement l'éclat et les taches, le [[Sérum Niacinamide 10 % + TXA d'Anua|https://link.amazon/B09khwd0I]] est une alternative populaire, et le [[Sérum 10 % Niacinamide de The INKEY List|https://link.amazon/B0fnYOfPk]] séduit les peaux à tendance grasse."},
        {"type": "heading2", "text": "L'acide azélaïque : le correcteur"},
        {"type": "paragraph", "text": "L'acide azélaïque est un acide dicarboxylique utilisé depuis longtemps par les dermatologues. Il a une action antibactérienne, anti-inflammatoire et légèrement kératolytique, et il freine en partie la production de mélanine. Il est particulièrement apprécié pour les boutons inflammatoires, les rougeurs, la rosacée et les marques post-boutons. Les produits en vente libre sont généralement dosés à 10 %, et les concentrations plus élevées (15 à 20 %) sont réservées aux médicaments sur ordonnance. Notre [[guide complet de l'acide azélaïque|/blog/acide-azelaique-boutons-rougeurs-taches]] détaille son usage."},
        {"type": "paragraph", "text": "Pour commencer, la [[Suspension d'Acide Azélaïque 10 % de The Ordinary|https://link.amazon/B0eme8W7m]] est la valeur sûre. Les peaux plus réactives apprécieront le [[Sérum Apaisant Acide Azélaïque de medicube|https://link.amazon/B0dnXMtdG]], tandis que le [[Booster 10 % d'acide azélaïque de Paula's Choice|https://link.amazon/B06gyNjso]] propose une formule plus premium associée à de l'acide salicylique."},
        {"type": "image", "src": "/image/inline-azelaique-niacinamide-serums.jpg", "caption": "Deux sérums, deux rôles : l'un régule et répare, l'autre corrige et apaise."},
        {"type": "heading2", "text": "Le comparatif en un coup d'œil"},
        {"type": "heading3", "text": "Pour les boutons et l'acné"},
        {"type": "paragraph", "text": "L'acide azélaïque a une action plus directe sur les boutons inflammatoires grâce à son effet antibactérien. La niacinamide agit plutôt en amont, en régulant le sébum et en limitant l'aspect des pores. Pour une acné légère à modérée, l'acide azélaïque est souvent plus efficace ; pour une peau grasse avec des pores visibles, la niacinamide prend l'avantage."},
        {"type": "heading3", "text": "Pour les rougeurs et la rosacée"},
        {"type": "paragraph", "text": "Avantage net à l'{{acide azélaïque}}, utilisé en médecine pour la rosacée papulo-pustuleuse. La niacinamide apaise aussi et renforce la barrière, ce qui aide les peaux réactives, mais elle n'a pas le même effet anti-inflammatoire ciblé."},
        {"type": "heading3", "text": "Pour les taches et les marques"},
        {"type": "paragraph", "text": "Les deux agissent sur la pigmentation, par des mécanismes différents : l'acide azélaïque freine la production de mélanine dans les zones hyperactives, la niacinamide limite son transfert vers la surface de la peau. Pour les marques post-boutons, l'acide azélaïque est souvent plus rapide, mais la niacinamide est un excellent soutien pour l'éclat général. Dans tous les cas, sans protection solaire, les taches reviennent."},
        {"type": "heading3", "text": "Pour les pores et le sébum"},
        {"type": "paragraph", "text": "Victoire de la {{niacinamide}}, qui régule le sébum et lisse l'aspect du grain de peau. L'acide azélaïque aide indirectement en limitant l'obstruction des pores, mais ce n'est pas son rôle principal. Notre article sur les [[pores dilatés|/blog/pores-dilates-ce-qui-marche-vraiment]] détaille ce qui fonctionne réellement."},
        {"type": "heading3", "text": "Pour la tolérance"},
        {"type": "paragraph", "text": "Les deux sont bien tolérés par la plupart des peaux. La niacinamide est plus rarement irritante, même si certaines peaux sensibles peuvent avoir des rougeurs avec les concentrations élevées. L'acide azélaïque peut provoquer des picotements ou une sécheresse les premiers jours, qui s'atténuent généralement. Dans les deux cas, on commence progressivement."},
        {"type": "heading2", "text": "Peut-on utiliser les deux ensemble ?"},
        {"type": "paragraph", "text": "Oui, et c'est même une association très appréciée. Il n'y a pas d'incompatibilité connue entre les deux, et leurs actions se complètent : la niacinamide renforce la barrière et régule le sébum pendant que l'acide azélaïque traite l'inflammation et les marques. La niacinamide peut même aider à mieux tolérer l'acide azélaïque en limitant l'inconfort.\nLa façon la plus simple est de les {{séparer dans la journée}} : niacinamide le matin, acide azélaïque le soir (ou l'inverse). Si votre peau les tolère bien, vous pouvez aussi les superposer le même soir : d'abord le produit le plus fluide, puis le plus riche, puis la crème. Si vous ressentez des picotements, revenez à la version « un actif par moment de la journée »."},
        {"type": "heading2", "text": "Dans quel ordre appliquer ses soins ?"},
        {"type": "paragraph", "text": "La règle générale est de passer du plus fluide au plus riche : nettoyant, éventuellement lotion, puis sérums, puis crème, et enfin écran solaire le matin. Si vous superposez niacinamide et acide azélaïque le même soir, appliquez d'abord celui dont la texture est la plus liquide, laissez-le pénétrer une minute, puis passez au second. L'acide azélaïque en suspension (texture crémeuse) se met généralement en dernier avant la crème hydratante."},
        {"type": "paragraph", "text": "Au démarrage, introduisez un {{seul actif à la fois}} et attendez au moins deux semaines avant d'ajouter le suivant. Cette discipline permet d'identifier ce qui convient à votre peau et ce qui l'irrite. Si vous avez des doutes sur un produit, notez-le dans votre téléphone avec la date de début : c'est un réflexe qui évite bien des tâtonnements."},
        {"type": "heading2", "text": "Quel budget prévoir ?"},
        {"type": "paragraph", "text": "Bonne nouvelle : ces deux actifs n'ont pas besoin d'être chers pour être efficaces. On trouve des niacinamides à 10 % et des acides azélaïques à 10 % pour moins de quinze euros, ce qui est largement suffisant pour tester. Les formules plus chères n'offrent pas forcément plus de résultats, mais peuvent proposer des textures plus agréables, des associations (zinc, acide salicylique, panthénol) ou une meilleure tolérance pour les peaux réactives.\nSi vous démarrez, le plus rentable est un duo simple : un sérum de niacinamide, un acide azélaïque, un nettoyant doux, une crème hydratante et un SPF 50. Cela fait cinq produits, pour une routine complète qui reste à budget raisonnable."},
        {"type": "heading2", "text": "Grossesse, allaitement : que faut-il savoir ?"},
        {"type": "paragraph", "text": "L'acide azélaïque est souvent cité comme l'un des actifs les mieux tolérés pour traiter les boutons pendant la grossesse, et la niacinamide est généralement considérée comme bien tolérée en cosmétique. Cela ne veut pas dire qu'ils sont sans risque pour toutes les situations : demandez l'avis de votre médecin ou de votre pharmacien avant de les utiliser pendant la grossesse ou l'allaitement, en particulier si vous suivez par ailleurs un traitement."},
        {"type": "heading2", "text": "Quelle routine selon votre peau ?"},
        {"type": "heading3", "text": "Peau grasse ou à imperfections"},
        {"type": "paragraph", "text": "Niacinamide le matin pour réguler le sébum et resserrer l'aspect des pores, acide azélaïque le soir pour traiter les boutons. Gardez un nettoyant doux, une crème légère et un écran solaire non gras, comme le [[Anthelios UVMune 400 Oil Control de La Roche-Posay|https://link.amazon/B06suxJQt]]."},
        {"type": "heading3", "text": "Peau sensible ou avec rougeurs"},
        {"type": "paragraph", "text": "Commencez par l'{{acide azélaïque}} un soir sur deux, puis ajoutez une niacinamide à faible concentration (2 à 5 %) le matin si besoin. Privilégiez des formules apaisantes, sans parfum, et hydratez avec une crème réparatrice comme la [[Crème Hydratante de CeraVe|https://link.amazon/B0bhj5Esi]]. En cas de rougeurs persistantes, demandez conseil à un dermatologue."},
        {"type": "heading3", "text": "Peau avec taches et marques"},
        {"type": "paragraph", "text": "Acide azélaïque le soir pour agir sur la pigmentation, niacinamide le matin pour unifier le teint, et surtout un écran solaire SPF 50 tous les jours, qui conditionne la réussite du traitement."},
        {"type": "heading3", "text": "Peau mixte ou normale"},
        {"type": "paragraph", "text": "Une simple niacinamide matin et soir suffit souvent. Ajoutez l'acide azélaïque seulement en cas de boutons récurrents ou de marques. Notre article sur la [[routine peau mixte|/blog/peau-mixte-quelle-routine-adopter]] vous aide à construire une base équilibrée."},
        {"type": "heading3", "text": "Peau sèche ou barrière abîmée"},
        {"type": "paragraph", "text": "Commencez par réparer la barrière avec des céramides et une crème nourrissante, puis introduisez la niacinamide à faible dose. L'acide azélaïque peut attendre que la peau soit apaisée. Notre guide sur la [[barrière cutanée abîmée|/blog/barriere-cutanee-abimee-signes-comment-reparer]] vous explique comment faire."},
        {"type": "heading2", "text": "Notre sélection de soins niacinamide"},
        {"type": "paragraph", "text": "Voici des références accessibles en pharmacie et en parapharmacie, à choisir selon votre budget et votre type de peau."},
        pblock("to_niacinamide", "anua_niacinamide", "sesmahal", "neutrogena_niac", "boj_propolis"),
        {"type": "heading2", "text": "Notre sélection de soins à l'acide azélaïque et anti-imperfections"},
        pblock("sesderma_azelac", "serum_antiimperfections", "nuxe_zinc_serum", "effaclar_ai", "cleanance_hydra", "garancia_eclair"),
        {"type": "image", "src": "/image/inline-azelaique-niacinamide-routine.jpg", "caption": "Une routine courte et régulière vaut mieux qu'un empilement de produits : nettoyer, traiter, hydrater, protéger."},
        {"type": "heading2", "text": "Pour compléter sa routine : hydrater et protéger"},
        {"type": "paragraph", "text": "Aucun actif ne fonctionne sans hydratation ni protection solaire. Un nettoyant doux et une crème réparatrice limitent l'inconfort, et un SPF 50 quotidien protège vos résultats."},
        pblock("cerave_nettoyeur", "cerave_creme", "svr_sunsecure", "eucerin_oil", "uriage_bariesun"),
        {"type": "heading2", "text": "Les erreurs à éviter"},
        {"type": "steps", "items": [
            "Introduire les deux actifs le même jour : commencez par un seul, attendez deux semaines, puis ajoutez le second.",
            "Viser une concentration trop élevée dès le départ : mieux vaut 5 à 10 % régulièrement que 15 % abandonné.",
            "Oublier l'écran solaire : sans lui, les taches reviennent et les rougeurs s'aggravent.",
            "Attendre des résultats en une semaine : comptez 4 à 8 semaines pour les boutons, trois mois pour les taches.",
            "Multiplier les acides exfoliants en plus : n'ajoutez pas AHA, BHA et rétinol en même temps.",
        ]},
        {"type": "tips", "items": [
            "Faites un test cutané derrière l'oreille avant tout nouvel actif.",
            "Un seul nouvel actif à la fois, pour savoir lequel convient à votre peau.",
            "Appliquez l'acide azélaïque sur peau propre et sèche, puis hydratez.",
            "SPF 50 chaque matin, même en automne et en hiver.",
            "Des boutons kystiques, des rougeurs permanentes ou une peau qui brûle méritent un avis dermatologique.",
        ]},
        {"type": "heading2", "text": "Questions fréquentes"},
        {"type": "faq", "items": [
            {"q": "Quelle est la différence entre acide azélaïque et niacinamide ?", "a": "La niacinamide régule le sébum, renforce la barrière et unifie le teint. L'acide azélaïque a une action antibactérienne, anti-inflammatoire et anti-taches, utile pour les boutons inflammatoires et les rougeurs."},
            {"q": "Peut-on mélanger acide azélaïque et niacinamide ?", "a": "Oui, il n'y a pas d'incompatibilité connue. On peut les utiliser à des moments différents de la journée ou les superposer le même soir si la peau les tolère."},
            {"q": "Lequel choisir pour les boutons ?", "a": "L'acide azélaïque est souvent plus efficace sur les boutons inflammatoires. La niacinamide aide plutôt à réguler le sébum et à resserrer l'aspect des pores."},
            {"q": "Lequel est le plus doux pour une peau sensible ?", "a": "La niacinamide est généralement très bien tolérée, mais l'acide azélaïque convient aussi aux peaux sensibles si on commence progressivement. Faites toujours un test préalable."},
            {"q": "Faut-il les appliquer le matin ou le soir ?", "a": "La niacinamide peut s'utiliser matin et soir. L'acide azélaïque n'est pas photosensibilisant et s'utilise aussi bien le matin que le soir. Le soir est souvent plus confortable."},
            {"q": "Combien de temps avant de voir des résultats ?", "a": "Comptez quatre à huit semaines pour les boutons et les pores, et trois mois ou plus pour les taches, avec un écran solaire quotidien."},
        ]},
        {"type": "paragraph", "text": "En résumé, la niacinamide est la base idéale pour {{réguler et réparer}}, l'acide azélaïque le renfort pour {{corriger}} boutons, rougeurs et marques. Vous n'avez pas à choisir : les deux se complètent très bien. Pour trouver la routine qui correspond à votre peau, faites notre [[diagnostic personnalisé|/routine-360]] et retrouvez les [[bons plans beauté|/promos]] du moment."},
    ],
}


if __name__ == "__main__":
    slug = ARTICLE["slug"]
    result = db.articles.update_one({"slug": slug}, {"$set": ARTICLE}, upsert=True)
    print(("Article cree : " if result.upserted_id else "Article mis a jour : ") + slug)
    print(f"   -> visible sur /blog/{slug}")
