// Compatibility scoring algorithm
import { BUDGET_RANGES } from "../data/quizConfig";

function contains(arr, needle) {
  if (!arr) return false;
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

  // Ingredients (+20 each, cap 40)
  let ingPoints = 0;
  for (const ing of answers.ingredients || []) {
    if (ing === "Aucune préférence") continue;
    if (contains(product.tags || [], ing) || contains(product.benefits || [], ing)) {
      ingPoints += 20;
      reasons.push(ing.toLowerCase());
    }
  }
  s += Math.min(40, ingPoints);

  // Budget (+15)
  if (answers.budget && BUDGET_RANGES[answers.budget]) {
    const [min, max] = BUDGET_RANGES[answers.budget];
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

  // Problem-based scoring
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

  // Rating boost
  if (product.rating >= 4.7) s += 5;

  // Normalize 0-100 with floor 55 to feel encouraging
  return { score: Math.min(99, Math.max(55, s)), reasons };
}

export function rankProducts(products, answers, problem = null) {
  return products
    .map((p) => {
      const { score, reasons } = scoreProduct(p, answers, problem);
      return { ...p, _score: score, _reasons: [...new Set(reasons)].slice(0, 4) };
    })
    .sort((a, b) => b._score - a._score);
}
