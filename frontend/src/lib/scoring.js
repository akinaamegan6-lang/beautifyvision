// Compatibility scoring algorithm
import { BUDGET_RANGES } from "../data/quizConfig";
import { getProfile } from "./profile";

function contains(arr, needle) {
  if (!arr || !needle) return false;
  const n = needle.toLowerCase();
  return arr.some((x) => x.toLowerCase().includes(n) || n.includes(x.toLowerCase()));
}

const HAIR_PROBLEM_SCORE_MAP = {
  "chute":               { hair_types: ["fins"],                            keywords: ["anti-chute", "fortifiant", "biotine", "densifiant", "volume"] },
  "cheveux-gras":        { hair_types: ["gras"],                            keywords: ["sébo", "purifiant", "légèreté", "équilibre", "zinc"] },
  "cheveux-secs":        { hair_types: ["secs"],                            keywords: ["nutrition", "hydrat", "nourriss", "réparateur", "karité", "argan"] },
  "pellicules":          { hair_types: ["gras"],                            keywords: ["antipelliculaire", "zinc", "cuir chevelu", "purifiant"] },
  "cheveux-colores":     { hair_types: ["colorés"],                         keywords: ["colorés", "protège couleur", "brillance", "réparateur", "kératine"] },
  "frisottis":           { hair_types: ["bouclés", "frisés", "crépus"],     keywords: ["anti-frisottis", "lissant", "frisottis", "domptage"] },
  "manque-volume":       { hair_types: ["fins"],                            keywords: ["volume", "légèreté", "densifiant", "gonflant"] },
  "cuir-chevelu-sensible": { hair_types: ["sensibles"],                     keywords: ["apaisant", "sensible", "sans parfum", "douceur"] },
  "pointes-fourchues":   { hair_types: ["secs", "abîmés"],                  keywords: ["pointes", "réparateur", "anti-casse", "kératine"] },
};

const PROBLEM_SCORE_MAP = {
  "acne":      { skin_types: ["acneique", "grasse"],    keywords: ["acné", "anti-acné", "matifiant", "purifiant", "imperfections", "sébo", "salicylique"] },
  "peau-seche":{ skin_types: ["seche"],                 keywords: ["hydrat", "nourri", "réparat", "barrière", "déshydrat"] },
  "rougeurs":  { skin_types: ["sensible"],              keywords: ["apaisant", "calmant", "rougeurs", "anti-rougeurs", "couperose"] },
  "taches":    { skin_types: [],                        keywords: ["taches", "anti-taches", "éclat", "teint", "unifiant", "illuminat", "dépigment", "vitamine c"] },
  "anti-age":  { skin_types: ["mature"],                keywords: ["anti-âge", "rides", "fermeté", "repulp", "raffermi", "lifting", "collagène", "rétinol"] },
  "pores":     { skin_types: [],                        keywords: ["pores", "matifiant", "sébo", "purifiant", "resserrer"] },
  "eczema":    { skin_types: ["sensible"],              keywords: ["eczéma", "atopique", "apaisant", "sans parfum", "hypoallergén", "tolérance"] },
  "psoriasis": { skin_types: ["sensible"],              keywords: ["apaisant", "sans parfum", "tolérance", "hypoallergén"] },
  "vitiligo":  { skin_types: [],                        keywords: ["solaire", "spf", "protection", "apaisant"] },
  "sensible":  { skin_types: ["sensible"],              keywords: ["sensible", "apaisant", "sans parfum", "sans alcool", "hypoallergén", "douceur"] },
  "sebum":     { skin_types: ["grasse", "mixte"],       keywords: ["matifiant", "sébo", "régulat", "pores", "brillance"] },
  "cernes":    { skin_types: [],                        keywords: ["cernes", "contour yeux", "poches", "anti-fatigue", "regard"] },
};

