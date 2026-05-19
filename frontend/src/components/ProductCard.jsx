import { Heart, Star } from "lucide-react";
import { useWishlist } from "../hooks/useWishlist";

export default function ProductCard({ product, rank }) {
  const { has, toggle } = useWishlist();
  const inWishlist = has(product.id);
  return (
    <div
      className="group relative bg-white border border-[#FEC4D2] rounded-2xl p-5 card-lift overflow-hidden flex flex-col"
      data-testid={`product-card-${product.id}`}
    >
      {rank && (
        <span className="absolute top-3 left-3 z-10 bg-[#79C1E0] text-white text-xs font-semibold rounded-full px-2.5 py-1">
          #{rank}
        </span>
      )}
      <button
        onClick={() => toggle(product.id)}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 border border-[#FEC4D2]/60 flex items-center justify-center transition ${
          inWishlist ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        aria-label="Ajouter à la wishlist"
        data-testid={`wishlist-toggle-${product.id}`}
      >
        <Heart size={16} className={inWishlist ? "fill-[#FEC4D2] text-[#FEC4D2]" : "text-[#FEC4D2]"} />
      </button>
      <div className="aspect-square w-full rounded-xl bg-gradient-to-br from-[#FEC4D2]/10 to-[#79C1E0]/10 overflow-hidden mb-4">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
        />
      </div>
      <p className="text-xs uppercase tracking-wider text-neutral-500">{product.brand}</p>
      <h3 className="text-base font-medium text-neutral-900 mt-1 line-clamp-2 min-h-[2.8em]">{product.name}</h3>
      <div className="flex items-center gap-2 mt-2 text-sm">
        <Star size={14} className="fill-[#FEC4D2] text-[#FEC4D2]" />
        <span className="font-medium">{product.rating}</span>
        <span className="text-neutral-400 text-xs">({product.reviews})</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {(product.tags || []).slice(0, 3).map((t) => (
          <span key={t} className="text-[10px] uppercase tracking-wider bg-[#FEC4D2]/15 text-neutral-700 px-2 py-1 rounded-full">{t}</span>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
        <span className="text-xl font-semibold text-neutral-900">{product.price.toFixed(2)} €</span>
        <a
          href={product.affiliate_url || "#"}
          target="_blank" rel="noreferrer"
          className="bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 text-xs font-medium px-4 py-2 rounded-full transition"
          data-testid={`see-product-${product.id}`}
        >
          Voir le produit
        </a>
      </div>
    </div>
  );
}
