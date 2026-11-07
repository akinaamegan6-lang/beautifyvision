import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { SKIN_FILTERS } from "../../data/promoSections";
import PromoCard from "./PromoCard";
import PromoSlider from "./PromoSlider";

const cache = new Map();

function usePromos(categories, skin) {
  const key = `${categories.join(",")}|${skin}`;
  const [state, setState] = useState(() => ({ key, items: cache.get(key) ?? null }));

  useEffect(() => {
    if (cache.has(key)) {
      setState({ key, items: cache.get(key) });
      return undefined;
    }
    let alive = true;
    setState({ key, items: null });
    api.get("/products/promos", { params: { categories: categories.join(","), limit: 20, ...(skin ? { skin_type: skin } : {}) } })
      .then((r) => { cache.set(key, r.data || []); if (alive) setState({ key, items: r.data || [] }); })
      .catch(() => { if (alive) setState({ key, items: [] }); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state.key === key ? state.items : null;
}

export function SectionHeading({ title, className = "" }) {
  return (
    <h2 className={`text-3xl md:text-4xl font-bold text-[#79C1E0] ${className}`}>
      {title[0]} <span className="editorial font-medium text-[#FEC4D2] text-4xl md:text-5xl">{title[1]}</span>
    </h2>
  );
}

const chip = (active) =>
  `px-4 py-2 rounded-full text-sm font-medium border transition whitespace-nowrap ${
    active ? "bg-[#FEC4D2] border-[#FEC4D2] text-neutral-900" : "bg-white border-[#FEC4D2]/60 text-neutral-700 hover:bg-[#FEC4D2]/20"
  }`;

export default function PromoSection({ section }) {
  const [tabKey, setTabKey] = useState(section.tabs[0].key);
  const [skin, setSkin] = useState("");
  const tab = section.tabs.find((t) => t.key === tabKey) || section.tabs[0];
  const items = usePromos(tab.categories, section.skinFilter ? skin : "");

  return (
    <section id={section.id} className="relative scroll-mt-24 px-6 py-12 md:py-16" data-testid={`promo-section-${section.id}`}>
      <img
        src={section.decor.src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className={`pointer-events-none absolute z-0 select-none ${section.decor.className}`}
      />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex items-start gap-5 md:gap-6">
          <img src={section.icon} alt="" className="w-16 h-16 md:w-20 md:h-20 shrink-0 object-contain" />
          <div className="max-w-3xl lg:max-w-2xl">
            <SectionHeading title={section.title} />
            <p className="mt-3 text-neutral-600 leading-relaxed">{section.text}</p>
            {section.links.length > 0 && (
              <p className="mt-2 text-sm text-neutral-500">
                À lire aussi :{" "}
                {section.links.map((l, i) => (
                  <span key={l.to}>
                    {i > 0 && " · "}
                    <Link to={l.to} className="text-[#79C1E0] hover:underline">{l.label}</Link>
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label={`Catégories de promos ${section.title[1]}`}>
          {section.tabs.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={t.key === tab.key} className={chip(t.key === tab.key)} onClick={() => setTabKey(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        {section.skinFilter && (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Filtrer par type de peau">
            {SKIN_FILTERS.map((f) => (
              <button
                key={f.value || "all"}
                type="button"
                onClick={() => setSkin(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  skin === f.value ? "bg-[#79C1E0] border-[#79C1E0] text-white" : "bg-white border-[#79C1E0]/40 text-neutral-600 hover:bg-[#79C1E0]/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 min-h-[22rem]">
          {items === null ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-hidden="true">
              {[0, 1, 2].map((i) => <div key={i} className="h-[24rem] rounded-3xl bg-[#FEC4D2]/10 animate-pulse" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#FEC4D2] bg-white/70 p-10 text-center text-neutral-600">
              Aucune promo à afficher pour ce filtre en ce moment. Essaie une autre catégorie ou un autre type de peau.
            </div>
          ) : (
            <PromoSlider items={items} resetKey={`${tab.key}|${skin}`} renderItem={(p) => <PromoCard product={p} />} />
          )}
        </div>
      </div>
    </section>
  );
}
