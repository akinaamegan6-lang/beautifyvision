import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import ArticleCard from "./ArticleCard";

/** Accueil : les 4 derniers articles du blog (même image que l'article). */
export default function LatestArticlesSection() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    let alive = true;
    api.get("/blog/articles", { params: { limit: 4 } })
      .then((r) => alive && setArticles((r.data || []).slice(0, 4)))
      .catch(() => alive && setArticles([]));
    return () => { alive = false; };
  }, []);

  if (!articles.length) return null;

  return (
    <section className="px-6 py-20 md:py-24" data-testid="latest-articles-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#79C1E0] leading-tight">
            Nos derniers <span className="editorial font-normal text-[#F58BA8]">articles</span>
          </h2>
          <p className="mt-4 text-neutral-600 leading-relaxed">
            Des conseils simples et fiables pour mieux comprendre ta peau et adopter les bons réflexes au quotidien.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="latest-articles-grid">
          {articles.map((a) => <ArticleCard key={a.id || a.slug} article={a} />)}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-[#F2709C] text-[#F2709C] hover:bg-[#F2709C] hover:text-white px-8 py-3 text-sm font-semibold transition"
            data-testid="latest-articles-cta"
          >
            Voir tous les articles du blog <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
