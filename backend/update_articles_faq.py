"""
Script ponctuel : ajoute une FAQ (et ajuste titre/description SEO) aux articles
existants "niacinamide" et "comment faire pousser ses cheveux plus vite".
Idempotent : si l'article a deja un bloc FAQ, rien n'est ajoute.

    cd backend
    source venv/bin/activate
    python3 update_articles_faq.py
"""
import os
from pathlib import Path

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

os.environ.setdefault("SSL_CERT_FILE", certifi.where())
load_dotenv(Path(__file__).parent / ".env")

client = MongoClient(os.environ["MONGO_URL"], tlsCAFile=certifi.where())
db = client[os.environ["DB_NAME"]]

UPDATES = {
    "niacinamide-bienfaits-avec-quoi-ne-pas-melanger": {
        "meta": {
            "meta_title": "Niacinamide : bienfaits et avec quoi ne pas la mélanger",
            "meta_description": "Niacinamide : bienfaits, concentration idéale (2 à 5 %) et réponse claire à « avec quoi ne pas la mélanger » : vitamine C, acides, rétinol, qui peut l'utiliser.",
        },
        "heading": "Questions fréquentes sur la niacinamide",
        "faq": [
            {"q": "Avec quoi ne faut-il pas mélanger la niacinamide ?",
             "a": "Aucun actif n'est réellement interdit avec la niacinamide, c'est l'un des ingrédients les plus faciles à associer. Par précaution, on espace la vitamine C pure à pH très bas (vitamine C le matin, niacinamide le soir) et on évite d'empiler plusieurs acides exfoliants (AHA/BHA) au même moment. Si votre peau picote ou rougit, on sépare simplement les produits entre matin et soir."},
            {"q": "Peut-on associer niacinamide et rétinol ?",
             "a": "Oui, c'est même une association appréciée : la niacinamide aide à mieux tolérer le rétinol en renforçant la barrière cutanée. On peut les appliquer le même soir (niacinamide d'abord) ou les alterner si la peau est sensible."},
            {"q": "Peut-on utiliser la niacinamide avec la vitamine C ?",
             "a": "Oui avec les formules modernes et stabilisées. Les anciennes craintes d'incompatibilité concernaient surtout la vitamine C pure à pH très bas. Dans le doute, la vitamine C se met le matin et la niacinamide le soir."},
            {"q": "Quelle concentration de niacinamide choisir ?",
             "a": "Entre 2 et 5 % pour débuter, et jusqu'à 10 % si votre peau le supporte. Au-delà, le risque de rougeurs augmente sans bénéfice prouvé supplémentaire pour la plupart des peaux."},
            {"q": "En combien de temps voit-on les résultats ?",
             "a": "Comptez 4 à 8 semaines d'usage régulier pour constater un effet visible sur le grain de peau, les pores et la brillance. Les taches demandent généralement plus de temps et une protection solaire quotidienne."},
            {"q": "La niacinamide convient-elle aux peaux sensibles ?",
             "a": "Dans la majorité des cas oui, car elle apaise et renforce la barrière cutanée. Commencez par une faible concentration, testez sur une petite zone et introduisez-la progressivement. En cas de pathologie cutanée, demandez l'avis d'un dermatologue."},
        ],
    },
    "comment-faire-pousser-ses-cheveux-plus-vite": {
        "meta": {
            "meta_title": "Comment faire pousser ses cheveux plus vite : la méthode réaliste",
            "meta_description": "Comment faire pousser les cheveux plus vite ? Vitesse de pousse réelle, massage du cuir chevelu, alimentation, anti-casse : la méthode réaliste et ce qui ne marche pas.",
        },
        "heading": "Questions fréquentes sur la pousse des cheveux",
        "faq": [
            {"q": "À quelle vitesse poussent les cheveux ?",
             "a": "En moyenne de 1 à 1,5 cm par mois, soit 12 à 15 cm par an. Cette vitesse dépend surtout de la génétique et de l'âge, et elle ne peut pas être doublée par un produit."},
            {"q": "Comment faire pousser ses cheveux plus vite en un mois ?",
             "a": "En un mois, on ne peut pas accélérer la pousse, mais on peut réduire la casse pour conserver toute la longueur gagnée : moins de chaleur, démêlage doux, pointes entretenues, cuir chevelu massé et alimentation suffisante en protéines, fer et zinc."},
            {"q": "Le massage du cuir chevelu fait-il vraiment pousser les cheveux ?",
             "a": "Il stimule la microcirculation et contribue à un cuir chevelu en bonne santé, ce qui crée de bonnes conditions pour la pousse. Les preuves sont modestes : c'est un bon complément, pas un traitement."},
            {"q": "Les compléments alimentaires aident-ils à faire pousser les cheveux ?",
             "a": "Ils peuvent aider si vous avez une carence (fer, zinc, vitamine D, protéines). Sans carence, l'effet est limité. En cas de chute importante ou soudaine, faites un bilan avec votre médecin."},
            {"q": "Faut-il couper ses cheveux pour qu'ils poussent plus vite ?",
             "a": "Couper les pointes n'accélère pas la pousse à la racine, mais retirer les pointes abîmées évite que la casse remonte et fait gagner de la longueur visible sur la durée. Une coupe tous les 2 à 3 mois est un bon repère."},
            {"q": "Combien de temps avant de voir une différence ?",
             "a": "Comptez 3 à 6 mois de routine régulière pour constater un effet visible sur la longueur et l'état général des cheveux."},
        ],
    },
}

for slug, upd in UPDATES.items():
    art = db.articles.find_one({"slug": slug})
    if not art:
        print(f"Introuvable : {slug}")
        continue
    blocks = art.get("blocks", [])
    changes = dict(upd["meta"])
    if any(b.get("type") == "faq" for b in blocks):
        print(f"FAQ deja presente : {slug} (meta mises a jour seulement)")
    else:
        blocks = blocks + [
            {"type": "heading2", "text": upd["heading"]},
            {"type": "faq", "items": upd["faq"]},
        ]
        changes["blocks"] = blocks
        print(f"FAQ ajoutee : {slug}")
    db.articles.update_one({"slug": slug}, {"$set": changes})
print("Termine.")
