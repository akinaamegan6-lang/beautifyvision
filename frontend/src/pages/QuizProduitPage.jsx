import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import QuizStep from "../components/QuizStep";
import { getQuestionsForProduct, SKIN_ANSWER_KEYS } from "../data/quizConfig";

function QuizProduitInner({ categorie, souscategorie, produit }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const allQuestions = getQuestionsForProduct(categorie, produit);

  const rawIdx = parseInt(searchParams.get("q") || "0", 10);
  const currentIdx = Number.isNaN(rawIdx) ? 0 : Math.min(Math.max(rawIdx, 0), allQuestions.length - 1);

  const [answers, setAnswers] = useState({ product_answers: {} });

  const q = allQuestions[currentIdx];
  const isProductQ = !SKIN_ANSWER_KEYS.has(q.key);
  const value = isProductQ ? answers.product_answers[q.key] : answers[q.key];

  const setValue = (v) => {
    if (isProductQ) {
      setAnswers((a) => ({ ...a, product_answers: { ...a.product_answers, [q.key]: v } }));
    } else {
      setAnswers((a) => ({ ...a, [q.key]: v }));
    }
  };

  // On avance, on empile une entrée d'historique (une par question) : le
  // bouton retour du navigateur revient ainsi question par question.
  const goToIndex = (idx) => {
    const next = new URLSearchParams(searchParams);
    next.set("q", String(idx));
    setSearchParams(next);
  };

  const next = () => {
    if (currentIdx < allQuestions.length - 1) goToIndex(currentIdx + 1);
    else navigate(`/resultats/${produit}`, { state: { answers, categorie, souscategorie } });
  };
  // On réutilise l'historique natif plutôt que d'empiler une nouvelle entrée,
  // pour rester cohérent avec le bouton retour du navigateur.
  const back = () => {
    if (currentIdx > 0) navigate(-1);
  };

  return (
    <main className="bg-white min-h-screen px-6 py-12 md:py-20 relative" data-testid="quiz-page">
      <div className="halo-pink -top-20 -right-20"/>
      <div className="halo-blue top-1/2 -left-32"/>
      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Quiz · Trouve ton produit</p>
          <h1 className="mt-2 text-2xl md:text-3xl font-bold text-[#FEC4D2] capitalize">
            <span className="editorial text-neutral-900">{produit.replace(/-/g, " ")}</span>
          </h1>
        </div>
        <QuizStep
          question={q}
          value={value}
          onChange={setValue}
          onNext={next}
          onBack={back}
          index={currentIdx}
          total={allQuestions.length}
          canGoBack={currentIdx > 0}
        />
      </div>
    </main>
  );
}

export default function QuizProduitPage() {
  const { categorie, souscategorie, produit } = useParams();
  // La clé force un remontage complet (et donc une réinitialisation de la
  // question courante et des réponses) chaque fois qu'on change de
  // catégorie/sous-catégorie/produit en pleine navigation (ex: via le menu).
  return (
    <QuizProduitInner
      key={`${categorie}/${souscategorie}/${produit}`}
      categorie={categorie}
      souscategorie={souscategorie}
      produit={produit}
    />
  );
}
