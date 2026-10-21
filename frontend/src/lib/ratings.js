import { api } from "./api";

// Cle stable d'un produit : l'identifiant Awin (p= dans le lien affilie) quand
// il existe, sinon l'id du catalogue. Doit rester identique a rating_key()
// dans backend/server.py.
export function ratingKey(product) {
  const m = /[?&]p=(\d+)/.exec(product?.affiliate_url || "");
  if (m) return `aw${m[1]}`;
  return product?.id ? `id${product.id}` : null;
}

// 999 -> "999", 1234 -> "1,2K", 12000 -> "12K", 1 500 000 -> "1,5M"
export function formatCount(n) {
  const v = Number(n) || 0;
  const fmt = (x, unit) => {
    const r = x >= 10 ? Math.round(x) : Math.round(x * 10) / 10;
    return `${String(r).replace(".", ",")}${unit}`;
  };
  if (v >= 999_500) return fmt(v / 1_000_000, "M");
  if (v >= 1000) return fmt(v / 1000, "K");
  return String(v);
}

export function formatRating(r) {
  return (Number(r) || 0).toFixed(1).replace(".", ",");
}

// ---- cache partage entre toutes les cartes de la page ----
const cache = new Map(); // key -> { rating, reviews }
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

export const getCached = (key) => cache.get(key);
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let queue = new Set();
let timer = null;
export function requestStats(key) {
  if (!key || cache.has(key)) return;
  queue.add(key);
  if (!timer) timer = setTimeout(flush, 40);
}
async function flush() {
  const keys = [...queue];
  queue = new Set();
  timer = null;
  for (let i = 0; i < keys.length; i += 40) {
    const chunk = keys.slice(i, i + 40);
    try {
      const { data } = await api.get("/ratings", { params: { keys: chunk.join(",") } });
      chunk.forEach((k) => cache.set(k, data[k] || { rating: 0, reviews: 0 }));
    } catch {
      /* on garde l'affichage a 0 si l'API ne repond pas */
    }
  }
  notify();
}

// ---- identite anonyme de la visiteuse (1 note / produit) ----
function voterId() {
  try {
    let id = localStorage.getItem("bv_voter_id");
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}${Math.random().toString(36).slice(2)}`).replace(/-/g, "");
      localStorage.setItem("bv_voter_id", id);
    }
    return id;
  } catch {
    return `anon${Math.random().toString(36).slice(2)}${Date.now()}`;
  }
}

export function getMyRating(key) {
  try {
    return JSON.parse(localStorage.getItem("bv_my_ratings") || "{}")[key] || 0;
  } catch {
    return 0;
  }
}

export async function submitRating(key, stars) {
  const { data } = await api.post("/ratings", { key, stars, voter_id: voterId() });
  cache.set(key, data);
  try {
    const mine = JSON.parse(localStorage.getItem("bv_my_ratings") || "{}");
    mine[key] = stars;
    localStorage.setItem("bv_my_ratings", JSON.stringify(mine));
  } catch { /* stockage indisponible : la note est quand meme enregistree */ }
  notify();
  return data;
}
