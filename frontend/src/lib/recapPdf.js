// Récapitulatif PDF « Mon bilan Beautify Vision » : transforme les réponses d'un quiz
// en phrases claires (une par question, y compris « aucun / peu importe / je n'y fais
// pas attention »), choisit les produits à inclure, puis demande le PDF au backend.
import { api } from "./api";
import { splitByMatchQuality, MIN_GOOD_MATCH_SCORE } from "./scoring";
import {
  SKIN_ANSWER_KEYS,
  SKIN_PROBLEMS,
  getQuestionsForProduct,
  getCategoryQuestions,
  getRoutineProductBySlug,
} from "../data/quizConfig";

const NONE = "__none__";

/* ------------------------------------------------------------------ */
/* Petits outils de rédaction                                          */
/* ------------------------------------------------------------------ */
const arr = (v) => (v === undefined || v === null || v === "" ? [] : Array.isArray(v) ? v : [v]);
const clean = (v) => arr(v).filter((x) => x !== NONE);

/** Minuscule initiale, sauf sigles (« SPF 50 »). */
const lc = (s) => {
  const t = String(s || "").trim();
  if (t.length > 1 && t[1] === t[1].toUpperCase() && t[1] !== t[1].toLowerCase()) return t;
  return t.charAt(0).toLowerCase() + t.slice(1);
};
const cap1 = (s) => String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);
const and = (list) => {
  const l = list.map(lc);
  if (l.length <= 1) return l[0] || "";
  return `${l.slice(0, -1).join(", ")} et ${l[l.length - 1]}`;
};
const noQ = (s) => String(s || "").replace(/\s*\?\s*$/, "").trim();
const isNoPref = (s) => /^peu importe/i.test(String(s));
const row = (cap, icon, text) => ({ cap, icon, text });

const SKIN_FIX = { seche: "sèche", acneique: "acnéique", "très seche": "très sèche" };
const skinWord = (v) => {
  const t = lc(String(v).replace(/^peau\s+/i, ""));
  return SKIN_FIX[t] || t;
};

const BUDGET_TEXT = {
  "0-15": "moins de 15 €",
  "15-30": "entre 15 et 30 €",
  "30-60": "entre 30 et 60 €",
  "60-300": "plus de 60 €",
};

const MAPS = {
  coloration: {
    "Colorés récemment": "Tes cheveux ont été colorés récemment.",
    "Décolorés ou méchés": "Tes cheveux sont décolorés ou méchés.",
    "Naturels": "Tes cheveux sont naturels, sans coloration.",
    "Partiellement colorés": "Tes cheveux sont partiellement colorés.",
  },
  chaleur: {
    "Tous les jours": "Tu utilises des outils chauffants tous les jours.",
    "Quelques fois par semaine": "Tu utilises des outils chauffants quelques fois par semaine.",
    "Rarement": "Tu utilises rarement des outils chauffants.",
    "Jamais": "Tu n'utilises jamais d'outils chauffants.",
  },
  eau_chloree: {
    "Piscine régulière": "Tes cheveux sont régulièrement exposés à l'eau chlorée de la piscine.",
    "Mer en été": "Tes cheveux sont exposés à l'eau de mer en été.",
    "Souvent les deux": "Tes cheveux sont souvent exposés à l'eau chlorée et à l'eau de mer.",
    "Rarement ou jamais": "Tes cheveux sont rarement exposés à l'eau chlorée ou salée.",
  },
  lavage: {
    "Tous les jours": "Tu laves tes cheveux tous les jours.",
    "2-3 fois par semaine": "Tu laves tes cheveux 2 à 3 fois par semaine.",
    "1 fois par semaine": "Tu laves tes cheveux une fois par semaine.",
    "Moins souvent": "Tu laves tes cheveux moins d'une fois par semaine.",
  },
  duree: {
    "Récent (moins de 3 mois)": "Ce problème est récent (moins de 3 mois).",
    "Quelques mois": "Ce problème dure depuis quelques mois.",
    "Chronique, plusieurs années": "Ce problème est chronique, depuis plusieurs années.",
  },
  tiraill: {
    "Après la douche": "Ta peau tiraille après la douche.",
    "Toute la journée": "Ta peau tiraille toute la journée.",
    "Seulement en hiver": "Ta peau tiraille seulement en hiver.",
    "Rarement": "Ta peau tiraille rarement.",
  },
};

