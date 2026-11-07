import { ExternalLink } from "lucide-react";
import ProductRating from "../ProductRating";
import PriceBlock, { promoOf } from "../PriceBlock";
import WavyBadge from "./WavyBadge";
import { swapIfPlaceholder, productImgSrc, productImgError } from "../../data/imageAssets";

// Version compacte de la carte « recommandation » des résultats de quiz
// (bordure rose, visuel dégradé, marque en bleu, bouton bleu), pensée pour
// s'afficher trois par trois dans un slider.
export default function PromoCard({ product }) {
  const promo = promoOf(product);
  return (
    <article
      className="relative h-full bg-white border-2 border-[#FEC4D2] rounded-3xl overflow-hidden flex flex-col shadow-[0_20px_50px_-35px_rgba(254,196,210,0.9)]"
      data-testid={`promo-card-${product.id}`}
    >
      {promo && (
        <WavyBadge size={58} className="absolute top-3 right-3 z-10 text-[15px]">-{promo.pct}%</WavyBadge>
      )}
      <div className="bg-gradient-to-br from-[#FEC4D2]/15 to-[#79C1E0]/10 p-5 pt-6">
        <img
          src={productImgSrc(product.image)}
          alt={product.name}
          loading="lazy"
          className="w-full h-40 object-contain mix-blend-multiply"
          onLoad={swapIfPlaceholder}
          onError={productImgError(product.image)}
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#79C1E0] font-semibold truncate">{product.brand}</p>
        <h3 className="mt-1.5 text-[15px] leading-snug font-bold text-neutral-900 line-clamp-2 min-h-[2.6em]">{product.name}</h3>
        <ProductRating product={product} className="mt-2" />
        <div className="mt-auto pt-4 flex flex-wrap items-end gap-x-3 gap-y-3">
          <PriceBlock product={product} className="text-xl font-bold text-neutral-900" />
          <a
            href={product.affiliate_url || "#"}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="inline-flex flex-1 min-w-[8.5rem] items-center justify-center gap-1.5 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white text-xs font-medium px-4 py-2.5 rounded-full transition whitespace-nowrap"
            data-testid={`promo-see-${product.id}`}
          >
            Voir le produit <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </article>
  );
}
