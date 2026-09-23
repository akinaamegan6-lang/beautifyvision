import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "../lib/api";
import ArticleCard from "../components/ArticleCard";
import NewsletterBlock from "../components/blog/NewsletterBlock";
import { BLOG_CATEGORIES } from "../data/blogConfig";

const HERO_BANNER = "/image/hero-banner-blog.png";

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("tous");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      const params = {};
      if (activeCategory !== "tous") params.category = activeCategory;
      if (search.trim()) params.q = search.trim();
      api.get("/blog/articles", { params })
        .then((r) => setArticles(r.data || []))
        .catch(() => setArticles([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [activeCategory, search]);

  return (
    <main className="bg-white overflow-x-hidden" data-testid="blog-page">
      {/* ===== HERO ===== */}
      <section
        className="relative px-6 sm:px-10 py-16 sm:py-20 rounded-b-[2.5rem] sm:rounded-b-[3rem] bg-cover bg-[position:75%_center] sm:bg-[position:right_center] overflow-hidden"
        style={{ backgroundImage: `url(${HERO_BANNER})`, backgroundColor: "#FEEFF2" }}
        data-testid="blog-hero"
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-lg">
            <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0] font-semibold mb-4">Le blog</p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] text-neutral-900">
              Conseils et inspirations<br/>pour une beauté<br/>
              <span className="editorial text-[#79C1E0]">qui te ressemble.</span>
            </h1>
            <p className="mt-6 text-neutral-600 leading-relaxed max-w-md">
              Skincare, make-up, haircare... découvre nos articles pour mieux comprendre ta peau, prendre soin de toi et faire des choix adaptés, simplement.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SEARCH + CATEGORIES ===== */}
      <section className="px-6 py-10" data-testid="blog-filters">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="relative w-full lg:max-w-xs">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"/>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un article..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#FEC4D2]/50 bg-white text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FEC4D2]/50 transition"
              data-testid="blog-search-input"
            />
          </div>

          <div className="flex flex-wrap gap-2.5" data-testid="blog-category-pills">
            <button
              onClick={() => setActiveCategory("tous")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                activeCategory === "tous" ? "bg-[#FEC4D2] text-neutral-900" : "bg-[#FEC4D2]/10 text-neutral-700 hover:bg-[#FEC4D2]/20"
              }`}
              data-testid="blog-category-tous"
            >
              Tous
            </button>
            {BLOG_CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveCategory(c.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                  activeCategory === c.key ? "bg-[#FEC4D2] text-neutral-900" : "bg-[#FEC4D2]/10 text-neutral-700 hover:bg-[#FEC4D2]/20"
                }`}
                data-testid={`blog-category-${c.key}`}
              >
                <img src={c.icon} alt="" className="w-5 h-5 object-contain rounded-full"/>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ARTICLES GRID ===== */}
      <section className="px-6 pb-24" data-testid="blog-articles-section">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="flex gap-2"><span className="loader-dot"/><span className="loader-dot"/><span className="loader-dot"/></div>
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="blog-articles-grid">
              {articles.map((a) => <ArticleCard key={a.id} article={a}/>)}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-[#FEC4D2]/50 rounded-3xl" data-testid="blog-empty-state">
              <p className="text-neutral-500">
                {search.trim() || activeCategory !== "tous"
                  ? "Aucun article ne correspond à ta recherche pour le moment."
                  : "Les premiers articles arrivent très bientôt !"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="px-6 pb-24" data-testid="blog-newsletter">
        <NewsletterBlock/>
      </section>
    </main>
  );
}