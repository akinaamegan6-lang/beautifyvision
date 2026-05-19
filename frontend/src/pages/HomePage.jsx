import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Search, Settings2, CheckCircle2, ArrowRight, Star, BarChart3 } from "lucide-react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";

const HERO_IMG = "https://images.unsplash.com/photo-1763192902738-a3e17d5f9015?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwbWFrZXVwJTIwcG9ydHJhaXQlMjBnbG93fGVufDB8fHx8MTc3ODQ0NzQwNHww&ixlib=rb-4.1.0&q=85";
const BEFORE_IMG = "/images/sans-maquillag.png";
const AFTER_IMG = "/images/avec-maquillage.png";

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
      <section className="relative px-6 pt-16 pb-24" data-testid="hero-section">
        <div className="halo-pink -top-32 -left-32" />
        <div className="halo-blue top-40 right-0" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="animate-fade-up">
            <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0] mb-5">Comparateur beauté · IA virtuelle</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-[#FEC4D2]">
              Trouve le produit <span className="editorial text-[#79C1E0]">fait</span> pour toi.<br/>
              Compare. <span className="editorial text-[#79C1E0]">Essaie</span>. Décide.
            </h1>
            <p className="mt-6 text-base md:text-lg text-neutral-600 max-w-xl leading-relaxed">
              Des milliers de produits cosmétiques et soins comparés selon ton type de peau, ton budget et tes envies.
              Et un essayage virtuel par IA pour voir le résultat avant d'acheter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/comparateur" className="inline-flex items-center gap-2 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-7 py-3.5 rounded-full font-medium transition shadow-md hover:shadow-lg" data-testid="hero-cta-compare">
                Explorer le comparateur <ArrowRight size={16}/>
              </Link>
              <Link to="/essayage-ia" className="inline-flex items-center gap-2 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white px-7 py-3.5 rounded-full font-medium transition shadow-md hover:shadow-lg" data-testid="hero-cta-ai">
                <Sparkles size={16}/> Essayer avec ma photo
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-neutral-500">
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#79C1E0]"/> 100% gratuit</div>
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#79C1E0]"/> Sans inscription</div>
            </div>
          </div>
          <div className="relative animate-fade-in">
            <div className="absolute -inset-6 bg-gradient-to-br from-[#FEC4D2]/20 to-[#79C1E0]/10 rounded-[3rem] -rotate-2" />
            <img src={HERO_IMG} alt="BeautifyVision hero" className="relative rounded-[2.5rem] w-full aspect-[4/5] object-cover shadow-xl" />
            <div className="absolute -bottom-6 -left-6 bg-white border border-[#FEC4D2] rounded-2xl px-5 py-4 shadow-lg hidden md:block">
              <div className="flex items-center gap-2">
                <Star size={16} className="fill-[#FEC4D2] text-[#FEC4D2]"/>
                <span className="font-semibold text-sm">+5 000</span>
                <span className="text-xs text-neutral-500">produits comparés</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="px-6 py-24 bg-[#FEC4D2]/[0.04]" data-testid="how-it-works">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Le concept</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold text-[#79C1E0]">
            Comment fonctionne <span className="editorial text-[#FEC4D2]">BeautifyVision</span> ?
          </h2>
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, n: "01", t: "Choisis ta catégorie", d: "Navigue dans Visage, Corps ou Cosmétiques et sélectionne le type de produit qui t'intéresse." },
              { icon: Settings2, n: "02", t: "Configure tes critères", d: "Type de peau, budget, texture, problèmes spécifiques — coche ce qui te ressemble." },
              { icon: CheckCircle2, n: "03", t: "Compare & décide", d: "Vois tous les produits du marché correspondants, et clique vers la marque pour acheter." },
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
              Deux outils pour trouver <span className="editorial text-[#FEC4D2]">ton produit idéal</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Comparator card */}
            <div className="bg-white border border-[#FEC4D2] rounded-3xl p-8 md:p-10 card-lift flex flex-col" data-testid="tool-card-comparator">
              <div className="w-12 h-12 rounded-2xl bg-[#FEC4D2]/15 flex items-center justify-center text-[#FEC4D2] mb-6">
                <BarChart3 size={22}/>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900">Le Comparateur</h3>
              <p className="mt-3 text-neutral-600 leading-relaxed">
                Des milliers de produits. Tous les critères qui comptent. <span className="editorial">La meilleure décision pour ta peau.</span>
              </p>

              <div className="mt-7 bg-[#FEC4D2]/[0.04] border border-[#FEC4D2]/30 rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                  <span>Filtres actifs : 4</span>
                  <span>127 produits</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[0,1,2].map(i => (
                    <div key={i} className="aspect-[3/4] rounded-xl bg-white border border-[#FEC4D2]/40 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-[#FEC4D2]/40"/>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/comparateur" className="mt-8 inline-flex items-center gap-2 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-7 py-3 rounded-full font-medium transition w-fit" data-testid="tool-cta-comparator">
                Explorer le comparateur <ArrowRight size={16}/>
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
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover"/>
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