// Questions « produit » : légende + groupe nominal pour « pas de préférence pour … »
const PRODUCT_NOUNS = {
  texture: ["Texture", "la texture"],
  objectif: ["Objectif", "l'objectif"],
  moment: ["Moment d'application", "le moment d'application"],
  ingredients_specifiques: ["Ingrédients", "les ingrédients"],
  frequence: ["Fréquence", "la fréquence"],
  benefice: ["Bénéfice", "le bénéfice principal"],
  concentration: ["Concentration", "la concentration"],
  format: ["Format", "le format"],
  rincage: ["Rinçage", "le rinçage"],
  couvrance: ["Couvrance", "la couvrance"],
  fini: ["Fini", "le fini"],
  tenue: ["Tenue", "la tenue"],
  effet: ["Effet", "l'effet"],
  look: ["Type de look", "le type de look"],
  teinte: ["Teinte", "la teinte"],
  soin: ["Soin hydratant", "le soin hydratant"],
  spf: ["Indice de protection", "l'indice de protection"],
};

const ZONE_OF = { skin_: "ton visage", body_: "ton corps", hair_: "tes cheveux" };
const zoneWord = (key) => ZONE_OF[Object.keys(ZONE_OF).find((p) => key.startsWith(p))] || "toi";

/* ------------------------------------------------------------------ */
/* Une réponse -> une ligne de diagnostic                              */
/* ------------------------------------------------------------------ */
// `ctx` : { mode: "produit" | "probleme" | "routine", budgetRange }
// Renvoie { kind: "row", row } | { kind: "concern" | "ingredient", items, emptyRow }
function describe(q, value, ctx) {
  const key = q.key;
  const vals = clean(value);
  const first = vals[0];
  const missing = arr(value).length === 0;

  switch (key) {
    case "skin_type":
      return { kind: "row", row: row("Type de peau", "drop", first ? `Tu as une peau ${skinWord(first)}.` : "Tu n'as pas précisé ton type de peau.") };
    case "budget": {
      if (ctx.budgetRange && typeof ctx.budgetRange === "object") {
        return { kind: "row", row: row("Budget", "sliders-horizontal", `Ton budget pour la routine complète se situe entre ${ctx.budgetRange.min} et ${ctx.budgetRange.max} €.`) };
      }
      const t = BUDGET_TEXT[value];
      return { kind: "row", row: row("Budget", "sliders-horizontal", t ? `Ton budget pour ce produit : ${t}.` : "Tu n'as pas fixé de budget précis.") };
    }
    case "allergies": {
      const none = missing || vals.length === 0 || vals.includes("Aucune connue");
      return { kind: "row", row: row("Allergies et intolérances", "warning-circle", none ? "Tu n'as aucune allergie ou intolérance connue." : `Tu souhaites éviter : ${and(vals)}.`) };
    }
    case "lifestyle":
      return { kind: "row", row: row("Mode de vie", "sun-horizon", vals.length ? `Dans ton quotidien : ${and(vals)}.` : "Tu n'as signalé aucun facteur particulier dans ton quotidien.") };
    case "alimentation": {
      const skip = vals.includes("Je n'y fais pas attention");
      const rest = vals.filter((v) => v !== "Je n'y fais pas attention");
      let text;
      if (skip && !rest.length) text = "Tu ne fais pas particulièrement attention à ton alimentation.";
      else if (skip) text = `Ton alimentation : ${and(rest)} (sans y faire particulièrement attention).`;
      else text = rest.length ? `Ton alimentation : ${and(rest)}.` : "Tu n'as pas précisé ton alimentation.";
      return { kind: "row", row: row("Alimentation", "leaf", text) };
    }
    case "hair_type":
      return { kind: "row", row: row("Type de cheveux", "waves", first ? `Tu as les cheveux ${lc(first)}.` : "Tu n'as pas précisé ton type de cheveux.") };
    case "hair_thickness":
      return { kind: "row", row: row("Épaisseur", "waves", first ? `Tes cheveux sont ${lc(first)}.` : "Tu n'as pas précisé l'épaisseur de tes cheveux.") };
    case "hair_scalp":
    case "scalp":
      return { kind: "row", row: row("Cuir chevelu", "circle-dashed", !first ? "Tu n'as pas précisé l'état de ton cuir chevelu." : /pellicule/i.test(first) ? "Ton cuir chevelu est sujet aux pellicules." : `Ton cuir chevelu est ${lc(first)}.`) };
    case "hair_porosity":
      return { kind: "row", row: row("Porosité", "drop-half", first ? `La porosité de tes cheveux est ${lc(first)}.` : "Tu ne connais pas la porosité de tes cheveux.") };
    case "coloration":
    case "chaleur":
    case "eau_chloree":
    case "lavage": {
      const icon = { coloration: "sparkle", chaleur: "fire", eau_chloree: "drop-half", lavage: "clock" }[key];
      const cap = { coloration: "Coloration", chaleur: "Outils chauffants", eau_chloree: "Eau chlorée ou salée", lavage: "Fréquence de lavage" }[key];
      return { kind: "row", row: row(cap, icon, MAPS[key][first] || (first ? `${cap1(lc(first))}.` : "Tu n'as pas répondu à cette question.")) };
    }
    case "body_type":
      return { kind: "row", row: row("Peau du corps", "drop", first ? `Ta peau corporelle est ${lc(first)}.` : "Tu n'as pas précisé le type de ta peau corporelle.") };
    case "skin_concerns":
    case "body_concerns":
    case "hair_concerns":
      return { kind: "concern", items: vals, emptyRow: row("Préoccupations", "magnifying-glass", `Tu n'as pas de préoccupation particulière pour ${zoneWord(key)}.`) };
    case "skin_ingredients":
    case "body_ingredients":
    case "hair_ingredients":
      return { kind: "ingredient", items: vals, emptyRow: row("Ingrédients préférés", "leaf", `Tu n'as aucun ingrédient préféré pour ${zoneWord(key)}.`) };
    default:
      break;
  }

  /* --- questions « problème de peau » --- */
  if (ctx.mode === "probleme") {
    const P = {
      duree: ["Ancienneté", "clock"],
      type_boutons: ["Type de boutons", "circle-dashed"],
      traitements: ["Traitements essayés", "flask"],
      declencheurs: ["Facteurs déclenchants", "fire"],
      tiraill: ["Tiraillements", "snowflake"],
      objectif: ["Objectif", "star-four"],
      type_rougeurs: ["Rougeurs", "heart"],
      type_taches: ["Taches", "sparkle"],
      soleil: ["Exposition au soleil", "sun"],
      priorite: ["Priorité", "star-four"],
      signes: ["Signes de l'âge", "clock"],
      cause: ["Cause probable", "magnifying-glass"],
      reactions: ["Réactions de la peau", "thermometer-simple"],
      sensible_a: ["Sensibilités", "warning-circle"],
      moment: ["Moment le plus marqué", "clock"],
      type_cernes: ["Cernes", "magnifying-glass"],
    }[key];
    if (P) {
      const [cap, icon] = P;
      const dontKnow = vals.length === 0 || vals.every((v) => /^(je ne sais pas|aucun identifié)/i.test(v));
      let text;
      switch (key) {
        case "duree": text = MAPS.duree[first] || `Ce problème : ${lc(first)}.`; break;
        case "tiraill": text = MAPS.tiraill[first] || `Tiraillements : ${lc(first)}.`; break;
        case "type_boutons": text = `Tu observes : ${and(vals)}.`; break;
        case "traitements": text = vals.includes("Aucun") || !vals.length ? "Tu n'as encore essayé aucun traitement." : `Tu as déjà essayé : ${and(vals)}.`; break;
        case "declencheurs": text = dontKnow ? "Tu n'as pas identifié de facteur déclenchant." : `Facteurs déclenchants identifiés : ${and(vals)}.`; break;
        case "objectif": text = `Ton objectif : ${lc(first)}.`; break;
        case "type_rougeurs": text = `Tes rougeurs sont : ${lc(first)}.`; break;
        case "type_taches": text = dontKnow ? "Tu ne sais pas précisément de quel type de taches il s'agit." : `Tu observes : ${and(vals)}.`; break;
        case "soleil": text = `Ton exposition au soleil : ${lc(first)}.`; break;
        case "priorite": text = `Ta priorité : ${lc(first)}.`; break;
        case "signes": text = `Signes de l'âge observés : ${lc(first)}.`; break;
        case "cause": text = dontKnow ? "Tu ne connais pas la cause probable." : `Cause probable selon toi : ${lc(first)}.`; break;
        case "reactions": text = vals.length ? `Ta peau réagit par : ${and(vals)}.` : "Ta peau ne présente pas de réaction fréquente."; break;
        case "sensible_a": text = vals.length ? `Tu es sensible à : ${and(vals)}.` : "Tu n'as pas identifié de sensibilité particulière."; break;
        case "moment": text = `Moment où c'est le plus marqué : ${lc(first)}.`; break;
        case "type_cernes": text = `Type de cernes : ${lc(first)}.`; break;
        default: text = vals.length ? `${and(vals)}.` : "Pas de précision.";
      }
      return { kind: "row", row: row(cap, icon, text) };
    }
  }

  /* --- questions propres à un produit --- */
  if (key === "type_chute") return { kind: "row", row: row("Type de chute", "star-four", first ? `Ta chute de cheveux est ${lc(first)}.` : "Tu n'as pas précisé le type de chute.") };
  if (key === "traitement") return { kind: "row", row: row("Traitement colorant", "sparkle", first ? `Ton traitement colorant : ${lc(first)}.` : "Tu n'as pas précisé ton traitement colorant.") };
  if (key === "probleme") return { kind: "row", row: row("Problème principal", "star-four", first ? `Ton problème principal : ${lc(first)}.` : "Tu n'as pas précisé de problème principal.") };

  const noun = PRODUCT_NOUNS[key];
  if (noun) {
    const [cap, det] = noun;
    const real = vals.filter((v) => !isNoPref(v));
    if (!real.length) return { kind: "row", row: row(cap, "star-four", `Tu n'as pas de préférence particulière pour ${det}.`) };
    return { kind: "row", row: row(cap, "star-four", `Tu recherches : ${and(real)}.`) };
  }

  // Filet de sécurité : question inconnue -> « Question : réponses ».
  const real = vals.filter((v) => !isNoPref(v));
  return { kind: "row", row: row(cap1(noQ(q.label)), "star-four", real.length ? `${cap1(and(real))}.` : "Tu n'as pas de préférence particulière.") };
}

