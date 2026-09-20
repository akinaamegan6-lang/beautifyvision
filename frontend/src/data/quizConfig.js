// Configuration centralisée des quiz et listes pour BeautifyVision

// === Liste des 12 problèmes de peau ===
export const SKIN_PROBLEMS = [
  { slug: "acne", label: "Acné / Imperfections" },
  { slug: "peau-seche", label: "Peau sèche & Déshydratation" },
  { slug: "rougeurs", label: "Rougeurs & Couperose" },
  { slug: "taches", label: "Taches & Hyperpigmentation" },
  { slug: "anti-age", label: "Rides & Anti-âge" },
  { slug: "pores", label: "Pores dilatés" },
  { slug: "eczema", label: "Eczéma" },
  { slug: "psoriasis", label: "Psoriasis" },
  { slug: "vitiligo", label: "Vitiligo" },
  { slug: "sensible", label: "Peau sensible & Réactive" },
  { slug: "sebum", label: "Excès de sébum" },
  { slug: "cernes", label: "Cernes & Poches" },
];

// === Bloc 1 : questions universelles sur la peau ===
const Q_BUDGET = {
  key: "budget",
  label: "Quel est ton budget pour ce produit ?",
  multi: false,
  options: [
    { value: "0-15", label: "Moins de 15 €" },
    { value: "15-30", label: "15 – 30 €" },
    { value: "30-60", label: "30 – 60 €" },
    { value: "60-300", label: "Plus de 60 €" },
  ],
};

// Skin type + budget — pour skincare ET cosmétiques teint
export const SKIN_QUESTIONS = [
  {
    key: "skin_type",
    label: "Quel est ton type de peau ?",
    multi: false,
    options: [
      { value: "grasse", label: "Peau grasse" },
      { value: "seche", label: "Peau sèche" },
      { value: "mixte", label: "Peau mixte" },
      { value: "sensible", label: "Peau sensible" },
      { value: "normale", label: "Peau normale" },
      { value: "mature", label: "Peau mature" },
      { value: "acneique", label: "Peau acnéique" },
    ],
  },
  Q_BUDGET,
];

// Questions cheveux — type + budget
export const HAIR_QUESTIONS = [
  {
    key: "hair_type",
    label: "Quel est ton type de cheveux ?",
    multi: false,
    options: [
      { value: "raides", label: "Cheveux raides" },
      { value: "ondulés", label: "Cheveux ondulés" },
      { value: "bouclés", label: "Cheveux bouclés" },
      { value: "frisés", label: "Cheveux frisés" },
      { value: "crépus", label: "Cheveux crépus" },
    ],
  },
  Q_BUDGET,
];

// Questions lifestyle cheveux — coloration, outils, eau chlorée, fréquence lavage
export const HAIR_LIFESTYLE_QUESTIONS = [
  Q("coloration", "As-tu les cheveux colorés ou décolorés ?", false, ["Colorés récemment", "Décolorés ou méchés", "Naturels", "Partiellement colorés"]),
  Q("chaleur", "Utilises-tu des outils chauffants (fer, sèche-cheveux...) ?", false, ["Tous les jours", "Quelques fois par semaine", "Rarement", "Jamais"]),
  Q("eau_chloree", "Exposition à l'eau chlorée ou salée ?", false, ["Piscine régulière", "Mer en été", "Souvent les deux", "Rarement ou jamais"]),
  Q("lavage", "À quelle fréquence laves-tu tes cheveux ?", false, ["Tous les jours", "2-3 fois par semaine", "1 fois par semaine", "Moins souvent"]),
];

// Questions lifestyle — uniquement pour les produits skincare (visage/corps)
export const LIFESTYLE_QUESTIONS = [
  {
    key: "allergies",
    label: "As-tu des allergies ou intolérances connues ?",
    multi: true,
    options: ["Parfum", "Huiles essentielles", "Alcool", "Silicones", "Sulfates", "Aucune connue"]
      .map((v) => ({ value: v, label: v })),
  },
  {
    key: "lifestyle",
    label: "Ton mode de vie au quotidien ?",
    multi: true,
    options: ["Exposition solaire fréquente", "Stress élevé", "Sommeil irrégulier", "Sport régulier", "Tabac", "Pollution urbaine quotidienne"]
      .map((v) => ({ value: v, label: v })),
  },
  {
    key: "alimentation",
    label: "Comment décrirais-tu ton alimentation ?",
    multi: true,
    options: ["Équilibrée", "Riche en sucre", "Peu d'eau au quotidien", "Beaucoup de caféine", "Végétarienne/Végane", "Je n'y fais pas attention"]
      .map((v) => ({ value: v, label: v })),
  },
];

