import { Heart, ExternalLink } from "lucide-react";
import ProductRating from "./ProductRating";
import { useWishlist } from "../hooks/useWishlist";
import { NO_PRODUCT_IMAGE, swapIfPlaceholder } from "../data/imageAssets";

export default function HorizontalProductCard({ product }) {
  const { has, toggle } = useWishlist();
  const inWishlist = has(product.id);
  return (
    <div
      className="group relative bg-white border border-[#FEC4D2] rounded-3xl overflow-hidden flex flex-col md:flex-row card-lift"
      data-testid={`product-card-${product.id}`}
    >
      <div className="md:w-72 md:shrink-0 relative bg-gradient-to-br from-[#FEC4D2]/15 to-[#79C1E0]/10 p-6">
        <img
          src={product.image || NO_PRODUCT_IMAGE}
          alt={product.name}
          loading="lazy"
          className="w-full h-64 md:h-full object-contain group-hover:scale-105 transition duration-700 will-change-transform"
          onLoad={swapIfPlaceholder} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PRODUCT_IMAGE; }}
        />
      </div>

      <div className="flex-1 p-6 md:p-8 flex flex-col">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-[#79C1E0] font-semibold">{product.brand}</p>
            <h3 className="mt-2 text-xl md:text-2xl font-bold text-neutral-900 line-clamp-2">{product.name}</h3>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-neutral-900 whitespace-nowrap">{product.price.toFixed(0)} €</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {(product.tags || []).slice(0, 4).map((t) => (
            <span key={t} className="text-xs bg-[#FEC4D2]/40 text-neutral-800 px-3 py-1.5 rounded-full">{t}</span>
          ))}
        </div>

        <ProductRating product={product} stars5 size="md" className="mt-4" />

        <div className="mt-auto pt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => toggle(product.id)}
            className="w-10 h-10 rounded-full border border-[#FEC4D2]/60 flex items-center justify-center hover:bg-[#FEC4D2]/10 transition"
            aria-label="Wishlist"
            data-testid={`wishlist-toggle-${product.id}`}
          >
            <Heart size={16} className={inWishlist ? "fill-[#FEC4D2] text-[#FEC4D2]" : "text-[#FEC4D2]"} />
          </button>
          <a
            href={product.affiliate_url || "#"}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white text-sm font-medium px-6 py-2.5 rounded-full transition"
            data-testid={`see-product-${product.id}`}
          >
            Voir le produit <ExternalLink size={14}/>
          </a>
        </div>
      </div>
    </div>
  );
}
