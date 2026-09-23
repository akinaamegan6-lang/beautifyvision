import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

const SEND_ICON = "/icone/envoi-picto-newsletter.png";

export default function NewsletterBlock({ compact = false }) {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Merci pour ton inscription ! À très vite dans ta boîte mail.");
    setEmail("");
  };

  if (compact) {
    return (
      <div className="bg-[#FEC4D2]/[0.12] border border-[#FEC4D2]/30 rounded-3xl p-6" data-testid="newsletter-block-compact">
        <div className="flex items-start gap-3">
          <img src={SEND_ICON} alt="" className="w-7 h-7 object-contain shrink-0 mt-0.5"/>
          <h3 className="text-base font-bold text-neutral-900">
            Ne manque <span className="text-[#79C1E0]">aucun conseil beauté</span>
          </h3>
        </div>
        <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
          Inscris-toi à notre newsletter pour recevoir nos derniers articles, nos conseils et nos sélections produits.
        </p>
        <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2" data-testid="newsletter-form-compact">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ton e-mail"
            className="w-full px-4 py-2.5 rounded-full border border-[#FEC4D2]/50 bg-white text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FEC4D2]/50 transition"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-6 py-2.5 rounded-full text-sm font-semibold transition shadow-sm hover:shadow-md"
          >
            S'inscrire <Send size={14}/>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-[#FEC4D2]/[0.12] border border-[#FEC4D2]/30 rounded-[2rem] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6" data-testid="newsletter-block">
      <div className="flex items-start gap-4">
        <img src={SEND_ICON} alt="" className="w-9 h-9 object-contain shrink-0 mt-1"/>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
            Ne manque <span className="text-[#79C1E0]">aucun conseil beauté</span>
          </h2>
          <p className="mt-1.5 text-sm text-neutral-600 max-w-md">
            Inscris-toi à notre newsletter pour recevoir nos derniers articles, nos conseils et nos sélections produits.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2" data-testid="newsletter-form">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ton e-mail"
          className="flex-1 md:w-64 px-5 py-3 rounded-full border border-[#FEC4D2]/50 bg-white text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FEC4D2]/50 transition"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-6 py-3 rounded-full text-sm font-semibold transition shadow-sm hover:shadow-md whitespace-nowrap"
        >
          S'inscrire <Send size={14}/>
        </button>
      </form>
    </div>
  );
}
