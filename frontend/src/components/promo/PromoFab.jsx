import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Percent, X } from "lucide-react";
import { PINK_STRONG } from "./WavyBadge";

const ROWS = [
  { hash: "visage", label: "Visage", sub: "Crèmes, sérums, nettoyants", icon: "/icone/visage.png" },
  { hash: "corps", label: "Corps", sub: "Laits, gels douche, gommages", icon: "/icone/corps.png" },
  { hash: "make-up", label: "Make-up", sub: "Teint, yeux, lèvres", icon: "/icone/maquillage.svg" },
];
const HIDDEN_ON = ["/promos", "/admin", "/quiz"];

/**
 * Bouton flottant rond « PROMO » : reste visible au défilement (desktop et
 * mobile). Un clic ouvre une petite fenêtre qui mène à la page des promos.
 */
export default function PromoFab() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onDown = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [open]);

  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  return (
    <div ref={box} className="fixed z-[70] bottom-5 right-4 md:bottom-6 md:right-6" data-testid="promo-fab">
      {open && (
        <div
          role="dialog"
          aria-label="Promos du moment"
          className="absolute bottom-[76px] right-0 w-[min(88vw,320px)] bg-white border-2 border-[#FEC4D2] rounded-3xl shadow-2xl p-5 animate-fade-in"
        >
          <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="absolute top-3 right-3 w-8 h-8 rounded-full text-neutral-500 hover:bg-neutral-100 flex items-center justify-center">
            <X size={16} />
          </button>
          <p className="text-[11px] tracking-[0.25em] uppercase text-neutral-500">Bons plans</p>
          <h2 className="mt-1 pr-8 text-lg font-bold text-neutral-900 leading-snug">
            Découvre les meilleures <span className="editorial font-medium text-[#F58FAA] text-xl">promos</span> du moment
          </h2>
          <ul className="mt-4 space-y-2">
            {ROWS.map((r) => (
              <li key={r.hash}>
                <Link to={`/promos#${r.hash}`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl p-2 hover:bg-[#FEC4D2]/20 transition">
                  <img src={r.icon} alt="" className="w-11 h-11 object-contain shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-neutral-900">{r.label}</span>
                    <span className="block text-xs text-neutral-500 truncate">{r.sub}</span>
                  </span>
                  <ChevronRight size={16} className="text-neutral-400" />
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/promos" onClick={() => setOpen(false)} className="mt-4 flex items-center justify-center gap-2 w-full bg-[#79C1E0] hover:bg-[#6ab1d1] text-white text-sm font-semibold py-3 rounded-full transition">
            Voir toutes les promos
          </Link>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Promos et bons plans"
        className="relative w-16 h-16 rounded-full text-white flex flex-col items-center justify-center shadow-[0_10px_25px_-6px_rgba(245,143,170,0.8)] ring-2 ring-white hover:scale-105 active:scale-95 transition"
        style={{ background: `linear-gradient(135deg, #FAA9BE, ${PINK_STRONG})` }}
      >
        {!open && <span className="absolute inset-0 rounded-full bg-[#FEC4D2] opacity-40 animate-ping motion-reduce:hidden" aria-hidden="true" />}
        <Percent className="relative" size={26} strokeWidth={3} />
        <span className="relative mt-0.5 text-[10px] font-extrabold tracking-wider [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">PROMO</span>
      </button>
    </div>
  );
}
