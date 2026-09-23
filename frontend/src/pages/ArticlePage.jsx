import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, Clock, Sparkles, ChevronRight } from "lucide-react";
import { api } from "../lib/api";
import { getBlogCategory } from "../data/blogConfig";
import RichText from "../components/blog/RichText";
import { ArticleBlock } from "../components/blog/ArticleBlocks";
import TableOfContents from "../components/blog/TableOfContents";
import SimilarArticles from "../components/blog/SimilarArticles";
import NewsletterBlock from "../components/blog/NewsletterBlock";
import CommentsSection from "../components/blog/CommentsSection";
import { NO_PRODUCT_IMAGE } from "../data/imageAssets";
import { plainText } from "../components/blog/blogText";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setArticle(null);
    setNotFound(false);
    api.get(`/blog/articles/${slug}`)
      .then((r) => setArticle(r.data))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-24 text-center" data-testid="article-not-found">
        <p className="text-neutral-500">Cet article n'existe pas ou plus.</p>
        <Link to="/blog" className="inline-flex items-center gap-1.5 mt-4 text-[#79C1E0] font-medium hover:underline">
          Retour au blog
        </Link>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="flex justify-center py-32">
        <div className="flex gap-2"><span className="loader-dot"/><span className="loader-dot"/><span className="loader-dot"/></div>
      </main>
    );
  }

  const cat = getBlogCategory(article.category);

  return (
    <main className="bg-white overflow-x-hidden" data-testid="article-page">
      {/* ===== HERO ===== */}
      <section className="relative px-6 sm:px-10 pt-8 pb-12 sm:pb-16 rounded-b-[2.5rem] sm:rounded-b-[3rem] bg-[#FEEFF2] overflow-hidden" data-testid="article-hero">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center flex-wrap gap-1.5 text-xs text-neutral-500 mb-6" data-testid="breadcrumb">
            <Link to="/" className="hover:text-[#79C1E0] transition">Accueil</Link>
            <ChevronRight size={12}/>
            <Link to="/blog" className="hover:text-[#79C1E0] transition">Blog</Link>
            {cat && (
              <>
                <ChevronRight size={12}/>
                <span>{cat.label}</span>
              </>
            )}
            <ChevronRight size={12}/>
            <span className="text-neutral-700 truncate max-w-[220px] sm:max-w-none">{plainText(article.title)}</span>
          </nav>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div>
              {cat && (
                <span className="inline-block bg-white text-[#79C1E0] text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
                  {cat.label}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] text-neutral-900">
                <RichText text={article.title} highlightClassName="text-[#79C1E0]" italicHighlight/>
              </h1>
              {article.chapo && (
                <p className="mt-5 text-neutral-600 leading-relaxed max-w-lg">{article.chapo}</p>
              )}
              <div className="flex items-center gap-5 mt-6 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5"><Calendar size={14}/> {formatDate(article.published_at)}</span>
                <span className="flex items-center gap-1.5"><Clock size={14}/> {article.read_minutes} min de lecture</span>
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-[#FEC4D2]/15 to-[#79C1E0]/10 flex items-center justify-center">
              <img
                src={article.hero_image || article.image || NO_PRODUCT_IMAGE}
                alt={plainText(article.title)}
                className={article.hero_image || article.image ? "w-full h-full object-cover" : "w-1/3 h-1/3 object-contain"}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PRODUCT_IMAGE; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <section className="px-6 py-14" data-testid="article-content">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_320px] gap-12">
          <article className="min-w-0">
            {(article.blocks || []).map((block, i) => <ArticleBlock key={i} block={block}/>)}
            <CommentsSection articleId={article.id}/>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24 self-start" data-testid="article-sidebar">
            <TableOfContents blocks={article.blocks}/>

            <div className="bg-[#79C1E0]/10 rounded-2xl p-5" data-testid="routine-cta-block">
              <h3 className="text-base font-bold text-neutral-900">Crée ta routine skincare personnalisée</h3>
              <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                Réponds à quelques questions et obtiens une routine sur mesure adaptée à ta peau.
              </p>
              <Link
                to="/routine-360"
                className="inline-flex items-center gap-1.5 mt-3 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-4 py-2 rounded-full text-xs font-semibold transition"
              >
                <Sparkles size={12}/> Faire mon diagnostic
              </Link>
            </div>

            <SimilarArticles category={article.category} excludeSlug={article.slug}/>

            <NewsletterBlock compact/>
          </aside>
        </div>
      </section>
    </main>
  );
}
