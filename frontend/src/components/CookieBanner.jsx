import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, setConsent } from "../lib/consent";

/**
 * Bandeau de consentement : seul le suivi d'affiliation Awin est concerne.
 * "Tout refuser" et "Tout accepter" ont le meme poids visuel (CNIL).
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
    const open = () => setVisible(true);
    window.addEventListener("bv-open-cookies", open);
    return () => window.removeEventListener("bv-open-cookies", open);
  }, []);

  if (!visible) return null;

  const choose = (choice) => {
    setConsent(choice);
    setVisible(false);
  };
  const btn = "flex-1 text-sm font-medium px-5 py-2.5 rounded-full border-2 transition";

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Gestion des cookies"
      className="fixed z-[90] bottom-3 left-3 right-3 md:left-6 md:right-auto md:bottom-6 md:max-w-md bg-white border-2 border-[#FEC4D2] rounded-3xl shadow-2xl p-5"
      data-testid="cookie-banner"
    >
      <p className="text-sm font-bold text-neutral-900">Cookies et affiliation</p>
      <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
        Quand tu cliques sur un lien produit, notre partenaire d'affiliation Awin peut déposer un cookie de suivi qui
        nous permet d'être rémunérés sur ton achat, sans surcoût pour toi. Si tu refuses, le site fonctionne exactement
        pareil, mais ton achat ne nous sera pas attribué.{" "}
        <Link to="/politique-de-confidentialite" className="underline text-[#5aa9cc]">En savoir plus</Link>
      </p>
      <div className="mt-4 flex gap-3">
        <button onClick={() => choose("refused")} className={`${btn} border-[#79C1E0] text-neutral-900 hover:bg-[#79C1E0]/10`} data-testid="cookie-refuse">
          Tout refuser
        </button>
        <button onClick={() => choose("accepted")} className={`${btn} border-[#79C1E0] bg-[#79C1E0] text-white hover:bg-[#6ab1d1]`} data-testid="cookie-accept">
          Tout accepter
        </button>
      </div>
    </div>
  );
}
