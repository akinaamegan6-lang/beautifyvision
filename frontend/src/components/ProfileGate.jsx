import { useState } from "react";
import { GENDER_OPTIONS, AGE_OPTIONS, getProfile, saveProfile } from "../lib/profile";

function Choice({ options, value, onChange, testid }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`min-h-[56px] min-w-0 px-3 py-3 rounded-2xl border-2 text-center text-[15px] font-medium transition-all [overflow-wrap:anywhere] ${
              active
                ? "bg-[#FEC4D2]/15 border-[#FEC4D2] text-neutral-900 shadow-[0_8px_24px_-12px_rgba(254,196,210,0.6)]"
                : "bg-white border-neutral-200 text-neutral-700 hover:border-[#FEC4D2]"
            } ${opt.value === "non-precise" ? "col-span-2 md:col-span-3 border-dashed text-neutral-500" : ""}`}
            data-testid={`${testid}-${opt.value}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// Entoure un quiz : tant que genre + tranche d'age n'ont pas ete donnes (pour
// cette visite), on les demande avant la 1re question. Une fois repondu, les
// quiz suivants de la meme visite ne les redemandent pas.
export default function ProfileGate({ children }) {
  const [profile, setProfile] = useState(() => getProfile());
  const [gender, setGender] = useState(null);
  const [age, setAge] = useState(null);

  if (profile) return children;

  const ready = gender && age;
  const submit = () => {
    const p = { gender, age_range: age };
    saveProfile(p);
    setProfile(p);
  };

  return (
    <main className="bg-white min-h-screen px-6 py-12 md:py-20 relative" data-testid="profile-gate">
      <div className="halo-pink -top-20 -right-20"/>
      <div className="halo-blue top-1/2 -left-32"/>
      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Avant de commencer</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
            Fais-nous <span className="editorial">connaissance</span>
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            Ces deux réponses nous aident à affiner tes recommandations. Elles restent anonymes : aucun nom, aucun e-mail.
          </p>
        </div>

        <h2 className="text-lg font-semibold text-neutral-900 mb-3">Tu es…</h2>
        <Choice options={GENDER_OPTIONS} value={gender} onChange={setGender} testid="profile-gender"/>

        <h2 className="text-lg font-semibold text-neutral-900 mt-10 mb-3">Ta tranche d'âge</h2>
        <Choice options={AGE_OPTIONS} value={age} onChange={setAge} testid="profile-age"/>

        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={submit}
            disabled={!ready}
            className="inline-flex items-center gap-2 bg-[#79C1E0] hover:bg-[#6ab1d1] text-white px-8 py-3 rounded-full font-medium transition shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            data-testid="profile-continue"
          >
            Continuer →
          </button>
        </div>
      </div>
    </main>
  );
}
