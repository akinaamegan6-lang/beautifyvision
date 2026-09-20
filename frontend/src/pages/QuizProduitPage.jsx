import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuizStep from "../components/QuizStep";
import { getQuestionsForProduct, SKIN_ANSWER_KEYS } from "../data/quizConfig";

export default function QuizProduitPage() {
  const navigate = useNavigate();
  const { categorie, souscategorie, produit } = useParams();
  const allQuestions = getQuestionsForProduct(categorie, produit);
  const [currentIdx, setCurrentIdx] = useState(0);
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

  const next = () => {
    if (currentIdx < allQuestions.length - 1) setCurrentIdx(currentIdx + 1);
    else navigate(`/resultats/${produit}`, { state: { answers, categorie, souscategorie } });
  };
  const back = () => currentIdx > 0 && setCurrentIdx(currentIdx - 1);

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
