// Curated images for Routine 360° UI
export const TYPE_HERO_IMAGE = {
  visage: "/image/categorie-visage.png",
  corps: "/image/categorie-corps.png",
  cheveux: "/image/categorie-cheveux.png",
};

export const NO_PRODUCT_IMAGE = "/icone/no-imga.png";

// Photos produits : on charge d'abord la photo directement chez le marchand
// (son adresse est dans le parametre url= du lien du CDN Awin, ex.
// url=ssl:perfumeriacomas.com/...). Le CDN Awin (images2.productserve.com)
// renvoie en effet trop souvent, selon le produit, un petit GIF "No image
// available" de 70x70 px a la place de la vraie photo (image "valide" : pas
// d'erreur cote navigateur). Ordre d'essai : photo du marchand, puis CDN Awin,
// puis notre pictogramme.
export function merchantImageUrl(url) {
  if (!url || !url.includes("productserve.com")) return url || "";
  try {
    const raw = new URL(url).searchParams.get("url");
    if (raw) return raw.startsWith("ssl:") ? `https://${raw.slice(4)}` : `https://${raw}`;
  } catch { /* adresse illisible : on garde l'adresse d'origine */ }
  return url;
}

export function productImgSrc(url) {
  return url ? merchantImageUrl(url) : NO_PRODUCT_IMAGE;
}

export function productImgError(originalUrl, className) {
  return (e) => {
    const img = e.currentTarget;
    if (originalUrl && !img.dataset.triedCdn && img.src !== originalUrl) {
      img.dataset.triedCdn = "1";
      img.src = originalUrl;
      return;
    }
    img.onerror = null;
    img.src = NO_PRODUCT_IMAGE;
    if (className) img.className = className;
  };
}

// Dernier filet : si le CDN Awin (essaye apres la photo du marchand) renvoie
// son placeholder 70x70, on affiche notre pictogramme.
export function swapIfPlaceholder(e, className) {
  const img = e.currentTarget;
  if (img.naturalWidth === 70 && img.naturalHeight === 70 && img.src.includes("productserve.com")) {
    img.onerror = null;
    img.src = NO_PRODUCT_IMAGE;
    if (className) img.className = className;
  }
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

// Catégories du MENU (slugs de l'API /categories) -> visuel. Les slugs du menu
// diffèrent parfois de ceux de la Routine 360° (ex. "creme-hydratante" ici,
// "creme-visage" dans la routine). Sans visuel dédié -> pictogramme maison.
export const MENU_SLUG_IMAGE = {
  "creme-hydratante": "creme-visage",
  "creme-solaire-visage": "creme-solaire",
  "fond-de-teint-cosmetique": "fond-de-teint",
  "contouring": "bronzer",
  "demaquillant-cosm": "eau-micellaire",
  "gommage-corps": "exfoliant",
  "lait-corporel": "creme-corps",
  "beurre-corporel": "creme-corps",
};

export function getMenuProductImage(slug) {
  return CATEGORY_IMAGE[slug] || CATEGORY_IMAGE[MENU_SLUG_IMAGE[slug]] || NO_PRODUCT_IMAGE;
}
