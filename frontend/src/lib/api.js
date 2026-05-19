import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API, timeout: 120000 });

// ── Products ──────────────────────────────────────────────────────────────────

/**
 * Fetch Sephora products with pagination and filters.
 * Returns the full paginated response: { total, page, limit, pages, products }.
 * @param {{ page?: number, limit?: number, category?: string, budget_max?: number, search?: string }} params
 */
export async function fetchProducts(params = {}) {
  const { data } = await api.get("/products", { params });
  return data || { total: 0, page: 1, limit: 20, pages: 0, products: [] };
}

/**
 * Fetch top-rated products for a given parent section.
 * @param {{ parent?: string, limit?: number }} options
 */
export async function fetchTopProducts({ parent = "cosmetiques", limit = 10 } = {}) {
  const { data } = await api.get("/products/top", { params: { parent, limit } });
  return data || [];
}

/**
 * Fetch a single product by id.
 * @param {string} id
 */
export async function fetchProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

// ── Categories ────────────────────────────────────────────────────────────────

/**
 * Fetch the full category tree.
 */
export async function fetchCategories() {
  const { data } = await api.get("/categories");
  return data || {};
}
