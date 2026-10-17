import { Sparkles } from "lucide-react";

// Message affiche quand aucun produit de la base ne correspond vraiment aux
// criteres de la personne (score sous MIN_GOOD_MATCH_SCORE, cf. lib/scoring.js).
// Avant ce composant, la page affichait quand meme le produit le mieux note
// (meme hors-sujet, ex: un peigne demelant ou un crayon khol) comme "ton
// match parfait". Le ton reste volontairement leger / pas culpabilisant : on
// ne dit jamais a la personne qu'elle a "rien" ou que la demande a echoue.
export default function NoGoodMatchMessage({ productLabel = "produit" }) {
  return (
    <div
      className="max-w-2xl mx-auto text-center rounded-[2rem] border-2 border-dashed border-[#79C1E0]/50 bg-[#79C1E0]/5 px-6 py-10 md:py-12"
      data-testid="no-good-match"
    >
      <Sparkles size={28} className="text-[#79C1E0] mx-auto" />
      <p className="mt-4 text-lg md:text-xl font-semibold text-neutral-900">
        On n'a pas encore de {productLabel} qui coche vraiment toutes tes cases.
      </p>
      <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
        Notre sélection ne contient pour l'instant aucun produit qui respecte pleinement tous tes critères.
        Mais jette un œil juste en dessous : ces options-là pourraient tout de même te plaire, même si elles
        ne cochent pas toutes les cases (prix, ingrédients…).
      </p>
    </div>
  );
}
