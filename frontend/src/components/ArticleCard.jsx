import { Link } from "react-router-dom";
import { NO_PRODUCT_IMAGE } from "../data/imageAssets";
import { getBlogCategory } from "../data/blogConfig";

const ARROW_ICON = "/icone/fleche-lecture-article.png";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export default function ArticleCard({ article }) {
  const cat = getBlogCategory(article.category);
  return (
    <article
      className="group bg-white border border-[#FEC4D2]/40 rounded-3xl overflow-hidden card-lift flex flex-col"
      data-testid={`article-card-${article.id}`}
    >
      <Link to={`/blog/${article.slug}`} className="relative aspect-[4/3] block bg-gradient-to-br from-[#FEC4D2]/10 to-[#79C1E0]/10 overflow-hidden">
        <img
          src={article.image || NO_PRODUCT_IMAGE}
          alt={article.title}
          loading="lazy"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PRODUCT_IMAGE; }}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
        />
        {cat && (
          <span className="absolute top-3 left-3 bg-white/95 text-[#79C1E0] text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
            {cat.label}
          </span>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-semibold text-neutral-900 leading-snug line-clamp-2">
          <Link to={`/blog/${article.slug}`} data-testid={`article-title-${article.id}`}>{article.title}</Link>
        </h3>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed line-clamp-2 flex-1">{article.excerpt}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
          <span className="text-xs text-neutral-400">{formatDate(article.published_at)} · {article.read_minutes} min</span>
          <Link to={`/blog/${article.slug}`} aria-label="Lire l'article" data-testid={`read-article-${article.id}`}>
            <img src={ARROW_ICON} alt="" className="w-8 h-8 object-contain group-hover:translate-x-1 transition"/>
          </Link>
        </div>
      </div>
    </article>
  );
}
