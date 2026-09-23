import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Save, Share2, Sparkles, ChevronDown, Star, ExternalLink } from "lucide-react";
import { api } from "../lib/api";
import { rankProducts } from "../lib/scoring";
import { getRoutineProductBySlug, SKIN_PROBLEMS } from "../data/quizConfig";
import { NO_PRODUCT_IMAGE } from "../data/imageAssets";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";

function AlternativeCard({ product, index }) {
  return (
    <div className="bg-white border border-[#FEC4D2]/50 rounded-2xl p-4 flex items-center gap-4">
      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#FEC4D2]/15 to-[#79C1E0]/10 overflow-hidden shrink-0">
        <img src={product.image || NO_PRODUCT_IMAGE} alt={product.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PRODUCT_IMAGE; }} className="w-full h-full object-contain"/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-[#79C1E0] font-semibold">Alternative n°{index}</p>
        <p className="text-sm font-bold text-neutral-900 truncate">{product.name}</p>
        <p className="text-xs text-neutral-500">{product.brand}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-neutral-900">{product.price.toFixed(0)} €</p>
        <p className="text-xs text-[#FEC4D2] font-semibold">{product._score}%</p>
      </div>
      <a href={product.affiliate_url || "#"} target="_blank" rel="noreferrer" className="bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 text-xs font-medium px-3 py-1.5 rounded-full transition">
        Voir
      </a>
    </div>
  );
}

