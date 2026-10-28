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

const Q = (key, label, multi, options) => ({ key, label, multi, options: options.map((v) => ({ value: v, label: v })) });


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
    allowNone: true,
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
// Règle : les questions "structurelles" (un seul fait vrai possible, ex. type de cuir
// chevelu, type de chute, type de traitement, problème diagnostiqué) restent en
// sélection unique sans option "Peu importe". Les questions de "goût"/style (texture,
// fini, objectif, tenue, format...) sont en sélection multiple et proposent "Peu importe",
// pour élargir les produits proposés plutôt que de forcer un choix unique trop restrictif.
export const PRODUCT_QUESTIONS = {
  "masque": [
    Q("texture", "Texture préférée ?", true, ["Argile", "Crème", "Gel", "Tissu", "Peel-off", "Peu importe"]),
    Q("objectif", "Objectif principal ?", true, ["Purifier", "Hydrater", "Éclat", "Anti-âge", "Apaisant", "Peu importe"]),
    Q("ingredients_specifiques", "Ingrédients spécifiques souhaités ?", true, ["Charbon", "Argile", "Kaolin", "Acide salicylique", "Aloe vera", "Vitamine C", "Miel", "Peu importe"]),
    Q("frequence", "Fréquence d'utilisation ?", true, ["1 fois/semaine", "2-3 fois/semaine", "Quotidien", "Peu importe"]),
  ],
  "creme-hydratante": [
    Q("texture", "Texture ?", true, ["Légère/Gel", "Fluide", "Riche", "Baume", "Peu importe"]),
    Q("moment", "Moment d'application ?", true, ["Matin", "Soir", "Peu importe"]),
    Q("benefice", "Bénéfice principal ?", true, ["Hydratation intense", "Anti-âge", "Éclat", "Matifiant", "Apaisant", "Peu importe"]),
    Q("ingredients_specifiques", "Ingrédients ?", true, ["Acide hyaluronique", "Rétinol", "Niacinamide", "Céramides", "Squalane", "Vitamine C", "Peu importe"]),
  ],
  "serum": [
    Q("concentration", "Concentration souhaitée ?", true, ["Légère", "Concentrée", "Peu importe"]),
    Q("objectif", "Objectif ?", true, ["Anti-âge", "Éclat", "Hydratation", "Anti-taches", "Pores", "Fermeté", "Peu importe"]),
    Q("texture", "Texture ?", true, ["Huileuse", "Aqueuse", "Gel", "Peu importe"]),
  ],
  "nettoyant": [
    Q("format", "Format ?", true, ["Liquide", "Solide", "Mousse", "Huile", "Gel", "Eau micellaire", "Peu importe"]),
    Q("objectif", "Objectif ?", true, ["Purifier", "Douceur", "Anti-acné", "Démaquillant", "Peu importe"]),
    Q("rincage", "Rinçage ?", true, ["À rincer", "Sans rinçage", "Peu importe"]),
  ],
  "fond-de-teint-cosmetique": [
    Q("couvrance", "Couvrance ?", true, ["Légère", "Moyenne", "Totale", "Peu importe"]),
    Q("fini", "Fini ?", true, ["Mat", "Naturel", "Lumineux", "Satiné", "Peu importe"]),
    Q("tenue", "Tenue ?", true, ["Normale", "Longue tenue", "Waterproof", "Peu importe"]),
    Q("format", "Format ?", true, ["Liquide", "Poudre", "Coussin", "Stick", "Peu importe"]),
  ],
  "rouge-a-levres": [
    Q("fini", "Fini ?", true, ["Mat", "Satiné", "Brillant", "Gloss", "Peu importe"]),
    Q("tenue", "Tenue ?", true, ["Courte", "Longue tenue", "Transfert-proof", "Peu importe"]),
    Q("soin", "Avec soin hydratant ?", false, ["Avec soin hydratant", "Peu importe"]),
  ],
  "mascara": [
    Q("effet", "Effet ?", true, ["Volume", "Allongement", "Courbe", "Séparation", "Combiné", "Peu importe"]),
    Q("tenue", "Tenue ?", true, ["Normale", "Longue tenue", "Waterproof", "Peu importe"]),
  ],
  "eyeliner": [
    Q("format", "Format ?", true, ["Liquide", "Feutre", "Crayon", "Gel", "Peu importe"]),
    Q("tenue", "Tenue ?", true, ["Normale", "Longue tenue", "Waterproof", "Peu importe"]),
  ],
  "blush": [
    Q("format", "Format ?", true, ["Poudre", "Crème", "Liquide", "Peu importe"]),
    Q("fini", "Fini ?", true, ["Mat", "Satiné", "Shimmer", "Peu importe"]),
  ],
  "palette-yeux": [
    Q("look", "Type de look ?", true, ["Nude & naturel", "Smoky", "Terracotta", "Prune & mauve", "Coloré", "Peu importe"]),
    Q("fini", "Fini préféré ?", true, ["Mat", "Shimmer", "Métallisé", "Satiné", "Peu importe"]),
  ],
  "highlighter": [
    Q("format", "Format ?", true, ["Poudre", "Crème", "Liquide", "Peu importe"]),
    Q("teinte", "Teinte ?", true, ["Champagne", "Doré", "Rosé", "Argenté", "Peu importe"]),
  ],
  "shampoing": [
    Q("texture", "Type de shampoing ?", true, ["Liquide", "Solide", "Mousse", "Peu importe"]),
    Q("objectif", "Objectif principal ?", true, ["Nettoyage doux", "Volume", "Nutrition", "Antipelliculaire", "Sébum", "Peu importe"]),
    Q("scalp", "Cuir chevelu ?", false, ["Gras", "Sec", "Normal", "Sensible", "À pellicules"]),
  ],
  "apres-shampoing": [
    Q("objectif", "Objectif principal ?", true, ["Démêlant", "Nutrition", "Volume", "Réparateur", "Peu importe"]),
    Q("texture", "Texture ?", true, ["Légère", "Normale", "Riche", "Peu importe"]),
  ],
  "masque-cheveux": [
    Q("objectif", "Objectif ?", true, ["Réparateur", "Hydratation intense", "Brillance", "Anti-casse", "Peu importe"]),
    Q("frequence", "Fréquence ?", true, ["1 fois/semaine", "2 fois/semaine", "Quotidien", "Peu importe"]),
  ],
  "huile-cheveux": [
    Q("moment", "Moment d'application ?", true, ["Avant shampoing", "Après shampoing", "Sur cheveux secs", "Peu importe"]),
    Q("objectif", "Objectif ?", true, ["Brillance", "Nutrition", "Anti-frisottis", "Protection chaleur", "Peu importe"]),
  ],
  "serum-cheveux": [
    Q("objectif", "Objectif ?", true, ["Anti-chute", "Pointes sèches", "Frisottis", "Cuir chevelu", "Peu importe"]),
  ],
  "spray-coiffant": [
    Q("objectif", "Utilisation ?", true, ["Thermoprotection", "Définition des boucles", "Volume", "Lissage", "Peu importe"]),
  ],
  "shampoing-sec": [
    Q("moment", "Moment d'utilisation ?", true, ["Matin", "Entre deux shampoings", "Avant sortie", "Peu importe"]),
  ],
  "soin-anti-chute": [
    Q("type_chute", "Type de chute ?", false, ["Saisonnière", "Chronique", "Post-partum", "Liée au stress"]),
  ],
  "soin-cheveux-colores": [
    Q("traitement", "Type de traitement colorant ?", false, ["Coloration chimique", "Décoloration", "Mèches", "Coloration naturelle"]),
    Q("objectif", "Objectif ?", true, ["Protéger la couleur", "Réparer la fibre", "Brillance", "Douceur", "Peu importe"]),
  ],
  "soin-cuir-chevelu": [
    Q("probleme", "Problème principal ?", false, ["Pellicules", "Excès de sébum", "Cuir chevelu sensible", "Démangeaisons"]),
  ],
  "huile-corps": [
    Q("moment", "Moment d'application ?", true, ["Après la douche", "Avant le coucher", "Peu importe"]),
    Q("objectif", "Objectif principal ?", true, ["Hydratation intense", "Nourrir en profondeur", "Fermeté", "Anti-vergetures", "Peu importe"]),
  ],
  "creme-solaire-corps": [
    Q("spf", "Indice de protection souhaité ?", false, ["SPF 30", "SPF 50", "Peu importe"]),
    Q("texture", "Texture préférée ?", true, ["Légère / Fluide", "Riche", "Spray", "Peu importe"]),
  ],
};

