import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Search, Settings2, CheckCircle2, ArrowRight, Star, BarChart3, Play } from "lucide-react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { NO_PRODUCT_IMAGE } from "../data/imageAssets";

const HERO_IMG = "https://images.unsplash.com/photo-1763192902738-a3e17d5f9015?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwbWFrZXVwJTIwcG9ydHJhaXQlMjBnbG93fGVufDB8fHx8MTc3ODQ0NzQwNHww&ixlib=rb-4.1.0&q=85";
const BEFORE_IMG = "https://customer-assets.emergentagent.com/job_makeup-match-test/artifacts/u8viubvz_d633f23b-733d-43d5-9640-021d3f2a937f.png";
const AFTER_IMG = "https://customer-assets.emergentagent.com/job_makeup-match-test/artifacts/0l4tws9l_IMG_2228%20%281%29.JPG";

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export default function HomePage() {
  const [top, setTop] = useState([]);
  const month = MONTHS[new Date().getMonth()];

  useEffect(() => {
    api.get("/products/top", { params: { parent: "cosmetiques", limit: 10 } })
      .then((r) => setTop(r.data || []))
      .catch(() => setTop([]));
  }, []);

  const [first, second, third, ...rest] = top;

  return (
    <main className="bg-white overflow-x-hidden">
      {/* ===== HERO ===== */}
      <section className="relative px-6 pt-16 pb-32" data-testid="hero-section">
        <div className="halo-pink -top-32 -left-32" />
        <div className="halo-blue top-20 -right-10" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.1fr] lg:grid-rows-[auto_1fr] gap-x-10 gap-y-8 relative z-10">

          {/* Bloc A — label + H1 (mobile: 1er, desktop: col-1 row-1) */}
          <div className="order-1 lg:col-start-1 lg:row-start-1 animate-fade-up">
            <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0] mb-5">Diagnostic beauté personnalisé · Essayage de produit en direct</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-[#FEC4D2]">
              Ta routine<br/>
              <span className="relative inline-block">
                <span className="editorial text-[#79C1E0]">skincare</span>
                <svg className="absolute left-1 -bottom-3 w-[92%]" height="18" viewBox="0 0 200 18" fill="none" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 4 Q 100 -8, 197 6" stroke="#FEC4D2" strokeWidth="6" strokeLinecap="round"/>
                </svg>
              </span><br/>
              sur mesure.
            </h1>
          </div>

          {/* Bloc C — paragraphe + boutons + confiance (mobile: 3e, desktop: col-1 row-2) */}
          <div className="order-3 lg:col-start-1 lg:row-start-2 animate-fade-up">
            <p className="text-base md:text-lg text-neutral-600 max-w-xl leading-relaxed">
              Un quiz intelligent qui analyse ta peau et construit ta routine sur mesure, avec les produits qui te correspondent vraiment.
              Et un essayage virtuel par IA pour voir le résultat avant d'adopter.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link to="/routine-360" className="inline-flex items-center gap-2 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-7 py-3.5 rounded-full font-medium transition shadow-md hover:shadow-lg" data-testid="hero-cta-compare">
                Faire mon diagnostic <ArrowRight size={16}/>
              </Link>
              <a href="#how-it-works" className="inline-flex items-center gap-2.5 text-neutral-800 font-medium group" data-testid="hero-cta-howitworks">
                <span className="w-9 h-9 rounded-full bg-white border border-neutral-300 flex items-center justify-center group-hover:border-[#79C1E0] transition shrink-0">
                  <Play size={12} className="fill-neutral-800 text-neutral-800 ml-0.5"/>
                </span>
                <span className="underline underline-offset-4 decoration-neutral-300 group-hover:decoration-[#79C1E0] transition">Voir comment ça marche</span>
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-start gap-x-6 gap-y-5 text-sm text-neutral-600">
              <div className="flex items-start gap-2 w-[95px]"><img src="/icone/etoiles.png" alt="" className="w-5 h-5 object-contain shrink-0"/> <span>100% gratuit</span></div>
              <div className="flex items-start gap-2 w-[110px]"><img src="/icone/feuille.png" alt="" className="w-5 h-5 object-contain shrink-0"/> <span>Sans inscription</span></div>
              <div className="flex items-start gap-2 w-[130px]"><img src="/icone/vrai.png" alt="" className="w-5 h-5 object-contain shrink-0"/> <span>Recommandations personnalisées</span></div>
              <div className="flex items-start gap-2 w-[130px]"><img src="/icone/coeur.png" alt="" className="w-5 h-5 object-contain shrink-0"/> <span>Des produits fiables et adaptés</span></div>
            </div>
          </div>

          {/* Bloc B — visuel (mobile: 2e, desktop: col-2 rows-1+2) */}
          <div className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 relative animate-fade-in flex justify-center lg:justify-end lg:-mr-6 xl:-mr-16">
            <div className="absolute -inset-16 bg-gradient-to-br from-[#FEC4D2]/40 via-[#FEC4D2]/10 to-[#79C1E0]/35 rounded-full blur-3xl -z-10" />

            <p className="handwritten absolute -left-2 md:left-4 top-4 md:top-8 text-xl md:text-2xl lg:text-[1.7rem] text-neutral-700 leading-snug -rotate-3 z-20 hidden sm:block">
              Une peau plus saine<br/>Une version de toi, en mieux <span className="text-[#FEC4D2]">♥</span>
            </p>

            <div className="relative w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] md:w-[560px] md:h-[560px] lg:w-[600px] lg:h-[600px] xl:w-[680px] xl:h-[680px] rounded-full overflow-hidden shadow-2xl">
              <img src="/image/fille-hero-section.png" alt="Femme appliquant sa routine skincare BeautifyVision" className="w-full h-full object-cover"/>
            </div>

            {/* Widget — sérum */}
            <div className="absolute top-6 sm:top-10 right-0 md:-right-4 xl:-right-10 bg-white rounded-2xl shadow-xl p-3.5 flex items-center gap-3 w-56 md:w-64 z-20 card-lift">
              <img src="/image/serum-hero-section.png" alt="Sérum hydratant Hyalu B5" className="w-14 h-14 object-contain rounded-lg bg-neutral-50 shrink-0"/>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">Sérum hydratant</p>
                <p className="text-sm text-neutral-500 truncate">Hyalu B5</p>
                <p className="text-xs text-neutral-400 truncate">La Belle Rose</p>
              </div>
              <ArrowRight size={16} className="text-[#79C1E0] shrink-0 ml-auto"/>
            </div>

            {/* Widget — crème */}
            <div className="absolute bottom-20 sm:bottom-28 -left-2 md:-left-10 xl:-left-16 bg-white rounded-2xl shadow-xl p-3.5 flex items-center gap-3 w-56 md:w-64 z-20 card-lift">
              <img src="/image/creme-hero-section.png" alt="Crème apaisante Cicaplast Baume B5+" className="w-14 h-14 object-contain rounded-lg bg-neutral-50 shrink-0"/>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">Crème apaisante</p>
                <p className="text-sm text-neutral-500 truncate">Cicaplast Baume B5+</p>
                <p className="text-xs text-neutral-400 truncate">La Belle Rose</p>
              </div>
              <ArrowRight size={16} className="text-[#79C1E0] shrink-0 ml-auto"/>
            </div>

            {/* Widget — promesses BeautifyVision */}
            <div className="absolute top-1/2 -translate-y-1/4 right-0 md:-right-6 xl:-right-20 bg-white rounded-2xl shadow-xl p-5 w-64 z-20 card-lift hidden sm:block">
              <ul className="space-y-3">
                {[
                  "Une routine 100% personnalisée",
                  "Des produits qui te correspondent vraiment",
                  "Un essayage virtuel avant d'adopter",
                  "Un configurateur simple, sans prise de tête",
                ].map((txt) => (
                  <li key={txt} className="flex items-start gap-2 text-sm text-neutral-700 leading-snug">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-[#FEC4D2]/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={11} className="text-[#FEC4D2]"/>
                    </span>
                    {txt}
                  </li>
                ))}
              </ul>
            </div>

            <p className="handwritten absolute -bottom-6 md:-bottom-4 right-2 md:right-0 text-xl md:text-2xl lg:text-[1.7rem] text-neutral-700 leading-snug rotate-2 z-20 hidden sm:block">
              Good Skin<br/>Good Mood <span className="text-[#FEC4D2]">♥</span>
            </p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="px-6 py-24 bg-[#FEC4D2]/[0.04] scroll-mt-24" data-testid="how-it-works">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Le concept</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold text-[#79C1E0]">
            Comment fonctionne <span className="editorial text-[#FEC4D2]">BeautifyVision</span> ?
          </h2>
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, n: "01", t: "Réponds au quiz", d: "Type de peau, mode de vie, allergies, problèmes spécifiques — un diagnostic complet en quelques questions." },
              { icon: Settings2, n: "02", t: "Reçois ta sélection personnalisée", d: "Notre algorithme construit ta routine sur mesure parmi des milliers de produits." },
              { icon: CheckCircle2, n: "03", t: "Essaie & adopte", d: "Visualise le rendu avec l'essayage IA, puis clique vers la marque pour te procurer tes produits." },
            ].map((s, i) => (
              <div key={s.n} className="bg-white border border-[#FEC4D2]/40 rounded-3xl p-8 text-left card-lift animate-fade-up" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-bold text-[#79C1E0]">{s.n}</span>
                  <div className="w-12 h-12 rounded-full bg-[#FEC4D2]/15 flex items-center justify-center text-[#FEC4D2]">
                    <s.icon size={22}/>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">{s.t}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TWO TOOLS — DEUX OUTILS ===== */}
      <section className="px-6 py-24" data-testid="modules-section">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#79C1E0] leading-tight">
              Deux outils pour <span className="editorial text-[#FEC4D2]">ta routine beauté sur mesure</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Comparator card */}
            <div className="bg-white border border-[#FEC4D2] rounded-3xl p-8 md:p-10 card-lift flex flex-col" data-testid="tool-card-comparator">
              <div className="w-12 h-12 rounded-2xl bg-[#FEC4D2]/15 flex items-center justify-center text-[#FEC4D2] mb-6">
                <BarChart3 size={22}/>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">Le Configurateur</h3>
              <p className="mt-3 text-neutral-600 leading-relaxed">
                Un quiz intelligent qui analyse ton profil. <span className="editorial">Ta routine skincare sur mesure, en quelques minutes.</span>
              </p>

              <div className="mt-7 bg-[#FEC4D2]/[0.04] border border-[#FEC4D2]/30 rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                  <span>Diagnostic en cours...</span>
                  <span>6 étapes</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[0,1,2].map(i => (
                    <div key={i} className="aspect-[3/4] rounded-xl bg-white border border-[#FEC4D2]/40 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-[#FEC4D2]/40"/>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/routine-360" className="mt-8 inline-flex items-center gap-2 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-7 py-3 rounded-full font-medium transition w-fit" data-testid="tool-cta-comparator">
                Créer ma Routine 360° <ArrowRight size={16}/>
              </Link>
            </div>

            {/* AI card */}
            <div className="bg-white border border-[#79C1E0] rounded-3xl p-8 md:p-10 card-lift flex flex-col" data-testid="tool-card-ai">
              <div className="w-12 h-12 rounded-2xl bg-[#79C1E0]/15 flex items-center justify-center text-[#79C1E0] mb-6">
                <Sparkles size={22}/>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">L'Essayage IA</h3>
              <p className="mt-3 text-neutral-600 leading-relaxed">
                Uploade ta photo. Décris ton look. <span className="editorial">L'IA applique les produits directement sur ton visage.</span>
              </p>

              <div className="mt-7 bg-[#79C1E0]/[0.05] border border-[#79C1E0]/30 rounded-2xl p-5">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden">
                    <img src={BEFORE_IMG} alt="Avant" className="w-full h-full object-cover"/>
                  </div>
                  <ArrowRight size={20} className="text-[#79C1E0]"/>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden">
                    <img src={AFTER_IMG} alt="Après" className="w-full h-full object-cover"/>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 mt-2 text-xs text-center">
                  <span className="text-neutral-500">Avant</span>
                  <span/>
                  <span className="text-[#79C1E0] font-medium">Après</span>
                </div>
              </div>

              <Link to="/essayage-ia" className="mt-8 inline-flex items-center gap-2 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white px-7 py-3 rounded-full font-medium transition w-fit" data-testid="tool-cta-ai">
                <Sparkles size={16}/> Essayer maintenant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TOP MONTH PODIUM ===== */}
      {top.length > 0 && (
        <section className="px-6 py-24 bg-[#79C1E0]/[0.04]" data-testid="podium-section">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-[#FEC4D2]">Le best of</p>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold text-[#79C1E0]">
                Les produits cosmétiques les mieux notés de <span className="editorial text-[#FEC4D2] capitalize">{month}</span>
              </h2>
            </div>

            {/* Podium */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 items-end max-w-4xl mx-auto mb-16">
              {[second, first, third].map((p, idx) => {
                if (!p) return <div key={idx}/>;
                const isFirst = idx === 1;
                const heights = ["h-32", "h-48", "h-24"];
                const colors = ["bg-[#79C1E0]", "bg-[#FEC4D2]", "bg-[#79C1E0]"];
                const ranks = [2, 1, 3];
                return (
                  <div key={p.id} className={`flex flex-col items-center ${isFirst ? "" : "mb-0"}`}>
                    <div className="bg-white border-2 border-[#FEC4D2] rounded-2xl p-3 md:p-4 w-full max-w-[180px] mb-3 card-lift">
                      <div className="aspect-square rounded-xl bg-gradient-to-br from-[#FEC4D2]/15 to-[#79C1E0]/10 overflow-hidden mb-2">
                        <img src={p.image || NO_PRODUCT_IMAGE} alt={p.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PRODUCT_IMAGE; }}/>
                      </div>
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500 text-center">{p.brand}</p>
                      <h3 className="text-xs md:text-sm font-medium text-neutral-900 text-center line-clamp-2 mt-1">{p.name}</h3>
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <Star size={12} className="fill-[#FEC4D2] text-[#FEC4D2]"/>
                        <span className="text-xs font-medium">{p.rating}</span>
                      </div>
                      <p className="text-sm font-semibold text-center mt-1">{p.price.toFixed(2)} €</p>
                      <a href={p.affiliate_url || "#"} target="_blank" rel="noreferrer" className="block text-center text-[10px] md:text-xs mt-2 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 rounded-full px-3 py-1.5 transition" data-testid={`podium-cta-${p.id}`}>Voir le produit</a>
                    </div>
                    <div className={`w-full max-w-[180px] ${heights[idx]} ${colors[idx]} rounded-t-2xl flex items-center justify-center text-white font-bold text-3xl md:text-5xl shadow-inner`}>
                      {ranks[idx]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Places 4-10 */}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {rest.slice(0, 7).map((p, i) => <ProductCard key={p.id} product={p} rank={i + 4}/>)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== IA BANNER ===== */}
      <section className="px-6 py-24 relative" data-testid="ai-banner">
        <div className="absolute inset-x-6 inset-y-12 bg-[#FEC4D2]/[0.08] rounded-[3rem] -z-0"/>
        <div className="relative max-w-5xl mx-auto text-center py-12">
          <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Essayage virtuel</p>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-[#79C1E0] leading-tight">
            Pas sûre de ta teinte ? <br className="hidden md:block"/>
            L'<span className="editorial text-[#FEC4D2]">IA BeautifyVision</span> applique les produits<br className="hidden md:block"/> directement sur ta photo.
          </h2>
          <Link to="/essayage-ia" className="mt-10 inline-flex items-center gap-2 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white px-10 py-4 rounded-full font-medium transition shadow-lg hover:shadow-xl" data-testid="banner-cta-ai">
            <Sparkles size={18}/> Essayer maintenant
          </Link>
        </div>
      </section>
    </main>
  );
}