// --- Préoccupations du quiz "Routine 360°" (skin_concerns / body_concerns /
// hair_concerns) : mêmes libellés que les options affichées dans le quiz
// (data/quizConfig.js). On s'appuie sur la vraie catégorie du produit (déduite
// par l'import Awin) en priorité, puis sur les types de peau/cheveux et les
// bénéfices détectés dans le texte réel du produit — jamais d'invention.
const SKIN_CONCERN_SCORE_MAP = {
  "Acné / Imperfections":        { categories: ["exfoliant", "masque"],                 skin_types: ["acneique", "grasse"], benefits: ["Purifiant", "Matifiant"] },
  "Pores dilatés":                { categories: ["exfoliant"],                           skin_types: ["grasse", "mixte"],    benefits: ["Purifiant", "Matifiant"] },
  "Taches & hyperpigmentation":  { categories: [],                                       skin_types: [],                     benefits: ["Anti-taches", "Éclat"] },
  "Teint terne":                  { categories: ["brume", "exfoliant"],                   skin_types: [],                     benefits: ["Éclat"] },
  "Rides & anti-âge":            { categories: ["serum", "contour-yeux"],                skin_types: ["mature"],             benefits: ["Anti-âge"] },
  "Rougeurs & couperose":        { categories: [],                                       skin_types: ["sensible"],           benefits: ["Apaisant"] },
  "Sensibilité & réactivité":    { categories: [],                                       skin_types: ["sensible"],           benefits: ["Apaisant"] },
  "Déshydratation":               { categories: ["creme-hydratante", "serum", "huile-visage"], skin_types: ["seche"],        benefits: ["Hydratation intense"] },
  "Excès de sébum":              { categories: [],                                       skin_types: ["grasse"],             benefits: ["Matifiant", "Purifiant"] },
  "Cernes & poches":              { categories: ["contour-yeux"],                         skin_types: [],                     benefits: [] },
};

const BODY_CONCERN_SCORE_MAP = {
  "Vergetures":              { categories: ["vergetures"],                               benefits: [] },
  "Cellulite":                { categories: ["gommage-corps", "huile-corps"],              benefits: [] },
  "Peau qui tiraille":       { categories: ["lait-corporel", "beurre-corporel", "creme-corps", "huile-corps"], benefits: ["Hydratation intense"] },
  "Démangeaisons":           { categories: [],                                            benefits: ["Apaisant"] },
  "Taches corporelles":     { categories: [],                                            benefits: ["Anti-taches"] },
  "Cicatrices":              { categories: [],                                            benefits: ["Réparateur"] },
  "Acné corps":              { categories: ["gommage-corps"],                             benefits: ["Purifiant"] },
  "Peau terne":              { categories: ["gommage-corps"],                             benefits: ["Éclat"] },
  "Transpiration excessive":{ categories: ["deodorant"],                                 benefits: [] },
};

const HAIR_CONCERN_SCORE_MAP = {
  "Chute":                 { categories: ["soin-anti-chute"],                 hair_types: ["fins"],                     benefits: ["Anti-chute", "Fortifiant"] },
  "Casse":                 { categories: [],                                  hair_types: ["secs", "abîmés"],           benefits: ["Réparateur", "Fortifiant"] },
  "Pointes sèches":        { categories: ["huile-cheveux", "serum-cheveux"],  hair_types: ["secs", "abîmés"],           benefits: ["Nutrition intense", "Réparateur"] },
  "Pellicules":            { categories: ["soin-cuir-chevelu"],               hair_types: ["gras"],                     benefits: ["Antipelliculaire"] },
  "Perte d'éclat":         { categories: [],                                  hair_types: [],                           benefits: ["Brillance"] },
  "Frisottis":             { categories: ["spray-coiffant"],                  hair_types: ["bouclés", "frisés", "crépus"], benefits: ["Anti-frisottis"] },
  "Cheveux colorés":       { categories: ["soin-cheveux-colores"],            hair_types: ["colorés"],                  benefits: [] },
  "Cheveux abîmés":        { categories: ["masque-cheveux", "huile-cheveux"], hair_types: ["abîmés", "secs"],           benefits: ["Réparateur", "Nutrition intense"] },
  "Manque de volume":      { categories: [],                                  hair_types: ["fins"],                     benefits: ["Volume"] },
};

function concernBonus(product, label, map) {
  const rule = map[label];
  if (!rule) return { bonus: 0, reasons: [] };
  let bonus = 0;
  const reasons = [];
  if (rule.categories?.length && rule.categories.includes(product.category)) {
    bonus += 25;
    reasons.push(label.toLowerCase());
  }
  if (rule.skin_types?.length && rule.skin_types.some((t) => (product.skin_types || []).includes(t))) {
    bonus += 15;
  }
  if (rule.hair_types?.length && rule.hair_types.some((t) => (product.hair_types || []).includes(t))) {
    bonus += 15;
  }
  for (const b of rule.benefits || []) {
    if (contains(product.benefits || [], b) || contains(product.tags || [], b)) {
      bonus += 10;
      reasons.push(b.toLowerCase());
    }
  }
  return { bonus: Math.min(40, bonus), reasons };
}

