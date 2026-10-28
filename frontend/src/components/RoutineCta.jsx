import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

/**
 * Appel à l'action vers le quiz « Routine 360 ».
 * variant="hero" : titre + bouton alignés à gauche (haut de page).
 * variant="band" : bandeau centré (milieu / bas de page).
 */
export default function RoutineCta({ variant = "band", testId = "routine-cta" }) {
  const title = "Tu veux créer ta propre routine ?";
  const button = (
    <Link
      to="/routine-360"
      className="inline-flex items-center justify-center gap-2 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white text-base font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg transition"
      data-testid={`${testId}-button`}
    >
      <Sparkles size={18} /> Créer ma routine 360
    </Link>
  );

  if (variant === "hero") {
    return (
      <div className="mt-8" data-testid={testId}>
        <p className="text-lg font-semibold text-neutral-900 mb-3">{title}</p>
        {button}
      </div>
    );
  }

  return (
    <section className="px-6 py-10" data-testid={testId}>
      <div className="max-w-4xl mx-auto text-center rounded-[2rem] bg-gradient-to-br from-[#FEC4D2]/50 to-[#79C1E0]/25 px-6 py-10 md:py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">{title}</h2>
        <p className="mt-3 text-neutral-700 max-w-xl mx-auto leading-relaxed">
          Réponds à quelques questions : Beautify Vision te propose une routine complète, visage, corps et cheveux, avec des produits adaptés à ta peau.
        </p>
        <div className="mt-6">{button}</div>
      </div>
    </section>
  );
}
