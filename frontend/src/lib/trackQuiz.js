import { api } from "./api";
import { getProfile } from "./profile";

// Enregistre (de facon anonyme) un passage au quiz : type de quiz, genre et
// tranche d'age declares, reponses, produits recommandes. Aucune donnee
// personnelle : pas d'e-mail, pas de nom, pas d'IP. Ne bloque jamais la page :
// toute erreur est ignoree.
export function trackQuiz({ quizType, quizKey, answers, products }) {
  try {
    const profile = getProfile() || {};
    const recos = (products || []).slice(0, 40).map((p) => ({
      id: String(p.id || ""),
      name: String(p.name || "").slice(0, 200),
      brand: String(p.brand || "").slice(0, 100),
      category: String(p.category || "").slice(0, 60),
      price: Number(p.price) || 0,
      score: typeof p._score === "number" ? Math.round(p._score) : null,
      slot: p._slot ? String(p._slot).slice(0, 60) : null,
    }));
    api.post("/quiz-sessions", {
      quiz_type: quizType,
      quiz_key: quizKey || null,
      gender: profile.gender || "non-precise",
      age_range: profile.age_range || "non-precise",
      answers: answers || {},
      products: recos,
    }).catch(() => {});
  } catch { /* jamais bloquant */ }
}
