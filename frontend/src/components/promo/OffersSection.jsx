import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Tag } from "lucide-react";
import { activeOffers, fmtDate } from "../../data/promoOffers";
import { SectionHeading } from "./PromoSection";

const YEAR = 365 * 24 * 3600 * 1000;

function CopyCode({ code }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch { /* presse-papiers indisponible : le code reste lisible */ }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 border-2 border-dashed border-[#FEC4D2] bg-[#FEC4D2]/15 rounded-xl px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-neutral-900 hover:bg-[#FEC4D2]/30 transition"
      aria-label={`Copier le code ${code}`}
    >
      {code} {done ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-neutral-500" />}
    </button>
  );
}

function OfferCard({ offer }) {
  const longTerm = offer.endTs - Date.now() > YEAR;
  return (
    <article className="bg-white border border-[#FEC4D2] rounded-3xl p-5 flex flex-col" data-testid={`offer-${offer.id}`}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
        <span className={`px-2.5 py-1 rounded-full ${offer.code ? "bg-[#FEC4D2] text-neutral-900" : "bg-[#79C1E0]/15 text-[#3d8fb3]"}`}>
          {offer.code ? "Code promo" : "Offre"}
        </span>
        {offer.upcoming && <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">Dès le {fmtDate(offer.startTs)}</span>}
        {offer.tag && <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600">{offer.tag}</span>}
      </div>
      <h3 className="mt-3 text-lg font-bold text-neutral-900 leading-snug">{offer.title}</h3>
      <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">{offer.text}</p>
      <p className="mt-2 text-xs text-neutral-500">
        {offer.merchant}
        {offer.min ? ` · ${offer.min}` : ""}
        {!longTerm ? ` · jusqu'au ${fmtDate(offer.endTs)}` : ""}
      </p>
      <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-3">
        {offer.code ? <CopyCode code={offer.code} /> : <span />}
        <a
          href={offer.url}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white text-sm font-medium px-5 py-2.5 rounded-full transition"
        >
          Profiter de l'offre <ExternalLink size={13} />
        </a>
      </div>
    </article>
  );
}

export default function OffersSection() {
  const offers = useMemo(() => activeOffers(), []);
  const [all, setAll] = useState(false);
  const shown = all ? offers : offers.slice(0, 9);
  if (offers.length === 0) return null;
  return (
    <section id="offres" className="scroll-mt-24 px-6 py-12 md:py-16" data-testid="promo-offers">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start gap-5">
          <span className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full bg-[#FEC4D2]/30 flex items-center justify-center text-[#79C1E0]">
            <Tag size={30} strokeWidth={1.6} />
          </span>
          <div className="max-w-3xl">
            <SectionHeading title={["Codes promo &", "offres du moment"]} />
            <p className="mt-3 text-neutral-600 leading-relaxed">
              Les codes promo et offres en cours chez nos marchands partenaires : réductions sur tout le site, coffrets de Noël, soins capillaires, maquillage et grandes marques de dermocosmétique. Copie le code, puis clique sur « Profiter de l'offre » pour l'appliquer au moment de payer.
            </p>
          </div>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((o) => <OfferCard key={o.id} offer={o} />)}
        </div>
        {offers.length > 9 && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setAll((v) => !v)}
              className="px-6 py-2.5 rounded-full border border-[#79C1E0]/60 text-sm font-medium text-neutral-800 hover:bg-[#79C1E0]/10 transition"
            >
              {all ? "Voir moins d'offres" : `Voir les ${offers.length - 9} autres offres`}
            </button>
          </div>
        )}
        <p className="mt-6 text-xs text-neutral-500 max-w-3xl">
          Les offres sont communiquées par nos marchands partenaires et peuvent évoluer ou prendre fin sans préavis ; vérifie toujours les conditions sur le site du marchand. Beautify Vision peut percevoir une commission sur les achats effectués via ces liens, sans surcoût pour toi.
        </p>
      </div>
    </section>
  );
}