// === Bloc 2 : questions spécifiques par type de produit ===
const Q = (key, label, multi, options) => ({ key, label, multi, options: options.map((v) => ({ value: v, label: v })) });

export const PRODUCT_QUESTIONS = {
  "masque": [
    Q("texture", "Texture préférée ?", false, ["Argile", "Crème", "Gel", "Tissu", "Peel-off"]),
    Q("objectif", "Objectif principal ?", false, ["Purifier", "Hydrater", "Éclat", "Anti-âge", "Apaisant"]),
    Q("ingredients_specifiques", "Ingrédients spécifiques souhaités ?", true, ["Charbon", "Argile", "Kaolin", "Acide salicylique", "Aloe vera", "Vitamine C", "Miel"]),
    Q("frequence", "Fréquence d'utilisation ?", false, ["1 fois/semaine", "2-3 fois/semaine", "Quotidien"]),
  ],
  "creme-hydratante": [
    Q("texture", "Texture ?", false, ["Légère/Gel", "Fluide", "Riche", "Baume"]),
    Q("moment", "Moment d'application ?", false, ["Matin", "Soir", "Matin et soir"]),
    Q("benefice", "Bénéfice principal ?", false, ["Hydratation intense", "Anti-âge", "Éclat", "Matifiant", "Apaisant"]),
    Q("ingredients_specifiques", "Ingrédients ?", true, ["Acide hyaluronique", "Rétinol", "Niacinamide", "Céramides", "Squalane", "Vitamine C"]),
  ],
  "serum": [
    Q("concentration", "Concentration souhaitée ?", false, ["Légère", "Concentrée"]),
    Q("objectif", "Objectif ?", false, ["Anti-âge", "Éclat", "Hydratation", "Anti-taches", "Pores", "Fermeté"]),
    Q("texture", "Texture ?", false, ["Huileuse", "Aqueuse", "Gel"]),
  ],
  "nettoyant": [
    Q("format", "Format ?", false, ["Liquide", "Solide", "Mousse", "Huile", "Gel", "Eau micellaire"]),
    Q("objectif", "Objectif ?", false, ["Purifier", "Douceur", "Anti-acné", "Démaquillant"]),
    Q("rincage", "Rinçage ?", false, ["À rincer", "Sans rinçage"]),
  ],
  "fond-de-teint-cosmetique": [
    Q("couvrance", "Couvrance ?", false, ["Légère", "Moyenne", "Totale"]),
    Q("fini", "Fini ?", false, ["Mat", "Naturel", "Lumineux", "Satiné"]),
    Q("tenue", "Tenue ?", false, ["Normale", "Longue tenue", "Waterproof"]),
    Q("format", "Format ?", false, ["Liquide", "Poudre", "Coussin", "Stick"]),
  ],
  "rouge-a-levres": [
    Q("fini", "Fini ?", false, ["Mat", "Satiné", "Brillant", "Gloss"]),
    Q("tenue", "Tenue ?", false, ["Courte", "Longue tenue", "Transfert-proof"]),
    Q("soin", "Avec soin hydratant ?", false, ["Avec soin hydratant", "Non important"]),
  ],
  "mascara": [
    Q("effet", "Effet ?", false, ["Volume", "Allongement", "Courbe", "Séparation", "Combiné"]),
    Q("tenue", "Tenue ?", false, ["Normale", "Longue tenue", "Waterproof"]),
  ],
  "blush": [
    Q("format", "Format ?", false, ["Poudre", "Crème", "Liquide"]),
    Q("fini", "Fini ?", false, ["Mat", "Satiné", "Shimmer"]),
  ],
  "palette-yeux": [
    Q("look", "Type de look ?", false, ["Nude & naturel", "Smoky", "Terracotta", "Prune & mauve", "Coloré"]),
    Q("fini", "Fini préféré ?", true, ["Mat", "Shimmer", "Métallisé", "Satiné"]),
  ],
  "highlighter": [
    Q("format", "Format ?", false, ["Poudre", "Crème", "Liquide"]),
    Q("teinte", "Teinte ?", false, ["Champagne", "Doré", "Rosé", "Argenté"]),
  ],
  "shampoing": [
    Q("texture", "Type de shampoing ?", false, ["Liquide", "Solide", "Mousse"]),
    Q("objectif", "Objectif principal ?", false, ["Nettoyage doux", "Volume", "Nutrition", "Antipelliculaire", "Sébum"]),
    Q("scalp", "Cuir chevelu ?", false, ["Gras", "Sec", "Normal", "Sensible", "À pellicules"]),
  ],
  "apres-shampoing": [
    Q("objectif", "Objectif principal ?", false, ["Démêlant", "Nutrition", "Volume", "Réparateur"]),
    Q("texture", "Texture ?", false, ["Légère", "Normale", "Riche"]),
  ],
  "masque-cheveux": [
    Q("objectif", "Objectif ?", false, ["Réparateur", "Hydratation intense", "Brillance", "Anti-casse"]),
    Q("frequence", "Fréquence ?", false, ["1 fois/semaine", "2 fois/semaine", "Quotidien"]),
  ],
  "huile-cheveux": [
    Q("moment", "Moment d'application ?", false, ["Avant shampoing", "Après shampoing", "Sur cheveux secs", "Les deux"]),
    Q("objectif", "Objectif ?", false, ["Brillance", "Nutrition", "Anti-frisottis", "Protection chaleur"]),
  ],
  "serum-cheveux": [
    Q("objectif", "Objectif ?", false, ["Anti-chute", "Pointes sèches", "Frisottis", "Cuir chevelu"]),
  ],
  "spray-coiffant": [
    Q("objectif", "Utilisation ?", false, ["Thermoprotection", "Définition des boucles", "Volume", "Lissage"]),
  ],
  "shampoing-sec": [
    Q("moment", "Moment d'utilisation ?", false, ["Matin", "Entre deux shampoings", "Avant sortie"]),
  ],
  "soin-anti-chute": [
    Q("type_chute", "Type de chute ?", false, ["Saisonnière", "Chronique", "Post-partum", "Liée au stress"]),
  ],
  "soin-cheveux-colores": [
    Q("traitement", "Type de traitement colorant ?", false, ["Coloration chimique", "Décoloration", "Mèches", "Coloration naturelle"]),
    Q("objectif", "Objectif ?", false, ["Protéger la couleur", "Réparer la fibre", "Brillance", "Douceur"]),
  ],
  "soin-cuir-chevelu": [
    Q("probleme", "Problème principal ?", false, ["Pellicules", "Excès de sébum", "Cuir chevelu sensible", "Démangeaisons"]),
  ],
};

