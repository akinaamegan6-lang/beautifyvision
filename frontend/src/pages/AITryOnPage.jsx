import { useRef, useState, useEffect } from "react";
import { Upload, Sparkles, RefreshCw, Save, Share2, ImagePlus } from "lucide-react";
import { Slider } from "../components/ui/slider";
import { Textarea } from "../components/ui/textarea";
import { api } from "../lib/api";
import { trackQuiz } from "../lib/trackQuiz";
import { applyMakeup, detectZonePositions } from "../lib/faceMakeup";
import { PRESET_LOOKS } from "../data/criteria";
import ProductCard from "../components/ProductCard";
import { toast } from "sonner";

const LOADER_STEPS = [
  "Sélection des produits les plus adaptés…",
  "Analyse de votre visage en cours…",
  "Application du maquillage…",
];

// ── Undertone / preset keyword maps ─────────────────────────────────────────
const UNDERTONE_KWS = {
  warm:    ["terracotta", "cuivré", "doré", "pêche", "orangé", "coral", "champagne", "rosewood"],
  cool:    ["prune", "mauve", "rosé", "rose", "framboise", "lilas", "argenté", "violet", "plum"],
  neutral: ["nude", "naturel", "translucide", "lumineux", "honey"],
};
const PRESET_KWS = {
  natural:     ["naturel", "nude", "éclat", "bonne mine"],
  terracotta:  ["terracotta", "orangé", "cuivré", "pêche", "coral"],
  nude:        ["nude", "naturel", "rosewood", "honey"],
  "lips-bold": ["rouge", "intense", "mat", "velvet", "prune", "bold"],
  smoky:       ["smoky", "noir", "mat", "shimmer", "dark", "night"],
  fresh:       ["naturel", "pêche", "éclat", "bonne mine", "rose"],
  plum:        ["prune", "mauve", "violet", "lilas", "plum"],
};
const PROMPT_DICT = [
  "terracotta", "nude", "smoky", "rouge", "prune", "mauve", "rose",
  "naturel", "mat", "doré", "champagne", "pêche", "orangé", "violet", "shimmer",
];

// Libellé français des zones (message « aucun produit dans cette teinte »)
const ZONE_LABEL_FR = {
  lips: "Lèvres", cheeks: "Joues", liner: "Eyeliner", lashes: "Cils", brows: "Sourcils",
};

async function selectProducts({ undertone, budgetMax, presetId, prompt, skinToneHex }) {
  // Vraie selection IA (Claude) cote backend. Si la cle ANTHROPIC_API_KEY
  // n'est pas configuree (ou que l'appel echoue pour une autre raison), on
  // retombe sur l'heuristique locale ci-dessous pour que la page reste
  // utilisable pendant la mise en place des cles API.
  try {
    const { data } = await api.post("/ai/select-products", {
      prompt,
      skin_tone_hex: skinToneHex || "#E2BFA0",
      undertone,
      budget_max: budgetMax || 200,
    });
    return { products: data.products, outOfBudget: data.out_of_budget || [], summary: data.summary, unmatched: data.unmatched || [] };
  } catch (err) {
    console.warn("Selection IA (backend) indisponible, repli sur la selection locale :", err);
  }

  const res = await api.get("/products", { params: { parent: "cosmetiques" } });
  const products = (res.data || []).filter((p) => !budgetMax || p.price <= budgetMax);

  // Group by zone
  const byZone = {};
  for (const p of products) {
    if (!p.zone) continue;
    if (!byZone[p.zone]) byZone[p.zone] = [];
    byZone[p.zone].push(p);
  }

  // Combined keywords: undertone + preset + free-text
  const keywords = new Set([
    ...(UNDERTONE_KWS[undertone] || UNDERTONE_KWS.neutral),
    ...(PRESET_KWS[presetId] || []),
    ...PROMPT_DICT.filter((kw) => prompt.toLowerCase().includes(kw)),
  ]);

  const selected = [];
  for (const [zone, zonePros] of Object.entries(byZone)) {
    const scored = zonePros.map((p) => {
      const text = [...(p.tags || []), ...(p.benefits || []), p.name].join(" ").toLowerCase();
      const score = [...keywords].filter((kw) => text.includes(kw)).length;
      return { ...p, _ks: score };
    });
    scored.sort((a, b) => b._ks - a._ks || b.rating - a.rating);
    const best = scored[0];
    if (best) {
      selected.push({
        product_id: best.id,
        zone,
        color_hex: best.color_hex || "#E2BFA0",
        reason: `Sélectionné pour ${zone}`,
      });
    }
  }

  const presetLabel = PRESET_LOOKS.find((p) => p.id === presetId)?.label || "";
  return {
    products: selected,
    outOfBudget: [],
    unmatched: [],
    summary: presetLabel ? `Look "${presetLabel}" · sous-ton ${undertone}` : `Sous-ton ${undertone}`,
  };
}

