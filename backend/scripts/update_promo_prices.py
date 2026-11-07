#!/usr/bin/env python3
"""Met a jour prix + ancien prix (prix barre) des produits DocMorris et Beauty Success deja en base.

- DocMorris (Awin) : flux datafeed -> colonnes search_price (prix actuel) et
  product_price_old (ancien prix, rempli quand il y a une promo).
- Beauty Success (Effiliation) : price (prix actuel) et price_norebate (prix avant remise).

Ne cree aucun produit et ne touche a rien d'autre que `price` et `old_price`.
Un prix barre n'est enregistre que si la remise est comprise entre 5 % et 80 %
(en dessous c'est du bruit, au-dessus c'est presque toujours un prix de
reference non realiste). Sinon `old_price` est supprime du produit.

Usage (depuis backend/, venv active) :
  python3 scripts/update_promo_prices.py --dry-run             # simulation (lit la base, n'ecrit rien)
  python3 scripts/update_promo_prices.py                       # mise a jour reelle
Options : --docmorris CHEMIN  --beautysuccess CHEMIN  --only docmorris|beautysuccess
"""
import csv
import os
import re
import sys
import uuid
from collections import Counter
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

csv.field_size_limit(10**9)
HERE = Path(__file__).resolve().parent
BACKEND = HERE.parent
PROJECT = BACKEND.parent
load_dotenv(BACKEND / ".env")

MIN_PCT, MAX_PCT = 5, 80
DOCMORRIS_MID = "16148"


def arg(flag, default=None):
    if flag in sys.argv:
        i = sys.argv.index(flag)
        if i + 1 < len(sys.argv):
            return sys.argv[i + 1]
    return default


def num(s):
    m = re.search(r"\d+(?:[.,]\d+)?", s or "")
    return float(m.group().replace(",", ".")) if m else 0.0


def promo(price, old):
    """Retourne l'ancien prix a afficher barre, ou None."""
    if price > 0 and old > price:
        pct = 100 * (old - price) / old
        if MIN_PCT <= pct <= MAX_PCT:
            return round(old, 2)
    return None


def feed_docmorris(path):
    out = {}
    with open(path, newline="", encoding="utf-8", errors="replace") as f:
        for r in csv.DictReader(f):
            if (r.get("merchant_id") or "").strip() != DOCMORRIS_MID:
                continue
            aw = (r.get("aw_product_id") or "").strip()
            if not aw:
                continue
            out[str(uuid.uuid5(uuid.NAMESPACE_URL, f"awin-{aw}"))] = (num(r.get("search_price")), num(r.get("product_price_old")))
    return out


def feed_beautysuccess(path):
    out = {}
    with open(path, newline="", encoding="utf-8-sig", errors="replace") as f:
        for r in csv.DictReader(f, delimiter=";"):
            pid = (r.get("id") or "").strip()
            if not pid:
                continue
            out[str(uuid.uuid5(uuid.NAMESPACE_URL, f"beautysuccess-{pid}"))] = (num(r.get("price")), num(r.get("price_norebate")))
    return out


def process(label, col, feed, db_filter, dry_run, report):
    in_db = {d["id"]: d for d in col.find(db_filter, {"id": 1, "price": 1, "old_price": 1, "_id": 0})}
    found = [i for i in in_db if i in feed]
    missing = len(in_db) - len(found)
    n_promo = n_price_changed = 0
    pcts = Counter()
    for pid in found:
        price, old = feed[pid]
        if price <= 0:
            continue
        o = promo(price, old)
        d = in_db[pid]
        if o:
            n_promo += 1
            pcts[int(100 * (o - price) / o) // 10 * 10] += 1
        if abs(d["price"] - price) > 0.005:
            n_price_changed += 1
        if not dry_run:
            if o:
                col.update_one({"id": pid}, {"$set": {"price": round(price, 2), "old_price": o}})
            else:
                col.update_one({"id": pid}, {"$set": {"price": round(price, 2)}, "$unset": {"old_price": ""}})
    report.append(f"{label} : {len(in_db)} produits en base, {len(found)} retrouves dans le flux, {missing} absents du flux (laisses tels quels)")
    report.append(f"  -> {n_promo} en promo (prix barre), {n_price_changed} avec un prix actuel different de la base")
    report.append("  remises par tranche (%) : " + ", ".join(f"{k}-{k+10}: {v}" for k, v in sorted(pcts.items())))


def main():
    dry_run = "--dry-run" in sys.argv
    only = arg("--only")
    client = MongoClient(os.environ["MONGO_URL"], tlsCAFile=__import__("certifi").where())
    col = client[os.environ["DB_NAME"]]["products"]
    report = [f"Mode : {'SIMULATION (rien n ecrit)' if dry_run else 'MISE A JOUR REELLE'}"]

    if only in (None, "docmorris"):
        path = arg("--docmorris") or next((str(p) for p in [PROJECT / "datafeed_2923665.csv-2"] if p.exists()), None)
        if path:
            feed = feed_docmorris(path)
            process("DocMorris", col, feed, {"affiliate_url": {"$regex": f"[?&]m={DOCMORRIS_MID}(?:&|$)"}}, dry_run, report)
        else:
            report.append("DocMorris : flux introuvable (--docmorris chemin)")

    if only in (None, "beautysuccess"):
        path = arg("--beautysuccess") or next((str(p) for p in [PROJECT / "products_405179742-2.csv"] if p.exists()), None)
        if path:
            feed = feed_beautysuccess(path)
            process("Beauty Success", col, feed, {"source_merchant": "Beauty Success"}, dry_run, report)
        else:
            report.append("Beauty Success : flux introuvable (--beautysuccess chemin)")

    text = "\n".join(report)
    print(text)
    (HERE / "update_promo_prices_report.txt").write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
