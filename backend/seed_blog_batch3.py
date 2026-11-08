"""
Script ponctuel : cree (ou met a jour) 2 articles de blog directement en base
(acide azelaique + pourquoi les cheveux ne poussent pas), sans passer par l'API.
A lancer une seule fois depuis le dossier backend :

    source venv/bin/activate
    python3 seed_blog_batch3.py

Attention : ce script se connecte au MONGO_URL defini dans backend/.env,
qui est le meme cluster Atlas que celui utilise en production. Les articles
seront donc visibles en local ET sur beautifyvision.fr des leur creation.
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
}


def pblock(*keys):
    return {"type": "products", "items": [P[k] for k in keys]}



ARTICLES = [

# ---------------------------------------------------------------------- #1
{
    "id": "acide-azelaique-guide",
    "slug": "acide-azelaique-boutons-rougeurs-taches",
    "category": "ingredients",
    "title": "Acide azélaïque :\nle {{soin star}} contre boutons, rougeurs et taches",
    "excerpt": "À quoi sert l'acide azélaïque, pour quelle peau, à quelle concentration et comment l'utiliser ? Le guide complet de l'actif dont tout le monde parle, avec une sélection de sérums.",
    "chapo": "Boutons, rougeurs, marques brunes qui ne partent pas : l'acide azélaïque coche beaucoup de cases à la fois, et c'est une des raisons pour lesquelles il explose sur les réseaux. Mais est-il vraiment fait pour toutes les peaux ? À quelle concentration ? Matin ou soir ? Voici tout ce qu'il faut savoir avant de l'ajouter à votre routine.",
    "meta_title": "Acide azélaïque : bienfaits, mode d'emploi et meilleurs sérums",
    "meta_description": "Acide azélaïque : à quoi ça sert, pour quelle peau, comment l'utiliser, à quelle concentration et avec quoi l'associer ? Guide complet et sélection de sérums.",
    "image": "/image/hero-acide-azelaique.jpg",
    "hero_image": "/image/hero-acide-azelaique.jpg",
    "read_minutes": 11,
    "published_at": "2026-11-08T07:00:00Z",
    "blocks": [
        {"type": "heading2", "text": "Qu'est-ce que l'acide azélaïque ?"},
        {"type": "paragraph", "text": "L'acide azélaïque est un acide dicarboxylique que l'on trouve naturellement dans certaines céréales comme l'orge, le blé ou le seigle, et que la peau tolère généralement très bien. Les cosmétiques utilisent aujourd'hui des versions de synthèse, plus stables et plus pures. Il est utilisé depuis plusieurs décennies par les dermatologues, notamment dans le traitement de l'acné et de la {{rosacée}}, ce qui lui donne un solide historique de sécurité que beaucoup d'actifs « tendance » n'ont pas.\nContrairement aux acides exfoliants plus connus (AHA comme l'acide glycolique, BHA comme l'acide salicylique), il n'agit pas uniquement en « décapant » la surface de la peau. Il a une action {{multi-cibles}} : il calme l'inflammation, limite la prolifération des bactéries impliquées dans l'acné, aide à désobstruer les pores et freine la production de mélanine responsable des taches. C'est précisément cette polyvalence qui en fait un actif aussi populaire."},
        {"type": "heading2", "text": "À quoi sert l'acide azélaïque ?"},
        {"type": "heading3", "text": "Contre les boutons et l'acné"},
        {"type": "paragraph", "text": "L'acide azélaïque a une action antibactérienne sur Cutibacterium acnes, la bactérie qui se développe dans les pores obstrués et entretient les boutons inflammatoires. Il a aussi un effet légèrement kératolytique : il aide à normaliser la façon dont les cellules de la couche superficielle se renouvellent, ce qui limite la formation de comédons (points noirs et microkystes). Résultat : moins de boutons rouges et douloureux, et une peau qui se congestionne moins. Il convient donc bien aux acnés légères à modérées, souvent en complément d'un traitement prescrit."},
        {"type": "heading3", "text": "Contre les rougeurs et la rosacée"},
        {"type": "paragraph", "text": "C'est l'un de ses atouts les plus appréciés. Son effet anti-inflammatoire apaise les rougeurs diffuses, les petits boutons de la rosacée papulo-pustuleuse et la peau qui « chauffe » facilement. En France, les formes de rosacée bien installées sont d'ailleurs traitées par des préparations dosées à 15 % sur ordonnance. Les sérums en vente libre, plus légèrement dosés, peuvent aider à entretenir une peau réactive mais ne remplacent pas un avis médical si les rougeurs sont persistantes."},
        {"type": "heading3", "text": "Contre les taches et les marques post-boutons"},
        {"type": "paragraph", "text": "L'acide azélaïque inhibe en partie la tyrosinase, l'enzyme clé de la production de mélanine. Il est surtout efficace sur l'{{hyperpigmentation post-inflammatoire}}, c'est-à-dire ces marques brunes ou rosées qui restent après un bouton, et il est souvent utilisé en dermatologie sur le mélasma. Il agit de préférence sur les zones qui produisent trop de pigment, sans éclaircir la peau saine de façon visible. Il est aussi souvent recommandé pour les peaux mates à foncées, plus sujettes aux marques persistantes. Il faut toutefois de la patience : comptez plusieurs semaines avant de voir une vraie différence."},
        {"type": "heading3", "text": "Pour lisser le grain de peau"},
        {"type": "paragraph", "text": "En régulant le renouvellement cellulaire et en réduisant l'inflammation, il contribue à affiner le grain de peau et à rendre le teint plus uniforme. Ce n'est pas un actif anti-âge à proprement parler, mais un teint plus clair et moins irrité donne mécaniquement bonne mine."},
        {"type": "image", "src": "/image/inline-acide-azelaique-serum.jpg", "caption": "L'acide azélaïque se trouve le plus souvent sous forme de sérum ou de crème-gel légère."},
        {"type": "heading2", "text": "Acide azélaïque : pour quelle peau ?"},
        {"type": "paragraph", "text": "C'est un des acides les plus polyvalents, ce qui explique son succès. Il convient en particulier aux peaux à tendance acnéique, mixtes à grasses, aux peaux avec rougeurs ou rosacée, aux peaux ayant des marques post-boutons, et même aux {{peaux sensibles}} qui supportent mal les AHA et les BHA, à condition de commencer doucement. Il est également une alternative intéressante aux rétinoïdes pour les personnes qui ne les tolèrent pas ou qui ne peuvent pas en utiliser.\nSi votre peau est très sèche ou fortement abîmée au niveau de la barrière cutanée, mieux vaut d'abord la réparer : notre article sur la [[barrière cutanée abîmée|/blog/barriere-cutanee-abimee-signes-comment-reparer]] vous explique comment faire avant d'ajouter un actif. Et si vous ne savez pas quelle routine suit votre type de peau, notre [[routine pour peau acnéique|/routine/peau-acneique]] et notre [[routine pour peau à taches|/routine/peau-a-taches]] donnent une base de départ."},
        {"type": "heading2", "text": "Quelle concentration choisir ?"},
        {"type": "paragraph", "text": "En cosmétique, les produits en vente libre sont généralement dosés à {{10 %}}, comme la [[Suspension d'Acide Azélaïque 10 % de The Ordinary|https://link.amazon/B0eme8W7m]], qui reste la référence la plus accessible, ou le [[Sérum à 10 % d'acide azélaïque de The INKEY List|https://link.amazon/B02j29iV0]]. Les concentrations plus élevées (15 à 20 %) sont réservées aux médicaments : gel à 15 % pour la rosacée, crème à 20 % pour l'acné, délivrés sur ordonnance. Si vous avez de l'acné marquée ou une rosacée installée, un rendez-vous chez le dermatologue ou votre médecin permet d'accéder à ces formules plus puissantes.\nIl existe aussi des {{dérivés}} de l'acide azélaïque, comme celui du [[sérum aPAD de Geek & Gorgeous|https://link.amazon/B070U9yWJ]], dosé à 20 % mais sous une forme dérivée, plus douce et plus stable. Ce n'est pas exactement la même molécule, mais l'objectif est similaire : un effet clarifiant et apaisant avec moins de risque d'inconfort."},
        {"type": "heading2", "text": "Comment utiliser l'acide azélaïque : la routine pas à pas"},
        {"type": "steps", "items": [
            "Nettoyer le visage avec un gel doux, sans savon, à l'eau tiède.",
            "Sécher la peau (appliquer sur peau bien sèche limite les picotements).",
            "Déposer une fine couche d'acide azélaïque sur tout le visage, en évitant le contour des yeux.",
            "Laisser pénétrer 1 à 2 minutes.",
            "Appliquer une crème hydratante adaptée à votre peau.",
            "Le matin, terminer par un écran solaire SPF 30 ou 50.",
        ]},
        {"type": "paragraph", "text": "Commencez {{progressivement}} : une application tous les deux soirs pendant une à deux semaines, puis chaque soir, et enfin matin et soir si votre peau le tolère. Quelques picotements, des démangeaisons légères ou un peu de sécheresse sont fréquents les premiers jours et s'atténuent en général avec le temps. Si l'inconfort persiste ou s'intensifie, espacez les applications ou faites une pause.\nAu quotidien, la routine peut rester très simple. Pour nettoyer, un gel moussant doux comme le [[Gel Moussant de CeraVe|https://link.amazon/B06GPtCJc]] fait très bien l'affaire. Pour hydrater et soutenir la barrière cutanée, la [[Crème Hydratante Visage de CeraVe|https://link.amazon/B0bhj5Esi]] est un classique. Et le matin, un SPF léger comme l'[[Anthelios UVMune 400 Oil Control de La Roche-Posay|https://link.amazon/B06suxJQt]] protège sans laisser de film gras."},
        {"type": "image", "src": "/image/inline-acide-azelaique-routine.jpg", "caption": "Appliquer le soin sur peau propre et sèche, puis hydrater : une routine courte suffit."},
        {"type": "heading2", "text": "Matin ou soir : quand l'appliquer ?"},
        {"type": "paragraph", "text": "Contrairement aux rétinoïdes ou à certains acides exfoliants, l'acide azélaïque n'est pas photosensibilisant. Vous pouvez donc l'utiliser le matin comme le soir. Le plus simple pour beaucoup de personnes est de l'appliquer le {{soir}}, quand la peau se régénère et que l'on n'a pas besoin de maquiller par-dessus. Si vous l'utilisez le matin, laissez-le bien pénétrer avant la crème solaire. Dans tous les cas, l'écran solaire reste indispensable pendant le traitement : les rayons UV entretiennent les taches et aggravent les rougeurs."},
        {"type": "heading2", "text": "Avec quels actifs l'associer ou l'éviter ?"},
        {"type": "paragraph", "text": "L'acide azélaïque s'associe facilement à d'autres actifs. Sa meilleure alliée est la {{niacinamide}}, qui régule le sébum, apaise et renforce la barrière cutanée : la [[Niacinamide 10 % + Zinc 1 % de The Ordinary|https://link.amazon/B0h2WM4Wk]] est une combinaison très populaire, et nous vous expliquons en détail [[ce qu'il faut savoir sur la niacinamide|/blog/niacinamide-bienfaits-avec-quoi-ne-pas-melanger]]. Il se marie aussi très bien avec l'acide hyaluronique, les céramides et le panthénol.\nEn revanche, évitez de cumuler au même moment, surtout au début, l'acide azélaïque avec des actifs puissants et irritants : rétinol ou rétinoïdes forts, peelings, acides glycolique ou salicylique à forte dose, ou vitamine C pure très concentrée. Ce n'est pas formellement interdit, mais la peau risque de mal le supporter. Si vous voulez tout utiliser, alternez les soirs ou séparez-les entre matin et soir."},
        {"type": "heading2", "text": "Notre sélection de sérums et soins à l'acide azélaïque"},
        {"type": "paragraph", "text": "Voici quelques références qui nous semblent intéressantes selon votre budget et votre type de peau. Le [[Sérum Apaisant Acide Azélaïque 10 de medicube|https://link.amazon/B0dnXMtdG]] est une option douce, pensée pour les peaux réactives, tandis que le [[Azelaic Acid Balancing Serum de Q+A|https://link.amazon/B0iXEjlRW]] associe l'acide à du zinc PCA pour resserrer l'aspect des pores. Pour un premier essai, la suspension de The Ordinary et le sérum INKEY List restent des valeurs sûres au meilleur rapport qualité-prix."},
        pblock("sesderma_azelac", "keracnyl_gel", "cleanance_hydra", "effaclar_ai", "nuxe_zinc", "garancia_marabout"),
        {"type": "heading2", "text": "Pour compléter votre routine"},
        {"type": "paragraph", "text": "Un actif ne fonctionne bien que s'il est entouré de produits doux. Voici une sélection pour nettoyer, hydrater et protéger sans irriter une peau déjà sollicitée par l'acide."},
        pblock("cerave_nettoyeur", "cerave_creme", "uriage_bariesun", "pore_refiner", "serum_antiimperfections"),
        {"type": "heading2", "text": "Au bout de combien de temps voit-on les résultats ?"},
        {"type": "paragraph", "text": "Il faut de la patience. Pour les boutons, comptez en général {{4 à 8 semaines}} avant de constater une amélioration nette. Pour les rougeurs, plutôt 8 à 12 semaines. Les taches sont les plus lentes à bouger : trois mois ou plus sont souvent nécessaires, et uniquement avec une protection solaire quotidienne. Pendant les premières semaines, la peau peut même sembler un peu plus réactive avant de se stabiliser : c'est normal tant que l'inconfort reste léger. Prenez une photo au départ, à la lumière du jour, pour pouvoir comparer objectivement."},
        {"type": "heading2", "text": "Effets secondaires, précautions et grossesse"},
        {"type": "paragraph", "text": "L'acide azélaïque est en général bien toléré, mais il peut provoquer des picotements, des brûlures légères, des démangeaisons ou une peau qui pèle au début. Faites toujours un {{test préalable}} sur une petite zone (pli du coude ou derrière l'oreille) avant la première utilisation complète. Arrêtez si vous observez un gonflement, des plaques importantes ou une réaction allergique.\nEn cas de grossesse ou d'allaitement, l'acide azélaïque est souvent cité comme l'un des actifs les mieux tolérés pour traiter les boutons à ce moment-là, mais demandez systématiquement l'avis de votre médecin ou de votre pharmacien avant de l'utiliser. Même conseil si vous avez une peau très réactive, un eczéma actif ou si vous prenez déjà un traitement dermatologique. Cet article est informatif et ne remplace pas un avis médical."},
        {"type": "tips", "items": [
            "Commencez par un soir sur deux, puis augmentez la fréquence selon la tolérance.",
            "Appliquez toujours sur peau propre et sèche, puis hydratez.",
            "Protégez-vous du soleil chaque jour : sans SPF, les taches reviennent.",
            "N'introduisez qu'un nouvel actif à la fois pour savoir lequel convient à votre peau.",
            "Les boutons qui persistent, les rougeurs permanentes ou les kystes douloureux méritent un avis dermatologique.",
        ]},
        {"type": "heading2", "text": "Questions fréquentes sur l'acide azélaïque"},
        {"type": "faq", "items": [
            {"q": "L'acide azélaïque éclaircit-il toute la peau ?", "a": "Non. Il agit surtout sur les zones où la mélanine est produite en excès (marques post-boutons, mélasma) et n'éclaircit pas visiblement la peau saine. C'est pour cela qu'il est souvent recommandé sur les peaux mates à foncées."},
            {"q": "Peut-on utiliser l'acide azélaïque tous les jours ?", "a": "Oui, une fois la peau habituée. Commencez à raison d'un soir sur deux, puis passez à une application quotidienne. Certaines personnes l'utilisent matin et soir si leur peau le tolère."},
            {"q": "Peut-on mélanger acide azélaïque et niacinamide ?", "a": "Oui, c'est même l'un des duos les plus appréciés : la niacinamide régule le sébum et renforce la barrière cutanée pendant que l'acide azélaïque agit sur les boutons, les rougeurs et les taches."},
            {"q": "Quelle est la différence entre acide azélaïque et acide salicylique ?", "a": "L'acide salicylique est un BHA qui nettoie l'intérieur des pores. L'acide azélaïque a en plus un effet anti-inflammatoire et anti-taches, ce qui le rend souvent plus doux pour les peaux sensibles ou rouges."},
            {"q": "L'acide azélaïque est-il compatible avec la grossesse ?", "a": "Il est souvent cité comme l'un des actifs les mieux tolérés pendant la grossesse, mais il faut demander l'avis de son médecin ou de son pharmacien avant tout usage."},
            {"q": "Pourquoi ça pique quand j'en mets ?", "a": "Des picotements légers sont fréquents au début, surtout sur peau humide ou irritée. Appliquez sur peau sèche, espacez les applications et hydratez. Si cela brûle fortement, arrêtez et demandez conseil."},
        ]},
        {"type": "paragraph", "text": "En résumé, l'acide azélaïque est un actif {{polyvalent et doux}}, idéal pour les peaux à boutons, sensibles et marquées. Il demande de la régularité et une bonne protection solaire, mais c'est l'un des rares actifs à pouvoir traiter plusieurs problèmes à la fois. Pour trouver la routine qui correspond à votre peau, faites notre [[diagnostic personnalisé|/routine-360]] et retrouvez les [[meilleurs bons plans beauté|/promos]] du moment."},
    ],
},

# ---------------------------------------------------------------------- #2
{
    "id": "pourquoi-cheveux-ne-poussent-pas",
    "slug": "pourquoi-mes-cheveux-ne-poussent-pas",
    "category": "cheveux",
    "title": "Pourquoi mes cheveux\n{{ne poussent pas}} ?",
    "excerpt": "Cheveux qui stagnent, qui cassent ou qui semblent ne jamais s'allonger : les vraies causes (casse, carences, stress, cuir chevelu) et les solutions pour retrouver de la longueur.",
    "chapo": "Vous avez l'impression que vos cheveux n'ont pas bougé depuis un an, voire qu'ils raccourcissent ? Dans la grande majorité des cas, ils poussent bel et bien : c'est la longueur qui disparaît avant d'être visible, à cause de la casse, d'une carence ou d'un cuir chevelu fatigué. Voici comment faire le tri entre les vraies causes et les fausses bonnes idées.",
    "meta_title": "Pourquoi mes cheveux ne poussent pas ? Causes et solutions",
    "meta_description": "Cheveux qui ne poussent pas : casse, carences, stress, hormones, cuir chevelu... Découvrez les causes possibles, les solutions qui marchent et quand consulter.",
    "image": "/image/hero-cheveux-ne-poussent-pas.jpg",
    "hero_image": "/image/hero-cheveux-ne-poussent-pas.jpg",
    "read_minutes": 11,
    "published_at": "2026-11-08T07:30:00Z",
    "blocks": [
        {"type": "heading2", "text": "À quelle vitesse les cheveux poussent-ils vraiment ?"},
        {"type": "paragraph", "text": "Avant de chercher un problème, un rappel utile : un cheveu pousse en moyenne d'environ {{1 centimètre par mois}}, soit 12 à 15 centimètres par an. Cette vitesse varie selon la génétique, l'âge, le type de cheveu et la santé générale, mais personne ne passe réellement de 5 à 30 centimètres en quelques mois. Autre point important : chaque cheveu passe par un cycle (phase de croissance, de transition, de repos puis de chute), et la durée de la phase de croissance est en grande partie héréditaire. C'est elle qui détermine la {{longueur maximale}} que vos cheveux peuvent atteindre.\nSi vos cheveux ne vous semblent pas pousser, il y a donc deux grandes explications : soit la pousse est ralentie, soit la longueur est perdue au fil du temps. Et la seconde est de loin la plus fréquente."},
        {"type": "heading2", "text": "Cause n°1 : la casse, qui « mange » la longueur"},
        {"type": "paragraph", "text": "Si vos cheveux se cassent à la même vitesse qu'ils poussent, vous n'aurez jamais l'impression de gagner en longueur. On parle de {{rétention de longueur}} : ce n'est pas la pousse qui est le problème, c'est ce qui se passe après. Les pointes sèches, fourchues ou fragilisées par la chaleur, les colorations, les décolorations et les frottements finissent par se casser, parfois bien plus haut que la pointe elle-même.\nLes signes qui trompent : des petits bouts de cheveux de 5 à 10 centimètres sur les vêtements ou la brosse, des longueurs inégales, des pointes qui s'effilent en « queue de rat ». Si c'est votre cas, la priorité est de protéger vos longueurs plutôt que d'acheter un énième produit de pousse."},
        {"type": "image", "src": "/image/inline-cheveux-pointes.jpg", "caption": "Des pointes abîmées cassent et font disparaître la longueur gagnée à la racine."},
        {"type": "heading3", "text": "Comment limiter la casse"},
        {"type": "steps", "items": [
            "Faire une coupe d'entretien de 1 cm tous les 2 à 3 mois pour éliminer les fourches.",
            "Réduire la chaleur : lisseur, sèche-cheveux à fond et fer à boucler fragilisent la fibre.",
            "Démêler avec une brosse adaptée, du bas vers le haut, jamais à sec et brutalement.",
            "Dormir sur une taie en satin ou en soie, ou protéger ses cheveux avec un bonnet.",
            "Éviter les élastiques serrés et les chignons tirés tous les jours.",
            "Appliquer un masque ou un soin sans rinçage sur les longueurs une à deux fois par semaine.",
        ]},
        {"type": "paragraph", "text": "Pour le démêlage, une brosse plate en bambou ou une brosse à démêler pour cheveux mouillés limitent la traction. Pour renforcer la fibre capillaire, un sérum fortifiant comme le [[Sérum Anti-Chute Genesis de Kérastase|https://link.amazon/B0bZPAd8t]] ou le [[Sérum Fiber Booster Anti-Chute de L'Oréal Paris Elseve|https://link.amazon/B0h6XUrRo]] accompagne une routine anti-casse."},
        {"type": "heading2", "text": "Cause n°2 : un cuir chevelu irrité ou déséquilibré"},
        {"type": "paragraph", "text": "Le cuir chevelu est le « sol » où pousse votre cheveu. S'il est enflammé, gras en excès, couvert de pellicules ou irrité par des produits trop agressifs, les follicules travaillent moins bien. Des démangeaisons persistantes, des squames, des rougeurs ou une sensation de brûlure doivent alerter : la dermite séborrhéique et les pellicules sont très courantes et se soignent, mais elles perturbent la pousse tant qu'elles ne sont pas prises en charge.\nUn shampoing doux, adapté à votre type de cuir chevelu, utilisé à une fréquence régulière, est la base. Le [[Shampooing Anti-Chute Dercos Energy+ de Vichy|https://link.amazon/B01yl6X0n]] est un exemple de formule pensée pour les cheveux fragiles. Si les démangeaisons ou les plaques persistent plus de quelques semaines, demandez conseil à un dermatologue plutôt que d'enchaîner les shampoings."},
        {"type": "heading2", "text": "Cause n°3 : les carences nutritionnelles"},
        {"type": "paragraph", "text": "Le cheveu est un tissu qui se renouvelle en permanence, donc très sensible à ce que l'on mange. Un manque de {{fer}} (ou de ferritine, la réserve de fer), de zinc, de vitamine D, de vitamines du groupe B ou de protéines peut ralentir la pousse et augmenter la chute. Les régimes restrictifs, les repas sautés, une alimentation pauvre en protéines, un végétarisme ou un véganisme mal équilibré, ou encore des règles abondantes font partie des situations à risque.\nUne assiette riche en protéines (œufs, poisson, légumineuses, volaille ou alternatives végétales), en bons gras (poissons gras, avocat, noix) et en légumes variés est la base d'une belle pousse. Si vous suspectez une carence, ne vous supplémentez pas au hasard : une prise de sang (ferritine, vitamine D, TSH) prescrite par votre médecin permet de cibler ce qui manque vraiment, car un excès de certains nutriments peut aussi être nocif."},
        {"type": "image", "src": "/image/inline-cheveux-alimentation.jpg", "caption": "Protéines, bons gras et légumes : une alimentation équilibrée nourrit le follicule pileux."},
        {"type": "paragraph", "text": "Les compléments alimentaires peuvent être un coup de pouce lorsque l'alimentation ne suffit pas, comme le [[Forcapil Anti-chute d'Arkopharma|https://link.amazon/B03em7vXT]], mais ils n'ont d'intérêt réel que sur la durée (comptez au minimum trois mois) et ne compensent ni une carence importante ni un problème hormonal. Gardez en tête que les résultats varient d'une personne à l'autre."},
        {"type": "heading2", "text": "Cause n°4 : le stress, la fatigue et les chocs de vie"},
        {"type": "paragraph", "text": "Un stress intense, une maladie, une opération, une grosse fièvre, un régime drastique ou un accouchement peuvent faire basculer une partie des cheveux en phase de repos en même temps. Environ deux à trois mois plus tard, ils tombent en masse : c'est le {{télogène effluvium}} (chute réactionnelle). Elle est impressionnante mais, dans la plupart des cas, temporaire : les cheveux repoussent progressivement, avec un léger décalage. C'est aussi ce qui explique pourquoi la chute du post-partum survient plusieurs mois après la naissance.\nAgir sur la cause (sommeil, gestion du stress, rééquilibrage alimentaire) est plus efficace que n'importe quel produit. Une cure de soins anti-chute peut accompagner cette période, comme le shampooing Anaphase+ de Ducray, pensé pour les cheveux qui tombent (voir notre sélection plus bas)."},
        {"type": "heading2", "text": "Cause n°5 : les hormones et la santé générale"},
        {"type": "paragraph", "text": "Les hormones jouent un rôle central dans le cycle du cheveu. Un dérèglement de la thyroïde (hypo ou hyperthyroïdie), un syndrome des ovaires polykystiques, la ménopause, l'arrêt ou le changement d'une pilule contraceptive, certaines maladies auto-immunes ou certains traitements peuvent provoquer une chute diffuse, un amincissement ou un ralentissement de la pousse. L'alopécie androgénétique, qui touche aussi les femmes, se manifeste souvent par un élargissement de la raie et une perte de densité au sommet du crâne.\nCes situations nécessitent un {{avis médical}} : un généraliste, un dermatologue ou un endocrinologue pourra demander les examens utiles et proposer un traitement adapté. Aucun produit cosmétique ne remplace ce diagnostic."},
        {"type": "heading2", "text": "Cause n°6 : de mauvaises habitudes qui tirent sur la racine"},
        {"type": "paragraph", "text": "Certaines coiffures serrées (queue de cheval très tirée, chignon haut, tresses collées, extensions lourdes) exercent une traction constante sur les follicules. À la longue, cela peut provoquer une {{alopécie de traction}} : les cheveux s'affinent puis disparaissent sur les zones sollicitées, souvent aux tempes et sur le front. Même chose pour les brossages trop vigoureux ou les cheveux démêlés à sec et à la force des bras.\nLaissez vos cheveux respirer, variez les coiffures, et privilégiez des accessoires doux comme les chouchous en satin ou en coton, que l'on trouve par exemple chez Hairlust."},
        {"type": "image", "src": "/image/inline-cheveux-brossage.jpg", "caption": "Un brossage doux, du bas vers le haut, limite la traction sur les racines."},
        {"type": "heading2", "text": "Les solutions qui aident vraiment la pousse"},
        {"type": "heading3", "text": "Le massage du cuir chevelu"},
        {"type": "paragraph", "text": "Masser le cuir chevelu quelques minutes par jour stimule la microcirculation et détend. Une petite étude japonaise a observé une augmentation de l'épaisseur des cheveux après plusieurs mois de massage quotidien. Les résultats restent modestes et il ne s'agit pas d'un traitement, mais c'est un geste gratuit, agréable et sans risque. Un [[masseur de cuir chevelu à picots|https://link.amazon/B06Q87rxv]] rend le geste plus confortable, et vous pouvez compléter avec une huile légère ou un soin. Massez du bout des doigts, sans gratter, avec des petits mouvements circulaires."},
        {"type": "image", "src": "/image/inline-cheveux-massage-cuir-chevelu.jpg", "caption": "Quelques minutes de massage par jour détendent et stimulent la circulation du cuir chevelu."},
        {"type": "heading3", "text": "L'huile de romarin : prometteuse, mais à relativiser"},
        {"type": "paragraph", "text": "L'huile de romarin est très populaire sur les réseaux. Une petite étude de 2015 l'a comparée au minoxidil 2 % et a observé une amélioration comparable au bout de six mois, mais les données restent limitées et il n'existe pas de grandes études. Si vous voulez essayer, utilisez-la toujours {{diluée}} dans une huile végétale (jojoba, ricin, amande douce) et faites un test préalable : pure, elle peut irriter le cuir chevelu. Une huile de romarin pure comme celle de [[Majestic Pure|https://link.amazon/B07V27moZ]] se dilue facilement dans une huile de base. Ne vous attendez pas à un miracle : c'est un complément, pas un traitement de la chute."},
        {"type": "heading3", "text": "Les soins anti-chute et fortifiants"},
        {"type": "paragraph", "text": "Lotions, shampoings, sérums et cures aident à entretenir un cuir chevelu en bonne santé et à fortifier la fibre, mais leur efficacité dépend de la cause. Ils sont surtout utiles en accompagnement, en parallèle de la correction d'une carence ou d'un facteur de stress. Pensez à la régularité : il faut au moins {{trois mois}} d'utilisation pour juger d'un effet, car le cycle du cheveu est lent."},
        {"type": "heading2", "text": "Nos produits coup de cœur contre la casse"},
        {"type": "paragraph", "text": "Notre sélection mélange soins du cuir chevelu, compléments et accessoires doux pour limiter la casse. Chaque produit répond à un besoin précis : choisissez celui qui correspond à votre situation plutôt que de tout acheter."},
        pblock("ducray_antichute", "cystiphane", "lashile_antichute", "lashile_pousse", "pilexil", "ducray_anacaps"),
        {"type": "paragraph", "text": "Et pour protéger vos longueurs au quotidien, ces accessoires et soins limitent les frottements et les cassures :"},
        pblock("hl_brush", "hl_detangler", "hl_pillow", "hl_splitfix", "evoluderm_ricin"),
        {"type": "heading2", "text": "Quand faut-il consulter ?"},
        {"type": "paragraph", "text": "Il est normal de perdre entre {{50 et 100 cheveux par jour}}. En revanche, consultez un médecin ou un dermatologue si vous observez une chute brutale ou très abondante, des plaques sans cheveux, une raie qui s'élargit nettement, un cuir chevelu douloureux, très rouge ou squameux, ou une chute qui dure plus de trois mois. Une prise de sang simple peut déjà orienter le diagnostic (ferritine, thyroïde, vitamine D). Plus la prise en charge est précoce, meilleures sont les chances de récupération. Cet article est informatif et ne remplace pas un avis médical."},
        {"type": "tips", "items": [
            "Photographiez vos cheveux à la même lumière tous les mois : l'évolution se voit mieux que dans le miroir.",
            "Un cheveu pousse d'environ 1 cm par mois : soyez patiente, les résultats se jugent à 3 à 6 mois.",
            "Coupez 1 cm tous les 2 à 3 mois : couper ne ralentit pas la pousse, cela évite la casse.",
            "Ne changez pas tout en même temps : un geste à la fois pour savoir ce qui fonctionne.",
        ]},
        {"type": "paragraph", "text": "Pour aller plus loin, lisez aussi notre guide pour [[faire pousser ses cheveux plus vite|/blog/comment-faire-pousser-ses-cheveux-plus-vite]], qui détaille les routines et les habitudes à adopter au quotidien."},
        {"type": "heading2", "text": "Questions fréquentes sur la pousse des cheveux"},
        {"type": "faq", "items": [
            {"q": "Pourquoi mes cheveux ne poussent plus ?", "a": "Dans la plupart des cas, ils poussent mais cassent aussi vite : la longueur n'est pas conservée. Une carence, du stress, un déséquilibre hormonal ou un cuir chevelu irrité peuvent aussi ralentir la pousse. Si la situation dure, parlez-en à votre médecin."},
            {"q": "Couper les cheveux les fait-il pousser plus vite ?", "a": "Non, la pousse se fait à la racine. En revanche, couper les pointes abîmées limite la casse et vous aide à conserver la longueur."},
            {"q": "Combien de temps pour voir une différence ?", "a": "Comptez au moins trois à six mois. Un cheveu pousse d'environ un centimètre par mois, donc les changements sont lents."},
            {"q": "L'huile de romarin fait-elle pousser les cheveux ?", "a": "Une petite étude a observé une amélioration comparable au minoxidil 2 % après six mois, mais les preuves restent limitées. Utilisez-la diluée et considérez-la comme un complément."},
            {"q": "Les compléments alimentaires sont-ils efficaces ?", "a": "Ils peuvent aider en cas de carence avérée ou d'alimentation déséquilibrée, mais ne remplacent pas un bilan. Demandez l'avis de votre médecin ou de votre pharmacien avant une cure."},
            {"q": "Le stress peut-il vraiment faire tomber les cheveux ?", "a": "Oui, un stress intense ou un choc physique peut provoquer une chute massive deux à trois mois plus tard. Elle est le plus souvent temporaire."},
        ]},
        {"type": "paragraph", "text": "Retenez l'essentiel : avant de chercher un produit miracle, protégez vos longueurs, soignez votre cuir chevelu, mangez équilibré et faites vérifier une éventuelle carence. Pour trouver les soins qui conviennent à vos cheveux, faites notre [[diagnostic beauté personnalisé|/routine-360]] et profitez des [[meilleures promos beauté|/promos]]."},
    ],
},
]


# ---------------------------------------------------------------------------
# Execution : upsert par slug
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    for article in ARTICLES:
        slug = article["slug"]
        result = db.articles.update_one({"slug": slug}, {"$set": article}, upsert=True)
        print(("Article cree : " if result.upserted_id else "Article mis a jour : ") + slug)
        print(f"   -> visible sur /blog/{slug}")

    print(f"\n{len(ARTICLES)} articles traites.")
