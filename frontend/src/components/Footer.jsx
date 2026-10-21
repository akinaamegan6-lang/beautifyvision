import { Instagram, Facebook, Youtube, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { openCookieSettings } from "../lib/consent";

// Icône TikTok (lucide-react n'en fournit pas) — même style trait que les autres icônes.
function TikTokIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/beautify_vision_fr", Icon: Instagram, color: "#FEC4D2" },
  { label: "Facebook", href: "https://www.facebook.com/share/19gtdCAoGJ/", Icon: Facebook, color: "#79C1E0" },
  { label: "TikTok", href: "https://www.tiktok.com/@beautify.vision", Icon: TikTokIcon, color: "#FEC4D2" },
  { label: "YouTube", href: "https://youtube.com/@beautifyvision", Icon: Youtube, color: "#79C1E0" },
];

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
            <li><Link to="/comment-ca-marche" className="hover:text-[#FEC4D2]">Comment ça marche</Link></li>
            <li><Link to="/contact" className="hover:text-[#FEC4D2]">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[#79C1E0] mb-4">Légal</h4>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li><Link to="/cgu" className="hover:text-[#FEC4D2]">CGU</Link></li>
            <li><Link to="/politique-de-confidentialite" className="hover:text-[#FEC4D2]">Politique de confidentialité</Link></li>
            <li><Link to="/mentions-legales" className="hover:text-[#FEC4D2]">Mentions légales</Link></li>
            <li><button type="button" onClick={openCookieSettings} className="hover:text-[#FEC4D2]" data-testid="manage-cookies">Gérer mes cookies</button></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[#79C1E0] mb-4">Suis-nous</h4>
          <div className="flex flex-wrap gap-3">
            {SOCIALS.map(({ label, href, Icon, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="w-10 h-10 rounded-full border flex items-center justify-center transition hover:text-white"
                style={{ borderColor: color, color }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = color; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ""; e.currentTarget.style.color = color; }}
                data-testid={`social-${label.toLowerCase()}`}
              >
                <Icon size={16} />
              </a>
            ))}
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
