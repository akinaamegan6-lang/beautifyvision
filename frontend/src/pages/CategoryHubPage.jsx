import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api } from "../lib/api";

export default function CategoryHubPage() {
  const { section } = useParams();
  const [cats, setCats] = useState({});
  useEffect(() => { api.get("/categories").then(r => setCats(r.data || {})); }, []);
  const c = cats[section];
  if (!c) return <main className="min-h-screen px-6 py-20 text-center text-neutral-500">Chargement…</main>;

  const Item = ({ slug, label }) => (
    <Link to={`/comparateur/${slug}`} className="group flex items-center justify-between bg-white border border-[#FEC4D2]/60 hover:border-[#FEC4D2] rounded-2xl px-5 py-4 transition card-lift" data-testid={`cat-item-${slug}`}>
      <span className="text-sm text-neutral-800">{label}</span>
      <ArrowRight size={16} className="text-neutral-400 group-hover:text-[#FEC4D2] group-hover:translate-x-1 transition"/>
    </Link>
  );

  return (
    <main className="bg-white min-h-screen">
      <section className="px-6 pt-16 pb-10 relative">
        <div className="halo-pink -top-20 right-0"/>
        <div className="max-w-4xl mx-auto text-center relative">
          <h1 className="text-5xl md:text-6xl font-bold text-[#FEC4D2] capitalize">{c.label}</h1>
          <p className="mt-4 text-neutral-600">Explore notre sélection de produits {c.label.toLowerCase()} et trouve celui qui te correspond parfaitement.</p>
        </div>
      </section>

      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#79C1E0] mb-6">Produits {c.label.toLowerCase()}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="products-grid-hub">
            {(c.products || []).map(p => <Item key={p.slug} slug={p.slug} label={p.label}/>)}
          </div>
        </div>
      </section>

      {c.problems?.length > 0 && (
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold text-[#79C1E0] mb-6">Mon problème de peau</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {c.problems.map(p => <Item key={p.slug} slug={p.slug} label={p.label}/>)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
