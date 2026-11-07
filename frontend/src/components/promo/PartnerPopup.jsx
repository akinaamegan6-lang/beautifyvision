import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { POPUPS } from "../../data/partnerBanners";

const DELAY_MS = 2500;
const key = (p) => `bv_partner_popup_${p}`;

/**
 * Pop-in carrée d'un partenaire, propre à certaines pages (routines par type
 * de peau, page Promos). Une seule fois par visite et par page ; se ferme avec
 * la croix, la touche Échap ou un clic à côté.
 */
export default function PartnerPopup() {
  const { pathname } = useLocation();
  const cfg = POPUPS[pathname] || null;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    if (!cfg) return undefined;
    try { if (sessionStorage.getItem(key(pathname)) === "1") return undefined; } catch { /* ignoré */ }
    const t = setTimeout(() => {
      setOpen(true);
      try { sessionStorage.setItem(key(pathname), "1"); } catch { /* ignoré */ }
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, [pathname, cfg]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open || !cfg) return null;
  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-neutral-900/45 backdrop-blur-[2px] animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Offre partenaire"
      data-testid="partner-popup"
    >
      <div className="relative w-[min(80vw,280px)]">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fermer"
          className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white border border-[#FEC4D2] shadow flex items-center justify-center text-neutral-700 hover:bg-[#FEC4D2]/30"
        >
          <X size={18} />
        </button>
        <a href={cfg.url} target="_blank" rel="sponsored noopener noreferrer" onClick={() => setOpen(false)} className="block rounded-3xl overflow-hidden shadow-2xl bg-white">
          <img src={cfg.src} width={cfg.w} height={cfg.h} alt={cfg.alt || ""} className="w-full h-auto block" />
        </a>
        <p className="mt-2 text-center text-[10px] uppercase tracking-wider text-white/80">Publicité · lien partenaire</p>
      </div>
    </div>
  );
}
