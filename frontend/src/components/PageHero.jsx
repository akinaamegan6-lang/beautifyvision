import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const HERO_BG = "/image/fond-hero-page.png";

/**
 * Hero partage par les pages "statiques" du site (legal, comment ca marche,
 * contact...) : fond fond-hero-page.png, fil d'ariane, titre bicolore et
 * intro optionnelle. `eyebrow` ajoute un petit label au-dessus du titre.
 */
export default function PageHero({
  breadcrumbLabel,
  eyebrow,
  titleBlack,
  titleBlue,
  intro,
  testId = "page-hero",
}) {
  return (
    <section
      className="relative px-6 sm:px-10 py-16 sm:py-20 rounded-b-[2.5rem] sm:rounded-b-[3rem] bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${HERO_BG})`, backgroundColor: "#FEEFF2" }}
      data-testid={testId}
    >
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 mb-6" data-testid="breadcrumb">
          <Link to="/" className="hover:text-[#79C1E0] transition">Accueil</Link>
          <ChevronRight size={12}/>
          <span className="text-neutral-700">{breadcrumbLabel}</span>
        </nav>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.2em] text-[#79C1E0] font-semibold mb-3">{eyebrow}</p>
        )}
        <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] text-neutral-900 max-w-2xl">
          {titleBlack} <span className="editorial text-[#79C1E0]">{titleBlue}</span>
        </h1>
        {intro && <p className="mt-6 text-neutral-600 leading-relaxed max-w-xl">{intro}</p>}
      </div>
    </section>
  );
}