// --- Ingrédients à éviter / allergies -------------------------------------
// Le flux Awin ne contient pas la liste INCI complète des produits : on ne
// peut donc pas garantir à 100% qu'un produit est totalement exempt d'un
// ingrédient. On utilise les vrais signaux disponibles (nom du produit, tags
// et bénéfices détectés par l'import à partir du texte réel du produit) :
//  - si le produit affiche un tag "Sans X" -> on le FAVORISE nettement
//    (il a été explicitement vérifié comme exempt de cet ingrédient)
//  - si le produit mentionne explicitement l'ingrédient (ex: "parfumé",
//    "à l'alcool") sans porter le tag "Sans X" -> on l'EXCLUT des résultats
//  - sinon (aucune info disponible) -> neutre, le produit reste proposé
// Cette table sert à la fois pour la question "allergies" (quiz par
// produit/cheveux) et pour toute option "Sans X" cochée dans une question
// d'ingrédients (Routine 360°, quiz par catégorie) : les deux expriment la
// même intention "je ne veux pas de X dans mon produit".
const UNWANTED_INGREDIENT_MAP = {
  "Parfum":              { safeTag: "Sans parfum",   presence: ["parfumé", "parfumée", "au parfum"] },
  "Sans parfum":         { safeTag: "Sans parfum",   presence: ["parfumé", "parfumée", "au parfum"] },
  "Huiles essentielles": { safeTag: null,            presence: ["huile essentielle", "huiles essentielles"] },
  "Alcool":              { safeTag: "Sans alcool",   presence: ["à l'alcool", "a l'alcool"] },
  "Silicones":           { safeTag: "Sans silicone", presence: ["silicone"] },
  "Sans silicone":       { safeTag: "Sans silicone", presence: ["silicone"] },
  "Sulfates":            { safeTag: "Sans sulfate",  presence: ["sulfate"] },
  "Sans sulfate":        { safeTag: "Sans sulfate",  presence: ["sulfate"] },
  "Sans paraben":        { safeTag: "Sans paraben",  presence: ["paraben"] },
};

// "__none__" = marqueur du bouton "Aucun ne me correspond" (QuizStep.jsx) :
// une réponse neutre, à ignorer exactement comme "Aucune connue"/"Aucune préférence".
const IGNORED_INGREDIENT_LABELS = new Set(["Aucune connue", "Aucune préférence", "__none__"]);

function hasUnwantedSignal(product, presenceWords) {
  if (!presenceWords || !presenceWords.length) return false;
  const text = `${product.name || ""} ${(product.tags || []).join(" ")} ${(product.benefits || []).join(" ")}`.toLowerCase();
  return presenceWords.some((w) => text.includes(w.toLowerCase()));
}

// Regroupe tout ce que la personne a dit vouloir éviter (question "allergies"
// + toute case "Sans X" cochée dans une question d'ingrédients) et renvoie
// soit une exclusion franche, soit un bonus pour les produits confirmés sûrs.
function applyUnwantedIngredients(product, labels) {
  let excluded = false;
  let bonus = 0;
  const reasons = [];
  for (const label of labels) {
    if (!label || IGNORED_INGREDIENT_LABELS.has(label)) continue;
    const rule = UNWANTED_INGREDIENT_MAP[label];
    if (!rule) continue;
    if (rule.safeTag && contains(product.tags || [], rule.safeTag)) {
      bonus += 15;
      reasons.push(rule.safeTag.toLowerCase());
      continue;
    }
    if (hasUnwantedSignal(product, rule.presence)) {
      excluded = true;
      break;
    }
  }
  return { excluded, bonus: Math.min(30, bonus), reasons };
}

