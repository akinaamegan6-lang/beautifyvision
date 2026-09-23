import { Instagram, Twitter, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#FEC4D2]/40 mt-24" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <span className="text-2xl font-bold tracking-tight">
            <span style={{ color: "#FEC4D2" }}>Beautify</span>
            <span className="editorial text-[#79C1E0]">Vision</span>
          </span>
          <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
            Le comparateur beauté <span className="editorial text-[#79C1E0]">intelligent</span> qui te ressemble.
            Trouve, essaie, décide.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[#79C1E0] mb-4">À propos</h4>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li><Link to="/" className="hover:text-[#FEC4D2]">L'équipe</Link></li>
            <li><Link to="/" className="hover:text-[#FEC4D2]">Comment ça marche</Link></li>
            <li><Link to="/" className="hover:text-[#FEC4D2]">Affiliation</Link></li>
            <li><Link to="/" className="hover:text-[#FEC4D2]">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[#79C1E0] mb-4">Légal</h4>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li><Link to="/" className="hover:text-[#FEC4D2]">CGU</Link></li>
            <li><Link to="/" className="hover:text-[#FEC4D2]">Politique de confidentialité</Link></li>
            <li><Link to="/" className="hover:text-[#FEC4D2]">Mentions légales</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[#79C1E0] mb-4">Suis-nous</h4>
          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 rounded-full border border-[#FEC4D2] flex items-center justify-center text-[#FEC4D2] hover:bg-[#FEC4D2] hover:text-white transition" aria-label="Instagram"><Instagram size={16}/></a>
            <a href="#" className="w-10 h-10 rounded-full border border-[#79C1E0] flex items-center justify-center text-[#79C1E0] hover:bg-[#79C1E0] hover:text-white transition" aria-label="Twitter"><Twitter size={16}/></a>
          </div>
          <Link to="/essayage-ia" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#79C1E0] hover:underline">
            <Sparkles size={14}/> Essayer l'IA
          </Link>
        </div>
      </div>
      <div className="border-t border-neutral-100">
        <p className="max-w-7xl mx-auto px-6 py-6 text-xs text-neutral-500">
          © {new Date().getFullYear()} BeautifyVision · Les liens vers les marques partenaires sont des liens d'affiliation.
        </p>
      </div>
    </footer>
  );
}
