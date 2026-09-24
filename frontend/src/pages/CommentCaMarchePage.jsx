import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import PageHero from "../components/PageHero";
import Seo from "../components/Seo";

const ARROW_ICON = "/icone/fleche-comment-ca-marche.png";

const STEPS = [
  {
    eyebrow: "CHOISIS TA CATÉGORIE",
    titleBlack: "Commence par la zone",
    titleColor: "qui t'intéresse.",
    description:
      "Visage, corps ou cheveux : sélectionne la catégorie sur laquelle tu veux te concentrer pour recevoir des conseils vraiment ciblés.",
    checklist: [
      "Visage — pour ta peau et ton teint",
      "Corps — pour l'hydratation et le soin",
      "Cheveux — pour ta routine capillaire",
    ],
  },
  {
    eyebrow: "PRÉCISE TON BESOIN",
    titleBlack: "Réponds à quelques",
    titleColor: "questions rapides.",
    description:
      "Type de peau, objectifs, préférences : notre quiz s'adapte à toi pour comprendre exactement ce dont tu as besoin.",
    checklist: [
      "Un quiz rapide, quelques minutes suffisent",
      "Des questions pensées pour être simples et utiles",
      "Aucune donnée revendue à des tiers",
    ],
  },
  {
    eyebrow: "DÉCOUVRE TES RECOS",
    titleBlack: "Reçois une sélection",
    titleColor: "vraiment pour toi.",
    description:
      "Produits et routine personnalisée : on te propose ce qui correspond à ton profil, pas une liste générique.",
    checklist: [
      "Des produits comparés objectivement",
      "Une routine 360° adaptée à ton besoin",
      "Des liens vers les meilleures offres",
    ],
  },
  {
    eyebrow: "ESSAIE & DÉCIDE",
    titleBlack: "Visualise le résultat",
    titleColor: "avant d'acheter.",
    description:
      "Essaie virtuellement certains looks grâce à l'IA, ajoute tes coups de cœur à ta wishlist, puis achète en toute confiance via nos liens partenaires.",
    checklist: [
      "Essayage virtuel propulsé par l'IA",
      "Une wishlist pour garder tes favoris",
      "Des liens d'affiliation transparents",
    ],
  },
];

function StepBlock({ index, step }) {
  const isPink = index % 2 === 0;
  const accent = isPink ? "#FEC4D2" : "#79C1E0";
  const blockBg = isPink ? "bg-[#FEC4D2]/10" : "bg-[#79C1E0]/10";
  const badgeBg = isPink ? "bg-[#FEC4D2]" : "bg-[#79C1E0]";
  const numberLabel = String(index + 1).padStart(2, "0");

  return (
    <div className={`rounded-[2rem] ${blockBg} p-7 sm:p-9`} data-testid={`step-block-${index}`}>
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        <div className="flex-1">
          <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${badgeBg} text-white font-bold text-base mb-5`}>
            {numberLabel}
          </span>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: accent }}>
            {step.eyebrow}
          </p>
          <h3 className="text-2xl sm:text-[1.75rem] font-bold leading-[1.15] text-neutral-900">
            {step.titleBlack} <span className="editorial" style={{ color: accent }}>{step.titleColor}</span>
          </h3>
          <p className="mt-4 text-neutral-600 leading-relaxed max-w-md">{step.description}</p>
        </div>
        <div className="flex-1 flex items-center">
          <ul className="space-y-3 w-full">
            {step.checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-neutral-700">
                <span
                  className="shrink-0 w-5 h-5 rounded-full text-white flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: accent }}
                >
                  <Check size={12} strokeWidth={3}/>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StepConnector({ flip }) {
  return (
    <div className="flex justify-center py-2" aria-hidden="true">
      <img
        src={ARROW_ICON}
        alt=""
        className="h-14 w-auto object-contain"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      />
    </div>
  );
}

export default function CommentCaMarchePage() {
  return (
    <main className="bg-white" data-testid="comment-ca-marche-page">
      <Seo
        title="Comment ça marche | Beautify Vision"
        description="Découvre en 4 étapes comment Beautify Vision t'aide à trouver des produits et une routine beauté vraiment adaptés à toi."
        path="/comment-ca-marche"
      />

      <PageHero
        breadcrumbLabel="Comment ça marche"
        eyebrow="COMMENT ÇA MARCHE ?"
        titleBlack="Des recommandations beauté"
        titleBlue="pensées pour toi, en 4 étapes."
        intro="Beautify Vision analyse ton profil beauté pour te proposer des produits et une routine vraiment adaptés à toi — pas à tout le monde."
        testId="comment-ca-marche-hero"
      />

      <section className="px-6 py-14" data-testid="comment-ca-marche-steps">
        <div className="max-w-4xl mx-auto">
          {STEPS.map((step, i) => (
            <div key={i}>
              <StepBlock index={i} step={step}/>
              {i < STEPS.length - 1 && <StepConnector flip={i % 2 === 1}/>}
            </div>
          ))}
        </div>

        {/* ===== CTA ===== */}
        <div
          className="max-w-4xl mx-auto mt-12 relative rounded-3xl bg-[#FEEFF2] p-8 sm:p-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6"
          data-testid="comment-ca-marche-cta"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#79C1E0] font-semibold">PRÊTE À TE LANCER ?</p>
            <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-neutral-900">
              Découvre ta routine beauté <span className="editorial text-[#79C1E0]">en quelques clics.</span>
            </h3>
            <p className="mt-2 text-sm text-neutral-600 max-w-md">
              Lance le quiz dès maintenant et reçois des recommandations pensées pour toi.
            </p>
          </div>
          <Link
            to="/routine-360"
            className="shrink-0 inline-flex items-center gap-2 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-6 py-3 rounded-full text-sm font-semibold transition"
          >
            Essayer maintenant <ArrowRight size={16}/>
          </Link>
        </div>
      </section>
    </main>
  );
}
