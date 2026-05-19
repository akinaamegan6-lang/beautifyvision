import { useEffect, useState } from "react";

const KEY = "glowmatch_wishlist_v1";

export function useWishlist() {
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);
  const has = (id) => ids.includes(id);
  const toggle = (id) => setIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  return { ids, has, toggle, count: ids.length };
}
