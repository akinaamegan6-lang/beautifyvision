// Pastille « vaguelettes » (cercle légèrement ondulé) utilisée pour les remises.
export const PINK = "#FEC4D2";
export const PINK_STRONG = "#F58FAA";

function wavyPath(n = 12, R = 46, amp = 2.4, steps = 200) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = R + amp * Math.cos(n * t);
    pts.push(`${i === 0 ? "M" : "L"}${(50 + r * Math.cos(t)).toFixed(2)} ${(50 + r * Math.sin(t)).toFixed(2)}`);
  }
  return pts.join(" ") + " Z";
}
const PATH = wavyPath();

export default function WavyBadge({ size = 56, className = "", children }) {
  // Le parent doit être positionné pour porter le SVG : on ajoute « relative »
  // sauf si l'appelant positionne déjà la pastille (absolute / fixed).
  const pos = /\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative";
  return (
    <span className={`${pos} inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_4px_8px_rgba(245,143,170,0.35)]" aria-hidden="true">
        <path d={PATH} fill="#F78FAB" />
      </svg>
      <span className="relative text-center text-white font-bold leading-none [text-shadow:0_1px_2px_rgba(0,0,0,0.18)]">{children}</span>
    </span>
  );
}
