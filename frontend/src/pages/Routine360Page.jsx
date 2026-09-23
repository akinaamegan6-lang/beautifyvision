import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Check, X, AlertTriangle, ChevronRight, Sparkles, ChevronLeft } from "lucide-react";
import { ROUTINE_PRODUCTS, SKIN_PROBLEMS, BUDGET_RANGES, getProductQuestions, getCategoryQuestions } from "../data/quizConfig";
import { TYPE_HERO_IMAGE, getProductImage } from "../data/imageAssets";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import QuizStep from "../components/QuizStep";
import { Dialog, DialogContent } from "../components/ui/dialog";

const VisageIcon = () => <img src="/icone/visage.png" alt="Visage" className="w-8 h-8 object-contain"/>;
const CorpsIcon = () => <img src="/icone/corps.png" alt="Corps" className="w-8 h-8 object-contain"/>;
const CheveuxIcon = () => <img src="/icone/cheveux.png" alt="Cheveux" className="w-8 h-8 object-contain"/>;

const TYPES = [
  { key: "visage", label: "Visage", subtitle: "Skincare & Maquillage", image: TYPE_HERO_IMAGE.visage, Icon: VisageIcon },
  { key: "corps", label: "Corps", subtitle: "Hydratation & Soin", image: TYPE_HERO_IMAGE.corps, Icon: CorpsIcon },
  { key: "cheveux", label: "Cheveux", subtitle: "Soin & Coiffage", image: TYPE_HERO_IMAGE.cheveux, Icon: CheveuxIcon },
];

const VISAGE_SUB = [
  { key: "skincare", label: "Routine Skincare", subtitle: "Nettoyant, sérum, crème…", desc: "Uniquement les soins pour ta peau" },
  { key: "complet", label: "Routine Visage & Maquillage", subtitle: "Skincare + Fond de teint, rouge à lèvres…", desc: "Soin + maquillage du quotidien" },
];

