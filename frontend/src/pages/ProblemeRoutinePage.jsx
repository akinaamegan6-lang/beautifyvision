import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Sparkles, ArrowRight } from "lucide-react";
import { api } from "../lib/api";
import { SKIN_PROBLEMS, getProblemQuestions } from "../data/quizConfig";
import { rankProducts } from "../lib/scoring";
import QuizStep from "../components/QuizStep";
import ProductRecommendationCard from "../components/ProductRecommendationCard";
import HorizontalProductCard from "../components/HorizontalProductCard";

const VISAGE_ZONES = [
  "Front", "Joues", "Nez", "Menton", "Contour des yeux",
  "Contour des lèvres", "Tout le visage", "Peu importe / Je ne sais pas",
];
const CORPS_ZONES = [
  "Dos", "Bras", "Jambes", "Ventre", "Décolleté",
  "Mains", "Pieds", "Aisselles", "Tout le corps", "Peu importe / Je ne sais pas",
];

const ZONE_OPTS = [
  { value: "visage", label: "Visage" },
  { value: "corps", label: "Corps" },
  { value: "les-deux", label: "Les deux" },
];

export default function ProblemeRoutinePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { questions: problemQs, disclaimer } = getProblemQuestions(slug);
  const problem = SKIN_PROBLEMS.find((p) => p.slug === slug);

  // stage 0=zone, 1=zones précises, 2=questions, 3=résultats
  const [stage, setStage] = useState(0);
  const [zone, setZone] = useState(null);
  const [zonesPrecises, setZonesPrecises] = useState([]);
  const [problemAnswers, setProblemAnswers] = useState({});
  const [qIdx, setQIdx] = useState(0);
  const [ranked, setRanked] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ref so the fetch always reads the latest answers regardless of closure timing
  const answersRef = useRef({});

  const totalSteps = 2 + problemQs.length;
  const currentStep = stage <= 1 ? stage : stage === 2 ? 2 + qIdx : totalSteps;

  const doFetch = (selectedZone) => {
    setLoading(true);
    const parents = selectedZone === "les-deux" ? ["visage", "corps"] : [selectedZone];
    Promise.all(
      parents.map((p) => api.get("/products", { params: { parent: p } }).then((r) => r.data || []))
    )
      .then((results) => {
        const all = results.flat();
        const answers = { problem: slug, product_answers: answersRef.current };
        setRanked(rankProducts(all, answers, slug));
      })
      .finally(() => setLoading(false));
  };

  const handleZoneSelect = (v) => {
    setZone(v);
    setTimeout(() => setStage(1), 200);
  };

  const toggleZonePrecise = (z) => {
    setZonesPrecises((prev) => (prev.includes(z) ? prev.filter((x) => x !== z) : [...prev, z]));
  };

  const handleNextZonesPrecises = () => {
    if (problemQs.length === 0) {
      setStage(3);
      doFetch(zone);
    } else {
      setStage(2);
    }
  };

  const handleProblemAnswer = (val) => {
    const q = problemQs[qIdx];
    const next = { ...answersRef.current, [q.key]: val };
    answersRef.current = next;
    setProblemAnswers(next);
  };

  const handleProblemNext = () => {
    if (qIdx < problemQs.length - 1) {
      setQIdx((i) => i + 1);
    } else {
      setStage(3);
      doFetch(zone);
    }
  };

  const handleBack = () => {
    if (stage === 1) { setStage(0); setZonesPrecises([]); }
    else if (stage === 2 && qIdx === 0) { setStage(1); }
    else if (stage === 2) { setQIdx((i) => i - 1); }
    else if (stage === 3) {
      setRanked([]);
      if (problemQs.length > 0) { setStage(2); setQIdx(problemQs.length - 1); }
      else setStage(1);
    }
  };

  const renderProgress = () => {
    if (stage === 3) return null;
    const pct = Math.round(((currentStep + 1) / totalSteps) * 100);
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3 text-sm text-neutral-500">
          <span>Étape {currentStep + 1} sur {totalSteps}</span>
          <span className="font-medium text-[#79C1E0]">{pct}%</span>
        </div>
        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FEC4D2] to-[#79C1E0] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <main className="bg-white min-h-screen px-6 py-12 md:py-20 relative" data-testid="probleme-routine-page">
      <div className="halo-pink -top-20 -right-20" />
      <div className="halo-blue top-1/2 -left-32" />

      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Mon problème de peau</p>
          <h1 className="mt-2 text-2xl md:text-3xl font-bold">
            <span className="editorial text-neutral-900">{problem?.label || slug}</span>
          </h1>
        </div>

        {/* Étape 0 : Zone principale */}
        {stage === 0 && (
          <div data-testid="step-zone">
            {renderProgress()}
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 text-center leading-tight">
              Quelle zone est concernée ?
            </h2>
            <div className="mt-12 grid grid-cols-3 gap-4">
              {ZONE_OPTS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleZoneSelect(opt.value)}
                  className={`min-h-[80px] px-5 py-6 rounded-2xl border-2 text-center transition-all ${
                    zone === opt.value
                      ? "bg-[#FEC4D2]/15 border-[#FEC4D2] text-neutral-900 shadow-[0_8px_24px_-12px_rgba(254,196,210,0.6)]"
                      : "bg-white border-neutral-200 text-neutral-700 hover:border-[#FEC4D2]"
                  }`}
                  data-testid={`zone-option-${opt.value}`}
                >
                  <span className="text-base font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 1 : Zones précises */}
        {stage === 1 && (
          <div data-testid="step-zones-precises">
            {renderProgress()}
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 text-center leading-tight">
              Quelles zones précisément ?
            </h2>
            <p className="mt-2 text-sm text-center text-neutral-500">Tu peux choisir plusieurs options</p>

            {(zone === "visage" || zone === "les-deux") && (
              <div className="mt-10">
                {zone === "les-deux" && (
                  <p className="text-xs uppercase tracking-wider text-[#79C1E0] font-semibold mb-4">Visage</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {VISAGE_ZONES.map((z) => (
                    <button
                      key={z}
                      onClick={() => toggleZonePrecise(z)}
                      className={`min-h-[56px] px-3 py-3 rounded-2xl border-2 text-left transition-all ${
                        zonesPrecises.includes(z)
                          ? "bg-[#FEC4D2]/15 border-[#FEC4D2] text-neutral-900"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-[#FEC4D2]"
                      }`}
                      data-testid={`zone-precise-${z.toLowerCase().replace(/[\s/]+/g, "-")}`}
                    >
                      <span className="text-sm font-medium">{z}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {zone === "les-deux" && <div className="border-t border-neutral-100 my-8" />}

            {(zone === "corps" || zone === "les-deux") && (
              <div className={zone === "les-deux" ? "" : "mt-10"}>
                {zone === "les-deux" && (
                  <p className="text-xs uppercase tracking-wider text-[#79C1E0] font-semibold mb-4">Corps</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CORPS_ZONES.map((z) => (
                    <button
                      key={z}
                      onClick={() => toggleZonePrecise(z)}
                      className={`min-h-[56px] px-3 py-3 rounded-2xl border-2 text-left transition-all ${
                        zonesPrecises.includes(z)
                          ? "bg-[#FEC4D2]/15 border-[#FEC4D2] text-neutral-900"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-[#FEC4D2]"
                      }`}
                      data-testid={`zone-precise-${z.toLowerCase().replace(/[\s/]+/g, "-")}`}
                    >
                      <span className="text-sm font-medium">{z}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 flex items-center justify-between">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition"
                data-testid="zones-precises-back"
              >
                <ChevronLeft size={16} /> Précédent
              </button>
              <button
                onClick={handleNextZonesPrecises}
                className="inline-flex items-center gap-2 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white px-8 py-3 rounded-full font-medium transition shadow-md hover:shadow-lg"
                data-testid="zones-precises-next"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* Étape 2 : Questions spécifiques au problème */}
        {stage === 2 && problemQs.length > 0 && (
          <div data-testid="step-problem-questions">
            {disclaimer && (
              <div className="mb-8 px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm text-neutral-600 leading-relaxed">
                <span className="mr-1.5">⚕️</span>{disclaimer}
              </div>
            )}
            <QuizStep
              question={problemQs[qIdx]}
              value={problemAnswers[problemQs[qIdx].key]}
              onChange={handleProblemAnswer}
              onNext={handleProblemNext}
              onBack={handleBack}
              index={currentStep}
              total={totalSteps}
              canGoBack={true}
            />
          </div>
        )}

        {/* Étape 3 : Résultats */}
        {stage === 3 && (
          <div data-testid="step-results">
            {loading ? (
              <p className="text-center py-20 text-neutral-500">Chargement de tes recommandations…</p>
            ) : ranked.length === 0 ? (
              <p className="text-center py-20 text-neutral-500">Aucun résultat trouvé.</p>
            ) : (
              <>
                <div className="text-center mb-10">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Ta recommandation</p>
                  <h2 className="mt-2 text-4xl md:text-5xl font-bold">
                    Ton <span className="editorial text-neutral-900">match parfait</span>
                  </h2>
                  <p className="mt-3 text-neutral-600">
                    Les produits les mieux adaptés à ton problème de peau.
                  </p>
                </div>

                <ProductRecommendationCard
                  product={ranked[0]}
                  badge={`Recommandé · ${problem?.label || slug}`}
                />

                {ranked.slice(1, 7).length > 0 && (
                  <section className="mt-12">
                    <h3 className="text-xl md:text-2xl font-semibold text-[#79C1E0] mb-6">
                      D'autres produits qui te correspondent
                    </h3>
                    <div className="grid grid-cols-1 gap-5">
                      {ranked.slice(1, 7).map((p) => (
                        <div key={p.id} className="relative">
                          <span className="absolute top-4 right-4 z-10 bg-white border border-[#FEC4D2] text-[#FEC4D2] text-xs font-bold px-3 py-1.5 rounded-full">
                            {p._score}%
                          </span>
                          <HorizontalProductCard product={p} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <div
                  className="mt-12 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #FEC4D2 0%, #79C1E0 100%)" }}
                  data-testid="banner-routine-360"
                >
                  <Sparkles size={32} className="text-white/90 mx-auto" />
                  <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white">
                    Tu veux une routine beauté <span className="editorial">complète</span> ?
                  </h2>
                  <p className="mt-4 text-white/90 max-w-xl mx-auto">
                    Réponds à quelques questions supplémentaires et reçois ta Routine 360° personnalisée.
                  </p>
                  <button
                    onClick={() => navigate("/routine-360")}
                    className="mt-8 inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 px-8 py-4 rounded-full font-medium transition shadow-lg"
                    data-testid="cta-routine-360"
                  >
                    Créer ma Routine 360° <ArrowRight size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
