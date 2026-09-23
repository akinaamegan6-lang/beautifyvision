import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Sparkles, User, ChevronDown, LogOut } from "lucide-react";
import { api } from "../lib/api";
import { useWishlist } from "../hooks/useWishlist";
import { SKIN_PROBLEMS } from "../data/quizConfig";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

export default function Header() {
  const [categories, setCategories] = useState({});
  const [open, setOpen] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const closeTimer = useRef(null);

  const startCloseTimer = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 200);
  };

  const cancelCloseTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const { count } = useWishlist();
  const { user, logout } = useAuth();
  const loc = useLocation();

  useEffect(() => { setOpen(null); setProfileOpen(false); }, [loc.pathname]);
  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data)).catch(() => setCategories({}));
  }, []);

  const navItems = [
    { key: "visage", label: "Visage" },
    { key: "corps", label: "Corps" },
    { key: "cheveux", label: "Cheveux" },
    { key: "cosmetiques", label: "Cosmétiques" },
    { key: "problemes", label: "Mon problème de peau" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#FEC4D2]/40" data-testid="site-header">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
          <span className="text-2xl font-bold tracking-tight">
            <span style={{ color: "#FEC4D2" }}>Beautify</span>
            <span className="editorial text-[#79C1E0]">Vision</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" onMouseLeave={startCloseTimer}>
          {navItems.map((it) => (
            <div key={it.key} className="relative" onMouseEnter={() => { cancelCloseTimer(); setOpen(it.key); }}>
              <button className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-[#79C1E0] flex items-center gap-1 transition" data-testid={`menu-${it.key}`}>
                {it.label}
                <ChevronDown size={14} className={`transition ${open === it.key ? "rotate-180" : ""}`} />
              </button>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/routine-360" className="hidden md:inline-flex items-center gap-1.5 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-5 py-2.5 rounded-full text-sm font-semibold transition shadow-sm hover:shadow-md" data-testid="routine-360-cta">
            <Sparkles size={14}/> Routine 360°
          </Link>
          <Link to="/wishlist" className="relative p-2 hover:text-[#FEC4D2] transition" data-testid="wishlist-link">
            <Heart size={20} />
            {count > 0 && <span className="absolute -top-1 -right-1 bg-[#FEC4D2] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{count}</span>}
          </Link>
          <div className="relative">
            <button onClick={() => user ? setProfileOpen(!profileOpen) : setAuthOpen(true)} className="p-2 hover:text-[#79C1E0] transition" data-testid="profile-btn" aria-label="Compte">
              <User size={20} />
            </button>
            {user && profileOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-[#FEC4D2]/40 rounded-2xl shadow-xl p-4 w-64 text-left z-50">
                <p className="text-xs uppercase tracking-wider text-neutral-500">Connectée</p>
                <p className="font-semibold text-sm text-neutral-900 mt-1">{user.name || user.email}</p>
                <p className="text-xs text-neutral-500">{user.email}</p>
                <button onClick={() => { logout(); setProfileOpen(false); }} className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2 rounded-full text-sm transition" data-testid="logout-btn">
                  <LogOut size={14}/> Se déconnecter
                </button>
              </div>
            )}
          </div>
          <Link to="/essayage-ia" className="hidden md:inline-flex items-center gap-1.5 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white px-5 py-2.5 rounded-full text-sm font-medium transition shadow-sm hover:shadow-md" data-testid="try-ai-cta">
            <Sparkles size={14}/> Essayer l'IA
          </Link>
          <Link to="/blog" className="hidden lg:inline-flex px-4 py-2 text-sm font-bold text-neutral-900 hover:text-[#FEC4D2] transition" data-testid="menu-blog">
            Blog
          </Link>
        </div>
      </div>

      {/* Mega menu */}
      {open && (
        <div className="absolute left-0 right-0 top-full bg-white border-b border-[#FEC4D2]/40 shadow-[0_30px_60px_-30px_rgba(254,196,210,0.5)] mega-enter"
          onMouseEnter={cancelCloseTimer} onMouseLeave={startCloseTimer} data-testid={`megamenu-${open}`}>
          {open === "problemes" ? (
            <div className="max-w-7xl mx-auto px-8 py-10">
              <h4 className="editorial text-[#79C1E0] text-xl mb-5">Choisis ton problème de peau</h4>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                {SKIN_PROBLEMS.map((p) => (
                  <li key={p.slug}>
                    <Link to={`/probleme/${p.slug}`} className="block py-1.5 text-sm text-neutral-700 hover:text-[#FEC4D2] transition" data-testid={`menu-problem-${p.slug}`}>{p.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : categories[open] ? (
            <div className="max-w-7xl mx-auto px-8 py-10">
              <h4 className="editorial text-[#79C1E0] text-xl mb-5">Produits {categories[open].label.toLowerCase()}</h4>
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
                {categories[open].products.map((p) => (
                  <li key={p.slug}>
                    <Link to={`/quiz/${open}/general/${p.slug}`} className="block py-1.5 text-sm text-neutral-700 hover:text-[#FEC4D2] transition" data-testid={`menu-item-${p.slug}`}>{p.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      <AuthModal open={authOpen} onOpenChange={setAuthOpen}/>
    </header>
  );
}
