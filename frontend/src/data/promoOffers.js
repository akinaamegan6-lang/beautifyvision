// Offres et codes promo des marchands partenaires (programme Awin).
// Source : e-mail « Promotions » d'Awin pour Perfumeria Comas FR. Les liens sont
// les liens suivis (cread.php) fournis par Awin ; seule la page d'arrivée (ued)
// est reconstruite à partir du chemin indiqué ici.
// Les offres expirées disparaissent toutes seules ; celles qui commencent dans
// moins de 30 jours s'affichent avec « Dès le jj/mm ».
// Pour ajouter une offre : copier un bloc, adapter dates (ISO avec fuseau) et chemin.

const AWIN_BASE = "https://www.awin1.com/cread.php?awinmid=105475&awinaffid=2923665&clickref=bv-promos&ued=";
const SHOP = "https://perfumeriacomas.com";

export const awinLink = (path) => `${AWIN_BASE}${encodeURIComponent(SHOP + path)}`;

const o = (id, title, text, start, end, path, extra = {}) => ({
  id, title, text, start, end, merchant: "Perfumeria Comas", url: awinLink(path), ...extra,
});

export const PROMO_OFFERS = [
  // ---- Codes promo ----
  o("singledays10", "-10 % sur tout le site", "Célèbre la Journée des célibataires avec 10 % de réduction sur tes produits préférés.", "2026-11-01T12:16:00+01:00", "2026-11-30T12:16:00+01:00", "/fr", { code: "SINGLEDAYS10", min: "Dès 79 € d'achat" }),
  o("singledays5", "-5 % sur tout le site", "Journée des célibataires : 5 % de réduction sur tes produits préférés.", "2026-11-01T12:13:00+01:00", "2026-11-30T12:13:00+01:00", "/fr", { code: "SINGLEDAYS5", min: "Dès 39 € d'achat" }),
  o("10cosm", "-10 € sur les cosmétiques", "Offre à ta peau les soins dont elle a besoin après l'été.", "2026-09-28T12:31:00+02:00", "2026-11-30T12:31:00+01:00", "/fr/cosmetica-9360", { code: "10COSM", min: "Dès 79 € d'achat" }),
  o("imbatcosm", "-10 % sur les cosmétiques", "10 % de réduction sur les produits cosmétiques.", "2026-10-01T13:32:00+02:00", "2026-12-31T13:32:00+01:00", "/fr/cosmetica-9360", { code: "IMBATCOSM", min: "Dès 39 € d'achat" }),
  o("5maq", "-5 € sur le maquillage", "5 € de réduction sur les produits de maquillage.", "2026-10-01T13:30:00+02:00", "2026-12-31T13:30:00+01:00", "/fr/maquillaje-7558", { code: "5MAQ", min: "Dès 39 € d'achat" }),
  o("hair10", "-10 % extra sur les soins capillaires", "Prépare tes cheveux au changement de saison.", "2026-09-01T12:36:00+02:00", "2026-12-31T12:36:00+01:00", "/fr/cabello", { code: "HAIR10", min: "Dès 39 € d'achat" }),
  o("beauty10", "-10 % extra sur tout le site", "Célèbre la beauté sur tout le site pour la Journée internationale de la beauté.", "2026-09-01T12:35:00+02:00", "2026-12-31T12:35:00+01:00", "/fr", { code: "BEAUTY10", min: "Dès 60 € d'achat" }),
  o("rebajas10", "-10 % sur tout le site", "Prévente : 10 % de réduction sur tout le site, hors produits de niche.", "2026-05-31T17:04:00+02:00", "2026-12-31T17:04:00+01:00", "/fr", { code: "REBAJAS10", min: "Dès 60 € d'achat" }),
  o("preblack", "Pré-Black Friday : -8 % supplémentaires", "8 % de réduction supplémentaire sur tes essentiels, hors parfumerie de niche.", "2026-11-16T12:27:00+01:00", "2026-11-22T12:27:00+01:00", "/fr", { code: "PREBLACK", min: "Dès 60 € d'achat" }),
  o("blackdays", "Black Days : -10 € sur tout le site", "10 € de réduction supplémentaire sur tes produits préférés.", "2026-11-23T12:30:00+01:00", "2026-11-26T12:30:00+01:00", "/fr", { code: "BLACKDAYS", min: "Dès 79 € d'achat" }),
  o("blackfriday", "Black Friday : -12 % supplémentaires", "12 % de réduction supplémentaire sur tout le site.", "2026-11-27T12:32:00+01:00", "2026-11-29T12:32:00+01:00", "/fr", { code: "BLACKFRIDAY", min: "Dès 60 € d'achat" }),
  o("cybermonday", "Cyber Monday : -10 % sur tout le site", "10 % de réduction sur tes produits préférés.", "2026-11-30T16:34:00+01:00", "2026-12-02T12:34:00+01:00", "/fr", { code: "CIBERMONDAY", min: "Dès 60 € d'achat" }),

  // ---- Offres thématiques (sans code) ----
  o("coffrets-51", "Coffrets cadeaux : jusqu'à -51 %", "Les meilleures réductions pour composer le cadeau parfait.", "2025-02-11T17:01:00+01:00", "2028-02-11T17:00:00+01:00", "/fr/coffrets-cadeaux", { tag: "Noël" }),
  o("coffrets-10", "Coffrets : -10 % supplémentaires", "10 % de réduction supplémentaire sur les coffrets.", "2026-05-31T16:53:00+02:00", "2026-12-31T16:53:00+01:00", "/fr/coffrets-cadeaux", { min: "Dès 60 € d'achat", tag: "Noël" }),
  o("cosmetiques-55", "Cosmétiques : jusqu'à -55 %", "Tes cosmétiques préférés avec jusqu'à 55 % de réduction.", "2025-02-11T17:02:00+01:00", "2028-02-11T17:02:00+01:00", "/fr/cosmetica-9360", { tag: "Noël" }),
  o("parapharmacie-55", "Soins & parapharmacie : jusqu'à -55 %", "Soins du visage et du corps avec jusqu'à 55 % de réduction.", "2026-10-01T13:26:00+02:00", "2026-12-31T13:26:00+01:00", "/fr/parafarmacia-5821"),
  o("maquillage-35", "Maquillage d'automne : jusqu'à -35 %", "Découvre les indispensables de la saison.", "2026-09-01T12:33:00+02:00", "2026-12-31T12:33:00+01:00", "/fr/maquillaje-7558"),
  o("capillaire-40", "Soins capillaires : jusqu'à -40 %", "Tes soins capillaires préférés jusqu'à 40 % moins chers.", "2025-02-11T17:03:00+01:00", "2028-02-11T17:02:00+01:00", "/fr/cabello", { tag: "Noël" }),
  o("naturels-40", "Cosmétiques naturels : jusqu'à -40 % + 10 %", "Jusqu'à 40 % de réduction, puis 10 % supplémentaires.", "2026-05-31T17:11:00+02:00", "2026-12-31T17:11:00+01:00", "/fr/cosmetica-9360", { min: "Dès 60 € d'achat" }),
  o("newsletter-10", "-10 % en t'abonnant à la newsletter", "Abonne-toi à la newsletter de Perfumería Comas et reçois 10 % sur ton prochain achat.", "2025-02-11T16:48:00+01:00", "2028-02-29T23:59:00+01:00", "/fr"),

  // ---- Marques ----
  o("lierac-57", "Lierac : jusqu'à -57 %", "Soins visage haute efficacité pour renouveler et sublimer la peau.", "2026-09-01T12:28:00+02:00", "2026-12-31T12:28:00+01:00", "/fr/lierac", { brand: true }),
  o("avene-55", "Avène : jusqu'à -55 %", "Ta marque préférée avec la meilleure remise.", "2025-02-11T16:54:00+01:00", "2028-02-11T16:52:00+01:00", "/fr/avene", { brand: true }),
  o("eucerin-45", "Eucerin : jusqu'à -45 %", "Hydratation, taches, rides et peaux sensibles.", "2026-09-01T12:27:00+02:00", "2026-12-31T12:27:00+01:00", "/fr/eucerin", { brand: true }),
  o("bioderma-45", "Bioderma : jusqu'à -45 %", "Des formules dermatologiques pour nettoyer, hydrater et protéger la peau.", "2025-02-11T16:55:00+01:00", "2028-02-11T16:55:00+01:00", "/fr/bioderma", { brand: true }),
  o("clarins-38", "Clarins : jusqu'à -38 %", "Des soins iconiques pour prendre soin du visage et révéler sa beauté.", "2026-09-01T12:30:00+02:00", "2026-12-31T12:30:00+01:00", "/fr/clarins", { brand: true }),
  o("uriage-40", "Uriage : jusqu'à -40 %", "Des soins à base d'Eau Thermale d'Uriage pour protéger et chouchouter la peau.", "2026-09-01T12:29:00+02:00", "2026-12-31T12:29:00+01:00", "/fr/uriage", { brand: true }),
  o("svr-35", "SVR : jusqu'à -35 %", "Une marque très populaire, avec jusqu'à 35 % de réduction.", "2026-05-31T17:01:00+02:00", "2026-12-31T17:01:00+01:00", "/fr/svr", { brand: true }),
  o("sisley-30", "Sisley : -30 %", "30 % de réduction sur tes favoris Sisley.", "2025-02-11T17:00:00+01:00", "2028-02-11T16:59:00+01:00", "/fr/sisley", { brand: true }),
  o("sensai-30", "Sensai : jusqu'à -30 %", "Des soins emblématiques pour sublimer ta beauté.", "2025-02-11T16:57:00+01:00", "2028-02-11T16:56:00+01:00", "/fr/sensai", { brand: true }),
  o("kerastase-20", "Kérastase : jusqu'à -20 %", "Des soins capillaires emblématiques pour sublimer ta chevelure.", "2026-10-01T13:03:00+02:00", "2026-12-31T13:03:00+01:00", "/fr/cabello", { brand: true }),
  o("piaubert-30", "Jeanne Piaubert : -30 % supplémentaires", "Jusqu'à 25 % de réduction, puis 30 % supplémentaires.", "2025-02-11T16:58:00+01:00", "2028-02-11T16:57:00+01:00", "/fr/jeanne-piaubert", { brand: true }),
];

const DAY = 24 * 3600 * 1000;

/** Offres en cours (+ celles qui démarrent dans moins de 30 jours), triées : codes d'abord. */
export function activeOffers(now = Date.now()) {
  return PROMO_OFFERS
    .map((x) => ({ ...x, startTs: Date.parse(x.start), endTs: Date.parse(x.end) }))
    .filter((x) => x.endTs > now && x.startTs - now < 30 * DAY)
    .map((x) => ({ ...x, upcoming: x.startTs > now }))
    .sort((a, b) =>
      Number(a.upcoming) - Number(b.upcoming) ||
      Number(!!b.code) - Number(!!a.code) ||
      Number(!!a.brand) - Number(!!b.brand) ||
      a.endTs - b.endTs
    );
}

export const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", timeZone: "Europe/Paris" });
