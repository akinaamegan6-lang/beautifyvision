// Structure de la page « Promos » : trois univers (visage, corps, make-up),
// chacun découpé en onglets. Chaque onglet regroupe des catégories du catalogue
// (slugs de la collection `products`) ; l'API renvoie jusqu'à 20 produits en
// promo par onglet (moins s'il n'y en a pas assez).

export const PROMO_SECTIONS = [
  {
    id: "visage",
    title: ["Promos", "Visage"],
    icon: "/icone/visage.png",
    decor: { src: "/image/tache-de-creme.webp", className: "hidden md:block -left-44 top-0 w-72" },
    text:
      "Crèmes hydratantes, sérums, nettoyants, masques et soins du contour des yeux : retrouve les soins visage en promotion chez nos marchands partenaires, avec l'ancien prix barré et le pourcentage de remise. Pas sûre de ton type de peau ? Nos routines t'aident à choisir le bon soin.",
    links: [
      { to: "/routine/peau-grasse", label: "Routine peau grasse" },
      { to: "/routine/peau-seche", label: "Routine peau sèche" },
      { to: "/routine/peau-acneique", label: "Routine peau à boutons" },
      { to: "/routine/peau-a-taches", label: "Routine peau à taches" },
    ],
    skinFilter: true,
    tabs: [
      { key: "cremes", label: "Crèmes", categories: ["creme-hydratante", "creme-solaire-visage"] },
      { key: "serums", label: "Sérums & huiles", categories: ["serum", "huile-visage"] },
      { key: "nettoyants", label: "Nettoyants & démaquillants", categories: ["nettoyant", "demaquillant", "exfoliant"] },
      { key: "yeux-masques", label: "Contour des yeux & masques", categories: ["contour-yeux", "masque", "brume"] },
    ],
  },
  {
    id: "corps",
    title: ["Promos", "Corps"],
    icon: "/icone/corps.png",
    decor: { src: "/image/tache-de-mousse.webp", className: "hidden md:block -left-48 -top-8 w-80" },
    text:
      "Laits et crèmes hydratantes, gels douche, huiles, gommages, soins des mains et des pieds : prends soin de ta peau de la tête aux pieds avec les promos corps du moment. Les prix barrés te montrent tout de suite l'économie réalisée.",
    links: [],
    tabs: [
      { key: "cremes-corps", label: "Crèmes & laits corps", categories: ["creme-corps", "lait-corporel", "beurre-corporel"] },
      { key: "douche", label: "Gels douche", categories: ["gel-douche"] },
      { key: "huiles-gommages", label: "Huiles, gommages & vergetures", categories: ["huile-corps", "gommage-corps", "vergetures"] },
      { key: "mains-pieds", label: "Mains, pieds & autres soins", categories: ["soin-mains", "soin-pieds", "deodorant", "autobronzant", "creme-solaire-corps"] },
    ],
  },
  {
    id: "make-up",
    title: ["Promos", "Make-up"],
    icon: "/icone/maquillage.svg",
    decor: { src: "/image/pinceau-poudre-rose.webp", className: "hidden md:block -left-52 -top-4 w-80" },
    text:
      "Teint, yeux, lèvres : les indispensables du make-up à prix doux. Fonds de teint, poudres et blushs, mascaras, eyeliners et palettes, rouges à lèvres et soins des lèvres, toutes les promos sont regroupées par partie du visage.",
    links: [],
    tabs: [
      { key: "teint", label: "Teint", categories: ["fond-de-teint-cosmetique", "primer", "poudre", "blush", "highlighter", "contouring"] },
      { key: "yeux", label: "Yeux", categories: ["mascara", "eyeliner", "palette-yeux", "sourcils"] },
      { key: "levres", label: "Lèvres", categories: ["rouge-a-levres", "soin-levres"] },
    ],
  },
];

export const ALL_PROMO_CATEGORIES = Array.from(
  new Set(PROMO_SECTIONS.flatMap((s) => s.tabs.flatMap((t) => t.categories)))
);

export const SKIN_FILTERS = [
  { value: "", label: "Toutes les peaux" },
  { value: "grasse", label: "Peau grasse" },
  { value: "seche", label: "Peau sèche" },
  { value: "mixte", label: "Peau mixte" },
  { value: "sensible", label: "Peau sensible" },
  { value: "normale", label: "Peau normale" },
];
