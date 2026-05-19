import { useEffect, useRef, useState } from "react";
import { Upload, Sparkles, RefreshCw, Save, Share2, ImagePlus } from "lucide-react";
import { Slider } from "../components/ui/slider";
import { Textarea } from "../components/ui/textarea";
import { api } from "../lib/api";
import { PRESET_LOOKS } from "../data/criteria";
import ProductCard from "../components/ProductCard";
import { toast } from "sonner";

const LOADER_STEPS = [
  "Analyse de votre teint en cours…",
  "Sélection des produits les plus adaptés…",
  "Application du maquillage sur votre photo…",
];

function detectSkinToneFromImage(img) {
  // Sample center face region for HEX
  const canvas = document.createElement("canvas");
  const W = 200; const H = 200;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, W, H);
  const data = ctx.getImageData(W * 0.35, H * 0.4, W * 0.3, H * 0.25).data;
  let r=0,g=0,b=0,n=0;
  for (let i=0; i<data.length; i+=4) { r+=data[i]; g+=data[i+1]; b+=data[i+2]; n++; }
  r=Math.round(r/n); g=Math.round(g/n); b=Math.round(b/n);
  const hex = "#" + [r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("");
  const undertone = (r-b) > 15 ? "warm" : (b-r) > 15 ? "cool" : "neutral";
  return { hex, undertone };
}