// Fallback generic questions when product type has no specific config
export const GENERIC_PRODUCT_QUESTIONS = [
  Q("texture", "Texture préférée ?", false, ["Légère", "Fluide", "Riche", "Crémeuse"]),
  Q("objectif", "Objectif principal ?", false, ["Hydratation", "Éclat", "Anti-âge", "Apaisant", "Matifiant"]),
];

export function getProductQuestions(slug) {
  return PRODUCT_QUESTIONS[slug] || GENERIC_PRODUCT_QUESTIONS;
}

// === Bloc 3 : questions spécifiques par problème de peau ===
export const PROBLEM_QUESTIONS = {
  "acne": {
    questions: [
      Q("duree", "Depuis quand as-tu ce problème ?", false, ["Récent (moins de 3 mois)", "Quelques mois", "Chronique, plusieurs années"]),
      Q("type_boutons", "Type de boutons ?", true, ["Points noirs", "Boutons blancs", "Boutons inflammatoires rouges", "Kystes profonds"]),
      Q("traitements", "As-tu déjà essayé des traitements ?", true, ["Acide salicylique", "Peroxyde de benzoyle", "Rétinoïdes", "Suivi dermatologique", "Aucun"]),
      Q("declencheurs", "Facteurs déclenchants identifiés ?", true, ["Stress", "Alimentation", "Hormones ou cycle", "Exposition solaire", "Produits cosmétiques", "Je ne sais pas"]),
    ],
  },
  "peau-seche": {
    questions: [
      Q("tiraill", "Ta peau tiraille... ?", false, ["Après la douche", "Toute la journée", "Seulement en hiver", "Rarement"]),
      Q("objectif", "Tu cherches plutôt à ?", false, ["Hydrater en surface", "Nourrir en profondeur", "Réparer la barrière cutanée"]),
    ],
  },
  "rougeurs": {
    questions: [
      Q("type_rougeurs", "Type de rougeurs ?", false, ["Diffuses sur les joues", "Localisées, vaisseaux visibles", "Par plaques", "Après exposition soleil-froid-chaud"]),
      Q("declencheurs", "Déclencheurs connus ?", true, ["Soleil", "Froid", "Chaud ou épices", "Alcool", "Stress", "Aucun identifié"]),
    ],
  },
  "taches": {
    questions: [
      Q("type_taches", "Quel type de taches ?", true, ["Taches brunes ou solaires", "Cicatrices d'acné", "Mélasma", "Taches de vieillesse", "Je ne sais pas"]),
      Q("soleil", "Exposition au soleil ?", false, ["Quotidienne sans protection", "Quotidienne avec SPF", "Occasionnelle", "Rare"]),
      Q("priorite", "Ta priorité ?", false, ["Estomper les taches existantes", "Prévenir de nouvelles taches", "Unifier le teint", "Les deux"]),
    ],
  },
  "anti-age": {
    questions: [
      Q("signes", "Type de signes de l'âge ?", false, ["Ridules fines", "Rides marquées", "Perte de fermeté", "Relâchement"]),
      Q("priorite", "Ta priorité ?", false, ["Prévenir", "Corriger", "Repulper", "Raffermir"]),
    ],
  },
  "pores": {
    questions: [
      Q("cause", "Cause probable selon toi ?", false, ["Excès de sébum", "Déshydratation", "Âge, perte d'élasticité", "Je ne sais pas"]),
    ],
  },
  "eczema": {
    disclaimer: "Ce diagnostic doit être posé par un dermatologue. Nos recommandations sont des soins cosmétiques d'accompagnement, pas un traitement médical.",
    questions: [
      Q("objectif", "Que recherches-tu avant tout ?", false, ["Apaiser les irritations", "Hydrater intensément", "Réduire les rougeurs associées", "Produits hypoallergéniques, sans parfum"]),
    ],
  },
  "psoriasis": {
    disclaimer: "Ce diagnostic doit être posé par un dermatologue. Nos recommandations sont des soins cosmétiques d'accompagnement, pas un traitement médical.",
    questions: [
      Q("objectif", "Que recherches-tu avant tout ?", false, ["Apaiser", "Hydrater intensément", "Réduire les plaques visibles", "Produits doux, sans parfum"]),
    ],
  },
  "vitiligo": {
    disclaimer: "Ce diagnostic doit être posé par un dermatologue. Nos recommandations sont des soins cosmétiques d'accompagnement, pas un traitement médical.",
    questions: [
      Q("objectif", "Que recherches-tu ?", false, ["Protection solaire renforcée", "Unifier visuellement le teint", "Soin apaisant au quotidien", "Accompagnement global"]),
    ],
  },
  "sensible": {
    questions: [
      Q("reactions", "Réactions fréquentes ?", true, ["Tiraillements", "Rougeurs", "Démangeaisons", "Picotements après application de produits"]),
      Q("sensible_a", "Sensible à ?", true, ["Parfum", "Alcool", "Actifs type rétinol ou AHA", "Climat, froid-chaud"]),
    ],
  },
  "sebum": {
    questions: [
      Q("moment", "Moment le plus marqué ?", false, ["Dès le matin", "En journée", "Le soir"]),
      Q("objectif", "Tu cherches plutôt à ?", false, ["Matifier", "Réguler sans assécher", "Resserrer les pores"]),
    ],
  },
  "cernes": {
    questions: [
      Q("type_cernes", "Type ?", false, ["Cernes bleus ou violets", "Cernes bruns pigmentés", "Poches ou gonflements", "Les deux"]),
      Q("cause", "Cause principale selon toi ?", false, ["Fatigue, manque de sommeil", "Génétique", "Âge", "Allergies"]),
    ],
  },
};

