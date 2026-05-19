import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

export default function FiltersSidebar({ filters, setFilters, questions }) {
  const upd = (k, v) => setFilters({ ...filters, [k]: v });
  const toggleArr = (k, v) => {
    const arr = filters[k] || [];
    upd(k, arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const Section = ({ title, items, field, name }) => (
    <div>
      <h4 className="text-xs font-semibold tracking-[0.22em] text-[#79C1E0] mb-4">{title}</h4>
      <div className="space-y-3">
        {items.map((v) => {
          const id = `f-${name}-${v}`;
          const checked = (filters[field] || []).includes(v);
          return (
            <label key={v} htmlFor={id} className="flex items-center gap-3 text-base cursor-pointer text-neutral-800">
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={() => toggleArr(field, v)}
                className="data-[state=checked]:bg-[#FEC4D2] data-[state=checked]:border-[#FEC4D2] data-[state=checked]:text-neutral-900 w-5 h-5 rounded-md border-neutral-300"
                data-testid={`filter-${name}-${v.replace(/\s+/g, "-").toLowerCase()}`}
              />
              <span>{v}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="lg:sticky lg:top-24 bg-white rounded-3xl border border-[#FEC4D2]/40 p-7 space-y-8 h-fit" data-testid="filters-sidebar">
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Rechercher..."
          value={filters.search || ""}
          onChange={(e) => upd("search", e.target.value)}
          className="pl-10 h-12 border-neutral-200 rounded-full focus-visible:ring-[#FEC4D2]"
          data-testid="filter-search"
        />
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <h4 className="text-xs font-semibold tracking-[0.22em] text-[#79C1E0]">BUDGET :</h4>
          <span className="text-sm font-bold text-neutral-900">{filters.budget[1]} €</span>
        </div>
        <Slider
          value={[filters.budget[1]]}
          onValueChange={(v) => upd("budget", [0, v[0]])}
          min={10} max={300} step={5}
          data-testid="filter-budget"
        />
      </div>

      <Section title="TYPE DE PEAU" items={questions.skin_types} field="skin" name="skin" />
      <Section title="TEXTURE" items={questions.textures} field="textures" name="texture" />
      <Section title="BÉNÉFICE" items={questions.benefits} field="benefits" name="benefit" />
      <Section title="INGRÉDIENTS" items={questions.ingredients} field="ingredients" name="ingredient" />
    </aside>
  );
}
