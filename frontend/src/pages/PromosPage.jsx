import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { api } from "../lib/api";
import Seo from "../components/Seo";
import { PROMO_SECTIONS, ALL_PROMO_CATEGORIES } from "../data/promoSections";
import { SKIN_ROUTINES } from "../data/skinRoutines";
import { HeroPromoBanner, ChristmasBanner } from "../components/promo/PromoBanners";
import PromoSection, { SectionHeading } from "../components/promo/PromoSection";
import OffersSection from "../components/promo/OffersSection";

export default function PromosPage() {
  const { hash } = useLocation();
  const [maxPct, setMaxPct] = useState(0);

  useEffect(() => {
    let alive = true;
    api.get("/products/promos/summary", { params: { categories: ALL_PROMO_CATEGORIES.join(",") } })
      .then((r) => alive && setMaxPct(Number(r.data?.max_pct) || 0))
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Ancres (#visage, #corps, #make-up, #offres) : défilement avec la page déjà affichée.
  useEffect(() => {
    if (!hash) return undefined;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <main className="bg-gradient-to-b from-[#FFF5F8] via-white to-white" data-testid="promos-page">
      <Seo
        title="Promos & bons plans beauté : soins visage, corps, make-up | Beautify Vision"
        description="Les meilleures promos beauté du moment : crèmes, sérums, gels douche, fonds de teint, mascaras, rouges à lèvres à prix réduit, avec prix barrés et codes promo."
        path="/promos"
        image="/image/hero-banner-page-promos.png"
      />

      <header className="px-6 pt-10 md:pt-14 text-center">
        <p className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-neutral-500">Bons plans &amp; offres exclusives</p>
        <h1 className="mt-4 text-4xl md:text-6xl font-bold text-[#79C1E0] leading-tight">
          Promos <span className="text-[#79C1E0]">&amp;</span>{" "}
          <span className="editorial font-medium text-[#FEC4D2] text-5xl md:text-7xl">Bons plans</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-neutral-600 leading-relaxed">
          Retrouve ici les meilleures promotions skincare, corps et make-up, ainsi que les codes promo de nos marchands partenaires. Les produits sont mis à jour régulièrement : l'ancien prix est barré pour que tu voies l'économie en un coup d'œil.
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8 space-y-6">
        <HeroPromoBanner maxPct={maxPct} />
        <ChristmasBanner />
      </div>

      {PROMO_SECTIONS.map((s) => (
        <PromoSection key={s.id} section={s} />
      ))}

      <OffersSection />

      {/* Appels à l'action vers les routines par type de peau */}
      <section className="px-6 py-12 md:py-16" data-testid="promo-routines-cta">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title={["Trouve le soin", "adapté à ta peau"]} />
          <p className="mt-3 max-w-3xl text-neutral-600">
            Une promo n'est un bon plan que si le produit te convient. Découvre nos routines par type de peau, puis reviens profiter des remises sur les soins recommandés.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SKIN_ROUTINES.map((r) => (
              <Link
                key={r.key}
                to={r.path}
                className="group relative overflow-hidden rounded-3xl border border-[#FEC4D2] bg-white flex flex-col"
              >
                <div className="h-36 overflow-hidden bg-[#FEC4D2]/15">
                  <img src={r.heroImage} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-neutral-900">{r.breadcrumb}</h3>
                  <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed line-clamp-3">{r.homeText}</p>
                  <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#79C1E0]">
                    Voir la routine <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
