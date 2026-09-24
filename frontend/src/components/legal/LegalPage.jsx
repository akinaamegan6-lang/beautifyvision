import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import Seo from "../Seo";
import PageHero from "../PageHero";
import { CONTACT_EMAIL } from "../../data/legalContent";

function AccordionRow({ index, section, isOpen, onToggle }) {
  const isPink = index % 2 === 0;
  const badgeBg = isPink ? "bg-[#FEC4D2]" : "bg-[#79C1E0]";
  const rowBg = isPink ? "bg-[#FEC4D2]/10" : "bg-[#79C1E0]/10";
  const numberLabel = String(index + 1).padStart(2, "0");

  return (
    <div className={`rounded-2xl overflow-hidden ${rowBg}`} data-testid={`legal-section-${index}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 sm:gap-5 p-5 sm:p-6 text-left"
        aria-expanded={isOpen}
        data-testid={`legal-section-${index}-toggle`}
      >
        <span className={`shrink-0 w-11 h-11 rounded-full ${badgeBg} text-white font-bold flex items-center justify-center text-sm`}>
          {numberLabel}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-base font-bold text-neutral-900">{section.title}</span>
          <span className="block text-sm text-neutral-600 mt-0.5">{section.summary}</span>
        </span>
        <ChevronDown size={20} className={`shrink-0 text-neutral-500 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true"/>
      </button>
      {isOpen && (
        <div
          className="px-5 sm:px-6 pb-6 sm:pl-[4.75rem] space-y-3 text-sm text-neutral-700 leading-relaxed"
          data-testid={`legal-section-${index}-content`}
        >
          {section.body.map((block, i) =>
            block.type === "ul" ? (
              <ul key={i} className="list-disc pl-5 space-y-1.5">
                {block.items.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            ) : (
              <p key={i}>{block.text}</p>
            )
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Gabarit partage pour les pages legales (Mentions legales, Politique de
 * confidentialite, CGU) : hero avec fil d'ariane, liste de blocs
 * deroulants numerotes (alternance rose/bleu), et bloc de contact final.
 */
export default function LegalPage({
  breadcrumbLabel,
  titleBlack,
  titleBlue,
  intro,
  sections,
  metaTitle,
  metaDescription,
  path,
}) {
  const [openIds, setOpenIds] = useState(() => new Set());

  const toggle = (i) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <main className="bg-white" data-testid="legal-page">
      <Seo title={metaTitle} description={metaDescription} path={path}/>

      <PageHero
        breadcrumbLabel={breadcrumbLabel}
        titleBlack={titleBlack}
        titleBlue={titleBlue}
        intro={intro}
        testId="legal-hero"
      />

      {/* ===== ACCORDEON ===== */}
      <section className="px-6 py-14" data-testid="legal-sections">
        <div className="max-w-4xl mx-auto space-y-4">
          {sections.map((section, i) => (
            <AccordionRow key={i} index={i} section={section} isOpen={openIds.has(i)} onToggle={() => toggle(i)}/>
          ))}
        </div>

        {/* ===== CONTACT CTA ===== */}
        <div
          className="max-w-4xl mx-auto mt-10 relative rounded-3xl bg-[#FEEFF2] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          data-testid="legal-contact-cta"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#79C1E0] font-semibold flex items-center gap-1.5">
              <Sparkles size={12}/> Une question ?
            </p>
            <h3 className="mt-2 text-2xl font-bold text-neutral-900">
              Besoin de <span className="editorial text-[#79C1E0]">plus d'informations</span> ?
            </h3>
            <p className="mt-2 text-sm text-neutral-600">Tu peux nous contacter à tout moment à {CONTACT_EMAIL}.</p>
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="shrink-0 inline-flex items-center gap-2 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-5 py-3 rounded-full text-sm font-semibold transition"
          >
            Nous contacter →
          </a>
        </div>
      </section>
    </main>
  );
}
