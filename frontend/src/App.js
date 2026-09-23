import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";

function AppRouter() {
  const location = useLocation();
  // Synchronous detection of Emergent Google callback (#session_id=...)
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/:categorie/:souscategorie/:produit" element={<QuizProduitPage />} />
        <Route path="/resultats/:produit" element={<ResultatsProduitPage />} />
        <Route path="/routine-360" element={<Routine360Page />} />
        <Route path="/resultats-routine" element={<ResultatsRoutinePage />} />
        <Route path="/essayage-ia" element={<AITryOnPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/probleme/:slug" element={<ProblemeRoutinePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<ArticlePage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