export function getProblemQuestions(slug) {
  const config = PROBLEM_QUESTIONS[slug];
  if (!config) return { questions: [], disclaimer: null };
  return { questions: config.questions || [], disclaimer: config.disclaimer || null };
}

// Cosmétiques "teint" : type de peau pertinent
const TEINT_SLUGS = new Set([
  "fond-de-teint-cosmetique", "poudre", "primer", "highlighter", "blush", "contouring",
]);

// Cosmétiques "couleur" : type de peau non pertinent
const COULEUR_SLUGS = new Set([
  "rouge-a-levres", "mascara", "eyeliner", "palette-yeux", "sourcils",
]);

export function getQuestionsForProduct(parent, slug) {
  const productQs = PRODUCT_QUESTIONS[slug] || GENERIC_PRODUCT_QUESTIONS;
  if (parent === "visage" || parent === "corps") {
    return [...SKIN_QUESTIONS, ...LIFESTYLE_QUESTIONS, ...productQs];
  }
  if (parent === "cheveux") {
    return [...HAIR_QUESTIONS, ...HAIR_LIFESTYLE_QUESTIONS, ...productQs];
  }
  if (parent === "cosmetiques") {
    if (TEINT_SLUGS.has(slug)) return [...SKIN_QUESTIONS, ...productQs];
    if (COULEUR_SLUGS.has(slug)) return [Q_BUDGET, ...productQs];
  }
  // fallback : skincare par défaut
  return [...SKIN_QUESTIONS, ...productQs];
}

