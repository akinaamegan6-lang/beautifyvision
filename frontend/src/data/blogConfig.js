// Categories du blog BeautifyVision — icones decoupees depuis
// public/icone/pictogramme-categorie-blog.png
export const BLOG_CATEGORIES = [
  { key: "skincare", label: "Skincare", icon: "/icone/categorie-blog-skincare.png" },
  { key: "maquillage", label: "Make-up", icon: "/icone/categorie-blog-maquillage.png" },
  { key: "cheveux", label: "Cheveux", icon: "/icone/categorie-blog-cheveux.png" },
  { key: "corps", label: "Corps", icon: "/icone/categorie-blog-corps.png" },
  { key: "ingredients", label: "Ingrédients", icon: "/icone/categorie-blog-ingredients.png" },
  { key: "conseils", label: "Conseils", icon: "/icone/categorie-blog-conseils.png" },
];

export function getBlogCategory(key) {
  return BLOG_CATEGORIES.find((c) => c.key === key);
}