// Fallback generic questions when product type has no specific config
export const GENERIC_PRODUCT_QUESTIONS = [
  Q("texture", "Texture préférée ?", true, ["Légère", "Fluide", "Riche", "Crémeuse", "Peu importe"]),
  Q("objectif", "Objectif principal ?", true, ["Hydratation", "Éclat", "Anti-âge", "Apaisant", "Matifiant", "Peu importe"]),
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
      { ...Q("reactions", "Réactions fréquentes ?", true, ["Tiraillements", "Rougeurs", "Démangeaisons", "Picotements après application de produits"]), allowNone: true },
      { ...Q("sensible_a", "Sensible à ?", true, ["Parfum", "Alcool", "Actifs type rétinol ou AHA", "Climat, froid-chaud"]), allowNone: true },
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
export const TEINT_SLUGS = new Set([
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
    { ...QC("skin_concerns", "Tes préoccupations principales ?", true, ["Acné / Imperfections", "Pores dilatés", "Taches & hyperpigmentation", "Teint terne", "Rides & anti-âge", "Rougeurs & couperose", "Sensibilité & réactivité", "Déshydratation", "Excès de sébum", "Cernes & poches"]), allowNone: true },
    QC("skin_ingredients", "Ingrédients à privilégier ou éviter ?", true, ["Sans paraben", "Sans silicone", "Vegan", "Cruelty-free", "Naturel / Bio", "Acide hyaluronique", "Rétinol", "Niacinamide", "Vitamine C", "Aucune préférence"]),
    ...LIFESTYLE_QUESTIONS,
  ],
  corps: [
    QC("body_type", "Type de peau corporelle ?", false, ["Sèche", "Normale", "Mixte", "Sensible", "Très sèche"]),
    { ...QC("body_concerns", "Tes préoccupations corps ?", true, ["Vergetures", "Cellulite", "Peau qui tiraille", "Démangeaisons", "Taches corporelles", "Cicatrices", "Acné corps", "Peau terne", "Transpiration excessive"]), allowNone: true },
    { ...QC("body_ingredients", "Ingrédients préférés ?", true, ["Karité", "Argan", "Aloe vera", "Vitamine E", "Huile de coco", "Sans parfum", "Collagène", "Bio", "Vegan"]), allowNone: true },
    ...LIFESTYLE_QUESTIONS,
  ],
  cheveux: [
    QC("hair_type", "Quel est ton type de cheveux ?", false, ["Raides", "Ondulés", "Bouclés", "Crépus", "Frisés"]),
    QC("hair_thickness", "Épaisseur ?", false, ["Fins", "Normaux", "Épais"]),
    QC("hair_scalp", "Type de cuir chevelu ?", false, ["Gras", "Sec", "Normal", "Sensible", "À pellicules"]),
    { ...QC("hair_concerns", "Tes préoccupations cheveux ?", true, ["Chute", "Casse", "Pointes sèches", "Pellicules", "Perte d'éclat", "Frisottis", "Cheveux colorés", "Cheveux abîmés", "Manque de volume"]), allowNone: true },
    { ...QC("hair_ingredients", "Ingrédients préférés ?", true, ["Kératine", "Huile d'argan", "Coco", "Karité", "Aloe vera", "Sans sulfate", "Sans silicone", "Vegan", "Bio"]), allowNone: true },
    ...HAIR_LIFESTYLE_QUESTIONS,
    // Affichée uniquement pour les cheveux frisés/crépus (filtrée côté page).
    { ...QC("hair_porosity", "Quelle est ta porosité ?", false, ["Faible", "Moyenne", "Forte"]), allowNone: true },
  ],
};

// Pour Routine 360° on combine les éléments structurants des 3 catégories
// (type de peau/corps/cheveux + préoccupations) et n'interroge le style de vie
// qu'une seule fois, plutôt que de le répéter trois fois de suite.
CATEGORY_QUESTIONS["360"] = [
  QC("skin_type", "Quel est ton type de peau ?", false, ["Peau grasse", "Peau sèche", "Peau mixte", "Peau sensible", "Peau normale", "Peau mature", "Peau acnéique"]),
  { ...QC("skin_concerns", "Tes préoccupations visage ?", true, ["Acné / Imperfections", "Pores dilatés", "Taches & hyperpigmentation", "Teint terne", "Rides & anti-âge", "Rougeurs & couperose", "Sensibilité & réactivité", "Déshydratation", "Excès de sébum", "Cernes & poches"]), allowNone: true },
  QC("body_type", "Type de peau corporelle ?", false, ["Sèche", "Normale", "Mixte", "Sensible", "Très sèche"]),
  { ...QC("body_concerns", "Tes préoccupations corps ?", true, ["Vergetures", "Cellulite", "Peau qui tiraille", "Démangeaisons", "Taches corporelles", "Cicatrices", "Acné corps", "Peau terne", "Transpiration excessive"]), allowNone: true },
  QC("hair_type", "Quel est ton type de cheveux ?", false, ["Raides", "Ondulés", "Bouclés", "Crépus", "Frisés"]),
  { ...QC("hair_concerns", "Tes préoccupations cheveux ?", true, ["Chute", "Casse", "Pointes sèches", "Pellicules", "Perte d'éclat", "Frisottis", "Cheveux colorés", "Cheveux abîmés", "Manque de volume"]), allowNone: true },
  ...LIFESTYLE_QUESTIONS,
];

export function getCategoryQuestions(typeKey) {
  return CATEGORY_QUESTIONS[typeKey] || [];
}

// === Liste des produits pour la Routine 360° ===
// `det` = déterminant possessif correct pour "Personnalise {det} <produit>"
// (accord en genre, avec élision devant voyelle : "ton eau", pas "ta eau").
export const ROUTINE_PRODUCTS = [
  // Mêmes catégories, mêmes libellés et même ordre que le menu du site (API
  // /categories, backend/catalog.py) : le choix des produits d'une routine est
  // identique à la recherche d'un produit unique. `group` = bloc d'affichage,
  // `section` = regroupement du bilan PDF. `alsoIn` = autre bloc où le choix apparaît aussi (la brume sert au visage et au corps). Eau micellaire, Tonique, Gloss, Correcteur et Bronzer sont des choix propres aux routines (absents du menu produit unique).
  // Visage
  { slug: "creme-hydratante", label: "Crème hydratante", category: "creme-hydratante", emoji: "🧴", section: "skincare", group: "visage", det: "ta", short: "Crème hydratante" },
  { slug: "serum", label: "Sérum", category: "serum", emoji: "🧪", section: "skincare", group: "visage", det: "ton" },
  { slug: "nettoyant", label: "Savon / Nettoyant", category: "nettoyant", emoji: "🧼", section: "skincare", group: "visage", det: "ton", short: "Savon / nettoyant" },
  { slug: "eau-micellaire", label: "Eau micellaire", category: "nettoyant", emoji: "💧", section: "skincare", group: "visage", det: "ton", fem: true },
  { slug: "huile-visage", label: "Huile visage", category: "huile-visage", emoji: "🌟", section: "skincare", group: "visage", det: "ton", fem: true },
  { slug: "masque", label: "Masque", category: "masque", emoji: "🎭", section: "skincare", group: "visage", det: "ton" },
  { slug: "contour-yeux", label: "Contour des yeux", category: "contour-yeux", emoji: "👁️", section: "skincare", group: "visage", det: "ton" },
  { slug: "soin-levres", label: "Soin lèvres", category: "soin-levres", emoji: "💋", section: "skincare", group: "visage", det: "ton" },
  { slug: "exfoliant", label: "Exfoliant / Gommage", category: "exfoliant", emoji: "✨", section: "skincare", group: "visage", det: "ton", short: "Exfoliant" },
  { slug: "fond-de-teint", label: "Fond de teint / BB cream", category: "fond-de-teint", emoji: "🌹", section: "skincare", group: "visage", det: "ton", short: "Fond de teint" },
  { slug: "demaquillant", label: "Démaquillant", category: "demaquillant", emoji: "🧖", section: "skincare", group: "visage", det: "ton" },
  { slug: "tonique", label: "Tonique", category: "brume", emoji: "🌿", section: "skincare", group: "visage", det: "ton" },
  { slug: "brume", label: "Brume / Eau thermale", category: "brume", emoji: "💨", section: "skincare", group: "visage", det: "ta", alsoIn: ["corps"], short: "Brume" },
  { slug: "creme-solaire-visage", label: "Crème solaire visage", category: "creme-solaire-visage", emoji: "☀️", section: "skincare", group: "visage", det: "ta" },
  // Corps
  { slug: "creme-corps", label: "Crème corps", category: "creme-corps", emoji: "🌸", section: "skincare", group: "corps", det: "ta" },
  { slug: "huile-corps", label: "Huile corps", category: "huile-corps", emoji: "🌟", section: "skincare", group: "corps", det: "ton", fem: true },
  { slug: "gommage-corps", label: "Gommage corps", category: "gommage-corps", emoji: "✨", section: "skincare", group: "corps", det: "ton" },
  { slug: "lait-corporel", label: "Lait corporel", category: "lait-corporel", emoji: "🥛", section: "skincare", group: "corps", det: "ton" },
  { slug: "beurre-corporel", label: "Beurre corporel", category: "beurre-corporel", emoji: "🧈", section: "skincare", group: "corps", det: "ton" },
  { slug: "soin-mains", label: "Soin mains & ongles", category: "soin-mains", emoji: "🤲", section: "skincare", group: "corps", det: "ton", short: "Soin mains" },
  { slug: "soin-pieds", label: "Soin pieds", category: "soin-pieds", emoji: "🦶", section: "skincare", group: "corps", det: "ton" },
  { slug: "deodorant", label: "Déodorant / Soin aisselles", category: "deodorant", emoji: "🌿", section: "skincare", group: "corps", det: "ton", short: "Déodorant" },
  { slug: "autobronzant", label: "Autobronzant", category: "autobronzant", emoji: "🌞", section: "skincare", group: "corps", det: "ton" },
  { slug: "vergetures", label: "Soin vergetures & cicatrices", category: "vergetures", emoji: "🩹", section: "skincare", group: "corps", det: "ton", short: "Soin vergetures" },
  { slug: "creme-solaire-corps", label: "Crème solaire corps", category: "creme-solaire-corps", emoji: "☀️", section: "skincare", group: "corps", det: "ta" },
  { slug: "gel-douche", label: "Gel douche / Savon corps", category: "gel-douche", emoji: "🧼", section: "skincare", group: "corps", det: "ton", short: "Gel douche" },
  // Maquillage
  { slug: "rouge-a-levres", label: "Rouge à lèvres / Gloss", category: "rouge-a-levres", emoji: "💄", section: "maquillage", group: "maquillage", det: "ton", short: "Rouge à lèvres" },
  { slug: "gloss", label: "Gloss", category: "rouge-a-levres", emoji: "💋", section: "maquillage", group: "maquillage", det: "ton" },
  { slug: "fond-de-teint-cosmetique", label: "Fond de teint & Correcteur", category: "fond-de-teint-cosmetique", emoji: "🌹", section: "maquillage", group: "maquillage", det: "ton", short: "Fond de teint" },
  { slug: "correcteur", label: "Correcteur", category: "fond-de-teint-cosmetique", emoji: "🩷", section: "maquillage", group: "maquillage", det: "ton" },
  { slug: "palette-yeux", label: "Palette yeux", category: "palette-yeux", emoji: "🎨", section: "maquillage", group: "maquillage", det: "ta" },
  { slug: "mascara", label: "Mascara", category: "mascara", emoji: "👁️", section: "maquillage", group: "maquillage", det: "ton" },
  { slug: "eyeliner", label: "Eyeliner & Crayon yeux", category: "eyeliner", emoji: "✏️", section: "maquillage", group: "maquillage", det: "ton", short: "Eyeliner" },
  { slug: "blush", label: "Blush & Bronzer", category: "blush", emoji: "🌸", section: "maquillage", group: "maquillage", det: "ton", short: "Blush" },
  { slug: "bronzer", label: "Bronzer", category: "blush", emoji: "🧡", section: "maquillage", group: "maquillage", det: "ton" },
  { slug: "highlighter", label: "Highlighter / Enlumineur", category: "highlighter", emoji: "✨", section: "maquillage", group: "maquillage", det: "ton", short: "Highlighter" },
  { slug: "poudre", label: "Poudre (libre, compacte)", category: "poudre", emoji: "🤍", section: "maquillage", group: "maquillage", det: "ta", short: "Poudre" },
  { slug: "contouring", label: "Contouring", category: "contouring", emoji: "🧡", section: "maquillage", group: "maquillage", det: "ton" },
  { slug: "sourcils", label: "Sourcils", category: "sourcils", emoji: "✒️", section: "maquillage", group: "maquillage", det: "tes" },
  { slug: "primer", label: "Base & Primer", category: "primer", emoji: "🌟", section: "maquillage", group: "maquillage", det: "ton", short: "Primer" },
  { slug: "demaquillant-cosm", label: "Démaquillant & Micellar", category: "demaquillant-cosm", emoji: "💧", section: "maquillage", group: "maquillage", det: "ton", short: "Démaquillant" },
  // Cheveux
  { slug: "shampoing", label: "Shampoing", category: "shampoing", emoji: "🧴", section: "cheveux", group: "cheveux", det: "ton" },
  { slug: "apres-shampoing", label: "Après-shampoing", category: "apres-shampoing", emoji: "💧", section: "cheveux", group: "cheveux", det: "ton" },
  { slug: "masque-cheveux", label: "Masque cheveux", category: "masque-cheveux", emoji: "🎭", section: "cheveux", group: "cheveux", det: "ton" },
  { slug: "huile-cheveux", label: "Huile cheveux", category: "huile-cheveux", emoji: "✨", section: "cheveux", group: "cheveux", det: "ton", fem: true },
  { slug: "serum-cheveux", label: "Sérum cheveux", category: "serum-cheveux", emoji: "🌟", section: "cheveux", group: "cheveux", det: "ton" },
  { slug: "spray-coiffant", label: "Spray coiffant", category: "spray-coiffant", emoji: "💨", section: "cheveux", group: "cheveux", det: "ton" },
  { slug: "shampoing-sec", label: "Shampoing sec", category: "shampoing-sec", emoji: "🌫️", section: "cheveux", group: "cheveux", det: "ton" },
  { slug: "soin-anti-chute", label: "Soin anti-chute", category: "soin-anti-chute", emoji: "🌱", section: "cheveux", group: "cheveux", det: "ton" },
  { slug: "soin-cheveux-colores", label: "Soin cheveux colorés", category: "soin-cheveux-colores", emoji: "🎨", section: "cheveux", group: "cheveux", det: "ton" },
  { slug: "soin-cuir-chevelu", label: "Soin cuir chevelu", category: "soin-cuir-chevelu", emoji: "🌿", section: "cheveux", group: "cheveux", det: "ton" },
  { slug: "creme-visage", label: "Crème visage", category: "creme-hydratante", emoji: "🧴", section: "skincare", group: "visage", hidden: true, det: "ta" },
  { slug: "creme-solaire", label: "Crème solaire visage", category: "creme-solaire-visage", emoji: "☀️", section: "skincare", group: "visage", hidden: true, det: "ta" },
];

// Titre accorde en genre et en nombre : "Ta brume idéale", "Ton sérum idéal",
// "Ton huile corps idéale", "Tes sourcils idéaux".
export function routineIdealTitle(meta) {
  if (!meta) return "Ton produit idéal";
  const det = meta.det || "ton";
  const adj = det === "tes" ? "idéaux" : det === "ta" || meta.fem ? "idéale" : "idéal";
  return `${det.charAt(0).toUpperCase()}${det.slice(1)} ${(meta.short || meta.label).toLowerCase()} ${adj}`;
}

// "de brume", "d'eau micellaire", "d'huile corps" (elision devant voyelle / h muet)
export function deLabel(label = "produit") {
  const l = label.toLowerCase();
  const first = l.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return /^([aeiouy]|hu)/.test(first) ? `d'${l}` : `de ${l}`;
}

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