/** Parcourt des questions et renvoie { diagnostic, concerns, ingredients }. */
function buildSection(questions, getValue, ctx) {
  const diagnostic = [];
  const concerns = [];
  const ingredients = [];
  const emptyConcern = [];
  const emptyIngredient = [];
  for (const q of questions) {
    const value = getValue(q);
    if (value === undefined && ctx.skipUnanswered) continue;
    const d = describe(q, value, ctx);
    if (d.kind === "row") diagnostic.push(d.row);
    else if (d.kind === "concern") {
      if (d.items.length) concerns.push(...d.items);
      else emptyConcern.push(d.emptyRow);
    } else if (d.kind === "ingredient") {
      if (d.items.length) ingredients.push(...d.items);
      else emptyIngredient.push(d.emptyRow);
    }
  }
  // Une liste vide devient une phrase. Si plusieurs listes sont vides (Routine 360°)
  // on n'écrit qu'une phrase générale ; si une autre liste est remplie, on précise la zone.
  const flush = (items, empties, generic) => {
    if (!empties.length) return;
    if (items.length || empties.length === 1) diagnostic.push(...empties);
    else diagnostic.push(row(empties[0].cap, empties[0].icon, generic));
  };
  flush(concerns, emptyConcern, "Tu n'as pas de préoccupation particulière.");
  flush(ingredients, emptyIngredient, "Tu n'as aucun ingrédient préféré.");
  return { diagnostic, concerns: [...new Set(concerns)], ingredients: [...new Set(ingredients)] };
}

