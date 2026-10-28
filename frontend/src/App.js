import "@/App.css";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useLayoutEffect, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import QuizProduitPage from "@/pages/QuizProduitPage";
import ResultatsProduitPage from "@/pages/ResultatsProduitPage";
import Routine360Page from "@/pages/Routine360Page";
import ResultatsRoutinePage from "@/pages/ResultatsRoutinePage";
import AITryOnPage from "@/pages/AITryOnPage";
import WishlistPage from "@/pages/WishlistPage";
import AuthCallback from "@/pages/AuthCallback";
import ProblemeRoutinePage from "@/pages/ProblemeRoutinePage";
import BlogPage from "@/pages/BlogPage";
import ArticlePage from "@/pages/ArticlePage";
import MentionsLegalesPage from "@/pages/legal/MentionsLegalesPage";
import PolitiqueConfidentialitePage from "@/pages/legal/PolitiqueConfidentialitePage";
import CguPage from "@/pages/legal/CguPage";
import CommentCaMarchePage from "@/pages/CommentCaMarchePage";
import ContactPage from "@/pages/ContactPage";
import AdminQuizPage from "@/pages/AdminQuizPage";
import SkinRoutinePage from "@/pages/SkinRoutinePage";
import ProfileGate from "@/components/ProfileGate";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import CookieBanner from "@/components/CookieBanner";
import WelcomeRoutinePopup from "@/components/WelcomeRoutinePopup";
import { installAwinConsentLinks } from "@/lib/consent";

// Remonte en haut de page à chaque changement de route (sauf si on
// revient en arrière/avant dans l'historique au sein d'une même page,
// cf. la navigation question par question du quiz).
function ScrollToTop() {
  const { pathname, search } = useLocation();
  // useLayoutEffect + "instant" : pas d'animation (html a scroll-behavior:smooth)
  // et pas de flash de la nouvelle page à l'ancienne position de scroll.
  // `search` : le quiz change de question via ?q=N sans changer de pathname.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search]);
  return null;
}

function AppRouter() {
  const location = useLocation();
  // Ajoute le choix cookies (cons=0/1) aux liens Awin au moment du clic.
  useEffect(() => installAwinConsentLinks(), []);
  // Synchronous detection of Emergent Google callback (#session_id=...)
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <>
      <Header />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/:categorie/:souscategorie/:produit" element={<ProfileGate><QuizProduitPage /></ProfileGate>} />
        <Route path="/resultats/:produit" element={<ResultatsProduitPage />} />
        <Route path="/routine-360" element={<ProfileGate><Routine360Page /></ProfileGate>} />
        <Route path="/resultats-routine" element={<ResultatsRoutinePage />} />
        <Route path="/essayage-ia" element={<ProfileGate><AITryOnPage /></ProfileGate>} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/probleme/:slug" element={<ProfileGate><ProblemeRoutinePage /></ProfileGate>} />
        <Route path="/routine/:slug" element={<SkinRoutinePage />} />
        <Route path="/admin/quiz" element={<AdminQuizPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<ArticlePage />} />
        <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
        <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialitePage />} />
        <Route path="/cgu" element={<CguPage />} />
        <Route path="/comment-ca-marche" element={<CommentCaMarchePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
      <Footer />
      <WelcomeRoutinePopup />
      <CookieBanner />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRouter />
            <Toaster position="top-right" />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </div>
  );
}

export default App;