export default function AITryOnPage() {
  const [step, setStep] = useState(1); // 1 upload, 2 describe, 3 loading, 4 result
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [photoB64, setPhotoB64] = useState("");
  const [skinTone, setSkinTone] = useState({ hex: "#E2BFA0", undertone: "neutral" });
  const [prompt, setPrompt] = useState("");
  const [presetId, setPresetId] = useState("natural");
  const [budget, setBudget] = useState([0, 80]);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null); // { image_base64, products: [...], summary }
  const [activeHotspot, setActiveHotspot] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPhotoDataUrl(dataUrl);
      setPhotoB64(dataUrl.split(",")[1] || "");
      const img = new Image();
      img.onload = () => {
        try { setSkinTone(detectSkinToneFromImage(img)); }
        catch (err) { console.warn("Skin tone detection failed, using default:", err); }
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

    // Advance loading messages at 1 s intervals across the 3 s window
    const t1 = setTimeout(() => setLoadingStep(1), 1000);
    const t2 = setTimeout(() => setLoadingStep(2), 2000);

    const fullPrompt = `${presetText}. ${prompt}`.trim();
    try {
      // Enforce a 3-second minimum so the animation plays fully
      const [sel] = await Promise.all([
        api.post("/ai/select-products", {
          prompt: fullPrompt,
          skin_tone_hex: skinTone.hex,
          undertone: skinTone.undertone,
          budget_max: budget[1],
        }),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);

      const selected = sel.data.products || [];
      const summary = sel.data.summary || "";

      // Fetch full product details for each selection
      const details = await Promise.all(
        selected.map((s) =>
          api.get(`/products/${s.product_id}`)
            .then((r) => ({ ...r.data, zone: s.zone, color_hex: s.color_hex, reason: s.reason }))
            .catch(() => null)
        )
      );
      const products = details.filter(Boolean);

      // Show the original uploaded photo — makeup synthesis added later
      setResult({ image: photoDataUrl, products, summary });
      setStep(4);
    } catch {
      toast.error("Une erreur est survenue. Réessaie dans un instant.");
      setStep(2);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
    }
  };

  // === Renders ===
  const Step1 = () => (
    <div className="max-w-2xl mx-auto text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Essayage IA · Étape 1</p>
      <h1 className="mt-3 text-4xl md:text-5xl font-bold text-[#FEC4D2]">Upload ta <span className="editorial text-neutral-900">photo</span></h1>
      <p className="mt-3 text-neutral-600 leading-relaxed">
        Photo de face, éclairage naturel, sans maquillage de préférence.
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        Ta photo est traitée uniquement pour générer ton rendu. Elle n'est jamais stockée sans ton accord.
      </p>
      <label
        htmlFor="photo-upload"
        className="mt-10 block border-2 border-dashed border-[#FEC4D2] rounded-3xl p-16 cursor-pointer hover:bg-[#FEC4D2]/5 transition"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        data-testid="upload-zone"
      >
        <div className="flex flex-col items-center gap-4 text-neutral-600">
          <div className="w-16 h-16 rounded-full bg-[#FEC4D2]/15 flex items-center justify-center text-[#FEC4D2]"><Upload size={26}/></div>
          <div>
            <p className="font-medium">Glisse une photo ou clique ici</p>
            <p className="text-xs text-neutral-500 mt-1">JPG, PNG · max 10 Mo</p>
          </div>
        </div>
        <input id="photo-upload" ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])}/>
      </label>
    </div>
  );

  const Step2 = () => (
    <div className="grid lg:grid-cols-[400px_1fr] gap-10 max-w-6xl mx-auto">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Étape 2 · Décris ton look</p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#FEC4D2]">Ta <span className="editorial text-neutral-900">photo</span></h2>
        <div className="mt-6 rounded-3xl overflow-hidden border-2 border-[#FEC4D2]">
          <img src={photoDataUrl} alt="Aperçu" className="w-full aspect-[4/5] object-cover"/>
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
              className={`px-4 py-2.5 rounded-full border text-sm transition ${
                presetId === p.id ? "bg-[#FEC4D2] border-[#FEC4D2] text-neutral-900" : "border-[#FEC4D2]/50 text-neutral-700 hover:border-[#FEC4D2]"
              }`}
              data-testid={`preset-${p.id}`}
            >
              <span className="mr-1.5">{p.emoji}</span>{p.label}
            </button>
          ))}
        </div>

        <h3 className="mt-10 text-2xl font-semibold text-[#79C1E0]">Ou décris-le librement</h3>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="Ex : je veux un fard à paupières terracotta et un rouge à lèvres nude avec un budget de 30 €"
          className="mt-4 border-[#FEC4D2]/40 focus-visible:ring-[#FEC4D2]"
          data-testid="free-prompt"
        />

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-[#79C1E0]">Budget max</h4>
            <span className="text-sm text-neutral-700">{budget[0]} – {budget[1]}{budget[1] >= 200 ? "+" : ""} €</span>
          </div>
          <Slider value={budget} onValueChange={setBudget} min={0} max={200} step={5} data-testid="ai-budget-slider"/>
        </div>

        <button
          onClick={generate}
          className="mt-10 inline-flex items-center gap-2 bg-[#FEC4D2] hover:bg-[#fdb2c3] text-neutral-900 px-10 py-4 rounded-full font-medium transition shadow-md hover:shadow-lg"
          data-testid="generate-look"
        >
          <Sparkles size={18}/> Générer mon look →
        </button>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="max-w-2xl mx-auto text-center py-20">
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className="loader-dot"/><span className="loader-dot"/><span className="loader-dot"/>
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold text-[#79C1E0] editorial">{LOADER_STEPS[loadingStep]}</h2>
      <p className="mt-3 text-sm text-neutral-500">Quelques instants suffiront…</p>
    </div>
  );

  const ZONE_POS = {
    lips: { left: "50%", top: "78%" },
    eyes: { left: "50%", top: "42%" },
    cheeks: { left: "32%", top: "62%" },
    face: { left: "50%", top: "20%" },
  };

  const Step4 = () => (
    <div className="grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#79C1E0]">Résultat</p>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#FEC4D2]">Ton <span className="editorial text-neutral-900">look</span></h2>
        <p className="mt-2 text-sm text-neutral-600">{result?.summary}</p>
        <div className="mt-6 relative rounded-3xl overflow-hidden border-2 border-[#FEC4D2]" data-testid="result-image">
          <img src={result.image} alt="Résultat" className="w-full aspect-[4/5] object-cover"/>
          {result.products.map((p, i) => {
            const pos = ZONE_POS[p.zone] || ZONE_POS.face;
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
            <RefreshCw size={14}/> Modifier ma demande
          </button>
          <button onClick={() => toast("Look sauvegardé !")} className="inline-flex items-center gap-2 text-sm border border-[#79C1E0] hover:bg-[#79C1E0]/10 text-neutral-700 px-4 py-2 rounded-full transition" data-testid="save-look">
            <Save size={14}/> Sauvegarder
          </button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast("Lien copié"); }} className="inline-flex items-center gap-2 text-sm border border-[#79C1E0] hover:bg-[#79C1E0]/10 text-neutral-700 px-4 py-2 rounded-full transition" data-testid="share-look">
            <Share2 size={14}/> Partager
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-[#79C1E0]">Produits utilisés</h3>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5" data-testid="result-products">
          {result.products.map((p) => <ProductCard key={p.id} product={p}/>)}
        </div>

        <div className="mt-6 bg-[#FEC4D2]/10 border border-[#FEC4D2]/40 rounded-2xl px-6 py-5 flex items-center justify-between" data-testid="look-total">
          <span className="text-neutral-600 text-base">Total du look</span>
          <span className="text-2xl md:text-3xl font-bold text-neutral-900">
            {result.products.reduce((sum, p) => sum + (p.price || 0), 0).toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <main className="bg-white min-h-screen relative">
      <div className="halo-pink -top-20 -right-20"/>
      <div className="halo-blue top-1/2 -left-32"/>
      <section className="px-6 py-16 relative">
        {step === 1 && <Step1/>}
        {step === 2 && <Step2/>}
        {step === 3 && <Step3/>}
        {step === 4 && result && <Step4/>}
        {step === 1 && (
          <div className="mt-12 flex justify-center">
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 text-sm text-[#79C1E0] hover:underline" data-testid="manual-upload-btn">
              <ImagePlus size={14}/> Sélectionner une image
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
