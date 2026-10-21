import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Star, X } from "lucide-react";
import {
  ratingKey, formatCount, formatRating,
  getCached, subscribe, requestStats, getMyRating, submitRating,
} from "../lib/ratings";

const LABELS = ["", "Décevant", "Moyen", "Bien", "Très bien", "Excellent"];

function RateModal({ product, keyId, onClose }) {
  const previous = getMyRating(keyId);
  const [value, setValue] = useState(previous);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | sending | done | error

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const shown = hover || value;

  const send = async () => {
    if (!value || status === "sending") return;
    setStatus("sending");
    try {
      await submitRating(keyId, value);
      setStatus("done");
      setTimeout(onClose, 1300);
    } catch {
      setStatus("error");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm"
      onClick={onClose}
      data-testid="rate-modal"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Noter ${product.name}`}
        className="relative w-full max-w-sm bg-white rounded-3xl border-2 border-[#FEC4D2] p-7 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Fermer" className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center">
          <X size={16} />
        </button>
        {status === "done" ? (
          <div className="py-6">
            <p className="text-2xl font-bold text-[#79C1E0]">Merci !</p>
            <p className="text-sm text-neutral-600 mt-2">Ta note a bien été enregistrée.</p>
          </div>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.18em] text-[#79C1E0] font-semibold">{product.brand}</p>
            <h3 className="mt-1 text-base font-bold text-neutral-900 line-clamp-2">{product.name}</h3>
            <p className="mt-4 text-sm text-neutral-600">Quelle note donnes-tu à ce produit ?</p>
            <div className="mt-3 flex justify-center gap-1.5" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => setValue(n)}
                  className="p-1 transition-transform hover:scale-110"
                  data-testid={`rate-star-${n}`}
                >
                  <Star size={34} className={n <= shown ? "fill-[#FEC4D2] text-[#FEC4D2]" : "text-[#FEC4D2]/50"} />
                </button>
              ))}
            </div>
            <p className="h-5 mt-1 text-sm font-medium text-neutral-700">{LABELS[shown]}</p>
            {status === "error" && <p className="text-xs text-red-500 mt-1">Oups, ta note n'a pas pu être envoyée. Réessaie dans un instant.</p>}
            <button
              onClick={send}
              disabled={!value || status === "sending"}
              className="mt-4 w-full bg-[#79C1E0] hover:bg-[#6ab1d1] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-full transition"
              data-testid="rate-submit"
            >
              {status === "sending" ? "Envoi…" : previous ? "Modifier ma note" : "Envoyer ma note"}
            </button>
            <p className="mt-3 text-[10px] text-neutral-400">Une note par personne et par produit. Avis des lectrices Beautify Vision, non vérifiés.</p>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

/**
 * Note d'un produit : etoile + moyenne + (nombre de notes) + "Notez-le".
 * Les valeurs viennent uniquement des notes laissees par les visiteuses.
 *  - stars5 : affiche 5 etoiles remplies selon la moyenne (grandes cartes)
 *  - size   : "xs" | "sm" | "md"
 */
export default function ProductRating({ product, stars5 = false, size = "sm", className = "" }) {
  const keyId = ratingKey(product);
  const initial = product?.id ? { rating: product.rating || 0, reviews: product.reviews || 0 } : { rating: 0, reviews: 0 };
  const [, force] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => subscribe(() => force((n) => n + 1)), []);
  useEffect(() => {
    // les produits venant de l'API ont deja la vraie note ; ceux des articles non
    if (!product?.id) requestStats(keyId);
  }, [keyId, product?.id]);

  if (!keyId) return null;
  const stats = getCached(keyId) || initial;
  const mine = getMyRating(keyId);
  const filled = Math.round(stats.rating || 0);
  const star = size === "md" ? 16 : size === "xs" ? 11 : 13;
  const text = size === "md" ? "text-sm" : size === "xs" ? "text-[11px]" : "text-xs";

  return (
    <>
      <div className={`flex flex-wrap items-center gap-x-1.5 gap-y-0.5 ${text} ${className}`} data-testid="product-rating">
        {stars5 ? (
          <span className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={star} className={i < filled ? "fill-[#FEC4D2] text-[#FEC4D2]" : "text-[#FEC4D2]/40"} />
            ))}
          </span>
        ) : (
          <Star size={star} className={stats.reviews > 0 ? "fill-[#FEC4D2] text-[#FEC4D2]" : "text-[#FEC4D2]"} />
        )}
        {stats.reviews > 0 && <span className="font-semibold text-neutral-900">{formatRating(stats.rating)}</span>}
        <span className="text-neutral-400">({formatCount(stats.reviews)})</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[10px] text-[#79C1E0] hover:text-[#5aa9cc] underline underline-offset-2 whitespace-nowrap"
          data-testid="rate-open"
        >
          {mine ? "Modifier" : "Notez-le"}
        </button>
      </div>
      {open && <RateModal product={product} keyId={keyId} onClose={() => setOpen(false)} />}
    </>
  );
}
