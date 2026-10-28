// Profil "genre + tranche d'age" demande avant CHAQUE quiz (reponse obligatoire).
// La derniere reponse est gardee dans sessionStorage (le temps de la visite,
// dans le navigateur de la personne) pour pre-remplir la question : elle sert a ajuster legerement les
// recommandations et a alimenter des statistiques anonymes.

export const GENDER_OPTIONS = [
  { value: "femme", label: "Femme" },
  { value: "homme", label: "Homme" },
  { value: "autre", label: "Autre" },
];

export const AGE_OPTIONS = [
  { value: "moins-18", label: "Moins de 18 ans" },
  { value: "18-24", label: "18 – 24 ans" },
  { value: "25-34", label: "25 – 34 ans" },
  { value: "35-44", label: "35 – 44 ans" },
  { value: "45-54", label: "45 – 54 ans" },
  { value: "55-plus", label: "55 ans et plus" },
];

// "non-precise" n'est plus proposé (la réponse est obligatoire) mais reste
// affiché dans l'admin pour les anciens enregistrements.
export const GENDER_LABEL = { ...Object.fromEntries(GENDER_OPTIONS.map((o) => [o.value, o.label])), "non-precise": "Non précisé" };
export const AGE_LABEL = { ...Object.fromEntries(AGE_OPTIONS.map((o) => [o.value, o.label])), "non-precise": "Non précisé" };

const KEY = "bv_profile";

export function getProfile() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && p.gender && p.age_range) return p;
  } catch { /* stockage indisponible */ }
  return null;
}

export function saveProfile(profile) {
  try { sessionStorage.setItem(KEY, JSON.stringify(profile)); } catch { /* ignore */ }
}
