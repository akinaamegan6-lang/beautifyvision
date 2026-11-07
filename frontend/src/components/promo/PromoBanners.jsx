import { ArrowRight, Gift, Zap } from "lucide-react";
import WavyBadge from "./WavyBadge";

const goTo = (id) => (e) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const cta = "inline-flex items-center gap-2 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 font-semibold text-sm md:text-base px-6 py-3 rounded-full shadow-sm transition";

/** Bannière principale : un seul visuel, avec le vrai pourcentage maximal relevé dans le catalogue. */
export function HeroPromoBanner({ maxPct }) {
  return (
    <section className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#FFE3EA] to-[#FEC4D2]/50" data-testid="promo-hero-banner">
      <div className="flex flex-col md:block">
        <div className="relative z-10 order-1 px-6 pt-8 pb-6 md:px-14 md:py-12 md:max-w-[47%]">
          <span className="inline-flex items-center gap-1.5 bg-white rounded-full px-4 py-1.5 text-sm font-semibold text-neutral-800 shadow-sm">
            <Zap size={14} className="text-[#F58FAA]" fill="currentColor" /> Promo en cours
          </span>
          {maxPct > 0 ? (
            <>
              <p className="mt-5 text-sm font-medium text-neutral-600">Jusqu'à</p>
              <p className="-mt-1 text-6xl md:text-8xl font-extrabold text-[#F58FAA] leading-none tracking-tight">-{maxPct}%</p>
            </>
          ) : (
            <p className="mt-5 text-5xl md:text-6xl font-extrabold text-[#F58FAA] leading-none">Promos</p>
          )}
          <p className="mt-3 text-xl md:text-2xl lg:text-3xl text-neutral-800 leading-snug">
            sur une sélection de <span className="editorial text-[#79C1E0] font-semibold">soins</span>
            <span className="block">visage, corps et make-up</span>
          </p>
          <a href="#visage" onClick={goTo("visage")} className={`${cta} mt-6`}>
            J'en profite <ArrowRight size={16} />
          </a>
        </div>
        <div className="relative order-2 h-52 sm:h-64 md:absolute md:inset-0 md:h-auto">
          <img
            src="/image/hero-banner-page-promos.png"
            alt="Flacons de soins, crème et sérum posés sur une serviette douce, sur fond rose"
            className="w-full h-full object-cover object-[72%_60%] md:object-right"
          />
          {maxPct > 0 && (
            <WavyBadge size={104} className="absolute top-3 right-4 md:top-8 md:right-10 text-lg md:text-xl hidden sm:inline-flex rotate-6">
              <span className="block text-[11px] md:text-xs font-semibold">Jusqu'à</span>
              <span className="block text-2xl md:text-3xl font-extrabold">-{maxPct}%</span>
            </WavyBadge>
          )}
        </div>
      </div>
    </section>
  );
}

/** Bannière de Noël (un seul visuel, pas de slider). */
export function ChristmasBanner() {
  return (
    <section className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#FFE3EA] to-[#FEC4D2]/40" data-testid="promo-noel-banner">
      <div className="flex flex-col md:block">
        <div className="relative z-10 order-1 px-6 pt-8 pb-6 md:px-14 md:py-12 md:max-w-[47%]">
          <p className="text-[11px] tracking-[0.3em] uppercase text-neutral-500">Idées cadeaux</p>
          <h2 className="mt-2 text-4xl md:text-6xl font-bold text-[#79C1E0] leading-none">
            Spécial <span className="editorial font-medium text-[#FEC4D2] text-5xl md:text-7xl">Noël</span>
            <Gift className="inline-block ml-2 -mt-3 text-[#FEC4D2]" size={34} strokeWidth={1.6} />
          </h2>
          <p className="mt-4 text-neutral-700 md:text-lg leading-relaxed">
            Coffrets, routines et best-sellers à offrir (ou à s'offrir !) à prix réduit : retrouve les offres cadeaux et les codes promo du moment.
          </p>
          <a href="#offres" onClick={goTo("offres")} className={`${cta} mt-6`}>
            Voir les idées cadeaux <ArrowRight size={16} />
          </a>
        </div>
        <div className="relative order-2 h-52 sm:h-64 md:absolute md:inset-0 md:h-auto">
          <img
            src="/image/fond-banner-promo-noel.png"
            alt="Coffret cadeau de soins visage, boule de Noël rose et paquet cadeau avec ruban"
            className="w-full h-full object-cover object-[78%_70%] md:object-right"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
