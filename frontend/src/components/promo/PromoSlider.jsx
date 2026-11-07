import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Slider : 3 cartes par « page » sur grand écran, 2 sur tablette, 1 (avec un
// aperçu de la suivante) sur mobile. Les flèches font défiler page par page.
export default function PromoSlider({ items, renderItem, resetKey }) {
  const [viewportRef, api] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 640px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
    },
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [snap, setSnap] = useState(0);
  const [snaps, setSnaps] = useState(0);

  const sync = useCallback(() => {
    if (!api) return;
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
    setSnap(api.selectedScrollSnap());
    setSnaps(api.scrollSnapList().length);
  }, [api]);

  useEffect(() => {
    if (!api) return undefined;
    api.reInit();
    api.scrollTo(0, true);
    sync();
    api.on("select", sync).on("reInit", sync);
    return () => { api.off("select", sync).off("reInit", sync); };
  }, [api, sync, resetKey, items]);

  return (
    <div data-testid="promo-slider">
      <div className="flex justify-end gap-2 mb-3">
        {[["prev", ChevronLeft, canPrev, "Promos précédentes"], ["next", ChevronRight, canNext, "Promos suivantes"]].map(([k, Icon, ok, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => (k === "prev" ? api?.scrollPrev() : api?.scrollNext())}
            disabled={!ok}
            aria-label={label}
            className="w-10 h-10 rounded-full border border-[#FEC4D2] bg-white text-neutral-800 flex items-center justify-center transition hover:bg-[#FEC4D2]/30 disabled:opacity-35 disabled:hover:bg-white"
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
      <div className="overflow-hidden" ref={viewportRef}>
        <div className="flex -ml-4">
          {items.map((it) => (
            <div key={it.id} className="min-w-0 shrink-0 grow-0 basis-[86%] sm:basis-1/2 lg:basis-1/3 pl-4 pb-2">
              {renderItem(it)}
            </div>
          ))}
        </div>
      </div>
      {snaps > 1 && snaps <= 8 && (
        <div className="flex justify-center gap-1.5 mt-4" aria-hidden="true">
          {Array.from({ length: snaps }).map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === snap ? "w-6 bg-[#FEC4D2]" : "w-1.5 bg-[#FEC4D2]/40"}`} />
          ))}
        </div>
      )}
      {snaps > 8 && (
        <p className="mt-4 text-center text-xs text-neutral-500" aria-hidden="true">{snap + 1} / {snaps}</p>
      )}
    </div>
  );
}
