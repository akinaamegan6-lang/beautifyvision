import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import { rankProducts } from "../lib/scoring";
import ProductRecommendationCard from "../components/ProductRecommendationCard";
import HorizontalProductCard from "../components/HorizontalProductCard";

export default function ResultatsProduitPage() {
  const { produit } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [ranked, setRanked] = useState([]);
  const answers = state?.answers || {};

  useEffect(() => {
    api.get("/products", { params: { category: produit } }).then((r) => {
      setRanked(rankProducts(r.data || [], answers));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produit]);

  if (ranked.length === 0) {
    return <main className="px-6 py-20 text-center text-neutral-500 min-h-screen">Chargement des recommandations…</main>;
  }

  const best = ranked[0];
  const others = ranked.slice(1, 10);

  return (
    <main className="bg-white min-h-screen relative" data-testid="resultats-produit">
      <div className="halo-pink -top-20 -left-20"/>

      <section className="px-6 pt-12 pb-12 relative">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Ta recommandation</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold text-[#FEC4D2]">
            Ton <span className="editorial text-neutral-900">match parfait</span>
          </h1>
          <p className="mt-3 text-neutral-600">Voici le produit qui te correspond le mieux selon tes réponses.</p>
        </div>
        <div className="max-w-5xl mx-auto">
          <ProductRecommendationCard product={best}/>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#79C1E0]">D'autres produits qui te correspondent</h2>
          <div className="mt-8 grid grid-cols-1 gap-5">
            {others.map((p) => (
              <div key={p.id} className="relative">
                <span className="absolute top-4 right-4 z-10 bg-white border border-[#FEC4D2] text-[#FEC4D2] text-xs font-bold px-3 py-1.5 rounded-full">
                  {p._score}%
                </span>
                <HorizontalProductCard product={p}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FEC4D2 0%, #79C1E0 100%)" }} data-testid="banner-routine-360">
          <Sparkles size={32} className="text-white/90 mx-auto"/>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white">
            Tu veux une routine beauté <span className="editorial">complète</span> ?
          </h2>
          <p className="mt-4 text-white/90 max-w-xl mx-auto">
            Réponds à quelques questions supplémentaires et reçois ta Routine 360° personnalisée adaptée à ta peau de A à Z.
          </p>
          <button
            onClick={() => navigate("/routine-360")}
            className="mt-8 inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 px-8 py-4 rounded-full font-medium transition shadow-lg"
            data-testid="cta-routine-360"
          >
            Créer ma Routine 360° <ArrowRight size={16}/>
          </button>
        </div>
      </section>
    </main>
  );
}