function ProductSection({ slug, recommendations }) {
  const [open, setOpen] = useState(false);
  const meta = getRoutineProductBySlug(slug);
  const best = recommendations[0];
  const alts = recommendations.slice(1, 3);
  if (!best) {
    return (
      <div className="mb-12">
        <h3 className="text-xl md:text-2xl font-semibold text-[#79C1E0] mb-2">{meta?.emoji} Ton {meta?.label.toLowerCase()} idéal</h3>
        <p className="text-sm text-neutral-500 italic">Aucun produit trouvé dans notre base pour cette catégorie.</p>
      </div>
    );
  }
  const filled = Math.round(best.rating || 0);
  return (
    <section className="mb-14" data-testid={`routine-section-${slug}`}>
      <h3 className="text-xl md:text-2xl font-semibold text-[#79C1E0] mb-5">{meta?.emoji} Ton {meta?.label.toLowerCase()} idéal</h3>
      <div className="bg-white border-2 border-[#FEC4D2] rounded-3xl overflow-hidden grid md:grid-cols-[280px_1fr]">
        <div className="bg-gradient-to-br from-[#FEC4D2]/15 to-[#79C1E0]/10">
          <img src={best.image || NO_PRODUCT_IMAGE} alt={best.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PRODUCT_IMAGE; }} className="w-full h-56 md:h-full object-contain"/>
        </div>
        <div className="p-6 md:p-7 flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 bg-[#FEC4D2] text-neutral-900 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                <Sparkles size={10}/> Recommandé pour toi
              </span>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#79C1E0] font-semibold">{best.brand}</p>
              <p className="mt-1 text-lg md:text-xl font-bold text-neutral-900">{best.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-[#FEC4D2]">{best._score}%</p>
              <p className="text-[10px] text-neutral-500">compatibilité</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {[0,1,2,3,4].map(i => <Star key={i} size={12} className={i < filled ? "fill-[#FEC4D2] text-[#FEC4D2]" : "text-[#FEC4D2]/40"}/>)}
            <span className="ml-1 text-xs">{best.rating} ({best.reviews})</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(best.tags || []).slice(0, 3).map((t) => (
              <span key={t} className="text-[10px] bg-[#FEC4D2]/40 text-neutral-800 px-2 py-1 rounded-full">{t}</span>
            ))}
          </div>
          {best._reasons?.length > 0 && (
            <p className="mt-3 text-xs text-neutral-600 leading-relaxed">
              <span className="font-semibold text-[#79C1E0]">Pourquoi ? </span>
              Sélectionné pour {best._reasons.join(", ")}.
            </p>
          )}
          <div className="mt-auto pt-4 flex items-center justify-between">
            <span className="text-xl font-bold text-neutral-900">{best.price.toFixed(2)} €</span>
            <a href={best.affiliate_url || "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white text-sm font-medium px-5 py-2 rounded-full transition" data-testid={`reco-see-${slug}`}>
              Voir le produit <ExternalLink size={12}/>
            </a>
          </div>
        </div>
      </div>
      {alts.length > 0 && (
        <>
          <button
            onClick={() => setOpen(!open)}
            className="mt-4 inline-flex items-center gap-1 text-sm text-[#79C1E0] hover:text-[#6ab1d1] transition"
            data-testid={`toggle-alts-${slug}`}
          >
            Voir {alts.length} autre{alts.length > 1 ? "s" : ""} option{alts.length > 1 ? "s" : ""} <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`}/>
          </button>
          {open && (
            <div className="mt-3 space-y-2 animate-fade-in">
              {alts.map((p, i) => <AlternativeCard key={p.id} product={p} index={i + 1}/>)}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default function ResultatsRoutinePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const selected = state?.selected || [];
  const skinAnswers = state?.skinAnswers || {};
  const productAnswers = state?.productAnswers || {};
  const probleme = state?.probleme;
  const problemLabel = SKIN_PROBLEMS.find(p => p.slug === probleme)?.label;

  const [recos, setRecos] = useState({}); // { slug: [products...] }
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function load() {
      const result = {};
      for (const slug of selected) {
        const meta = getRoutineProductBySlug(slug);
        if (!meta) continue;
        try {
          const r = await api.get("/products", { params: { category: meta.category } });
          const merged = { ...skinAnswers, product_answers: productAnswers[slug] || {} };
          result[slug] = rankProducts(r.data || [], merged).slice(0, 3);
        } catch {
          result[slug] = [];
        }
      }
      setRecos(result);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allBest = selected.map((s) => recos[s]?.[0]).filter(Boolean);
  const total = allBest.reduce((sum, p) => sum + (p.price || 0), 0);

  const saveRoutine = (e) => {
    e.preventDefault();
    toast.success(`Routine sauvegardée. Un récap a été envoyé à ${email} (MOCK).`);
    setEmail("");
  };

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien de partage copié dans le presse-papier !");
  };

  return (
    <main className="bg-white min-h-screen relative" data-testid="resultats-routine">
      <div className="halo-pink -top-20 -right-20"/>
      <div className="halo-blue top-1/3 -left-32"/>

      <section className="px-6 pt-12 pb-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Ta routine personnalisée</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold text-[#FEC4D2]">
            ✨ Ta Routine <span className="editorial text-neutral-900">360°</span>
          </h1>
          <p className="mt-4 text-neutral-600">
            Créée spécialement pour toi {skinAnswers.skin_type && <>· peau <span className="font-semibold capitalize">{skinAnswers.skin_type}</span></>}
            {problemLabel && <> · objectif <span className="font-semibold">{problemLabel}</span></>}
          </p>
        </div>
      </section>

      <section className="px-6 py-10 relative">
        <div className="max-w-5xl mx-auto">
          {selected.length === 0 && (
            <p className="text-center text-neutral-500">Aucun produit sélectionné. <button onClick={() => navigate("/routine-360")} className="text-[#79C1E0] underline">Recommencer</button></p>
          )}
          {selected.map((slug) => (
            <ProductSection key={slug} slug={slug} recommendations={recos[slug] || []}/>
          ))}
        </div>
      </section>

      {allBest.length > 0 && (
        <section className="px-6 py-12 bg-[#FEC4D2]/[0.06] relative">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-[#79C1E0] text-center mb-8">
              Ta routine en <span className="editorial text-[#FEC4D2]">un coup d'œil</span>
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4" data-testid="routine-summary-strip">
              {allBest.map((p) => (
                <div key={p.id} className="shrink-0 w-44 bg-white border border-[#FEC4D2]/60 rounded-2xl p-3">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[#FEC4D2]/15 to-[#79C1E0]/10 mb-2">
                    <img src={p.image || NO_PRODUCT_IMAGE} alt={p.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = NO_PRODUCT_IMAGE; }} className="w-full h-full object-contain"/>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 truncate">{p.brand}</p>
                  <p className="text-xs font-medium text-neutral-900 line-clamp-2 min-h-[2.4em]">{p.name}</p>
                  <p className="text-sm font-bold text-neutral-900 mt-1">{p.price.toFixed(2)} €</p>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-white border-2 border-[#FEC4D2] rounded-3xl px-8 py-6 flex items-center justify-between" data-testid="routine-total">
              <span className="text-neutral-600">Coût estimé de ta routine complète</span>
              <span className="text-3xl md:text-4xl font-bold text-neutral-900">{total.toFixed(2)} €</span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-6 py-3 rounded-full font-medium transition shadow" data-testid="save-routine">
                    <Save size={16}/> Sauvegarder ma routine
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-[#FEC4D2]">Reçois ta <span className="editorial text-neutral-900">routine</span></DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-neutral-600">Reçois ta routine par email et sois notifiée des nouveautés pour ta peau.</p>
                  <form onSubmit={saveRoutine} className="space-y-3">
                    <Input type="email" required placeholder="ton@email.com" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="save-email-input"/>
                    <button type="submit" className="w-full bg-[#79C1E0] hover:bg-[#6ab1d1] text-white py-3 rounded-full font-medium transition" data-testid="save-email-submit">
                      Recevoir ma routine →
                    </button>
                  </form>
                </DialogContent>
              </Dialog>

              <button onClick={share} className="inline-flex items-center gap-2 bg-white border-2 border-[#79C1E0] hover:bg-[#79C1E0]/10 text-neutral-800 px-6 py-3 rounded-full font-medium transition" data-testid="share-routine">
                <Share2 size={16}/> Partager ma routine
              </button>

              <button onClick={() => navigate("/essayage-ia")} className="inline-flex items-center gap-2 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white px-6 py-3 rounded-full font-medium transition shadow" data-testid="try-ai-routine">
                <Sparkles size={16}/> Essaie ton maquillage en IA
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