// Clés stockées au niveau racine des réponses (pas dans product_answers)
export const SKIN_ANSWER_KEYS = new Set([
  "skin_type", "budget", "ingredients", "allergies", "lifestyle", "alimentation",
  "hair_type", "coloration", "chaleur", "eau_chloree", "lavage",
]);

// === Bloc questions par CATÉGORIE (visage/corps/cheveux) ===
const QC = (key, label, multi, options) => ({ key, label, multi, options: options.map((v) => ({ value: v, label: v })) });

export const CATEGORY_QUESTIONS = {
  visage: [
    QC("skin_type", "Quel est ton type de peau ?", false, ["Peau grasse", "Peau sèche", "Peau mixte", "Peau sensible", "Peau normale", "Peau mature", "Peau acnéique"]),
    QC("skin_concerns", "Tes préoccupations principales ?", true, ["Acné / Imperfections", "Pores dilatés", "Taches & hyperpigmentation", "Teint terne", "Rides & anti-âge", "Rougeurs & couperose", "Sensibilité & réactivité", "Déshydratation", "Excès de sébum", "Cernes & poches"]),
    QC("skin_ingredients", "Ingrédients à privilégier ou éviter ?", true, ["Sans paraben", "Sans silicone", "Vegan", "Cruelty-free", "Naturel / Bio", "Acide hyaluronique", "Rétinol", "Niacinamide", "Vitamine C", "Aucune préférence"]),
  ],
  corps: [
    QC("body_type", "Type de peau corporelle ?", false, ["Sèche", "Normale", "Mixte", "Sensible", "Très sèche"]),
    QC("body_concerns", "Tes préoccupations corps ?", true, ["Vergetures", "Cellulite", "Peau qui tiraille", "Démangeaisons", "Taches corporelles", "Cicatrices", "Acné corps", "Peau terne", "Transpiration excessive"]),
    QC("body_ingredients", "Ingrédients préférés ?", true, ["Karité", "Argan", "Aloe vera", "Vitamine E", "Huile de coco", "Sans parfum", "Collagène", "Bio", "Vegan"]),
  ],
  cheveux: [
    QC("hair_type", "Quel est ton type de cheveux ?", false, ["Raides", "Ondulés", "Bouclés", "Crépus", "Frisés"]),
    QC("hair_thickness", "Épaisseur ?", false, ["Fins", "Normaux", "Épais"]),
    QC("hair_scalp", "Type de cuir chevelu ?", false, ["Gras", "Sec", "Normal", "Sensible", "À pellicules"]),
    QC("hair_concerns", "Tes préoccupations cheveux ?", true, ["Chute", "Casse", "Pointes sèches", "Pellicules", "Perte d'éclat", "Frisottis", "Cheveux colorés", "Cheveux abîmés", "Manque de volume"]),
    QC("hair_ingredients", "Ingrédients préférés ?", true, ["Kératine", "Huile d'argan", "Coco", "Karité", "Aloe vera", "Sans sulfate", "Sans silicone", "Vegan", "Bio"]),
  ],
};

// Pour Routine 360° on combine les 3 catégories
CATEGORY_QUESTIONS["360"] = [
  ...CATEGORY_QUESTIONS.visage.slice(0, 2),
  ...CATEGORY_QUESTIONS.corps.slice(0, 1),
  ...CATEGORY_QUESTIONS.cheveux.slice(0, 2),
];

export function getCategoryQuestions(typeKey) {
  return CATEGORY_QUESTIONS[typeKey] || [];
}

