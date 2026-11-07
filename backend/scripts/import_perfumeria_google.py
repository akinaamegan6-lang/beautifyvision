#!/usr/bin/env python3
"""Import Perfumeria Comas FR depuis le flux Awin au format "Google" (retail).

Pourquoi ce script : le flux "interface" ne contient aucune info de promo,
alors que le flux Google donne `price` (prix normal) et `sale_price` (prix
remise). On s'en sert pour enregistrer `old_price` (prix barre).

Ce que fait le script :
- Produits DEJA en base : on ne met a jour QUE `price` et `old_price`
  (nom, image, lien, categorie... ne bougent pas). Les identifiants restent
  les memes (uuid5 de "awin-<aw_product_id>"), donc aucun doublon.
  Le lien entre flux : `id` du flux Google == `merchant_product_id` du flux
  interface / de l'ancien flux, qui donne l'aw_product_id.
- Produits NOUVEAUX (absents de la base) : crees avec les memes regles de
  classement que l'import Awin habituel. Les parfums, etuis et coffrets sont
  ecartes. Liste ecrite dans perfumeria_google_nouveaux.csv pour relecture.
- Produits en base mais plus dans le flux (retires par Perfumeria) : simple
  rapport (perfumeria_google_absents.csv), rien n'est supprime.

Usage (depuis backend/, venv active) :
  python3 scripts/import_perfumeria_google.py --dry-run          # simulation
  python3 scripts/import_perfumeria_google.py --dry-run --check-db  # simulation avec la vraie base (lecture seule)
  python3 scripts/import_perfumeria_google.py                    # import reel

Options : --feed CHEMIN  --old-feed CHEMIN  --interface-feed CHEMIN
"""
import csv
import html
import os
import re
import sys
import uuid
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import import_awin_feed as A  # noqa: E402

csv.field_size_limit(10**9)

SCRIPTS_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPTS_DIR.parent
PROJECT_DIR = BACKEND_DIR.parent
MERCHANT_ID = "105475"
MERCHANT_NAME = "Perfumeria Comas FR"
MIN_DISCOUNT_PCT = 5  # en dessous, on n'affiche pas de prix barre

RE_SET = re.compile(r"\b(coffrets?|cofres?|estuches?|sets?|kits?|trousses?|packs?|duos?|trios?|lots?)\b", re.I)
PERFUME_ROOTS = {"parfums", "parfums niche", "parfums de niche", "fragrance", "etuis", "étuis"}


def arg_value(flag, default=None):
    if flag in sys.argv:
        i = sys.argv.index(flag)
        if i + 1 < len(sys.argv):
            return sys.argv[i + 1]
    return default


def first_existing(*paths):
    for p in paths:
        if p and Path(p).exists():
            return Path(p)
    return None


def parse_price(s):
    m = re.search(r"\d+(?:[.,]\d+)?", s or "")
    return float(m.group().replace(",", ".")) if m else 0.0


def load_csv(path):
    with open(path, newline="", encoding="utf-8-sig", errors="replace") as f:
        return list(csv.DictReader(f))


def aw_id_map(paths):
    """merchant_product_id -> aw_product_id pour Perfumeria."""
    mp = {}
    for p in paths:
        if not p:
            continue
        for r in load_csv(p):
            if (r.get("merchant_id") or "").strip() != MERCHANT_ID:
                continue
            m, a = (r.get("merchant_product_id") or "").strip(), (r.get("aw_product_id") or "").strip()
            if m and a:
                mp.setdefault(m, a)
    return mp


def stable_id(gid, mp):
    aw = mp.get(gid)
    if aw:
        return str(uuid.uuid5(uuid.NAMESPACE_URL, f"awin-{aw}")), True
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"perfumeria-{gid}")), False


def prices(row):
    price = parse_price(row.get("price"))
    sale = parse_price(row.get("sale_price"))
    if sale > 0 and price > 0 and sale < price and 100 * (price - sale) / price >= MIN_DISCOUNT_PCT:
        return round(sale, 2), round(price, 2)
    current = sale if 0 < sale < price else price  # petite remise (<5 %) : prix actuel sans barre
    return round(current, 2), None


