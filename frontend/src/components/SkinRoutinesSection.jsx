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
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[#79C1E0] font-semibold">Nos routines sur mesure</p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-neutral-900">
            Une peau unique, <span className="editorial text-[#79C1E0]">des solutions adaptées.</span>
          </h2>
          <p className="mt-4 text-neutral-600 leading-relaxed">
            Peau grasse, taches, boutons ou sécheresse : choisis ton besoin et découvre la routine et les produits adaptés, sélectionnés parmi les meilleurs soins du moment.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {SKIN_ROUTINES.map((r) => {
            const products = HOME_PRODUCTS[r.key] || [];
            return (
              <article
                key={r.key}
                className="relative flex flex-col rounded-[2rem] overflow-hidden p-6 min-h-[480px] bg-cover bg-center bg-[#FEEFF2] card-lift"
                style={{ backgroundImage: `url(${IMG}/fond-${r.key}.webp)` }}
                data-testid={`skin-card-${r.key}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-neutral-700 pt-1 max-w-[9rem]">{r.homeLabel}</p>
                  <img
                    src={`${IMG}/peau-${r.key}.webp`}
                    alt={`Gros plan peau — ${r.breadcrumb.toLowerCase()}`}
                    loading="lazy"
                    className="w-20 h-20 rounded-full object-cover border-[3px] border-white shadow-md shrink-0"
                  />
                </div>

                <h3 className="mt-3 text-3xl font-bold leading-[1.1] text-neutral-900">
                  {r.homeTitle[0]} <span className="editorial text-[#3b8fb8]">{r.homeTitle[1]}</span>
                </h3>
                <p className="mt-3 text-sm text-neutral-700 leading-relaxed">{r.homeText}</p>

                <div className="mt-auto pt-6">
                  <div className="flex items-end justify-center gap-1 sm:gap-2 h-44">
                    {products.map((p, i) => (
                      <a
                        key={p.id}
                        href={p.url}
                        target="_blank"
                        rel="sponsored nofollow noopener noreferrer"
                        title={p.name}
                        aria-label={p.name}
                        className={`block w-1/3 transition-transform duration-300 hover:-translate-y-1 ${i === 1 ? "h-44" : "h-32"}`}
                        data-testid={`skin-product-${r.key}-${i + 1}`}
                      >
                        <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-contain drop-shadow-[0_6px_8px_rgba(0,0,0,0.18)]" />
                      </a>
                    ))}
                  </div>
                  <Link
                    to={r.path}
                    className="mt-5 inline-flex items-center gap-2 bg-white hover:bg-[#FEC4D2] text-neutral-900 text-sm font-medium px-5 py-2.5 rounded-full transition shadow-sm"
                    data-testid={`skin-card-link-${r.key}`}
                  >
                    Voir plus <ArrowRight size={15} />
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