export function scoreProduct(product, answers = {}, problem = null) {
  let s = 30; // baseline so all products feel "considered"
  const reasons = [];

  // Skin type (+30)
  if (answers.skin_type) {
    if ((product.skin_types || []).includes(answers.skin_type)) {
      s += 30;
      reasons.push(`adapté aux peaux ${answers.skin_type}`);
    } else if ((product.skin_types || []).length === 0) {
      s += 10; // neutral
    }
  }

  // Hair type (+30)
  if (answers.hair_type) {
    if ((product.hair_types || []).includes(answers.hair_type)) {
      s += 30;
      reasons.push(`adapté aux cheveux ${answers.hair_type}`);
    } else if ((product.hair_types || []).length === 0) {
      s += 10; // neutral product
    }
  }

  // Ingrédients préférés (+20 chacun, plafonné à 40) — plusieurs quiz
  // utilisent des clés différentes selon le type de produit (skin_ingredients,
  // body_ingredients, hair_ingredients) ; "ingredients" reste supporté pour
  // compatibilité avec d'anciens appels.
  const preferredIngredients = [
    ...(answers.ingredients || []),
    ...(answers.skin_ingredients || []),
    ...(answers.body_ingredients || []),
    ...(answers.hair_ingredients || []),
  ];
  let ingPoints = 0;
  for (const ing of preferredIngredients) {
    if (!ing || IGNORED_INGREDIENT_LABELS.has(ing)) continue;
    if (contains(product.tags || [], ing) || contains(product.benefits || [], ing)) {
      ingPoints += 20;
      reasons.push(ing.toLowerCase());
    }
  }
  s += Math.min(40, ingPoints);

  // Ingrédients à éviter / allergies : exclusion réelle si le produit signale
  // explicitement contenir l'ingrédient, bonus si un tag "Sans X" confirme
  // son absence. On regarde la question "allergies" ET toute case "Sans X"
  // cochée dans une question d'ingrédients (même intention).
  const unwantedLabels = [...(answers.allergies || []), ...preferredIngredients];
  const { excluded, bonus: safeBonus, reasons: safeReasons } = applyUnwantedIngredients(product, unwantedLabels);
  if (excluded) {
    return { score: 0, reasons: ["contient un ingrédient que tu évites"], excluded: true };
  }
  s += safeBonus;
  reasons.push(...safeReasons);

  // Budget (+15) — soit un budget "slug" (quiz par produit, ex: "15-30"),
  // soit une fourchette numérique globale (Routine 360°, ex: { min, max }).
  let budgetRange = null;
  if (answers.budget && BUDGET_RANGES[answers.budget]) {
    budgetRange = BUDGET_RANGES[answers.budget];
  } else if (answers.budget_range && typeof answers.budget_range.min === "number" && typeof answers.budget_range.max === "number") {
    budgetRange = [answers.budget_range.min, answers.budget_range.max];
  }
  if (budgetRange) {
    const [min, max] = budgetRange;
    if (product.price >= min && product.price <= max) {
      s += 15;
      reasons.push(`prix dans ta fourchette (${product.price}€)`);
    }
  }

  // Product-specific answers
  const pa = answers.product_answers || {};
  let bonus = 0;
  for (const [, val] of Object.entries(pa)) {
    const values = Array.isArray(val) ? val : [val];
    for (const v of values.filter(Boolean)) {
      if (contains(product.tags || [], v)) { bonus += 5; reasons.push(v.toLowerCase()); }
      if (contains(product.benefits || [], v)) { bonus += 10; reasons.push(v.toLowerCase()); }
    }
  }
  s += Math.min(25, bonus);

  // Problem-based scoring (quiz dédié à un problème de peau/cheveux)
  const effectiveProblem = problem || answers.problem || null;
  if (effectiveProblem) {
    const map = PROBLEM_SCORE_MAP[effectiveProblem] || HAIR_PROBLEM_SCORE_MAP[effectiveProblem];
    if (map) {
      let problemBonus = 0;
      if (map.skin_types?.length && map.skin_types.some((t) => (product.skin_types || []).includes(t))) {
        problemBonus += 20;
        reasons.push(`peau ${map.skin_types[0]}`);
      }
      if (map.hair_types?.length && map.hair_types.some((t) => (product.hair_types || []).includes(t))) {
        problemBonus += 20;
        reasons.push(`cheveux ${map.hair_types[0]}`);
      }
      for (const kw of map.keywords || []) {
        if (contains(product.benefits || [], kw) || contains(product.tags || [], kw)) {
          problemBonus += 10;
          reasons.push(kw);
        }
      }
      s += Math.min(35, problemBonus);
    }
  }

  // Préoccupations du quiz Routine 360° (skin_concerns / body_concerns / hair_concerns)
  let concernBonusTotal = 0;
  for (const label of answers.skin_concerns || []) {
    const { bonus: b, reasons: r } = concernBonus(product, label, SKIN_CONCERN_SCORE_MAP);
    concernBonusTotal += b;
    reasons.push(...r);
  }
  for (const label of answers.body_concerns || []) {
    const { bonus: b, reasons: r } = concernBonus(product, label, BODY_CONCERN_SCORE_MAP);
    concernBonusTotal += b;
    reasons.push(...r);
  }
  for (const label of answers.hair_concerns || []) {
    const { bonus: b, reasons: r } = concernBonus(product, label, HAIR_CONCERN_SCORE_MAP);
    concernBonusTotal += b;
    reasons.push(...r);
  }
  s += Math.min(40, concernBonusTotal);

  // Tranche d'age (question posee avant chaque quiz) : leger ajustement,
  // jamais prioritaire sur les vrais criteres du quiz.
  const ageRange = answers.age_range || (getProfile() || {}).age_range;
  if (ageRange) {
    const antiAge = contains(product.benefits || [], "anti-âge") || contains(product.tags || [], "anti-âge") ||
      /anti[- ]?(âge|age|rides)|rides|fermet[ée]|lifting|collag[eè]ne|r[ée]tinol/i.test(product.name || "");
    if (antiAge) {
      if (ageRange === "moins-18") { s -= 15; }
      else if (ageRange === "18-24") { s -= 8; }
      else if (["35-44", "45-54", "55-plus"].includes(ageRange)) {
        s += ageRange === "35-44" ? 6 : 10;
        reasons.push("adapté à ta tranche d'âge");
      }
    }
  }

  // Rating boost
  if (product.rating >= 4.7) s += 5;

  // Normalize 0-100. Pas de plancher artificiel ici : un produit qui ne
  // correspond a rien de precis dans les reponses doit pouvoir redescendre
  // pres de son score de base (30), sinon TOUT produit affiche un score
  // "flatteur" meme quand il n'a objectivement rien a voir avec la demande
  // (ex: un peigne demelant ou un crayon khol presente comme "55% compatible"
  // alors qu'il ne correspond a aucun critere reel). C'est ce plancher que
  // MIN_GOOD_MATCH_SCORE remplace plus bas : la "qualite" du match se decide
  // sur le score reel, pas sur un chiffre gonfle artificiellement.
  return { score: Math.min(99, Math.max(0, s)), reasons };
}