def build_doc(row, slug, parent, price, old_price, sid):
    name = html.unescape((row.get("title") or "").strip())
    brand = A.norm_brand(html.unescape(row.get("brand") or ""))
    text = f"{name} {row.get('description') or ''}"
    return {
        "id": sid,
        "category": slug,
        "parent": parent,
        "name": name,
        "brand": brand,
        "price": price,
        "old_price": old_price,
        "rating": A.RATING_DEFAULT,
        "reviews": A.REVIEWS_DEFAULT,
        "image": (row.get("image_link") or "").strip(),
        "tags": A.extract_matches(text, A.TAG_PATTERNS),
        "skin_types": A.extract_matches(text, A.SKIN_TYPE_PATTERNS),
        "hair_types": A.extract_matches(text, A.HAIR_TYPE_PATTERNS),
        "benefits": A.extract_matches(text, A.BENEFIT_PATTERNS),
        "color_hex": None,
        "zone": A.CATEGORY_ZONE.get(slug),
        "affiliate_url": (row.get("aw_deep_link") or "#").strip() or "#",
        "source": "awin",
        "source_merchant": MERCHANT_NAME,
    }


def exclusion_reason(row, for_new):
    """Raison d'ecarter un produit du flux Google (None = on garde)."""
    ptype = (row.get("product_type") or "").strip()
    root = A.norm_text(ptype.split(">")[0]).strip()
    gcat = (row.get("google_product_category") or "")
    if root in {A.norm_text(x) for x in PERFUME_ROOTS} or "Perfume & Cologne" in gcat:
        return "parfum / etui"
    pn = A.norm_text(ptype)
    if any(A.norm_text(b) in pn for b in A.EXCLUDE_PATH_CONTAINS):
        return "chemin hors sujet"
    if not A.norm_brand(row.get("brand") or ""):
        return "sans marque"
    if not (row.get("title") or "").strip():
        return "sans nom"
    if parse_price(row.get("price")) <= 0:
        return "sans prix"
    if for_new and (RE_SET.search(row.get("title") or "") or "Sets" in gcat or "coffret" in pn):
        return "coffret / set (a traiter plus tard)"
    return None


