import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCategories, fetchProducts } from "../lib/api";
import CriteriaPopup from "../components/CriteriaPopup";
import FiltersSidebar from "../components/FiltersSidebar";
import HorizontalProductCard from "../components/HorizontalProductCard";
import { getQuestions } from "../data/criteria";
import { AlertCircle, RefreshCw, SlidersHorizontal } from "lucide-react";

// ── Skeleton card matching HorizontalProductCard layout ──────────────────────
function SkeletonCard() {
  return (
    <div className="border border-[#FEC4D2]/40 rounded-3xl p-5 flex gap-5 animate-pulse">
      <div className="w-24 h-24 rounded-2xl bg-neutral-100 shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-3 bg-neutral-100 rounded-full w-1/4" />
        <div className="h-4 bg-neutral-100 rounded-full w-2/3" />
        <div className="h-3 bg-neutral-100 rounded-full w-1/2" />
        <div className="h-3 bg-neutral-100 rounded-full w-1/3" />
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="h-5 w-16 bg-neutral-100 rounded-full" />
        <div className="h-8 w-24 bg-neutral-100 rounded-full mt-auto" />
      </div>
    </div>
  );
}

// ── Error banner with retry ───────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="border border-red-200 rounded-3xl py-16 px-8 text-center bg-red-50">
      <AlertCircle size={32} className="mx-auto text-red-400 mb-4" />
      <p className="text-red-600 font-medium">{message}</p>
      <button
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 text-sm text-[#79C1E0] hover:text-[#6ab1d1] transition"
      >
        <RefreshCw size={14} /> Réessayer
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ComparatorPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [categoryLabel, setCategoryLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    skin: [], textures: [], benefits: [], ingredients: [], budget: [0, 1000], search: "",
  });
  const [sort, setSort] = useState("rating");
  const [page, setPage] = useState(1);
  const [popupOpen, setPopupOpen] = useState(true);
  const questions = getQuestions(slug);

  const loadData = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const [resp, categories] = await Promise.all([
        fetchProducts({
          category: slug || undefined,
          budget_max: filters.budget[1] < 1000 ? filters.budget[1] : undefined,
          search: filters.search || undefined,
          page: targetPage,
          limit: 20,
        }),
        fetchCategories(),
      ]);

      setProducts(resp.products || []);
      setPagination({ total: resp.total, page: resp.page, pages: resp.pages });

      const sections = Object.values(categories);
      for (const sec of sections) {
        const found =
          (sec.products || []).find((p) => p.slug === slug) ||
          (sec.problems || []).find((p) => p.slug === slug);
        if (found) { setCategoryLabel(found.label); break; }
      }
    } catch (err) {
      const isNetwork = !err.response;
      setError(
        isNetwork
          ? "Impossible de joindre le serveur. Vérifie que le backend tourne sur http://localhost:8000."
          : `Erreur serveur (${err.response?.status}) : ${err.response?.data?.detail ?? "réponse inattendue."}`
      );
    } finally {
      setLoading(false);
    }
  }, [slug, filters.budget, filters.search]);

  useEffect(() => {
    setPopupOpen(true);
    setPage(1);
    loadData(1);
  }, [loadData]);

  const displayed = useMemo(() => {
    let arr = [...products];
    if (filters.skin.length) {
      arr = arr.filter((p) =>
        (p.tags || []).some((t) => filters.skin.some((f) => t.toLowerCase().includes(f.toLowerCase())))
      );
    }
    if (sort === "price_asc") arr.sort((a, b) => (a.price ?? 9999) - (b.price ?? 9999));
    if (sort === "price_desc") arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (sort === "rating") arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === "popular") arr.sort((a, b) => b.reviews - a.reviews);
    return arr;
  }, [products, filters.skin, sort]);

  const onSubmitPopup = (vals) => {
    setFilters((prev) => ({ ...prev, ...vals }));
    setPopupOpen(false);
  };

  const goToPage = (p) => {
    setPage(p);
    loadData(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="bg-white min-h-screen">
      <CriteriaPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        onSubmit={onSubmitPopup}
        questions={questions}
        categoryLabel={categoryLabel}
      />

      <section className="px-6 pt-12 pb-6 relative">
        <div className="halo-pink -top-32 right-0 opacity-60" />
        <div className="max-w-7xl mx-auto relative">
          <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Comparateur</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold text-[#FEC4D2] capitalize">
            <span className="editorial text-neutral-900">{categoryLabel || slug}</span>
          </h1>
          <p className="mt-3 text-neutral-600 max-w-2xl">
            {loading
              ? "Chargement des produits…"
              : `${pagination.total} produit${pagination.total !== 1 ? "s" : ""} trouvé${pagination.total !== 1 ? "s" : ""}. Page ${pagination.page} / ${pagination.pages}.`}
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[300px_1fr] gap-8">
          <FiltersSidebar filters={filters} setFilters={setFilters} questions={questions} />

          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setPopupOpen(true)}
                className="inline-flex items-center gap-2 text-sm text-[#79C1E0] hover:text-[#6ab1d1] transition"
                data-testid="open-criteria-popup"
              >
                <SlidersHorizontal size={16} /> Reconfigurer mes critères
              </button>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-neutral-500">Trier :</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  disabled={loading}
                  className="border border-[#FEC4D2]/40 rounded-full px-4 py-2 bg-white text-neutral-700 focus:outline-none focus:border-[#FEC4D2] disabled:opacity-50"
                  data-testid="sort-select"
                >
                  <option value="rating">Mieux notés</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="popular">Les plus populaires</option>
                </select>
              </div>
            </div>

            {loading && (
              <div className="grid grid-cols-1 gap-5" data-testid="products-skeleton">
                {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {!loading && error && (
              <ErrorBanner message={error} onRetry={() => loadData(page)} />
            )}

            {!loading && !error && displayed.length === 0 && (
              <div className="border border-[#FEC4D2]/60 rounded-3xl py-20 text-center text-neutral-600 bg-white">
                <p className="editorial text-2xl text-[#79C1E0]">Aucun produit ne correspond.</p>
                <p className="mt-2 text-sm">Essaie d'ajuster ton budget ou tes filtres.</p>
              </div>
            )}

            {!loading && !error && displayed.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-5" data-testid="products-grid">
                  {displayed.map((p) => <HorizontalProductCard key={p.id} product={p} />)}
                </div>

                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      className="px-4 py-2 rounded-full border border-[#FEC4D2]/60 text-sm text-neutral-600 hover:border-[#FEC4D2] disabled:opacity-30 transition"
                    >
                      ←
                    </button>
                    {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                      const p = pagination.pages <= 7 ? i + 1 : Math.max(1, Math.min(pagination.pages - 6, page - 3)) + i;
                      return (
                        <button
                          key={p}
                          onClick={() => goToPage(p)}
                          className={`w-9 h-9 rounded-full text-sm font-medium transition ${
                            p === page
                              ? "bg-[#FEC4D2] text-white"
                              : "border border-[#FEC4D2]/40 text-neutral-600 hover:border-[#FEC4D2]"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= pagination.pages}
                      className="px-4 py-2 rounded-full border border-[#FEC4D2]/60 text-sm text-neutral-600 hover:border-[#FEC4D2] disabled:opacity-30 transition"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
