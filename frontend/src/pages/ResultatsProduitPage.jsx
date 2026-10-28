import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import { trackQuiz } from "../lib/trackQuiz";
import { rankProducts, splitByMatchQuality } from "../lib/scoring";
import ProductRecommendationCard from "../components/ProductRecommendationCard";
import HorizontalProductCard from "../components/HorizontalProductCard";
import NoGoodMatchMessage from "../components/NoGoodMatchMessage";

export default function ResultatsProduitPage() {
  const { produit } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [ranked, setRanked] = useState(null); // null = encore en chargement
  const answers = state?.answers || {};
  const trackedRef = useRef(false);

  useEffect(() => {
    api.get("/products", { params: { category: produit } }).then((r) => {
      const rankedList = rankProducts(r.data || [], answers);
      setRanked(rankedList);
      if (!trackedRef.current) {
        trackedRef.current = true;
        trackQuiz({ quizType: "produit", quizKey: produit, answers, products: rankedList.slice(0, 10) });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produit]);

  if (ranked === null) {
    return <main className="px-6 py-20 text-center text-neutral-500 min-h-screen">Chargement des recommandations…</main>;
  }

  // On ne presente plus automatiquement ranked[0] comme "ton match parfait" :
  // s'il n'a pas vraiment rempli les criteres (score sous le seuil), c'est
  // une alternative imparfaite comme une autre, pas LE match.
  const { goodMatches, alternatives } = splitByMatchQuality(ranked);
  const best = goodMatches[0];
  const otherGoodMatches = goodMatches.slice(1, 10);
  const altsToShow = alternatives.slice(0, 6);

  return (
    <main className="bg-white min-h-screen relative" data-testid="resultats-produit">
      <div className="halo-pink -top-20 -left-20"/>

      <section className="px-6 pt-12 pb-12 relative">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Ta recommandation</p>
          {best ? (
            <>
              <h1 className="mt-2 text-4xl md:text-5xl font-bold text-[#FEC4D2]">
                Ton <span className="editorial text-neutral-900">match parfait</span>
              </h1>
              <p className="mt-3 text-neutral-600">Voici le produit qui te correspond le mieux selon tes réponses.</p>
            </>
          ) : (
            <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-900">Tes recommandations</h1>
          )}
        </div>
        <div className="max-w-5xl mx-auto">
          {best ? <ProductRecommendationCard product={best}/> : <NoGoodMatchMessage/>}
        </div>
      </section>

      {otherGoodMatches.length > 0 && (
        <section className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#79C1E0]">D'autres produits qui te correspondent</h2>
            <div className="mt-8 grid grid-cols-1 gap-5">
              {otherGoodMatches.map((p) => (
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
      )}

      {altsToShow.length > 0 && (
        <section className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold text-neutral-500">
              Produits qui pourraient te plaire (mais ne respectent pas totalement tes critères)
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-5">
              {altsToShow.map((p) => (
                <div key={p.id} className="relative opacity-90">
                  <span className="absolute top-4 right-4 z-10 bg-white border border-neutral-300 text-neutral-500 text-xs font-bold px-3 py-1.5 rounded-full">
                    {p._score}%
                  </span>
                  <HorizontalProductCard product={p}/>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
