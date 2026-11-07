// Pop-ins des marchands partenaires (visuels fournis par Awin).
// Chaque emplacement reste invisible tant que son visuel n'est pas renseigné.
// Les visuels sont ceux de « Mes visuels » Awin (Perfumeria Comas FR, 04/11/2026),
// appelés directement depuis le serveur d'images Awin.
//
//  - src : adresse du visuel (ou chemin local dans public/partenaires/)
//  - w/h : dimensions réelles du visuel (évite le saut de mise en page)
//  - url : lien suivi Awin (cread.php) fourni avec le visuel
//  - alt : description du visuel (accessibilité)

const IMG = "https://a1.awin1.com/ads/awin/105475/";
const TAG = 513084; // tag annonceur Perfumeria
const link = (creativeId, ref, tag = TAG) =>
  `https://www.awin1.com/cread.php?s=${creativeId}&v=105475&q=${tag}&r=2923665&clickref=${ref}`;

/** Pop-ins carrées : une par page (clé = chemin exact de la page). */
export const POPUPS = {
  "/routine/peau-grasse": { src: IMG + "imgbioderma10-1793811768533.png", w: 250, h: 250, url: link(4973450, "bv-popup-grasse"), alt: "Perfumeria Comas : jusqu'à 62 % de réduction sur Bioderma" },
  "/routine/peau-a-taches": { src: IMG + "imglieracfr11-1793812281904.png", w: 250, h: 250, url: link(4973485, "bv-popup-taches"), alt: "Perfumeria Comas : jusqu'à 57 % de réduction sur Lierac" },
  "/routine/peau-acneique": { src: IMG + "imguriage10-1793812611533.png", w: 250, h: 250, url: link(4973492, "bv-popup-acne"), alt: "Perfumeria Comas : jusqu'à 40 % de réduction sur Uriage" },
  "/routine/peau-seche": { src: IMG + "imgerborian5-1793812075852.png", w: 250, h: 250, url: link(4973474, "bv-popup-seche"), alt: "Perfumeria Comas : des soins experts Erborian" },
  "/promos": { src: IMG + "imgpre28-1793810275419.png", w: 250, h: 250, url: link(4973405, "bv-popup-promos", 503436), alt: "Perfumeria Comas : Pré-Black Friday, 8 % de réduction supplémentaire" },
};