// Filter modal for one product
function ProductFilterModal({ slug, open, onClose, onSave, budgetTotal }) {
  const meta = ROUTINE_PRODUCTS.find((p) => p.slug === slug);
  const questions = getProductQuestions(meta?.category || slug);
  const [answers, setAnswers] = useState({});
  const [budget, setBudget] = useState({ min: 0, max: budgetTotal || 50 });

  useEffect(() => { if (open) { setAnswers({}); setBudget({ min: 0, max: budgetTotal || 50 }); } }, [open, budgetTotal]);

  const toggleChip = (qkey, value, multi) => {
    setAnswers((a) => {
      if (multi) {
        const arr = a[qkey] || [];
        return { ...a, [qkey]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
      }
      return { ...a, [qkey]: a[qkey] === value ? "" : value };
    });
  };

  const overBudget = budgetTotal && (budget.max - budget.min) > budgetTotal * 0.6;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="product-filter-modal">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {meta && <img src={getProductImage(meta.slug)} alt="" className="w-10 h-10 object-contain"/>}
            <h3 className="text-xl font-bold">Personnalise ton <span className="editorial">{meta?.label.toLowerCase()}</span></h3>
          </div>
        </div>

        <div className="space-y-5">
          {questions.map((q) => (
            <div key={q.key}>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#79C1E0] uppercase mb-2.5">{q.label}</p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const isActive = q.multi ? (answers[q.key] || []).includes(opt.value) : answers[q.key] === opt.value;
                  return (
                    <button key={opt.value} type="button" onClick={() => toggleChip(q.key, opt.value, q.multi)}
                      className={`px-4 py-2 rounded-full text-xs border transition ${isActive ? "bg-[#FEC4D2] border-[#FEC4D2] text-neutral-900" : "bg-white border-neutral-200 text-neutral-700 hover:border-[#FEC4D2]"}`}
                      data-testid={`modal-chip-${q.key}-${opt.value}`}
                    >{opt.label}</button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[#79C1E0] uppercase mb-2.5">Fourchette de prix</p>
            <div className="flex items-center gap-2">
              <input type="number" value={budget.min} onChange={(e) => setBudget({ ...budget, min: Number(e.target.value) })} className="w-24 px-3 py-2 border border-neutral-200 rounded-xl text-sm" data-testid="modal-budget-min"/>
              <span className="text-neutral-400">€ →</span>
              <input type="number" value={budget.max} onChange={(e) => setBudget({ ...budget, max: Number(e.target.value) })} className="w-24 px-3 py-2 border border-neutral-200 rounded-xl text-sm" data-testid="modal-budget-max"/>
              <span className="text-neutral-400">€</span>
            </div>
          </div>

          {overBudget && (
            <div className="bg-[#FFF3CD] border border-[#FFC107] rounded-xl p-3 flex gap-2 items-start" data-testid="modal-budget-alert">
              <AlertTriangle size={18} className="text-[#856404] shrink-0 mt-0.5"/>
              <div className="text-xs text-[#856404]">
                <strong>Attention :</strong> Ce budget représente plus de 60% du budget total ({budgetTotal} €).
                <p className="mt-1 text-[#a08016]">Ajuste pour équilibrer ta routine.</p>
              </div>
            </div>
          )}

          <button
            onClick={() => onSave({ answers, budget })}
            className="w-full bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 py-3 rounded-full font-medium transition mt-3"
            data-testid="modal-validate"
          >
            Valider mes préférences →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Routine360Page() {
  const navigate = useNavigate();
  const { user, status } = useAuth();
  const [searchParams] = useSearchParams();
  const probleme = searchParams.get("probleme");
  const problemLabel = SKIN_PROBLEMS.find(p => p.slug === probleme)?.label;

  const [step, setStep] = useState(1); // 0 auth, 1 type, 2 subtype (visage), 2.5 cat-questions, 3 products, 5 recap
  const [authOpen, setAuthOpen] = useState(false);
  const [chosenType, setChosenType] = useState(null);
  const [chosenSub, setChosenSub] = useState(null);
  const [budget, setBudget] = useState({ min: 20, max: 80 });
  const [selected, setSelected] = useState([]);
  const [productConfig, setProductConfig] = useState({}); // { slug: { answers, budget } }
  const [modalSlug, setModalSlug] = useState(null);
  const [catAnswers, setCatAnswers] = useState({});
  const [catQIdx, setCatQIdx] = useState(0);

  // Auto-advance when user logs in
  useEffect(() => {
    if (status === "auth" && step === 0) setStep(1);
  }, [status, step]);

  // === Step 0 — Auth gate ===
  if (status === "loading") {
    return <main className="min-h-screen flex items-center justify-center"><p className="text-neutral-500">Chargement…</p></main>;
  }
  if (false && !user) {
    return (
      <main className="bg-white min-h-screen px-6 py-20 relative" data-testid="routine-step-auth">
        <div className="halo-pink -top-20 -right-20"/>
        <div className="max-w-md mx-auto text-center relative">
          <div className="w-20 h-20 rounded-full bg-[#FEC4D2]/15 mx-auto flex items-center justify-center mb-6">
            <Lock size={36} className="text-[#FEC4D2]"/>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#FEC4D2]">
            Connecte-toi pour <span className="editorial text-neutral-900">créer ta routine</span>
          </h1>
          <p className="mt-3 text-neutral-600">Sauvegarde tes préférences et retrouve tes diagnostics à tout moment.</p>
          <button onClick={() => setAuthOpen(true)} className="mt-8 w-full bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 py-3.5 rounded-full font-medium transition shadow-md" data-testid="open-auth">Se connecter</button>
          <p className="mt-4 text-xs text-neutral-500">Ou crée un compte gratuit en moins de 30 secondes.</p>
          <AuthModal open={authOpen} onOpenChange={setAuthOpen}/>
        </div>
      </main>
    );
  }

  // === Step 1 — Choose type ===
  if (step === 1) {
    const choose = (k) => {
      setChosenType(k);
      setCatQIdx(0);
      setCatAnswers({});
      if (k === "visage") setStep(2);
      else setStep(2.5);
    };
    return (
      <main className="bg-white min-h-screen px-6 py-16 md:py-20 relative" data-testid="routine-step-type">
        <div className="halo-pink -top-20 -right-20"/>
        <div className="halo-blue top-1/2 -left-32"/>
        <div className="max-w-4xl mx-auto relative">
          <h1 className="text-center text-3xl md:text-4xl font-bold text-neutral-900">
            Pour quoi souhaites-tu <span className="editorial text-[#FEC4D2]">créer une routine</span> ?
          </h1>
          {problemLabel && (
            <p className="mt-3 text-center text-sm text-neutral-600">Objectif : <span className="font-semibold">{problemLabel}</span></p>
          )}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {TYPES.map((t) => (
              <button key={t.key} onClick={() => choose(t.key)} className="group bg-white border border-[#FEC4D2]/40 hover:border-[#FEC4D2] rounded-3xl overflow-hidden text-left card-lift transition" data-testid={`type-${t.key}`}>
                <div className="h-56 md:h-64 overflow-hidden bg-neutral-100">
                  <img src={t.image} alt={t.label} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-700"/>
                </div>
                <div className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FEC4D2]/15 flex items-center justify-center shrink-0">
                    <t.Icon/>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t.label}</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">{t.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 relative border-2 border-[#FEC4D2] rounded-3xl p-7 flex items-center gap-5 cursor-pointer card-lift" style={{ background: "linear-gradient(135deg,#FEC4D215,#79C1E015)" }} onClick={() => choose("360")} data-testid="type-360">
            <span className="absolute top-4 right-5 bg-white text-[#8b3a52] text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">Premium</span>
            <img src="/icone/routine-360.png" alt="Routine 360°" className="w-14 h-14 object-contain"/>
            <div className="flex-1">
              <h3 className="text-xl font-bold">Routine 360° <span className="editorial">Complète</span></h3>
              <p className="text-sm text-neutral-600 mt-0.5">Visage + Corps + Cheveux — une expérience unifiée.</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#8b3a52]">3 €</p>
              <p className="text-[10px] text-neutral-500">MOCKED</p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-neutral-500">1 routine gratuite par mois · Routine supplémentaire : 2 €</p>
        </div>
      </main>
    );
  }

  // === Step 2 — Visage sub-choice ===
  if (step === 2 && chosenType === "visage") {
    return (
      <main className="bg-white min-h-screen px-6 py-16 md:py-20 relative" data-testid="routine-step-subtype">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Routine → <span className="text-neutral-900">Visage</span></p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-900">Quel type de routine <span className="editorial text-[#FEC4D2]">visage</span> ?</h1>
          <p className="mt-2 text-neutral-600 mb-10">Choisis le niveau de personnalisation qui te convient.</p>
          <div className="grid md:grid-cols-2 gap-5">
            {VISAGE_SUB.map((s) => (
              <button key={s.key} onClick={() => { setChosenSub(s.key); setStep(2.5); }} className="bg-white border border-[#FEC4D2]/40 hover:border-[#FEC4D2] rounded-3xl p-8 text-center card-lift transition" data-testid={`subtype-${s.key}`}>
                <h3 className="text-xl font-bold mt-2">{s.label}</h3>
                <p className="text-sm text-neutral-500 mt-1">{s.subtitle}</p>
                <p className="text-xs italic text-neutral-400 mt-3">{s.desc}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="mt-8 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900">
            <ChevronLeft size={14}/> Retour
          </button>
        </div>
      </main>
    );
  }

  // === Step 2.5 — Category-specific questions ===
  if (step === 2.5 && chosenType) {
    const questions = getCategoryQuestions(chosenType);
    const q = questions[catQIdx];
    if (!q || questions.length === 0) {
      setStep(3);
      return null;
    }
    const onChange = (v) => setCatAnswers((a) => ({ ...a, [q.key]: v }));
    const onNext = () => {
      if (catQIdx < questions.length - 1) setCatQIdx(catQIdx + 1);
      else setStep(3);
    };
    const onBack = () => {
      if (catQIdx > 0) setCatQIdx(catQIdx - 1);
      else setStep(chosenType === "visage" ? 2 : 1);
    };
    const titles = { visage: "Parle-nous de ta peau", corps: "Parle-nous de ton corps", cheveux: "Parle-nous de tes cheveux", "360": "Parle-nous de toi" };
    return (
      <main className="bg-white min-h-screen px-6 py-12 md:py-16 relative" data-testid="routine-step-catq">
        <div className="halo-pink -top-20 -right-20"/>
        <div className="halo-blue top-1/2 -left-32"/>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0] text-center mb-2">Routine → <span className="text-neutral-900 capitalize">{chosenType === "360" ? "360°" : chosenType}</span></p>
          <h1 className="text-center text-2xl md:text-3xl font-bold text-[#FEC4D2] mb-10">
            {titles[chosenType] || titles.visage} <span className="editorial text-neutral-900">·</span>
          </h1>
          <QuizStep
            question={q}
            value={catAnswers[q.key]}
            onChange={onChange}
            onNext={onNext}
            onBack={onBack}
            index={catQIdx}
            total={questions.length}
            canGoBack={true}
          />
        </div>
      </main>
    );
  }

  // === Step 3 — Products grid ===
  if (step === 3) {
    const sections = chosenType === "360"
      ? ["skincare", "maquillage", "cheveux"]
      : chosenType === "visage"
        ? (chosenSub === "complet" ? ["skincare", "maquillage"] : ["skincare"])
        : chosenType === "corps" ? ["skincare"] // body products are in skincare section
        : chosenType === "cheveux" ? ["cheveux"]
        : ["skincare"];

    // For "corps" route, filter skincare to body-only products
    const items = (sec) => {
      const all = ROUTINE_PRODUCTS.filter((p) => p.section === sec);
      if (chosenType === "corps" && sec === "skincare") {
        return all.filter((p) => ["nettoyant","creme-corps","gommage","huile-visage","creme-solaire","brume"].includes(p.slug) || p.label.toLowerCase().includes("corps") || p.label.toLowerCase().includes("mains") || p.label.toLowerCase().includes("pieds") || p.label.toLowerCase().includes("déo"));
      }
      return all;
    };

    const titleMap = { skincare: "Skincare", maquillage: "Maquillage", cheveux: "Cheveux" };

    const toggle = (slug) => setSelected((arr) => arr.includes(slug) ? arr.filter((x) => x !== slug) : [...arr, slug]);

    return (
      <main className="bg-white min-h-screen px-6 py-12 md:py-16 relative pb-32" data-testid="routine-step-products">
        <div className="halo-pink -top-20 -right-20"/>
        <div className="max-w-5xl mx-auto relative">
          <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Routine → <span className="text-neutral-900 capitalize">{chosenType === "360" ? "360°" : chosenType}</span></p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-900">Choisis tes <span className="editorial text-[#FEC4D2]">produits</span></h1>
          <p className="mt-2 text-neutral-600">Sélectionne minimum 3 produits.</p>

          {/* Budget banner */}
          <div className="mt-6 bg-[#FEC4D2]/10 border border-[#FEC4D2]/40 rounded-2xl px-5 py-4 flex items-center gap-4">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#8b3a52" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6.5" width="18" height="11" rx="2"/><circle cx="12" cy="12" r="2.4"/></svg>
            <div className="flex-1">
              <p className="text-sm font-semibold">Budget total pour ta routine</p>
              <div className="mt-1 flex items-center gap-2">
                <input type="number" value={budget.min} onChange={(e) => setBudget({ ...budget, min: Number(e.target.value) })} className="w-20 px-2 py-1 border border-neutral-200 rounded-lg text-sm" data-testid="budget-min"/>
                <span className="text-neutral-400 text-xs">€ →</span>
                <input type="number" value={budget.max} onChange={(e) => setBudget({ ...budget, max: Number(e.target.value) })} className="w-20 px-2 py-1 border border-neutral-200 rounded-lg text-sm" data-testid="budget-max"/>
                <span className="text-neutral-400 text-xs">€</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Nous répartirons ce budget entre tes produits sélectionnés.</p>
            </div>
          </div>

          {sections.map((sec) => (
            <div key={sec} className="mt-8">
              <h2 className="text-xl font-semibold text-[#79C1E0] mb-4">{titleMap[sec]}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items(sec).map((p) => {
                  const isSel = selected.includes(p.slug);
                  const hasConfig = productConfig[p.slug];
                  return (
                    <div key={p.slug} className={`relative rounded-2xl border-2 p-5 transition ${isSel ? "bg-[#FEC4D2]/15 border-[#FEC4D2]" : "bg-white border-neutral-200 hover:border-[#FEC4D2]"}`}>
                      <button onClick={() => toggle(p.slug)} className="w-full flex flex-col items-center gap-2 text-center" data-testid={`product-tile-${p.slug}`}>
                        {isSel && <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FEC4D2] flex items-center justify-center"><Check size={12} className="text-white"/></span>}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                          <img src={getProductImage(p.slug)} alt={p.label} loading="lazy" className="w-full h-full object-contain p-1"/>
                        </div>
                        <span className="text-sm font-medium text-neutral-800">{p.label}</span>
                      </button>
                      {isSel && (
                        <button onClick={() => setModalSlug(p.slug)} className="mt-2 w-full text-[10px] text-[#79C1E0] hover:underline" data-testid={`personalize-${p.slug}`}>
                          {hasConfig ? "✓ Personnalisé" : "Personnaliser ▾"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Sticky bar */}
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-3xl bg-white border border-[#FEC4D2]/60 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_20px_50px_-20px_rgba(254,196,210,0.7)] z-30" data-testid="sticky-bar">
            <span className="text-sm">
              <span className="font-semibold text-[#FEC4D2]">{selected.length}</span> produit{selected.length > 1 ? "s" : ""} <span className="text-neutral-400">· budget {budget.min}-{budget.max}€</span>
            </span>
            <button disabled={selected.length < 3} onClick={() => setStep(5)} className="bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 text-sm font-medium px-6 py-2 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed" data-testid="routine-continue-products">
              Continuer →
            </button>
          </div>

          <ProductFilterModal
            slug={modalSlug}
            open={!!modalSlug}
            onClose={() => setModalSlug(null)}
            budgetTotal={budget.max}
            onSave={(cfg) => {
              setProductConfig((p) => ({ ...p, [modalSlug]: cfg }));
              setModalSlug(null);
            }}
          />
        </div>
      </main>
    );
  }

  // === Step 5 — Récap ===
  return (
    <main className="bg-white min-h-screen px-6 py-12 md:py-16 relative" data-testid="routine-step-recap">
      <div className="halo-blue top-1/3 -left-32"/>
      <div className="max-w-3xl mx-auto relative">
        <h1 className="text-center text-3xl md:text-4xl font-bold text-neutral-900">Voici ta sélection <span className="editorial text-[#FEC4D2]">✨</span></h1>
        <p className="text-center text-sm text-neutral-500 mt-2">Vérifie tes choix avant de générer ta routine personnalisée.</p>

        <div className="mt-10 bg-white border border-[#FEC4D2]/40 rounded-3xl divide-y divide-neutral-100" data-testid="recap-list">
          {selected.map((slug) => {
            const meta = ROUTINE_PRODUCTS.find((p) => p.slug === slug);
            const cfg = productConfig[slug] || {};
            const tags = [];
            Object.values(cfg.answers || {}).forEach((v) => {
              if (Array.isArray(v)) tags.push(...v); else if (v) tags.push(v);
            });
            return (
              <div key={slug} className="flex items-center gap-5 px-6 py-5" data-testid={`recap-row-${slug}`}>
                <img src={getProductImage(slug)} alt="" className="w-10 h-10 object-contain"/>
                <span className="font-semibold text-sm min-w-[120px]">{meta?.label}</span>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {tags.slice(0, 3).map((t) => <span key={t} className="text-[10px] bg-[#FEC4D2]/40 text-neutral-800 px-2 py-1 rounded-full">{t}</span>)}
                  {tags.length === 0 && <span className="text-xs italic text-neutral-400">Aucune personnalisation</span>}
                </div>
                <button onClick={() => { setStep(3); setModalSlug(slug); }} className="text-[#79C1E0] hover:text-[#0c3d52] transition" aria-label="Modifier" data-testid={`recap-edit-${slug}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4.5l5 5"/><path d="M16 3 4 15v5h5L21 8z"/></svg>
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-[#FEC4D2]/10 border border-[#FEC4D2]/40 rounded-3xl p-6 text-center">
          <p className="text-xs uppercase tracking-wider text-neutral-500">Budget total</p>
          <p className="mt-1 text-3xl font-bold">{budget.min} € — {budget.max} €</p>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate("/resultats-routine", { state: { selected, skinAnswers: catAnswers, productAnswers: Object.fromEntries(Object.entries(productConfig).map(([k, v]) => [k, v.answers || {}])), probleme, chosenType, chosenSub } })}
            className="inline-flex items-center gap-2 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-12 py-4 rounded-full font-semibold transition shadow-lg"
            data-testid="generate-routine"
          >
            <Sparkles size={18}/> Générer ma Routine Personnalisée
          </button>
          <p className="mt-3 text-xs text-neutral-500">Résultats générés en quelques secondes.</p>
        </div>

        <button onClick={() => setStep(3)} className="mt-8 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900">
          <ChevronLeft size={14}/> Modifier ma sélection
        </button>
      </div>
    </main>
  );
}
