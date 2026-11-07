// Prix d'un produit : prix actuel + (si promo) ancien prix barré et pastille -xx %.
// L'ancien prix vient du champ `old_price` rempli à l'import des flux marchands.

export function promoOf(product) {
  const price = Number(product?.price);
  const old = Number(product?.old_price);
  if (!(price > 0) || !(old > price)) return null;
  const pct = Math.round((100 * (old - price)) / old);
  if (pct < 5) return null;
  return { old, pct };
}

export default function PriceBlock({ product, digits = 2, className = "text-xl font-semibold text-neutral-900" }) {
  const promo = promoOf(product);
  const fmt = (n) => n.toFixed(digits);
  return (
    <div className="inline-flex flex-col items-start leading-tight" data-testid={`price-${product.id}`}>
      {promo && (
        <span className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm text-neutral-400 line-through whitespace-nowrap">{fmt(promo.old)} €</span>
          <span className="text-[11px] font-semibold bg-[#FEC4D2] text-neutral-900 px-1.5 py-0.5 rounded-full whitespace-nowrap">-{promo.pct}%</span>
        </span>
      )}
      <span className={`${className} whitespace-nowrap`}>{fmt(Number(product.price))} €</span>
    </div>
  );
}
