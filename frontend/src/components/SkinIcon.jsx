import { SKIN_ICONS } from "../data/skinIcons";

/** Pictogramme fin (trait), couleur héritée via currentColor. */
export default function SkinIcon({ name, size = 32, className = "", strokeWidth }) {
  const body = SKIN_ICONS[name];
  if (!body) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
      style={strokeWidth ? { stroke: "currentColor", strokeWidth } : undefined}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