// ── Skin-tone detection from image ───────────────────────────────────────────
function detectSkinToneFromImage(img) {
  const canvas = document.createElement("canvas");
  const W = 200, H = 200;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, W, H);
  const data = ctx.getImageData(W * 0.35, H * 0.4, W * 0.3, H * 0.25).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
  r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
  const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  const undertone = (r - b) > 15 ? "warm" : (b - r) > 15 ? "cool" : "neutral";
  return { hex, undertone };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AITryOnPage() {
  const [step, setStep] = useState(1); // 1 upload, 2 describe, 3 loading, 4 result

  // Remonte en haut à chaque changement d'étape (évite d'arriver au milieu/en bas de la page suivante)
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, [step]);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [skinTone, setSkinTone] = useState({ hex: "#E2BFA0", undertone: "neutral" });
  const [prompt, setPrompt] = useState("");
  const [presetId, setPresetId] = useState("natural");
  const [budget, setBudget] = useState(80);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [zonePositions, setZonePositions] = useState(null);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const fileRef = useRef(null);

  // Bug remonté : le bouton retour du navigateur ramenait à l'accueil (photo
  // et réponses perdues) au lieu de revenir à l'étape précédente. Même garde
  // que sur Routine360Page / ProblemeRoutinePage : on empile une entrée
  // tampon et un retour recule d'une étape en interne au lieu de quitter la
  // page. Exception : à la toute première étape (step 1), on laisse le
  // navigateur sortir normalement.
  useEffect(() => {
    window.history.pushState({ aiTryOn: true }, "");
    const handlePopState = () => {
      if (step === 1) return;
      if (step === 2) { setStep(1); return; }
      if (step === 3) { setStep(2); return; }
      if (step === 4) { setStep(2); return; }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPhotoDataUrl(dataUrl);
      const img = new Image();
      img.onload = () => {
        try { setSkinTone(detectSkinToneFromImage(img)); }
        catch (err) { console.warn("Skin tone detection failed:", err); }
        setStep(2);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const presetText = PRESET_LOOKS.find((p) => p.id === presetId)?.label || "";

  const generate = async () => {
    setStep(3);
    setLoadingStep(0);
    try {
      const fullPrompt = `${presetText}. ${prompt}`.trim();

      // 1. Selection des produits (IA cote backend si les cles sont configurees)
      const { products: selected, outOfBudget, summary, unmatched } = await selectProducts({
        undertone: skinTone.undertone,
        budgetMax: budget,
        presetId,
        prompt: fullPrompt,
        skinToneHex: skinTone.hex,
      });

      setLoadingStep(1);

      // Build color map by zone
      const colors = {};
      for (const p of selected) {
        if (p.zone && !colors[p.zone]) colors[p.zone] = p.color_hex;
      }

      // 2. Application du maquillage : vraie generation IA photorealiste
      // (Gemini "Nano Banana" cote backend) si GOOGLE_API_KEY est configuree,
      // sinon repli sur l'overlay local MediaPipe + Canvas (gratuit mais
      // moins realiste) pour que la page reste fonctionnelle entre-temps.
      let imageUrl;
      let usedRealAi = true;
      try {
        const base64Only = photoDataUrl.split(",")[1] || photoDataUrl;
        const { data } = await api.post("/ai/apply-makeup", {
          image_base64: base64Only,
          colors,
          look_description: fullPrompt,
        });
        imageUrl = `data:${data.mime_type};base64,${data.image_base64}`;
      } catch (err) {
        usedRealAi = false;
        const detail = err?.response?.data?.detail || err?.message || "erreur inconnue";
        console.warn("Application IA (backend) indisponible, repli sur l'overlay local :", err);
        toast.error(`Génération IA indisponible (${detail}) — rendu de secours affiché, moins fidèle à la description.`);
        imageUrl = await applyMakeup(photoDataUrl, colors);
      }

      setLoadingStep(2);

      // 3. Hydrate with full product data from backend
      const details = await Promise.all(
        selected.map((s) =>
          api.get(`/products/${s.product_id}`)
            .then((r) => ({ ...r.data, zone: s.zone, color_hex: s.color_hex, reason: s.reason }))
            .catch(() => null)
        )
      );
      const outOfBudgetDetails = await Promise.all(
        (outOfBudget || []).map((s) =>
          api.get(`/products/${s.product_id}`)
            .then((r) => ({ ...r.data, zone: s.zone, color_hex: s.color_hex, reason: s.reason }))
            .catch(() => null)
        )
      );

      setResult({
        image: imageUrl,
        products: details.filter(Boolean),
        outOfBudget: outOfBudgetDetails.filter(Boolean),
        unmatched: unmatched || [],
        summary,
        usedRealAi,
      });
      setStep(4);
      trackQuiz({
        quizType: "essayage-ia",
        quizKey: presetId || null,
        answers: {
          style: presetId,
          demande: String(prompt || "").slice(0, 300),
          budget_max: budget,
          sous_ton: skinTone.undertone,
          teinte_hex: skinTone.hex,
          rendu_ia_reel: usedRealAi,
        },
        products: details.filter(Boolean).map((p) => ({ ...p, _slot: p.zone })),
      });
    } catch (e) {
      console.error("Generate error:", e);
      toast.error("Une erreur est survenue. Réessaie dans un instant.");
      setStep(2);
    }
  };

  // ── Step renders ────────────────────────────────────────────────────────────
  const Step1 = () => (
    <div className="max-w-2xl mx-auto text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Essayage IA · Étape 1</p>
      <h1 className="mt-3 text-4xl md:text-5xl font-bold text-[#FEC4D2]">Upload ta <span className="editorial text-neutral-900">photo</span></h1>
      <p className="mt-3 text-neutral-600 leading-relaxed">Photo de face, éclairage naturel, sans maquillage de préférence.</p>
      <p className="mt-1 text-xs text-neutral-500">Ta photo n'est pas conservée.</p>
      <label
        htmlFor="photo-upload"
        className="mt-10 block border-2 border-dashed border-[#FEC4D2] rounded-3xl p-16 cursor-pointer hover:bg-[#FEC4D2]/5 transition"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        data-testid="upload-zone"
      >
        <div className="flex flex-col items-center gap-4 text-neutral-600">
          <div className="w-16 h-16 rounded-full bg-[#FEC4D2]/15 flex items-center justify-center text-[#FEC4D2]"><Upload size={26} /></div>
          <div>
            <p className="font-medium">Glisse une photo ou clique ici</p>
            <p className="text-xs text-neutral-500 mt-1">JPG, PNG · max 10 Mo</p>
          </div>
        </div>
        <input id="photo-upload" ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      </label>
    </div>
  );

  const Step2 = () => (
    <div className="grid lg:grid-cols-[400px_1fr] gap-10 max-w-6xl mx-auto">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Étape 2 · Décris ton look</p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#FEC4D2]">Ta <span className="editorial text-neutral-900">photo</span></h2>
        <div className="mt-6 rounded-3xl overflow-hidden border-2 border-[#FEC4D2]">
          <img src={photoDataUrl} alt="Aperçu" className="w-full aspect-[4/5] object-cover" />
        </div>
        <button onClick={() => { setStep(1); setPhotoDataUrl(null); }} className="mt-4 text-sm text-[#79C1E0] hover:underline" data-testid="change-photo">
          Changer de photo
        </button>
        <div className="mt-4 text-xs text-neutral-500">
          Teint détecté : <span className="font-mono" style={{ color: skinTone.hex }}>{skinTone.hex}</span> · sous-ton {skinTone.undertone}
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-[#79C1E0]">Choisis un look prédéfini</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESET_LOOKS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPresetId(p.id)}
              className={`px-4 py-2.5 rounded-full border text-sm transition ${presetId === p.id ? "bg-[#FEC4D2] border-[#FEC4D2] text-neutral-900" : "border-[#FEC4D2]/50 text-neutral-700 hover:border-[#FEC4D2]"}`}
              data-testid={`preset-${p.id}`}
            >
              <span className="mr-1.5">{p.emoji}</span>{p.label}
            </button>
          ))}
        </div>

        <h3 className="mt-10 text-2xl font-semibold text-[#79C1E0]">Ou décris-le librement</h3>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, 300))}
          rows={4}
          maxLength={300}
          placeholder="Ex : je veux un fard à paupières terracotta et un rouge à lèvres nude avec un budget de 30 €"
          className="mt-4 border-[#FEC4D2]/40 focus-visible:ring-[#FEC4D2]"
          data-testid="free-prompt"
        />
        <p className="mt-1.5 text-right text-xs text-neutral-400">{prompt.length}/300</p>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-[#79C1E0]">Budget max</h4>
            <span className="text-sm text-neutral-700">0 – {budget}{budget >= 200 ? "+" : ""} €</span>
          </div>
          <Slider value={[budget]} onValueChange={([v]) => setBudget(v)} min={0} max={200} step={5} data-testid="ai-budget-slider" />
        </div>

        <button
          onClick={generate}
          className="mt-10 inline-flex items-center gap-2 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-10 py-4 rounded-full font-medium transition shadow-md hover:shadow-lg"
          data-testid="generate-look"
        >
          <Sparkles size={18} /> Générer mon look →
        </button>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="max-w-2xl mx-auto text-center py-20">
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className="loader-dot" /><span className="loader-dot" /><span className="loader-dot" />
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold text-[#79C1E0] editorial">{LOADER_STEPS[loadingStep]}</h2>
      <p className="mt-3 text-sm text-neutral-500">Traitement en cours dans votre navigateur…</p>
    </div>
  );

  const ZONE_POS = {
    lips:      { left: "50%", top: "78%" },
    eyes:      { left: "50%", top: "42%" },
    cheeks:    { left: "32%", top: "62%" },
    face:      { left: "50%", top: "20%" },
    lashes:    { left: "50%", top: "40%" },
    brows:     { left: "50%", top: "34%" },
    liner:     { left: "50%", top: "41%" },
    highlight: { left: "68%", top: "58%" },
  };

  // Fixed percentages above are only a fallback: as soon as the final image is
  // ready, detect the real face and place hotspots on the actual lips/eyes/
  // cheeks/forehead of that specific photo.
  useEffect(() => {
    let cancelled = false;
    setZonePositions(null);
    if (result?.image) {
      detectZonePositions(result.image).then((pos) => {
        if (!cancelled) setZonePositions(pos);
      });
    }
    return () => { cancelled = true; };
  }, [result?.image]);

  const Step4 = () => (
    <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Résultat</p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#FEC4D2]">Ton <span className="editorial text-neutral-900">look</span></h2>
        <p className="mt-2 text-sm text-neutral-600">{result?.summary}</p>
        {result && !result.usedRealAi && (
          <p className="mt-1 text-xs text-amber-600 font-medium">
            ⚠ Rendu de secours (IA indisponible) — ne reflète pas forcément ta description exacte.
          </p>
        )}
        <div className="mt-6 relative rounded-3xl overflow-hidden border-2 border-[#FEC4D2]" data-testid="result-image">
          <img src={result.image} alt="Résultat" className="w-full aspect-[4/5] object-cover" />
          {result.products.map((p, i) => {
            const pos = zonePositions?.[p.zone] || ZONE_POS[p.zone] || ZONE_POS.face;
            return (
              <div key={p.id + i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: pos.left, top: pos.top }}>
                <button
                  className="hotspot"
                  onMouseEnter={() => setActiveHotspot(p)}
                  onMouseLeave={() => setActiveHotspot(null)}
                  onClick={() => setActiveHotspot(activeHotspot?.id === p.id ? null : p)}
                  data-testid={`hotspot-${p.zone}`}
                  aria-label={`Produit ${p.name}`}
                />
                {activeHotspot?.id === p.id && (
                  <div className="absolute left-6 top-0 bg-white border border-[#FEC4D2] rounded-2xl p-3 shadow-xl w-56 z-10">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-500">{p.brand}</p>
                    <p className="text-sm font-medium text-neutral-900 line-clamp-2">{p.name}</p>
                    <p className="text-sm font-semibold mt-1">{p.price.toFixed(2)} €</p>
                    <a href={p.affiliate_url || "#"} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 rounded-full px-3 py-1.5">Voir le produit</a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 text-sm border border-[#FEC4D2] hover:bg-[#FEC4D2]/10 text-neutral-700 px-4 py-2 rounded-full transition" data-testid="modify-request">
            <RefreshCw size={14} /> Modifier ma demande
          </button>
          <button onClick={() => toast("Look sauvegardé !")} className="inline-flex items-center gap-2 text-sm border border-[#79C1E0] hover:bg-[#79C1E0]/10 text-neutral-700 px-4 py-2 rounded-full transition" data-testid="save-look">
            <Save size={14} /> Sauvegarder
          </button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast("Lien copié"); }} className="inline-flex items-center gap-2 text-sm border border-[#79C1E0] hover:bg-[#79C1E0]/10 text-neutral-700 px-4 py-2 rounded-full transition" data-testid="share-look">
            <Share2 size={14} /> Partager
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-[#79C1E0]">Produits utilisés</h3>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5" data-testid="result-products">
          {result.products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {result.unmatched?.length > 0 && (
          <div className="mt-6 bg-[#79C1E0]/10 border border-[#79C1E0]/40 rounded-2xl px-5 py-4 text-sm text-neutral-700 leading-relaxed" data-testid="unmatched-note">
            {result.unmatched.map((u, i) => (
              <p key={i} className={i > 0 ? "mt-2" : ""}>
                <strong>{ZONE_LABEL_FR[u.zone] || u.zone} ({u.color}) :</strong> aucun produit de notre catalogue n'existe dans cette teinte, donc nous ne t'en recommandons pas. L'image montre le rendu imaginé par l'IA.
              </p>
            ))}
          </div>
        )}

        <div className="mt-6 bg-[#FEC4D2]/10 border border-[#FEC4D2]/40 rounded-2xl px-6 py-5 flex items-center justify-between" data-testid="look-total">
          <span className="text-neutral-600 text-base">Total du look</span>
          <span className="text-2xl md:text-3xl font-bold text-neutral-900">
            {result.products.reduce((sum, p) => sum + (p.price || 0), 0).toFixed(2)} €
          </span>
        </div>

        {result.outOfBudget?.length > 0 && (
          <div className="mt-8" data-testid="out-of-budget-section">
            <h4 className="text-lg font-semibold text-[#79C1E0]">Hors budget</h4>
            <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
              Ces produits iraient encore mieux avec ce look, mais dépassent le budget que tu as choisi.
              Ils ne sont pas comptés dans le total ci-dessus.
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {result.outOfBudget.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="bg-white min-h-screen relative">
      <div className="halo-pink -top-20 -right-20" />
      <div className="halo-blue top-1/2 -left-32" />
      <section className="px-6 py-16 relative">
        {step === 1 && Step1()}
        {step === 2 && Step2()}
        {step === 3 && Step3()}
        {step === 4 && result && Step4()}
        {step === 1 && (
          <div className="mt-12 flex justify-center">
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 text-sm text-[#79C1E0] hover:underline" data-testid="manual-upload-btn">
              <ImagePlus size={14} /> Sélectionner une image
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
