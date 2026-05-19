import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Sparkles, User, ChevronDown, X, Menu } from "lucide-react";
import { api } from "../lib/api";
import { useWishlist } from "../hooks/useWishlist";

export default function Header() {
  const [categories, setCategories] = useState({});
  const [open, setOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const { count } = useWishlist();
  const loc = useLocation();

  useEffect(() => {
    setOpen(null);
    setMobileOpen(false);
    setMobileExpanded(null);
  }, [loc.pathname]);

  useEffect(() => {
    api.get("/categories").then(r => setCategories(r.data)).catch(() => setCategories({}));
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeTimer = useRef(null);
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setOpen(null), 150); };
  const cancelClose  = () => { clearTimeout(closeTimer.current); };

  const sections = ["visage", "corps", "cosmetiques"];

  const toggleMobileSection = (k) =>
    setMobileExpanded((prev) => (prev === k ? null : k));

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#FEC4D2]/40"
        data-testid="site-header"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <span className="text-2xl font-bold tracking-tight">
              <span style={{ color: "#FEC4D2" }}>Beautify</span>
              <span className="editorial text-[#79C1E0]">Vision</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" onMouseLeave={scheduleClose}>
            {sections.map((k) => (
              <div key={k} className="relative" onMouseEnter={() => { cancelClose(); setOpen(k); }}>
                <button
                  className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-[#79C1E0] flex items-center gap-1 transition"
                  data-testid={`menu-${k}`}
                >
                  {categories[k]?.label || k}
                  <ChevronDown size={14} className={`transition ${open === k ? "rotate-180" : ""}`} />
                </button>
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link to="/wishlist" className="relative p-2 hover:text-[#FEC4D2] transition" data-testid="wishlist-link">
              <Heart size={20} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FEC4D2] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <button className="p-2 hover:text-[#79C1E0] transition hidden lg:block" data-testid="profile-btn" aria-label="Compte">
              <User size={20} />
            </button>
            <Link
              to="/essayage-ia"
              className="hidden lg:inline-flex items-center gap-2 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white px-5 py-2.5 rounded-full text-sm font-medium transition shadow-sm hover:shadow-md"
              data-testid="try-ai-cta"
            >
              <Sparkles size={16} /> Essayer l'IA
            </Link>

            {/* Burger button — mobile only */}
            <button
              className="lg:hidden p-2 text-neutral-700 hover:text-[#FEC4D2] transition"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
              data-testid="burger-btn"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Desktop mega menu */}
        {open && categories[open] && (
          <div
            className="absolute left-0 right-0 top-full bg-white border-b border-[#FEC4D2]/40 shadow-[0_30px_60px_-30px_rgba(254,196,210,0.5)] mega-enter"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            data-testid={`megamenu-${open}`}
          >
            <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 className="editorial text-[#79C1E0] text-xl mb-5">Produits {categories[open].label.toLowerCase()}</h4>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {categories[open].products.map((p) => (
                    <li key={p.slug}>
                      <Link
                        to={`/comparateur/${p.slug}`}
                        className="block py-1.5 text-sm text-neutral-700 hover:text-[#FEC4D2] transition"
                        data-testid={`menu-item-${p.slug}`}
                      >
                        {p.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {categories[open].problems?.length > 0 && (
                <div>
                  <h4 className="editorial text-[#79C1E0] text-xl mb-5">Mon problème de peau</h4>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {categories[open].problems.map((p) => (
                      <li key={p.slug}>
                        <Link
                          to={`/comparateur/${p.slug}`}
                          className="block py-1.5 text-sm text-neutral-700 hover:text-[#FEC4D2] transition"
                          data-testid={`menu-problem-${p.slug}`}
                        >
                          {p.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="max-w-7xl mx-auto px-8 pb-6">
              <Link
                to={`/categorie/${open}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#FEC4D2] hover:text-[#fdb2c3] transition"
                data-testid={`menu-see-all-${open}`}
              >
                Voir tout →
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────────────────────── */}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="mobile-drawer"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#FEC4D2]/40">
          <span className="text-xl font-bold tracking-tight">
            <span style={{ color: "#FEC4D2" }}>Beautify</span>
            <span className="editorial text-[#79C1E0]">Vision</span>
          </span>
          <button
            className="p-2 text-neutral-500 hover:text-[#FEC4D2] transition rounded-full hover:bg-[#FEC4D2]/10"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
            data-testid="close-mobile-menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer body — scrollable */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          {sections.map((k) => {
            const cat = categories[k];
            if (!cat) return null;
            const isExpanded = mobileExpanded === k;

            return (
              <div key={k} className="mb-1">
                {/* Section toggle */}
                <button
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left text-neutral-800 font-semibold hover:bg-[#FEC4D2]/10 transition"
                  onClick={() => toggleMobileSection(k)}
                  data-testid={`mobile-section-${k}`}
                >
                  <span>{cat.label}</span>
                  <ChevronDown
                    size={18}
                    className={`text-[#79C1E0] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Expandable content */}
                {isExpanded && (
                  <div className="mt-1 mb-3 pl-4 pr-2 space-y-4">
                    {/* Products */}
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#79C1E0] px-2 mb-2">
                        Produits
                      </p>
                      <ul className="space-y-0.5">
                        {cat.products.map((p) => (
                          <li key={p.slug}>
                            <Link
                              to={`/comparateur/${p.slug}`}
                              className="block px-3 py-2 rounded-xl text-sm text-neutral-700 hover:text-[#FEC4D2] hover:bg-[#FEC4D2]/8 transition"
                              data-testid={`mobile-item-${p.slug}`}
                            >
                              {p.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Problems */}
                    {cat.problems?.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-[#79C1E0] px-2 mb-2">
                          Mon problème de peau
                        </p>
                        <ul className="space-y-0.5">
                          {cat.problems.map((p) => (
                            <li key={p.slug}>
                              <Link
                                to={`/comparateur/${p.slug}`}
                                className="block px-3 py-2 rounded-xl text-sm text-neutral-700 hover:text-[#FEC4D2] hover:bg-[#FEC4D2]/8 transition"
                                data-testid={`mobile-problem-${p.slug}`}
                              >
                                {p.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Link
                      to={`/categorie/${k}`}
                      className="inline-flex items-center gap-1 px-3 text-xs font-medium text-[#FEC4D2] hover:text-[#fdb2c3] transition"
                    >
                      Voir tout →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className="px-6 py-6 border-t border-[#FEC4D2]/40 space-y-3">
          <Link
            to="/essayage-ia"
            className="flex items-center justify-center gap-2 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white px-5 py-3.5 rounded-full text-sm font-medium transition shadow-sm w-full"
            data-testid="mobile-try-ai-cta"
          >
            <Sparkles size={16} /> Essayer l'IA
          </Link>
          <Link
            to="/wishlist"
            className="flex items-center justify-center gap-2 border border-[#FEC4D2]/60 hover:border-[#FEC4D2] text-neutral-700 hover:text-[#FEC4D2] px-5 py-3 rounded-full text-sm font-medium transition w-full"
          >
            <Heart size={16} /> Ma wishlist {count > 0 && `(${count})`}
          </Link>
        </div>
      </div>
    </>
  );
}
