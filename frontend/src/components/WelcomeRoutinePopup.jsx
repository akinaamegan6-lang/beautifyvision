import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { SKIN_ROUTINES } from "../data/skinRoutines";

const SEEN_KEY = "bv_welcome_seen";
const SHOW_DELAY_MS = 1200;
// Pages sur lesquelles on n'affiche jamais la pop-in (déjà sur une routine, pages légales, admin, quiz...).
const EXCLUDED_PREFIXES = [
  "/routine", "/admin", "/quiz", "/resultats", "/essayage-ia", "/probleme",
  "/mentions-legales", "/politique-de-confidentialite", "/cgu", "/contact", "/auth",
];

function alreadySeen() {
  try { return sessionStorage.getItem(SEEN_KEY) === "1"; } catch { return false; }
}
function markSeen() {
  try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* navigation privée : on ignore */ }
}

/**
 * Pop-in d'accueil : s'affiche une fois par visite, peu après l'arrivée sur le site,
 * et propose les 4 routines par type de peau.
 */
export default function WelcomeRoutinePopup() {
  const { pathname, hash } = useLocation();
  const landingPath = useRef(pathname);
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    const p = landingPath.current;
    if (hash?.includes("session_id=")) return undefined;
    if (EXCLUDED_PREFIXES.some((x) => p.startsWith(x)) || alreadySeen()) return undefined;
    const t = setTimeout(() => { setOpen(true); markSeen(); }, SHOW_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si la personne navigue ailleurs (menu, lien...), la pop-in se ferme.
  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-neutral-900/45 backdrop-blur-[2px]"
      onClick={() => setOpen(false)}
      data-testid="welcome-popup-overlay"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-popup-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[2rem] bg-gradient-to-br from-[#FEEFF2] via-white to-[#E8F4FA] shadow-2xl px-5 sm:px-10 py-8 sm:py-10"
        data-testid="welcome-popup"
      >
        <button
          ref={closeRef}
          onClick={() => setOpen(false)}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 border border-[#FEC4D2]/60 flex items-center justify-center text-neutral-700 hover:bg-white transition"
          data-testid="welcome-popup-close"
        >
          <X size={18} />
        </button>

        <div className="text-center max-w-xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[#79C1E0] font-semibold">Nos routines sur mesure</p>
          <h2 id="welcome-popup-title" className="mt-3 text-3xl sm:text-4xl font-bold text-[#79C1E0] leading-tight">
            Dis-nous, tu as quelle peau ?
          </h2>
          <p className="mt-2 text-lg sm:text-xl editorial text-[#F7A8BC]">On te trouve la routine parfaite pour toi.</p>
        </div>

        <div className="mt-7 grid sm:grid-cols-2 gap-3 sm:gap-4">
          {SKIN_ROUTINES.map((r) => {
            const pink = r.tone === "pink";
            return (
              <Link
                key={r.key}
                to={r.path}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-4 rounded-2xl bg-white/85 border p-3 sm:p-4 hover:shadow-md transition ${pink ? "border-[#FEC4D2]" : "border-[#79C1E0]/50"}`}
                data-testid={`welcome-popup-${r.key}`}
              >
                <img
                  src={`/image/routines/peau-${r.key}.webp`}
                  alt=""
                  loading="lazy"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-900 leading-snug">{r.homeTitle.join(" ")}</p>
                  <span className={`mt-2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-xs sm:text-[13px] font-medium text-neutral-900 transition ${pink ? "bg-[#FEC4D2] group-hover:bg-[#fdb2c3]" : "bg-[#79C1E0] text-white group-hover:bg-[#6ab1d1]"}`}>
                    Découvrir la routine idéale <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setOpen(false)}
            className="text-sm text-neutral-500 hover:text-neutral-800 underline underline-offset-4 transition"
            data-testid="welcome-popup-skip"
          >
            Non merci, je découvre le site
          </button>
        </div>
      </div>
    </div>
  );
}
