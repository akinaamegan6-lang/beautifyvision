// Curated images for Routine 360° UI
export const TYPE_HERO_IMAGE = {
  visage: "/image/categorie-visage.png",
  corps: "/image/categorie-corps.png",
  cheveux: "/image/categorie-cheveux.png",
};

export const NO_PRODUCT_IMAGE = "/icone/no-imga.png";

// Visuels générés (ChatGPT, conversation "Modification interface site"), un
// par catégorie de produit de la Routine 360°. On complète cette liste au fur
// et à mesure que de nouveaux visuels sont générés ; tant qu'une catégorie n'y
// figure pas, getProductImage() retombe sur NO_PRODUCT_IMAGE.
export const CATEGORY_IMAGE = {
  // Skincare
  "nettoyant": "/image/cat-nettoyant.png",
  "eau-micellaire": "/image/cat-eau-micellaire.png",
  "tonique": "/image/cat-tonique.png",
  "serum": "/image/cat-serum.png",
  "creme-visage": "/image/cat-creme-visage.png",
  "contour-yeux": "/image/cat-contour-yeux.png",
  "masque": "/image/cat-masque.png",
  "exfoliant": "/image/cat-exfoliant.png",
  "huile-visage": "/image/cat-huile-visage.png",
  "creme-corps": "/image/cat-creme-corps.png",
  "demaquillant": "/image/cat-demaquillant.png",
  "brume": "/image/cat-brume.png",
  "creme-solaire": "/image/cat-creme-solaire.png",
  "soin-levres": "/image/cat-soin-levres.png",
  "huile-corps": "/image/cat-huile-corps.png",
  // "creme-solaire-corps": en attente de génération (limite ChatGPT atteinte)
};

export function getProductImage(slug) {
  return CATEGORY_IMAGE[slug] || NO_PRODUCT_IMAGE;
}
