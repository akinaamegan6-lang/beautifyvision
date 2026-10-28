import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadRecap } from "../lib/recapPdf";

/**
 * Bouton « Télécharge ton récapitulatif » (PDF) affiché à la fin des quiz.
 * `buildPayload` est appelé au clic : il renvoie les données du récap.
 * variant="card" : bloc complet ; variant="inline" : simple bouton.
 */
export default function RecapDownloadCta({ buildPayload, filename, variant = "card", disabled = false, testId = "recap-download" }) {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (busy || disabled) return;
    setBusy(true);
    try {
      await downloadRecap(buildPayload(), filename);
      toast.success("Ton récapitulatif est téléchargé.");
    } catch (e) {
      toast.error("Impossible de générer le PDF pour le moment. Réessaie dans un instant.");
    } finally {
      setBusy(false);
    }
  };

  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="inline-flex items-center justify-center gap-2 bg-[#FEC4D2] hover:bg-[#fdb2c3] disabled:opacity-60 disabled:cursor-not-allowed text-neutral-900 px-7 py-3.5 rounded-full text-sm font-semibold transition shadow-sm hover:shadow-md"
      data-testid={`${testId}-button`}
    >
      {busy ? <Loader2 size={17} className="animate-spin" /> : <FileDown size={17} />}
      {busy ? "Création de ton PDF…" : "Télécharger mon récapitulatif (PDF)"}
    </button>
  );

  if (variant === "inline") return button;

  return (
    <section className="px-6 py-10" data-testid={testId}>
      <div className="max-w-5xl mx-auto rounded-[2rem] border border-[#FEC4D2]/60 bg-gradient-to-br from-[#FEEFF2] via-white to-[#E8F4FA] p-7 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-left">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FEC4D2]/40 shrink-0">
          <FileDown size={30} className="text-[#F2709C]" />
        </span>
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
            Garde ton <span className="editorial text-[#FEC4D2]">diagnostic</span> avec toi
          </h2>
          <p className="mt-2 text-neutral-600 leading-relaxed">
            Télécharge le récapitulatif de ton diagnostic et de tes produits recommandés dans un PDF clair, avec un lien vers chaque produit.
          </p>
        </div>
        <div className="shrink-0">{button}</div>
      </div>
    </section>
  );
}
