import { ChevronLeft } from "lucide-react";

export default function QuizStep({
  question,
  value,
  onChange,
  onNext,
  onBack,
  index,
  total,
  canGoBack = true,
}) {
  const isMulti = question.multi;
  const selected = isMulti ? (value || []) : value;

  // Valeur spéciale pour le bouton "Aucun ne me correspond" (voir plus bas) :
  // sélectionner une vraie option désélectionne ce marqueur, et vice-versa.
  const NONE_VALUE = "__none__";

  const toggle = (v) => {
    if (isMulti) {
      const arr = selected || [];
      if (v === NONE_VALUE) {
        onChange(arr.includes(NONE_VALUE) ? [] : [NONE_VALUE]);
        return;
      }
      const withoutNone = arr.filter((x) => x !== NONE_VALUE);
      const next = withoutNone.includes(v) ? withoutNone.filter((x) => x !== v) : [...withoutNone, v];
      onChange(next);
    } else {
      onChange(v);
    }
  };

  const isSelected = (v) => isMulti ? (selected || []).includes(v) : selected === v;

  const canContinue = isMulti
    ? Array.isArray(selected) && selected.length > 0
    : selected !== undefined && selected !== null && selected !== "";

  return (
    <div className="max-w-3xl mx-auto" data-testid={`quiz-step-${question.key}`}>
      {/* Progress */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3 text-sm text-neutral-500">
          <span>Question {index + 1} sur {total}</span>
          <span className="font-medium text-[#79C1E0]">{Math.round(((index + 1) / total) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FEC4D2] to-[#79C1E0] transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 text-center leading-tight animate-fade-up">
        {question.label}
      </h2>
      {isMulti && (
        <p className="mt-2 text-sm text-center text-neutral-500">Tu peux choisir plusieurs options</p>
      )}

      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`min-h-[80px] min-w-0 px-3 sm:px-5 py-5 rounded-2xl border-2 text-left transition-all [overflow-wrap:anywhere] [hyphens:auto] ${
              isSelected(opt.value)
                ? "bg-[#FEC4D2]/15 border-[#FEC4D2] text-neutral-900 shadow-[0_8px_24px_-12px_rgba(254,196,210,0.6)]"
                : "bg-white border-neutral-200 text-neutral-700 hover:border-[#FEC4D2]"
            }`}
            data-testid={`quiz-option-${question.key}-${opt.value}`}
          >
            <span className="block text-[15px] sm:text-base font-medium leading-snug break-words">{String(opt.label).replace(/\//g, "/\u200b")}</span>
          </button>
        ))}
        {/* Échappatoire pour les questions où rien ne correspond forcément
            (style de vie, préoccupations, ingrédients…). Jamais affichée sur
            les questions structurantes (type de peau/cheveux/corps) qui
            servent de base au diagnostic produit — voir quizConfig.js. */}
        {question.allowNone && (
          <button
            type="button"
            onClick={() => toggle(NONE_VALUE)}
            className={`col-span-2 md:col-span-3 min-h-[64px] px-5 py-4 rounded-2xl border-2 border-dashed text-center transition-all ${
              isSelected(NONE_VALUE)
                ? "bg-[#FEC4D2]/15 border-[#FEC4D2] text-neutral-900"
                : "bg-neutral-50 border-neutral-300 text-neutral-500 hover:border-[#FEC4D2] hover:text-neutral-700"
            }`}
            data-testid={`quiz-option-${question.key}-none`}
          >
            <span className="text-sm font-medium">
              {question.noneLabel || (isMulti ? "Aucun ne me correspond" : "Je ne sais pas / Non applicable")}
            </span>
          </button>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
          data-testid="quiz-back"
        >
          <ChevronLeft size={16}/> Précédent
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className="inline-flex items-center gap-2 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white px-8 py-3 rounded-full font-medium transition shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          data-testid="quiz-next"
        >
          Continuer →
        </button>
      </div>
    </div>
  );
}
