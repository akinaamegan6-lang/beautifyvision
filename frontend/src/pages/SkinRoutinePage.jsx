import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ChevronRight, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import Seo from "../components/Seo";
import SkinIcon from "../components/SkinIcon";
import ProductCard from "../components/ProductCard";
import ArticleCard from "../components/ArticleCard";
import { SKIN_ROUTINES } from "../data/skinRoutines";
import { plainText } from "../components/blog/blogText";

const HERO_BG = "/image/fond-hero-page.png";

function ProductSection({ section }) {
  const [items, setItems] = useState(null);
  const idsKey = section.ids.join(",");

  useEffect(() => {
    let alive = true;
    api.get("/products/by-ids", { params: { ids: idsKey } })
      .then((r) => alive && setItems(r.data || []))
      .catch(() => alive && setItems([]));
    return () => { alive = false; };
  }, [idsKey]);

  return (
    <section className="px-6 py-14 md:py-16" data-testid="skin-products-section">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900">{section.title}</h2>
          <p className="mt-4 text-neutral-600 leading-relaxed">{section.text}</p>
        </div>
        {items === null ? (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5" aria-hidden="true">
            {section.ids.map((id) => <div key={id} className="h-96 rounded-2xl bg-[#FEC4D2]/10 animate-pulse" />)}
          </div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function RelatedArticles({ routine }) {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    let alive = true;
    api.get("/blog/articles", { params: { limit: 100 } })
      .then((r) => {
        if (!alive) return;
        const all = r.data || [];
        const picked = [];
        const add = (a) => { if (a && !picked.includes(a) && picked.length < 3) picked.push(a); };
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

  if (!articles.length) return null;
  return (
    <section className="px-6 py-14 md:py-16" data-testid="skin-articles-section">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 text-center">Nos articles complémentaires</h2>
        <p className="mt-4 text-neutral-600 leading-relaxed text-center max-w-2xl mx-auto">
          Pour aller plus loin dans ta routine, découvre nos articles sur les actifs, les gestes et les soins adaptés à ton type de peau.
        </p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => <ArticleCard key={a.id || a.slug} article={a} />)}
        </div>
      </div>
    </section>
  );
}

export default function SkinRoutinePage() {
  const { slug } = useParams();
  const routine = useMemo(() => SKIN_ROUTINES.find((r) => r.path === `/routine/${slug}`), [slug]);
  if (!routine) return <Navigate to="/" replace />;

  const others = SKIN_ROUTINES.filter((r) => r.key !== routine.key);
  const [h1a, h1b] = routine.h1;

  return (
    <main className="bg-white overflow-x-hidden" data-testid={`skin-routine-${routine.key}`}>
      <Seo
        title={routine.seoTitle}
        description={routine.seoDescription}
        path={routine.path}
        image={routine.heroImage}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://beautifyvision.fr/" },
            { "@type": "ListItem", position: 2, name: routine.breadcrumb, item: `https://beautifyvision.fr${routine.path}` },
          ],
        }}
      />

      {/* ===== HERO ===== */}
      <section
        className="relative px-6 sm:px-10 pt-10 pb-16 md:pb-20 rounded-b-[2.5rem] sm:rounded-b-[3rem] bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${HERO_BG})`, backgroundColor: "#FEEFF2" }}
        data-testid="skin-hero"
      >
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500 mb-8" data-testid="breadcrumb">
            <Link to="/" className="hover:text-[#79C1E0] transition">Accueil</Link>
            <ChevronRight size={12} />
            <span className="text-neutral-700">{routine.breadcrumb}</span>
          </nav>
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#79C1E0] font-semibold mb-3">{routine.homeLabel}</p>
              <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] text-neutral-900">
                {h1a} <span className="editorial text-[#79C1E0]">{h1b}</span>
              </h1>
              {routine.intro.map((p, i) => (
                <p key={i} className="mt-6 text-neutral-600 leading-relaxed max-w-xl">{p}</p>
              ))}
              <Link
                to="/routine-360"
                className="inline-flex items-center gap-2 mt-8 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 text-sm font-medium px-6 py-3 rounded-full transition"
                data-testid="skin-cta-routine"
              >
                Obtenir ma routine personnalisée <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <span className="absolute -top-4 -left-4 w-full h-full rounded-full bg-[#FEC4D2]/60" aria-hidden="true" />
                <img
                  src={routine.heroImage}
                  alt={`Soins et routine pour ${routine.breadcrumb.toLowerCase()}`}
                  className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px] rounded-full object-cover border-4 border-white shadow-lg"
                />
                <p className="handwritten absolute -bottom-2 left-1/2 sm:left-auto sm:-right-4 -translate-x-1/2 sm:translate-x-0 bg-white/90 rounded-full px-5 py-1.5 text-2xl sm:text-3xl text-[#4aa3c9] -rotate-3 whitespace-nowrap shadow-sm">
                  {routine.heroTagline}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMPRENDRE ===== */}
      <section className="px-6 py-14 md:py-20" data-testid="skin-understand">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1fr] gap-12 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900">{routine.understand.title}</h2>
            {routine.understand.text.map((p, i) => (
              <p key={i} className="mt-4 text-neutral-600 leading-relaxed">{p}</p>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {routine.understand.points.map((pt) => (
              <div key={pt.title} className="rounded-2xl border border-[#79C1E0]/30 bg-[#79C1E0]/[0.05] p-5">
                <SkinIcon name={pt.icon} size={40} className="text-[#4aa3c9]" />
                <h3 className="mt-3 font-semibold text-neutral-900 text-sm sm:text-base">{pt.title}</h3>
                <p className="mt-1.5 text-xs sm:text-sm text-neutral-600 leading-relaxed">{pt.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRODUITS (1) ===== */}
      <ProductSection section={routine.productSections[0]} />

      {/* ===== CONSEILS ===== */}
      <section className="px-6 py-14 md:py-20 bg-[#FEC4D2]/15" data-testid="skin-tips">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900">{routine.tips.title}</h2>
          <p className="mt-4 text-neutral-600 leading-relaxed max-w-2xl mx-auto">{routine.tips.text}</p>
          <ul className="mt-10 grid sm:grid-cols-2 gap-4 text-left">
            {routine.tips.items.map((t, i) => (
              <li key={i} className="flex gap-3 bg-white rounded-2xl p-5 border border-[#FEC4D2]/50">
                <SkinIcon name="check-circle" size={26} className="text-[#4aa3c9] shrink-0 mt-0.5" />
                <span className="text-sm text-neutral-700 leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== PRODUITS (2) ===== */}
      <ProductSection section={routine.productSections[1]} />

      {/* ===== ROUTINE COMPLETE ===== */}
      <section className="px-6 py-14 md:py-20 bg-[#79C1E0]/[0.06]" data-testid="skin-routine-steps">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 text-center">
            Routine complète pour {routine.breadcrumb.toLowerCase()}
          </h2>
          <p className="mt-4 text-neutral-600 leading-relaxed text-center max-w-2xl mx-auto">
            Quatre étapes suffisent pour une routine efficace : nettoyer, traiter, hydrater et protéger. Adapte la texture et les actifs à ta peau, et ajuste la fréquence selon ta tolérance.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {routine.routine.map((s, i) => (
              <div key={s.name} className="relative bg-white rounded-3xl p-6 border border-[#79C1E0]/25">
                <span className="absolute top-4 right-5 editorial text-4xl text-[#FEC4D2]">{i + 1}</span>
                <SkinIcon name={s.icon} size={44} className="text-[#4aa3c9]" />
                <h3 className="mt-4 text-lg font-semibold text-neutral-900">{s.name}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ERREURS ===== */}
      <section className="px-6 py-14 md:py-20" data-testid="skin-mistakes">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 text-center">
            Les erreurs à éviter avec une {routine.key === "taches" ? "peau à taches pigmentaires" : routine.breadcrumb.toLowerCase()}
          </h2>
          <p className="mt-4 text-neutral-600 leading-relaxed text-center max-w-2xl mx-auto">
            Même avec de bons produits, certains réflexes freinent les résultats. Voici les erreurs les plus courantes à corriger pour que ta routine soit vraiment efficace.
          </p>
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            {routine.mistakes.map((m) => (
              <div key={m.title} className="flex gap-4 rounded-2xl border border-neutral-200 p-5">
                <SkinIcon name="x-circle" size={28} className="text-[#e58aa0] shrink-0" />
                <div>
                  <h3 className="font-semibold text-neutral-900">{m.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600 leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RelatedArticles routine={routine} />

      {/* ===== AUTRES ROUTINES ===== */}
      <section className="px-6 pb-20" data-testid="skin-other-routines">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-neutral-500 mb-4">Découvre aussi nos routines pour d'autres besoins</p>
          <div className="flex flex-wrap justify-center gap-3">
            {others.map((o) => (
              <Link
                key={o.key}
                to={o.path}
                className="px-5 py-2.5 rounded-full border border-[#79C1E0]/50 text-sm text-neutral-800 hover:bg-[#79C1E0]/10 transition"
              >
                {o.breadcrumb}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
