import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Slider } from "./ui/slider";

export default function CriteriaPopup({ open, onClose, onSubmit, questions, categoryLabel }) {
  const [skin, setSkin] = useState([]);
  const [textures, setTextures] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [budget, setBudget] = useState([200]);

  useEffect(() => {
    if (open) {
      setSkin([]); setTextures([]); setBenefits([]); setIngredients([]); setBudget([200]);
    }
  }, [open]);

  if (!open) return null;

  const toggle = (arr, set) => (v) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const submit = () => {
    onSubmit({ skin, textures, benefits, ingredients, budget: [0, budget[0]] });
  };

  const Pill = ({ label, active, onClick, name }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full border text-sm transition select-none ${
        active
          ? "bg-[#FEC4D2] border-[#FEC4D2] text-neutral-900"
          : "bg-white border-neutral-200 text-neutral-700 hover:border-[#FEC4D2]"
      }`}
      data-testid={`criteria-${name}-${label.replace(/\s+/g, "-").toLowerCase()}`}
    >
      {label}
    </button>
  );

  const Section = ({ title, items, sel, set, name }) => (
    <div>
      <h4 className="text-xs font-semibold tracking-[0.2em] text-[#79C1E0] mb-4">{title}</h4>
      <div className="flex flex-wrap gap-2.5">
        {items.map((v) => (
          <Pill key={v} label={v} active={sel.includes(v)} onClick={() => toggle(sel, set)(v)} name={name} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-fade-in" data-testid="criteria-popup">
      <div className="bg-white border-2 border-[#FEC4D2] rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 transition z-10" data-testid="criteria-close" aria-label="Fermer">
          <X size={18} />
        </button>
        <div className="p-8 md:p-12 space-y-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#FEC4D2] leading-tight">
              Configure ta <span className="editorial text-neutral-900">recherche</span>
            </h2>
            <p className="mt-3 text-neutral-600 text-sm">
              Catégorie : <span className="font-semibold text-neutral-900">{categoryLabel}</span>
            </p>
          </div>

          <Section title="TYPE DE PEAU" items={questions.skin_types} sel={skin} set={setSkin} name="skin" />
          <Section title="TEXTURE SOUHAITÉE" items={questions.textures} sel={textures} set={setTextures} name="texture" />
          <Section title="BÉNÉFICE RECHERCHÉ" items={questions.benefits} sel={benefits} set={setBenefits} name="benefit" />
          <Section title="INGRÉDIENTS" items={questions.ingredients} sel={ingredients} set={setIngredients} name="ingredient" />

          <div>
            <div className="flex items-center gap-3 mb-4">
              <h4 className="text-xs font-semibold tracking-[0.2em] text-[#79C1E0]">BUDGET :</h4>
              <span className="text-sm font-bold text-neutral-900">JUSQU'À {budget[0]} €</span>
            </div>
            <Slider value={budget} onValueChange={setBudget} min={10} max={300} step={5} data-testid="budget-slider" />
          </div>

          <div className="text-center pt-4">
            <button
              onClick={submit}
              className="inline-flex items-center gap-2 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white px-12 py-4 rounded-full font-medium transition shadow-md hover:shadow-lg"
              data-testid="criteria-submit"
            >
              Lancer la comparaison →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