/* ------------------------------------------------------------------ */
/* Choix des produits                                                  */
/* ------------------------------------------------------------------ */
const reasonsText = (p) => (p?._reasons?.length ? `Sélectionné pour ${p._reasons.join(", ")}.` : "");

function pickFromRanking(ranked, bestLabel) {
  const { goodMatches } = splitByMatchQuality(ranked || []);
  const best = goodMatches[0];
  const rest = (ranked || []).filter((p) => !best || p.id !== best.id);
  const toItem = (p, slot, extra = {}) => ({ product_id: p.id, score: p._score, slot, ...extra });
  if (!best) {
    return {
      no_match: true,
      main_items: [],
      others: rest.slice(0, 3).map((p, i) => toItem(p, `Piste n°${i + 1}`)),
    };
  }
  return {
    no_match: false,
    main_items: [toItem(best, bestLabel, { subtitle: bestLabel, reasons: reasonsText(best) })],
    others: rest.slice(0, 3).map((p, i) => toItem(p, `Alternative n°${i + 1}`)),
  };
}

const prettySlug = (s) => cap1(String(s || "").replace(/-/g, " "));

/* ------------------------------------------------------------------ */
/* Constructeurs de payload (un par type de résultat)                  */
/* ------------------------------------------------------------------ */
export function buildProductRecap({ answers = {}, categorie, produit, ranked }) {
  const questions = getQuestionsForProduct(categorie, produit);
  const productAnswers = answers.product_answers || {};
  const sec = buildSection(
    questions,
    (q) => (SKIN_ANSWER_KEYS.has(q.key) ? answers[q.key] : productAnswers[q.key]),
    { mode: "produit" },
  );
  const hair = categorie === "cheveux";
  const makeup = categorie === "cosmetiques";
  return {
    kind: "produit",
    title: hair ? "Mon bilan cheveux" : makeup ? "Mon bilan maquillage" : "Mon bilan beauté",
    profile_title: hair ? "Ton profil capillaire" : "Ton profil beauté",
    doc_title: `Mon bilan Beautify Vision : ${prettySlug(produit)}`,
    note: `Le produit qui correspond le mieux à tes réponses pour : ${prettySlug(produit).toLowerCase()}.`,
    tips_kind: hair ? "hair" : "skin",
    ...sec,
    ...pickFromRanking(ranked, "Ton match parfait"),
  };
}

