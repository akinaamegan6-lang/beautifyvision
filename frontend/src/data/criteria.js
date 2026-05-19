// Criteria popup questions per category
export const CRITERIA_QUESTIONS = {
  default: {
    title: "Configure ta recherche",
    skin_types: ["Peau grasse", "Peau sèche", "Peau mixte", "Peau sensible", "Peau normale", "Peau mature", "Peau à tendance acnéique"],
    textures: ["Légère / Gel", "Fluide", "Riche / Nourrissante", "Matifiante", "Satinée", "Sans parfum", "Naturelle / Bio"],
    benefits: ["Hydratation intense", "Anti-âge", "Éclat & teint unifié", "Anti-taches", "Apaisant", "Matifiant", "Réparateur", "Protecteur (SPF)"],
    ingredients: ["Sans huile minérale", "Sans paraben", "Sans silicone", "Vegan", "Cruelty-free", "Avec acide hyaluronique", "Avec rétinol", "Avec niacinamide"],
  },
  "rouge-a-levres": {
    title: "Trouve ton rouge à lèvres idéal",
    skin_types: ["Lèvres sèches", "Lèvres normales", "Lèvres sensibles"],
    textures: ["Mat", "Satiné", "Gloss", "Crémeux", "Liquide"],
    benefits: ["Longue tenue", "Hydratant", "Couleur intense", "Effet nude", "Volume"],
    ingredients: ["Vegan", "Cruelty-free", "Sans paraben", "Avec acide hyaluronique"],
  },
  "palette-yeux": {
    title: "Trouve ta palette parfaite",
    skin_types: ["Paupières sensibles", "Paupières normales"],
    textures: ["Mat", "Shimmer", "Métallisé", "Satiné"],
    benefits: ["Longue tenue", "Pigmentation intense", "Look nude", "Look smoky", "Look terracotta"],
    ingredients: ["Vegan", "Cruelty-free", "Sans paraben"],
  },
  "mascara": {
    title: "Trouve ton mascara",
    skin_types: ["Yeux sensibles", "Porteuses de lentilles"],
    textures: ["Liquide", "Volume", "Longueur", "Courbant"],
    benefits: ["Longue tenue", "Waterproof", "Volume", "Allongeant", "Courbant"],
    ingredients: ["Vegan", "Cruelty-free", "Sans paraben"],
  },
  "fond-de-teint-cosmetique": {
    title: "Trouve ton fond de teint",
    skin_types: ["Peau grasse", "Peau sèche", "Peau mixte", "Peau sensible", "Peau normale", "Peau mature"],
    textures: ["Mat", "Lumineux", "Satiné", "Liquide", "Poudre"],
    benefits: ["Couvrance légère", "Couvrance moyenne", "Couvrance haute", "SPF", "Longue tenue"],
    ingredients: ["Vegan", "Cruelty-free", "Sans paraben", "Avec acide hyaluronique"],
  },
};

export function getQuestions(slug) {
  return CRITERIA_QUESTIONS[slug] || CRITERIA_QUESTIONS.default;
}

export const PRESET_LOOKS = [
  { id: "natural", emoji: "✨", label: "Maquillage qui sublime mon teint" },
  { id: "terracotta", emoji: "🍊", label: "Look terracotta / orangé" },
  { id: "nude", emoji: "🌸", label: "Nude & naturel" },
  { id: "lips-bold", emoji: "💋", label: "Lèvres intenses, yeux discrets" },
  { id: "smoky", emoji: "🖤", label: "Smoky dramatique" },
  { id: "fresh", emoji: "☀️", label: "Effet bonne mine, teint frais" },
  { id: "plum", emoji: "💜", label: "Teintes prune & mauve" },
];
