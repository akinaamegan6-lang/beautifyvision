// Curated images for Routine 360° UI
export const TYPE_HERO_IMAGE = {
  visage: "/image/categorie-visage.png",
  corps: "/image/categorie-corps.png",
  cheveux: "/image/categorie-cheveux.png",
};

export const NO_PRODUCT_IMAGE = "/icone/no-imga.png";

// Le CDN Awin (images2.productserve.com) renvoie parfois, au lieu de la photo,
// un petit GIF "No image available" de 70x70 px (image valide : le navigateur
// ne declenche donc pas d'erreur). Les vraies photos font 600x600. Quand on
// detecte ce placeholder, on essaie d'abord la photo directement chez le
// marchand (son adresse est dans le parametre url= du lien Awin), puis, si elle
// n'existe pas non plus, on affiche notre pictogramme.
export function swapIfPlaceholder(e, className) {
  const img = e.currentTarget;
  if (!(img.naturalWidth === 70 && img.naturalHeight === 70 && img.src.includes("productserve.com"))) return;
  const toPictogram = () => {
    img.onerror = null;
    img.src = NO_PRODUCT_IMAGE;
    if (className) img.className = className;
  };
  let direct = null;
  try {
    const raw = new URL(img.src).searchParams.get("url");
    if (raw) direct = raw.startsWith("ssl:") ? `https://${raw.slice(4)}` : `http://${raw}`;
  } catch { /* adresse illisible : on passe directement au pictogramme */ }
  if (!direct) return toPictogram();
  img.onerror = toPictogram;
  img.src = direct;
}


export const BUDGET_ICON = "/icone/budget.png";

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
  "creme-solaire-corps": "/image/cat-creme-solaire-corps.png",
  // Maquillage
  "fond-de-teint": "/image/cat-fond-de-teint.png",
  "correcteur": "/image/cat-correcteur.png",
  "poudre": "/image/cat-poudre.png",
  "blush": "/image/cat-blush.png",
  "bronzer": "/image/cat-bronzer.png",
  "highlighter": "/image/cat-highlighter.png",
  "palette-yeux": "/image/cat-palette-yeux.png",
  "mascara": "/image/cat-mascara.png",
  "eyeliner": "/image/cat-eyeliner.png",
  "rouge-a-levres": "/image/cat-rouge-a-levres.png",
  "gloss": "/image/cat-gloss.png",
  "sourcils": "/image/cat-sourcils.png",
  "primer": "/image/cat-primer.png",
  // Cheveux
  "shampoing": "/image/cat-shampoing.png",
  "apres-shampoing": "/image/cat-apres-shampoing.png",
  "masque-cheveux": "/image/cat-masque-cheveux.png",
  "huile-cheveux": "/image/cat-huile-cheveux.png",
  "serum-cheveux": "/image/cat-serum-cheveux.png",
  "spray-coiffant": "/image/cat-spray-coiffant.png",
};

export function getProductImage(slug) {
  return CATEGORY_IMAGE[slug] || NO_PRODUCT_IMAGE;
}
