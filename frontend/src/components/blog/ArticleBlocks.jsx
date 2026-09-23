import { useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import RichText from "./RichText";
import { slugifyHeading } from "./blogText";
import { NO_PRODUCT_IMAGE } from "../../data/imageAssets";

const LIGHTBULB_ICON = "/icone/nos-conseilles-picto.png";

function formatReviews(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".", ",")}k`;
  return `${n}`;
}

export function Heading2Block({ text }) {
  return (
    <h2 id={slugifyHeading(text)} className="scroll-mt-28 text-2xl md:text-3xl font-bold text-neutral-900 mt-14 mb-4 leading-snug">
      <RichText text={text} highlightClassName="text-[#79C1E0]"/>
    </h2>
  );
}

export function Heading3Block({ text }) {
  return (
    <h3 className="text-xl md:text-2xl font-bold text-[#FEC4D2] mt-10 mb-3">
      <RichText text={text} highlightClassName="text-[#FEC4D2]"/>
    </h3>
  );
}

export function Heading4Block({ text }) {
  return (
    <h4 className="text-lg font-semibold text-[#79C1E0] mt-8 mb-2">
      <RichText text={text} highlightClassName="text-[#79C1E0]"/>
    </h4>
  );
}

export function ParagraphBlock({ text }) {
  return <p className="text-neutral-600 leading-relaxed mb-4">{text}</p>;
}

export function ImageBlock({ src, caption }) {
  return (
    <figure className="my-6">
      <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-br from-[#FEC4D2]/10 to-[#79C1E0]/10 flex items-center justify-center">
        <img
          src={src || NO_PRODUCT_IMAGE}
          alt={caption || ""}
          className={src ? "w-full h-full object-cover" : "w-2/5 h-2/5 object-contain"}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PRODUCT_IMAGE; }}
        />
      </div>
      {caption && <figcaption className="mt-2 text-xs text-neutral-400 text-center">{caption}</figcaption>}
    </figure>
  );
}

export function StepsBlock({ items = [] }) {
  return (
    <div className="my-6 bg-[#FEC4D2]/10 rounded-3xl p-6 md:p-8">
      <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
        {items.map((text, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-[#fdb2c3] text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
            <span className="text-sm text-neutral-700">{text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function IngredientsBlock({ items = [] }) {
  return (
    <div className="my-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((ing, i) => (
        <div key={i} className="bg-white border border-[#FEC4D2]/30 rounded-2xl overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-[#FEC4D2]/10 to-[#79C1E0]/10 flex items-center justify-center">
            <img src={ing.image || NO_PRODUCT_IMAGE} alt={ing.name} className={ing.image ? "w-full h-full object-cover" : "w-1/2 h-1/2 object-contain"}/>
          </div>
          <div className="p-3.5">
            <p className="text-sm font-bold text-neutral-900">{ing.name}</p>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{ing.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductsBlock({ items = [] }) {
  const scrollerRef = useRef(null);
  const scrollBy = (dx) => scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  return (
    <div className="relative my-6">
      <button onClick={() => scrollBy(-260)} aria-label="Précédent" className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-[#FEC4D2]/50 shadow items-center justify-center hover:bg-[#FEC4D2]/10 transition">
        <ChevronLeft size={16}/>
      </button>
      <div ref={scrollerRef} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x no-scrollbar">
        {items.map((p, i) => (
          <div key={i} className="shrink-0 w-44 snap-start bg-white border border-[#FEC4D2]/30 rounded-2xl p-4">
            <div className="aspect-square rounded-xl bg-gradient-to-br from-[#FEC4D2]/10 to-[#79C1E0]/10 overflow-hidden mb-3 flex items-center justify-center">
              <img src={p.image || NO_PRODUCT_IMAGE} alt={p.name} className={p.image ? "w-full h-full object-cover" : "w-1/2 h-1/2 object-contain"}/>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500">{p.brand}</p>
            <p className="text-sm font-semibold text-neutral-900 line-clamp-2 min-h-[2.4em] mt-0.5">{p.name}</p>
            <div className="flex items-center gap-1 mt-1.5 text-xs">
              <Star size={12} className="fill-[#FEC4D2] text-[#FEC4D2]"/>
              <span className="font-medium">{p.rating}</span>
              <span className="text-neutral-400">({formatReviews(p.reviews)})</span>
            </div>
            <p className="text-base font-semibold text-neutral-900 mt-1.5">{p.price.toFixed(2)} €</p>
            <button className="w-full mt-2.5 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 text-xs font-medium py-2 rounded-full transition">Voir le produit</button>
          </div>
        ))}
      </div>
      <button onClick={() => scrollBy(260)} aria-label="Suivant" className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-[#FEC4D2]/50 shadow items-center justify-center hover:bg-[#FEC4D2]/10 transition">
        <ChevronRight size={16}/>
      </button>
    </div>
  );
}

export function TipsBlock({ items = [] }) {
  return (
    <div className="my-6 bg-[#79C1E0]/10 rounded-3xl p-6 md:p-8 flex gap-4">
      <img src={LIGHTBULB_ICON} alt="" className="w-10 h-10 object-contain shrink-0"/>
      <ul className="space-y-2.5">
        {items.map((text, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
            <span className="text-[#79C1E0] mt-0.5">✓</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArticleBlock({ block }) {
  switch (block.type) {
    case "heading2": return <Heading2Block text={block.text}/>;
    case "heading3": return <Heading3Block text={block.text}/>;
    case "heading4": return <Heading4Block text={block.text}/>;
    case "paragraph": return <ParagraphBlock text={block.text}/>;
    case "image": return <ImageBlock src={block.src} caption={block.caption}/>;
    case "steps": return <StepsBlock items={block.items}/>;
    case "ingredients": return <IngredientsBlock items={block.items}/>;
    case "products": return <ProductsBlock items={block.items}/>;
    case "tips": return <TipsBlock items={block.items}/>;
    default: return null;
  }
}
