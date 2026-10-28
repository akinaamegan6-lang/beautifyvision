import { MIN_GOOD_MATCH_SCORE } from "./scoring";

// Choisit, pour chaque étape de la routine, le produit à mettre en avant en
// tenant compte :
//  - du budget total (si possible : on remplace les produits les plus chers par
//    des alternatives moins chères sans trop perdre en compatibilité) ;
//  - d'un même produit qui ne doit pas apparaître sur deux étapes.
//
// `recos` : { slug: [produits classés par rankProducts] }.
// Retourne { recos: (mêmes listes, avec le produit choisi en tête de chaque
// étape), total, maxBudget, overBudget }.
export function optimizeRoutine(selected, recos, maxBudget) {
  const good = {};
  for (const slug of selected) {
    good[slug] = (recos[slug] || []).filter(
      (p) => p._score >= MIN_GOOD_MATCH_SCORE && typeof p.price === "number" && p.price > 0
    );
  }

  // 1. Meilleur produit de chaque étape, sans doublon entre étapes. Les étapes
  // dont le meilleur score est le plus haut choisissent en premier.
  const order = [...selected].sort((a, b) => (good[b][0]?._score || 0) - (good[a][0]?._score || 0));
  const pick = {};
  const used = new Set();
  for (const slug of order) {
    const first = good[slug].find((p) => !used.has(p.id));
    if (first) { pick[slug] = first; used.add(first.id); }
  }
  const totalOf = () => Object.values(pick).reduce((sum, p) => sum + p.price, 0);

  // 2. Si on dépasse le budget : on enchaîne les remplacements les plus
  // "rentables" (grosse économie, petite perte de compatibilité).
  if (maxBudget > 0) {
    let guard = 200;
    while (totalOf() > maxBudget && guard-- > 0) {
      let best = null;
      for (const slug of Object.keys(pick)) {
        const cur = pick[slug];
        for (const cand of good[slug]) {
          if (cand.id === cur.id || cand.price >= cur.price) continue;
          if (Object.entries(pick).some(([s2, p2]) => s2 !== slug && p2.id === cand.id)) continue;
          const saving = cur.price - cand.price;
          const loss = Math.max(0, cur._score - cand._score);
          const ratio = (loss + 3) / saving; // plus petit = meilleur
          if (!best || ratio < best.ratio) best = { slug, cand, ratio };
        }
      }
      if (!best) break;
      pick[best.slug] = best.cand;
    }
  }

  const total = Math.round(totalOf() * 100) / 100;
  const out = {};
  for (const slug of selected) {
    const list = recos[slug] || [];
    const chosen = pick[slug];
    out[slug] = chosen ? [chosen, ...list.filter((p) => p.id !== chosen.id)] : list;
  }
  return {
    recos: out,
    total,
    maxBudget: maxBudget || null,
    overBudget: !!maxBudget && total > maxBudget,
  };
}