// Score minimum pour qu'on considere un produit comme un "vrai" match et
// qu'on le presente comme "ton match parfait" / "ton produit ideal". En
// dessous, le produit est un simple produit "qui pourrait convenir mais ne
// respecte pas totalement les criteres" (prix hors budget, categorie pas
// assez precise, aucun critere specifique rempli...), jamais LE match mis en
// avant. Reprend la valeur de l'ancien plancher artificiel : le seuil est
// donc calibre sur la meme echelle que precedemment, mais sert maintenant a
// distinguer "bon match" de "pas de bon match" plutot qu'a gonfler tous les
// scores.
export const MIN_GOOD_MATCH_SCORE = 55;

export function rankProducts(products, answers, problem = null) {
  return products
    .map((p) => {
      const { score, reasons, excluded } = scoreProduct(p, answers, problem);
      return { ...p, _score: score, _reasons: [...new Set(reasons)].slice(0, 4), _excluded: !!excluded };
    })
    .filter((p) => !p._excluded)
    .sort((a, b) => b._score - a._score);
}

// Separe une liste deja classee (rankProducts) en "vrais" bons matchs et
// "alternatives imparfaites" (score sous le seuil). Utilise par les pages de
// resultats pour ne jamais presenter un produit hors-sujet comme "LE match
// parfait" : si goodMatches est vide, la page doit afficher un message
// "pas de produit qui correspond totalement a tes criteres" plutot que de
// forcer alternatives[0] dans la carte hero.
export function splitByMatchQuality(ranked) {
  const goodMatches = ranked.filter((p) => p._score >= MIN_GOOD_MATCH_SCORE);
  const alternatives = ranked.filter((p) => p._score < MIN_GOOD_MATCH_SCORE);
  return { goodMatches, alternatives };
}