export function buildProblemRecap({ slug, zone, zonesPrecises = [], problemQuestions = [], problemAnswers = {}, ranked, disclaimer }) {
  const label = SKIN_PROBLEMS.find((p) => p.slug === slug)?.label || prettySlug(slug);
  const zoneText = { visage: "ton visage", corps: "ton corps", "les-deux": "ton visage et ton corps" }[zone] || "ta peau";
  const precise = zonesPrecises.filter((z) => !/^peu importe/i.test(z));
  const diagnostic = [
    row("Préoccupation principale", "star-four", `Ta préoccupation principale : ${lc(label)}.`),
    row("Zone concernée", "magnifying-glass", `Tu souhaites traiter ${zoneText}.`),
    row("Zones précises", "magnifying-glass", precise.length ? `Zones concernées : ${and(precise)}.` : "Tu n'as pas précisé de zone particulière."),
  ];
  const sec = buildSection(problemQuestions, (q) => problemAnswers[q.key], { mode: "probleme" });
  return {
    kind: "probleme",
    title: "Mon bilan peau",
    profile_title: "Ton diagnostic peau",
    doc_title: `Mon bilan Beautify Vision : ${label}`,
    note: `Les produits les mieux adaptés à ton problème de peau : ${lc(label)}.`,
    tips_kind: "skin",
    disclaimer: disclaimer || null,
    diagnostic: [...diagnostic, ...sec.diagnostic],
    concerns: sec.concerns,
    ingredients: sec.ingredients,
    ...pickFromRanking(ranked, `Recommandé · ${label}`),
  };
}

