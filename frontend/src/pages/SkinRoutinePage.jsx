import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { api } from "../lib/api";
import Seo from "../components/Seo";
import RoutineCta from "../components/RoutineCta";
import ProductCard from "../components/ProductCard";
import { SKIN_ROUTINES } from "../data/skinRoutines";
import { SectionTitle, UnderstandSection, TipsSection, RoutineSteps, MistakesAndArticles } from "../components/SkinRoutineBlocks";

const HERO_BG = "/image/fond-hero-page.png";

function ProductSection({ section, tone }) {
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
    <section className="px-6 py-10 md:py-14" data-testid="skin-products-section">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <SectionTitle text={section.title} tone={tone} />
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
              <RoutineCta variant="hero" testId="skin-cta-top" />
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
      <UnderstandSection routine={routine} />

      {/* ===== PRODUITS (1) ===== */}
      <ProductSection section={routine.productSections[0]} tone="pink" />

      {/* ===== CONSEILS ===== */}
      <TipsSection routine={routine} />

      {/* ===== PRODUITS (2) ===== */}
      <ProductSection section={routine.productSections[1]} tone="blue" />

      {/* ===== ROUTINE COMPLETE ===== */}
      <RoutineSteps routine={routine} />

      <RoutineCta testId="skin-cta-mid" />

      {/* ===== ERREURS + ARTICLES ===== */}
      <MistakesAndArticles routine={routine} />

      <RoutineCta testId="skin-cta-bottom" />

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
