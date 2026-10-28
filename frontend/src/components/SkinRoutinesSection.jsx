import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SKIN_ROUTINES } from "../data/skinRoutines";
import { HOME_PRODUCTS } from "../data/skinHomeProducts";

const IMG = "/image/routines";

/**
 * Section d'accueil « Nos routines sur mesure » : 4 cartes (peau grasse, taches,
 * peau à tendance acnéique, peau sèche) avec fond illustré, photo ronde du type
 * de peau et 3 vrais produits détourés (liens affiliés Awin).
 */
export default function SkinRoutinesSection() {
  return (
    <section className="relative px-6 py-20 md:py-24" data-testid="skin-routines-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[#79C1E0] font-semibold">Nos routines sur mesure</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold text-[#79C1E0] leading-tight">
            Trouve la routine parfaite <span className="editorial text-[#FEC4D2]">pour ta peau</span>
          </h2>
          <p className="mt-4 text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Peau grasse, taches, boutons ou sécheresse : choisis ton besoin et découvre la routine et les produits adaptés, sélectionnés parmi les meilleurs soins du moment.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {SKIN_ROUTINES.map((r) => {
            const products = HOME_PRODUCTS[r.key] || [];
            return (
              <article
                key={r.key}
                className="relative flex flex-col rounded-[2rem] overflow-hidden p-6 bg-cover bg-center bg-[#FEEFF2] card-lift"
                style={{ backgroundImage: `url(${IMG}/fond-${r.key}.webp)` }}
                data-testid={`skin-card-${r.key}`}
              >
                {/* Voile blanc : éclaircit le fond illustré (ajuste bg-white/45 pour plus ou moins de clarté) */}
                <span className="absolute inset-0 bg-white/45 pointer-events-none" aria-hidden="true" />
                <img
                  src={`${IMG}/peau-${r.key}.webp`}
                  alt={`Gros plan peau — ${r.breadcrumb.toLowerCase()}`}
                  loading="lazy"
                  className="absolute top-3 right-3 w-14 h-14 rounded-full object-cover border-[3px] border-white shadow-md"
                />
                <p className={`relative text-[11px] uppercase tracking-[0.18em] font-semibold max-w-[8.5rem] ${r.tone === "pink" ? "text-[#F2709C]" : "text-[#3b8fb8]"}`}>{r.homeLabel}</p>

                <h3 className="relative mt-4 text-[1.5rem] font-bold leading-[1.15] text-neutral-900">
                  {r.homeTitle[0]}
                  <br />
                  <span className="text-[#F2709C]">{r.homeTitle[1]}</span>
                </h3>
                <p className="relative mt-2 text-sm text-neutral-800 leading-relaxed">{r.homeText}</p>

                <div className="relative mt-auto pt-4">
                  <div className="flex items-end justify-center -space-x-3 h-64">
                    {products.map((p, i) => (
                      <a
                        key={p.id}
                        href={p.url}
                        target="_blank"
                        rel="sponsored nofollow noopener noreferrer"
                        title={p.name}
                        aria-label={p.name}
                        className={`group block w-[38%] shrink-0 ${i === 1 ? "h-64" : "h-48"}`}
                        data-testid={`skin-product-${r.key}-${i + 1}`}
                      >
                        <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:-translate-y-1" />
                      </a>
                    ))}
                  </div>
                  <Link
                    to={r.path}
                    className="mt-5 inline-flex items-center gap-2 bg-white hover:bg-[#FEC4D2] text-neutral-900 text-sm font-medium px-5 py-2.5 rounded-full transition shadow-sm"
                    data-testid={`skin-card-link-${r.key}`}
                  >
                    Découvrir la routine idéale <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
