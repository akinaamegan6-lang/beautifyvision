import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { NO_PRODUCT_IMAGE } from "../../data/imageAssets";
import { getBlogCategory } from "../../data/blogConfig";
import { plainText } from "./blogText";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export default function SimilarArticles({ category, excludeSlug }) {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    if (!category) return;
    api.get("/blog/articles", { params: { category } })
      .then((r) => setArticles((r.data || []).filter((a) => a.slug !== excludeSlug).slice(0, 3)))
      .catch(() => setArticles([]));
  }, [category, excludeSlug]);

  return (
    <div data-testid="similar-articles">
      <h3 className="text-base font-bold text-neutral-900 mb-4">Articles similaires</h3>
      {articles.length > 0 && (
        <ul className="space-y-4">
          {articles.map((a) => {
            const cat = getBlogCategory(a.category);
            return (
              <li key={a.id}>
                <Link to={`/blog/${a.slug}`} className="flex gap-3 group" data-testid={`similar-article-${a.id}`}>
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-[#FEC4D2]/10 to-[#79C1E0]/10">
                    <img
                      src={a.image || NO_PRODUCT_IMAGE}
                      alt={plainText(a.title)}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PRODUCT_IMAGE; }}
                    />
                  </div>
                  <div className="min-w-0">
                    {cat && <span className="text-[10px] uppercase tracking-wider font-semibold text-[#79C1E0]">{cat.label}</span>}
                    <p className="text-sm font-medium text-neutral-900 leading-snug line-clamp-2 group-hover:text-[#FEC4D2] transition">{plainText(a.title)}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{formatDate(a.published_at)} · {a.read_minutes} min</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
