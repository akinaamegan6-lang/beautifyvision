import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

// Nuancier de carnation, du plus clair au plus foncé (approximatif).
export const SKIN_TONE_SWATCHES = [
  "#F9E4D4", "#F5D6BA", "#EFC8A0", "#E3B289", "#CB9767",
  "#AD7A4C", "#8A5A35", "#6B4226", "#4A2C1B", "#2E1B12",
];

function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function nearestSwatchIndex([r, g, b]) {
  let best = 0;
  let bestDist = Infinity;
  SKIN_TONE_SWATCHES.forEach((sw, i) => {
    const [sr, sg, sb] = hexToRgb(sw);
    const dist = (r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  return best;
}

/**
 * Sélecteur de teinte de carnation : curseur avec nuancier clair -> foncé,
 * carré de couleur en temps réel, et import de photo facultatif pour
 * suggérer automatiquement une teinte (estimation par couleur moyenne de
 * la zone centrale de la photo — une approximation simple, pas une vraie
 * détection IA du visage).
 * Entièrement facultatif : on peut valider sans toucher au curseur ni
 * importer de photo.
 */
export default function ShadePicker({ value, onChange }) {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef(null);

  const idx = value ?? 4;
  const swatch = SKIN_TONE_SWATCHES[idx];

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
      setAnalyzing(true);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const size = 40;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          // Zone centrée (approximation de la zone du visage) plutôt que
          // toute l'image, pour limiter l'effet du fond/des vêtements.
          const cropSize = Math.min(img.width, img.height) * 0.5;
          const sx = (img.width - cropSize) / 2;
          const sy = (img.height - cropSize) / 2.5;
          ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, size, size);
          const data = ctx.getImageData(0, 0, size, size).data;
          let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            n++;
          }
          const avg = [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
          onChange(nearestSwatchIndex(avg));
        } finally {
          setAnalyzing(false);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div data-testid="shade-picker">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-2 border-white shadow-md shrink-0"
          style={{ backgroundColor: swatch }}
          data-testid="shade-picker-preview"
        />
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={SKIN_TONE_SWATCHES.length - 1}
            step={1}
            value={idx}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, ${SKIN_TONE_SWATCHES.join(",")})` }}
            data-testid="shade-picker-slider"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
            <span>Plus clair</span>
            <span>Plus foncé</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {!photoPreview ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs text-[#79C1E0] hover:underline"
            data-testid="shade-picker-upload"
          >
            <Upload size={13} /> Importer une photo pour suggérer ta teinte
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <img src={photoPreview} alt="" className="w-9 h-9 rounded-lg object-cover" />
            <span className="text-xs text-neutral-500">{analyzing ? "Analyse en cours…" : "Teinte suggérée ✓"}</span>
            <button
              type="button"
              onClick={clearPhoto}
              className="text-neutral-400 hover:text-neutral-700"
              aria-label="Retirer la photo"
              data-testid="shade-picker-clear-photo"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          className="hidden"
          data-testid="shade-picker-file-input"
        />
      </div>
      <p className="mt-1.5 text-[11px] text-neutral-400 italic">
        Cette étape est facultative, tu peux valider sans choisir de teinte.
      </p>
    </div>
  );
}