const SECTION_GROUP = { skincare: "Soins du visage et du corps", maquillage: "Maquillage", cheveux: "Soins cheveux" };

export function buildRoutineRecap({ selected = [], skinAnswers = {}, productAnswers = {}, budgetRange, probleme, chosenType, recos = {} }) {
  const questions = getCategoryQuestions(chosenType || "360").filter(
    (q) => q.key !== "hair_porosity" || ["Frisés", "Crépus"].includes(skinAnswers.hair_type),
  );
  const sec = buildSection(questions, (q) => skinAnswers[q.key], { mode: "routine", budgetRange, skipUnanswered: true });
  const diagnostic = [];
  const problemLabel = SKIN_PROBLEMS.find((p) => p.slug === probleme)?.label;
  if (problemLabel) diagnostic.push(row("Préoccupation principale", "star-four", `Ta préoccupation principale : ${lc(problemLabel)}.`));
  diagnostic.push(...sec.diagnostic);
  if (budgetRange && !questions.some((q) => q.key === "budget")) {
    diagnostic.push(row("Budget", "sliders-horizontal", `Ton budget pour la routine complète se situe entre ${budgetRange.min} et ${budgetRange.max} €.`));
  }

  // Préférences détaillées par produit (hors « peu importe »)
  const detailRows = [];
  for (const slug of selected) {
    const meta = getRoutineProductBySlug(slug);
    const a = productAnswers[slug] || {};
    const parts = Object.entries(a)
      .map(([k, v]) => {
        const real = clean(v).filter((x) => !isNoPref(x));
        if (!real.length) return null;
        const nm = PRODUCT_NOUNS[k]?.[0] || cap1(k.replace(/_/g, " "));
        return `${nm.toLowerCase()} : ${and(real)}`;
      })
      .filter(Boolean);
    if (parts.length && meta) detailRows.push(row(meta.label, "star-four", `${cap1(parts.join(" ; "))}.`));
  }
  diagnostic.push(...detailRows.slice(0, 12));

  const main_items = [];
  const missing = [];
  let total = 0;
  for (const slug of selected) {
    const meta = getRoutineProductBySlug(slug);
    const best = (recos[slug] || []).find((p) => p._score >= MIN_GOOD_MATCH_SCORE);
    if (!meta) continue;
    if (!best) { missing.push(meta.label); continue; }
    total += best.price || 0;
    main_items.push({
      product_id: best.id,
      score: best._score,
      slot: meta.label,
      group: SECTION_GROUP[meta.section] || "",
      reasons: reasonsText(best),
    });
  }
  const type = chosenType;
  const title = type === "360" ? "Mon bilan routine 360°" : type === "cheveux" ? "Mon bilan cheveux" : type === "corps" ? "Mon bilan corps" : "Mon bilan peau";
  return {
    kind: "routine",
    title,
    profile_title: type === "cheveux" ? "Ton profil capillaire" : "Ton profil beauté",
    doc_title: `Ma routine personnalisée Beautify Vision`,
    tips_kind: type === "cheveux" ? "hair" : "skin",
    diagnostic: diagnostic.slice(0, 30),
    concerns: sec.concerns,
    ingredients: sec.ingredients,
    main_items,
    missing_steps: missing,
    budget_note: budgetRange && budgetRange.max && total > budgetRange.max
      ? `Ton budget est un peu serré : avec ${main_items.length} produits, la routine la plus économique que nous avons trouvée coûte ${total.toFixed(2).replace(".", ",")} € pour un budget de ${budgetRange.max} €. Tu peux retirer un produit ou augmenter ton budget pour avoir plus de choix.`
      : null,
    total: Math.round(total * 100) / 100,
    total_count: main_items.length,
    disclaimer: null,
  };
}

/* ------------------------------------------------------------------ */
/* Téléchargement                                                      */
/* ------------------------------------------------------------------ */
export async function downloadRecap(payload, filename = "mon-bilan-beautify-vision.pdf") {
  const r = await api.post("/recap-pdf", payload, { responseType: "blob", timeout: 90000 });
  const blob = new Blob([r.data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
