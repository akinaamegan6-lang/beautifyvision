import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { api } from "../lib/api";
import SkinIcon from "./SkinIcon";
import { NO_PRODUCT_IMAGE, productImgSrc, productImgError, swapIfPlaceholder } from "../data/imageAssets";
import { plainText } from "./blog/blogText";

/* Palette : rose = #F2709C (accent) / #F58BA8 (mot clé), bleu = #79C1E0 / #3b8fb8 (texte) */
const TONES = {
  pink: { word: "text-[#F58BA8]", icon: "text-[#F2709C]", disc: "bg-[#F2709C]/[0.14]", badge: "bg-[#F2709C]", label: "text-[#F2709C]", box: "bg-[#FEC4D2]/15 border-[#FEC4D2]/60" },
  blue: { word: "text-[#79C1E0]", icon: "text-[#3b8fb8]", disc: "bg-[#79C1E0]/[0.2]", badge: "bg-[#79C1E0]", label: "text-[#3b8fb8]", box: "bg-[#79C1E0]/10 border-[#79C1E0]/40" },
};
export const alt = (i) => (i % 2 === 0 ? "pink" : "blue");

/** Titre de section : le mot placé entre {accolades} passe en italique coloré. */
export function SectionTitle({ text, tone = "pink", className = "", as: Tag = "h2" }) {
  const parts = text.split(/(\{[^}]+\})/g).filter(Boolean);
  return (
    <Tag className={`text-2xl md:text-3xl font-bold text-neutral-900 ${className}`}>
      {parts.map((p, i) =>
        p.startsWith("{") ? (
          <span key={i} className={`editorial font-normal ${TONES[tone].word}`}>{p.slice(1, -1)}</span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </Tag>
  );
}

/** Pictogramme dans un rond de la même teinte, en plus clair. */
export function RoundIcon({ name, tone = "pink", size = 64, iconSize = 30, className = "" }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 ${TONES[tone].disc} ${className}`}
      style={{ width: size, height: size }}
    >
      <SkinIcon name={name} size={iconSize} className={TONES[tone].icon} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Comprendre ma peau                                                  */
/* ------------------------------------------------------------------ */
export function UnderstandSection({ routine }) {
  const u = routine.understand;
  return (
    <section className="px-6 py-10 md:py-14" data-testid="skin-understand">
      <div className="max-w-7xl mx-auto rounded-[2rem] bg-gradient-to-br from-[#FEEFF2] via-white to-[#FEEFF2]/70 border border-[#FEC4D2]/40 shadow-[0_10px_40px_rgba(254,196,210,0.25)] p-6 sm:p-10 grid lg:grid-cols-[0.95fr_1.25fr] gap-8 lg:gap-10 items-center">
        <div>
          <SectionTitle text={u.title} tone="pink" />
          {u.text.map((p, i) => (
            <p key={i} className="mt-4 text-neutral-600 leading-relaxed">{p}</p>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {u.points.map((pt, i) => (
            <div key={pt.title} className="rounded-2xl bg-white border border-neutral-100 shadow-[0_6px_24px_rgba(121,193,224,0.14)] px-3 py-5 text-center" data-testid="skin-understand-point">
              <RoundIcon name={pt.icon} tone={i % 2 === 0 ? "blue" : "pink"} />
              <h3 className="mt-3 font-semibold text-neutral-900 text-sm">{pt.title}</h3>
              <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">{pt.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Conseils                                                            */
/* ------------------------------------------------------------------ */
export function TipsSection({ routine }) {
  const t = routine.tips;
  return (
    <section className="px-6 py-10 md:py-14" data-testid="skin-tips">
      <div className="max-w-7xl mx-auto rounded-[2rem] bg-gradient-to-br from-[#FEC4D2]/40 via-[#FEEFF2] to-[#FEC4D2]/25 p-6 sm:p-10 md:p-12">
        <div className="text-center">
          <SectionTitle text={t.title} tone="blue" />
          <p className="mt-4 text-neutral-600 leading-relaxed max-w-2xl mx-auto">{t.text}</p>
        </div>
        <ul className="mt-9 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.items.map((it, i) => (
            <li key={it.title} className="rounded-2xl bg-white shadow-[0_6px_24px_rgba(242,112,156,0.10)] px-5 py-6 text-center" data-testid="skin-tip">
              <RoundIcon name={it.icon} tone={alt(i)} size={72} iconSize={36} />
              <h3 className="mt-4 font-semibold text-neutral-900">{it.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{it.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Routine complète : 4 étapes avec un produit chacune                 */
/* ------------------------------------------------------------------ */
export function StepsView({ routine, products }) {
  return (
    <section className="px-6 py-10 md:py-14" data-testid="skin-routine-steps">
      <div className="max-w-7xl mx-auto">
        <SectionTitle text={`Routine {complète} pour ${routine.breadcrumb.toLowerCase()}`} tone="blue" className="text-center" />
        <p className="mt-4 text-neutral-600 leading-relaxed text-center max-w-2xl mx-auto">
          Quatre étapes suffisent pour une routine efficace : nettoyer, traiter, hydrater et protéger. Adapte la texture et les actifs à ta peau, et ajuste la fréquence selon ta tolérance.
        </p>
        <div className="mt-10 flex flex-col lg:flex-row lg:items-stretch gap-3">
          {routine.routine.map((s, i) => {
            const tone = alt(i);
            const c = TONES[tone];
            const p = products ? products[s.productId] : undefined;
            return (
              <div key={s.name} className="contents">
                {i > 0 && (
                  <span className="self-center text-[#79C1E0] shrink-0" aria-hidden="true">
                    <ArrowRight size={26} className="hidden lg:block" />
                    <ArrowRight size={26} className="lg:hidden rotate-90" />
                  </span>
                )}
                <div className={`flex-1 min-w-0 rounded-3xl border p-4 flex flex-col ${c.box}`} data-testid={`skin-step-${i + 1}`}>
                  <div className="flex items-center gap-2 px-1 pb-3">
                    <span className={`w-7 h-7 rounded-full text-white text-sm font-semibold inline-flex items-center justify-center ${c.badge}`}>{i + 1}</span>
                    <h3 className={`text-lg font-semibold ${c.label}`}>{s.name}</h3>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-4 text-center h-[17.5rem] flex flex-col">
                    {products === null ? (
                      <div className="h-36 rounded-xl bg-neutral-100 animate-pulse" aria-hidden="true" />
                    ) : p ? (
                      <a
                        href={p.affiliate_url || "#"}
                        target="_blank"
                        rel="sponsored nofollow noopener noreferrer"
                        className="group block"
                        data-testid={`skin-step-product-${i + 1}`}
                      >
                        <img
                          src={productImgSrc(p.image)}
                          alt={p.name}
                          loading="lazy"
                          className="mx-auto h-36 w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:-translate-y-1"
                          onLoad={swapIfPlaceholder}
                          onError={productImgError(p.image)}
                        />
                        <p className="mt-3 text-sm font-semibold text-neutral-900 leading-snug line-clamp-2 group-hover:underline">{p.name}</p>
                      </a>
                    ) : (
                      <div className="h-36 flex items-center justify-center">
                        <RoundIcon name={s.icon} tone={tone} size={80} iconSize={40} />
                      </div>
                    )}
                    <div className="mt-auto pt-3 flex items-center justify-center gap-3" aria-label={s.when.length > 1 ? "Matin et soir" : "Le matin"}>
                      {s.when.includes("sun") && <SkinIcon name="sun" size={22} className="text-[#F5A524]" />}
                      {s.when.includes("moon") && <SkinIcon name="moon" size={22} className="text-[#5BA8D6]" />}
                    </div>
                  </div>
                  <p className="mt-3 px-1 text-xs sm:text-sm text-neutral-600 leading-relaxed">{s.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function RoutineSteps({ routine }) {
  const [products, setProducts] = useState(null);
  const idsKey = routine.routine.map((s) => s.productId).filter(Boolean).join(",");

  useEffect(() => {
    let alive = true;
    api.get("/products/by-ids", { params: { ids: idsKey } })
      .then((r) => {
        if (!alive) return;
        const map = {};
        (r.data || []).forEach((p) => { map[p.id] = p; });
        setProducts(map);
      })
      .catch(() => alive && setProducts({}));
    return () => { alive = false; };
  }, [idsKey]);

  return <StepsView routine={routine} products={products} />;
}

/* ------------------------------------------------------------------ */
/* Erreurs à éviter | Articles complémentaires (2 colonnes)            */
/* ------------------------------------------------------------------ */
export function MistakesView({ routine, articles }) {
  const hasArticles = articles && articles.length > 0;
  return (
    <section className="px-6 py-10 md:py-14" data-testid="skin-mistakes">
      <div className={`max-w-7xl mx-auto grid gap-5 ${hasArticles ? "lg:grid-cols-2" : ""}`}>
        <div className="rounded-3xl bg-gradient-to-br from-[#FEEFF2] to-white border border-[#FEC4D2]/50 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <RoundIcon name="x-circle" tone="pink" size={44} iconSize={24} />
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900">Les erreurs à éviter</h2>
          </div>
          <ul className="mt-6 space-y-4">
            {routine.mistakes.map((m) => (
              <li key={m.title} className="flex gap-3">
                <SkinIcon name="x-circle" size={22} className="text-[#F2709C] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">{m.title}</h3>
                  <p className="mt-0.5 text-sm text-neutral-600 leading-relaxed">{m.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {hasArticles && (
          <div className="rounded-3xl bg-gradient-to-br from-[#E8F4FA] to-white border border-[#79C1E0]/30 p-6 md:p-8" data-testid="skin-articles-section">
            <div className="flex items-center gap-3">
              <RoundIcon name="book-open-text" tone="blue" size={44} iconSize={24} />
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900">Nos articles complémentaires</h2>
            </div>
            <ul className="mt-6 space-y-3">
              {articles.map((a) => {
                const title = plainText(a.title);
                return (
                  <li key={a.id || a.slug}>
                    <Link
                      to={`/blog/${a.slug}`}
                      className="group flex items-center gap-3 rounded-xl bg-white/90 p-2 pr-4 hover:shadow-md transition"
                      data-testid={`skin-article-${a.slug}`}
                    >
                      <img
                        src={a.image || NO_PRODUCT_IMAGE}
                        alt=""
                        loading="lazy"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PRODUCT_IMAGE; }}
                        className="w-16 h-14 rounded-lg object-cover shrink-0"
                      />
                      <span className="flex-1 text-sm text-neutral-800 leading-snug line-clamp-2">{title}</span>
                      <ChevronRight size={16} className="text-[#79C1E0] shrink-0 group-hover:translate-x-0.5 transition" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export function MistakesAndArticles({ routine }) {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    let alive = true;
    api.get("/blog/articles", { params: { limit: 100 } })
      .then((r) => {
        if (!alive) return;
        const all = r.data || [];
        const picked = [];
        const add = (a) => { if (a && !picked.includes(a) && picked.length < 4) picked.push(a); };
        routine.articleSlugs.forEach((s) => add(all.find((a) => a.slug === s)));
        const kws = routine.articleKeywords.map((k) => k.toLowerCase());
        all.forEach((a) => {
          const hay = `${plainText(a.title)} ${a.excerpt || ""}`.toLowerCase();
          if (kws.some((k) => hay.includes(k))) add(a);
        });
        all.forEach(add);
        setArticles(picked);
      })
      .catch(() => alive && setArticles([]));
    return () => { alive = false; };
  }, [routine]);

  return <MistakesView routine={routine} articles={articles} />;
}