// === Liste des produits pour la Routine 360° ===
export const ROUTINE_PRODUCTS = [
  // Skincare
  { slug: "nettoyant", label: "Savon/Nettoyant", category: "nettoyant", emoji: "🧼", section: "skincare" },
  { slug: "eau-micellaire", label: "Eau micellaire", category: "nettoyant", emoji: "💧", section: "skincare" },
  { slug: "tonique", label: "Tonique", category: "brume", emoji: "🌿", section: "skincare" },
  { slug: "serum", label: "Sérum", category: "serum", emoji: "🧪", section: "skincare" },
  { slug: "creme-visage", label: "Crème visage", category: "creme-hydratante", emoji: "🧴", section: "skincare" },
  { slug: "contour-yeux", label: "Contour des yeux", category: "contour-yeux", emoji: "👁️", section: "skincare" },
  { slug: "masque", label: "Masque", category: "masque", emoji: "🎭", section: "skincare" },
  { slug: "exfoliant", label: "Exfoliant", category: "exfoliant", emoji: "✨", section: "skincare" },
  { slug: "huile-visage", label: "Huile visage", category: "huile-visage", emoji: "🌟", section: "skincare" },
  { slug: "creme-corps", label: "Crème corps", category: "creme-corps", emoji: "🌸", section: "skincare" },
  { slug: "demaquillant", label: "Démaquillant", category: "nettoyant", emoji: "🧖", section: "skincare" },
  { slug: "brume", label: "Brume", category: "brume", emoji: "💨", section: "skincare" },
  { slug: "creme-solaire", label: "Crème solaire visage", category: "creme-solaire-visage", emoji: "☀️", section: "skincare" },
  { slug: "soin-levres", label: "Soin lèvres", category: "soin-levres", emoji: "💋", section: "skincare" },
  // Maquillage
  { slug: "fond-de-teint", label: "Fond de teint", category: "fond-de-teint-cosmetique", emoji: "🌹", section: "maquillage" },
  { slug: "correcteur", label: "Correcteur", category: "fond-de-teint-cosmetique", emoji: "🩷", section: "maquillage" },
  { slug: "poudre", label: "Poudre", category: "poudre", emoji: "🤍", section: "maquillage" },
  { slug: "blush", label: "Blush", category: "blush", emoji: "🌸", section: "maquillage" },
  { slug: "bronzer", label: "Bronzer", category: "blush", emoji: "🧡", section: "maquillage" },
  { slug: "highlighter", label: "Highlighter", category: "highlighter", emoji: "✨", section: "maquillage" },
  { slug: "palette-yeux", label: "Fard à paupières", category: "palette-yeux", emoji: "🎨", section: "maquillage" },
  { slug: "mascara", label: "Mascara", category: "mascara", emoji: "👁️", section: "maquillage" },
  { slug: "eyeliner", label: "Eyeliner", category: "eyeliner", emoji: "✏️", section: "maquillage" },
  { slug: "rouge-a-levres", label: "Rouge à lèvres", category: "rouge-a-levres", emoji: "💄", section: "maquillage" },
  { slug: "gloss", label: "Gloss", category: "rouge-a-levres", emoji: "💋", section: "maquillage" },
  { slug: "sourcils", label: "Sourcils", category: "sourcils", emoji: "✒️", section: "maquillage" },
  { slug: "primer", label: "Primer", category: "primer", emoji: "🌟", section: "maquillage" },
  // Cheveux
  { slug: "shampoing", label: "Shampoing", category: "shampoing", emoji: "🧴", section: "cheveux" },
  { slug: "apres-shampoing", label: "Après-shampoing", category: "apres-shampoing", emoji: "💧", section: "cheveux" },
  { slug: "masque-cheveux", label: "Masque cheveux", category: "masque-cheveux", emoji: "🎭", section: "cheveux" },
  { slug: "huile-cheveux", label: "Huile cheveux", category: "huile-cheveux", emoji: "✨", section: "cheveux" },
  { slug: "serum-cheveux", label: "Sérum cheveux", category: "serum-cheveux", emoji: "🌟", section: "cheveux" },
  { slug: "spray-coiffant", label: "Spray coiffant", category: "spray-coiffant", emoji: "💨", section: "cheveux" },
];

export function getRoutineProductBySlug(slug) {
  return ROUTINE_PRODUCTS.find((p) => p.slug === slug);
}

// Budget ranges
export const BUDGET_RANGES = {
  "0-15": [0, 15],
  "15-30": [15, 30],
  "30-60": [30, 60],
  "60-300": [60, 300],
};
