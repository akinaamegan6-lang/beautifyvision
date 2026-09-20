import { Star, ExternalLink, Sparkles } from "lucide-react";
import { NO_PRODUCT_IMAGE } from "../data/imageAssets";

export default function ProductRecommendationCard({ product, badge = "Recommandé pour toi" }) {
  const score = product._score ?? 90;
  const reasons = product._reasons || [];
  const filled = Math.round(product.rating || 0);

  return (
    <div className="relative bg-white border-2 border-[#FEC4D2] rounded-3xl overflow-hidden grid md:grid-cols-[1fr_1.2fr] gap-0 shadow-[0_30px_80px_-40px_rgba(254,196,210,0.6)]" data-testid="recommendation-card">
      <div className="absolute top-5 left-5 z-10 inline-flex items-center gap-1.5 bg-[#FEC4D2] text-neutral-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow">
        <Sparkles size={12}/> {badge}
      </div>
      <div className="relative bg-gradient-to-br from-[#FEC4D2]/15 to-[#79C1E0]/10">
        <img src={NO_PRODUCT_IMAGE} alt={product.name} className="w-full h-64 md:h-full object-contain"/>
      </div>
      <div className="p-7 md:p-10 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-[#79C1E0] font-semibold">{product.brand}</p>
            <h3 className="mt-2 text-2xl md:text-3xl font-bold text-neutral-900">{product.name}</h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold text-[#FEC4D2]">{score}%</p>
            <p className="text-xs text-neutral-500 mt-1">compatibilité</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          {[0,1,2,3,4].map(i => (
            <Star key={i} size={14} className={i < filled ? "fill-[#FEC4D2] text-[#FEC4D2]" : "text-[#FEC4D2]/40"} />
          ))}
          <span className="ml-1 text-sm font-semibold">{product.rating}</span>
          <span className="text-xs text-neutral-500">({product.reviews} avis)</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {(product.tags || []).slice(0, 4).map((t) => (
            <span key={t} className="text-xs bg-[#FEC4D2]/40 text-neutral-800 px-3 py-1.5 rounded-full">{t}</span>
          ))}
        </div>

        {reasons.length > 0 && (
          <div className="mt-5 bg-neutral-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#79C1E0] uppercase tracking-wider mb-1.5">Pourquoi ce produit ?</p>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Sélectionné pour {reasons.join(", ")}.
            </p>
          </div>
        )}

        <div className="mt-auto pt-6 flex items-center justify-between gap-4">
          <span className="text-2xl font-bold text-neutral-900">{product.price.toFixed(2)} €</span>
          <a
            href={product.affiliate_url || "#"}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white text-sm font-medium px-7 py-3 rounded-full transition"
            data-testid="reco-see-product"
          >
            Voir le produit <ExternalLink size={14}/>
          </a>
        </div>
      </div>
    </div>
  );
}
