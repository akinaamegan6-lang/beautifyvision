import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import PageHero from "../components/PageHero";
import Seo from "../components/Seo";
import { CONTACT_EMAIL } from "../data/legalContent";

const OBJETS = [
  "Question générale",
  "Partenariat / collaboration",
  "Signaler un problème",
  "Autre",
];

const inputClass =
  "w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-white text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#79C1E0]/40 focus:border-[#79C1E0] transition";

export default function ContactPage() {
  const [form, setForm] = useState({ prenom: "", nom: "", objet: OBJETS[0], message: "" });

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.prenom.trim() || !form.nom.trim() || !form.message.trim()) return;
    toast.success("Ton message a bien été pris en compte, merci ! On te répond au plus vite.");
    setForm({ prenom: "", nom: "", objet: OBJETS[0], message: "" });
  };

  return (
    <main className="bg-white" data-testid="contact-page">
      <Seo
        title="Contact | Beautify Vision"
        description="Une question, une suggestion ou envie de collaborer ? Contacte l'équipe Beautify Vision via notre formulaire."
        path="/contact"
      />

      <PageHero
        breadcrumbLabel="Contact"
        titleBlack="Une question ?"
        titleBlue="Écris-nous."
        intro="Que ce soit pour une suggestion, un partenariat ou un souci technique, l'équipe Beautify Vision te répond avec plaisir."
        testId="contact-hero"
      />

      <section className="px-6 py-14" data-testid="contact-form-section">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="contact-prenom" className="block text-sm font-semibold text-neutral-800 mb-2">
                  Prénom
                </label>
                <input
                  id="contact-prenom"
                  type="text"
                  required
                  value={form.prenom}
                  onChange={update("prenom")}
                  placeholder="Ton prénom"
                  className={inputClass}
                  data-testid="contact-input-prenom"
                />
              </div>
              <div>
                <label htmlFor="contact-nom" className="block text-sm font-semibold text-neutral-800 mb-2">
                  Nom
                </label>
                <input
                  id="contact-nom"
                  type="text"
                  required
                  value={form.nom}
                  onChange={update("nom")}
                  placeholder="Ton nom"
                  className={inputClass}
                  data-testid="contact-input-nom"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-objet" className="block text-sm font-semibold text-neutral-800 mb-2">
                Objet de la demande
              </label>
              <select
                id="contact-objet"
                value={form.objet}
                onChange={update("objet")}
                className={`${inputClass} appearance-none`}
                data-testid="contact-input-objet"
              >
                {OBJETS.map((objet) => (
                  <option key={objet} value={objet}>{objet}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-sm font-semibold text-neutral-800 mb-2">
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={6}
                value={form.message}
                onChange={update("message")}
                placeholder="Écris ton message ici..."
                className={`${inputClass} resize-none`}
                data-testid="contact-input-message"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-6 py-3 rounded-full text-sm font-semibold transition shadow-sm hover:shadow-md"
              data-testid="contact-submit"
            >
              Envoyer le message <Send size={16}/>
            </button>

            <p className="text-xs text-neutral-500 pt-1">
              Tu peux aussi nous écrire directement à{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#79C1E0] hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
