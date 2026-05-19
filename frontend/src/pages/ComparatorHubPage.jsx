import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { api } from "../lib/api";

export default function ComparatorHubPage() {
  const [cats, setCats] = useState({});
  useEffect(() => { api.get("/categories").then(r => setCats(r.data || {})); }, []);
  const order = ["visage", "corps", "cosmetiques"];
  return (
    <main className="bg-white min-h-screen">
      <section className="px-6 pt-16 pb-12 relative" data-testid="comparator-hub">
        <div className="halo-pink -top-20 -left-20"/>
        <div className="halo-blue top-10 right-0"/>
        <div className="max-w-4xl mx-auto text-center relative">
          <h1 className="text-5xl md:text-6xl font-bold text-[#FEC4D2]">Le <span className="editorial text-neutral-900">Comparateur</span></h1>
          <p className="mt-4 text-neutral-600">Des milliers de produits cosmétiques comparés pour toi. Choisis ta catégorie et trouve le produit parfait.</p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          {order.map((k) => {
            const c = cats[k]; if (!c) return null;
            const preview = (c.products || []).slice(0, 4);
            const more = Math.max(0, (c.products || []).length - 4);
            return (
              <Link key={k} to={`/categorie/${k}`} className="group bg-white border border-[#FEC4D2] rounded-3xl p-8 card-lift" data-testid={`hub-card-${k}`}>
                <h2 className="text-2xl font-bold text-neutral-900">{c.label}</h2>
                <p className="mt-1 text-xs text-neutral-500">{(c.products || []).length} catégories de produits</p>
                <ul className="mt-5 space-y-2 text-sm text-neutral-700">
                  {preview.map(p => <li key={p.slug}>{p.label}</li>)}
                </ul>
                {more > 0 && <p className="mt-3 text-sm text-[#FEC4D2]">+ {more} autres</p>}
                <span className="mt-6 inline-flex items-center gap-1 text-sm text-[#79C1E0] group-hover:gap-2 transition-all">Explorer <ArrowRight size={14}/></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="px-6 py-20 bg-[#79C1E0]/[0.08]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#79C1E0]/40 flex items-center justify-center text-[#79C1E0] mx-auto"><Sparkles size={26}/></div>
          <h2 className="mt-6 text-3xl md:text-4xl font-bold text-[#79C1E0]">Tu préfères <span className="editorial text-[#FEC4D2]">essayer</span> avant de comparer ?</h2>
          <p className="mt-4 text-neutral-600">Notre IA peut appliquer virtuellement les produits sur ta photo pour t'aider à faire ton choix.</p>
          <Link to="/essayage-ia" className="mt-8 inline-flex items-center gap-2 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white px-8 py-3.5 rounded-full font-medium transition shadow-md hover:shadow-lg" data-testid="hub-try-ai">
            <Sparkles size={16}/> Essayer l'IA
          </Link>
        </div>
      </section>
    </main>
  );
}