def main():
    dry_run = "--dry-run" in sys.argv
    check_db = "--check-db" in sys.argv or not dry_run
    feed = first_existing(arg_value("--feed"), PROJECT_DIR / "105475-retail-fr_FR.csv", PROJECT_DIR.parent / "105475-retail-fr_FR.csv")
    old_feed = first_existing(arg_value("--old-feed"), PROJECT_DIR / "datafeed_2923665.csv")
    itf_feed = first_existing(arg_value("--interface-feed"), PROJECT_DIR / "105475-97867-fr_FR-Perfumerias_Comas_FR_PDF.csv",
                              PROJECT_DIR.parent / "105475-97867-fr_FR-Perfumerias_Comas_FR_PDF.csv")
    if not feed:
        print("Flux Google introuvable : indique-le avec --feed chemin.csv")
        sys.exit(1)
    mp = aw_id_map([old_feed, itf_feed])
    print(f"Flux Google : {feed}\nCorrespondances id Perfumeria -> aw_product_id : {len(mp)}")

    col = None
    if check_db:
        from pymongo import MongoClient
        import certifi
        client = MongoClient(os.environ["MONGO_URL"], tlsCAFile=certifi.where())
        col = client[os.environ["DB_NAME"]]["products"]

    rows = load_csv(feed)
    kept = rows

    # ids deja en base
    ids = {}
    for r in kept:
        sid, mapped = stable_id(r["id"].strip(), mp)
        ids[r["id"].strip()] = (sid, mapped)

    if col is not None:
        in_db = {d["id"] for d in col.find({"id": {"$in": [v[0] for v in ids.values()]}}, {"id": 1, "_id": 0})}
    else:
        # simulation sans base : on rejoue l'ancien import sur l'ancien flux
        in_db = set()
        if old_feed:
            for r in load_csv(old_feed):
                if (r.get("merchant_id") or "").strip() != MERCHANT_ID or (r.get("category_name") or "").strip() in A.EXCLUDE_CATEGORY_NAME:
                    continue
                pn = A.norm_text(r.get("merchant_category") or "")
                if any(A.norm_text(b) in pn for b in A.EXCLUDE_PATH_CONTAINS) or not A.norm_brand(r.get("brand_name") or ""):
                    continue
                try:
                    if float(r.get("search_price") or 0) <= 0:
                        continue
                except ValueError:
                    continue
                slug, _ = A.classify(r.get("product_name", ""), r.get("description", ""), r.get("merchant_category", ""))
                if slug:
                    in_db.add(str(uuid.uuid5(uuid.NAMESPACE_URL, f"awin-{r['aw_product_id'].strip()}")))

    updates, news, new_excluded, unclassified = [], [], Counter(), []
    promo_existing = promo_new = 0
    seen_new = set()
    feed_ids = set()
    for r in kept:
        gid = r["id"].strip()
        sid, mapped = ids[gid]
        feed_ids.add(sid)
        price, old = prices(r)
        if price <= 0:
            continue
        if sid in in_db:
            updates.append((sid, price, old))
            promo_existing += 1 if old else 0
            continue
        why = exclusion_reason(r, for_new=True)
        if why:
            new_excluded[why] += 1
            continue
        dkey = (A.norm_text(r.get("brand") or ""), A.norm_text(r.get("title") or ""), (r.get("link") or "").strip())
        if dkey in seen_new:
            new_excluded["declinaison de teinte en double"] += 1
            continue
        seen_new.add(dkey)
        slug, parent = A.classify(r["title"], r.get("description") or "", r.get("product_type") or "")
        if not slug:
            new_excluded["non classifie"] += 1
            unclassified.append(f"{r.get('brand')} | {r['title']} | {r.get('product_type')}")
            continue
        news.append(build_doc(r, slug, parent, price, old, sid))
        promo_new += 1 if old else 0

    # produits Perfumeria en base mais plus dans le flux
    absents = []
    if col is not None:
        for d in col.find({"affiliate_url": {"$regex": f"(?:[?&]m=|awinmid=){MERCHANT_ID}(?:&|$)"}},
                          {"id": 1, "name": 1, "brand": 1, "category": 1, "_id": 0}):
            if d["id"] not in feed_ids:
                absents.append(d)
    else:
        pass

    inserted = modified = 0
    if not dry_run:
        for sid, price, old in updates:
            upd = {"$set": {"price": price, "old_price": old}} if old else {"$set": {"price": price}, "$unset": {"old_price": ""}}
            res = col.update_one({"id": sid}, upd)
            modified += res.modified_count
        for doc in news:
            col.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
            inserted += 1

    # rapports
    with open(SCRIPTS_DIR / "perfumeria_google_nouveaux.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["categorie", "marque", "nom", "prix", "ancien_prix", "chemin_perfumeria"])
        for d in sorted(news, key=lambda d: (d["category"], d["brand"], d["name"])):
            w.writerow([d["category"], d["brand"], d["name"], d["price"], d["old_price"] or "", ""])
    if absents:
        with open(SCRIPTS_DIR / "perfumeria_google_absents.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["categorie", "marque", "nom", "id"])
            for d in absents:
                w.writerow([d.get("category"), d.get("brand"), d.get("name"), d["id"]])

    rep = [
        f"Mode : {'SIMULATION' if dry_run else 'IMPORT REEL'} ({'base reelle' if col is not None else 'base simulee depuis ancien flux'})",
        f"Lignes du flux Google : {len(rows)}",
        "Lignes du flux non retrouvees en base : voir ci-dessous (nouveaux / ecartes)",
        f"Produits deja en base retrouves dans le flux : {len(updates)} (dont {promo_existing} en promo -> prix barre)",
        f"Produits nouveaux a ajouter : {len(news)} (dont {promo_new} en promo)",
        "Absents de la base et ecartes (parfums, etuis, hors sujet...) : " + str(sum(new_excluded.values())),
    ] + [f"    {n:5d}  {k}" for k, n in new_excluded.most_common()] + [
        "Nouveaux par categorie : " + ", ".join(f"{k} {n}" for k, n in Counter(d['category'] for d in news).most_common()),
        (f"Produits en base mais plus dans le flux (non supprimes) : {len(absents)}" if col is not None else "Produits en base absents du flux : voir avec --check-db"),
    ]
    if not dry_run:
        rep.append(f"ECRIT : {modified} prix mis a jour, {inserted} produits ajoutes")
    text = "\n".join(rep)
    print(text)
    (SCRIPTS_DIR / "import_perfumeria_google_report.txt").write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
