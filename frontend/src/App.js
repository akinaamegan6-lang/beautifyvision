import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import ComparatorPage from "@/pages/ComparatorPage";
import ComparatorHubPage from "@/pages/ComparatorHubPage";
import CategoryHubPage from "@/pages/CategoryHubPage";
import AITryOnPage from "@/pages/AITryOnPage";
import WishlistPage from "@/pages/WishlistPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/comparateur" element={<ComparatorHubPage />} />
          <Route path="/categorie/:section" element={<CategoryHubPage />} />
          <Route path="/comparateur/:slug" element={<ComparatorPage />} />
          <Route path="/essayage-ia" element={<AITryOnPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Routes>
        <Footer />
        <Toaster position="top-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;
