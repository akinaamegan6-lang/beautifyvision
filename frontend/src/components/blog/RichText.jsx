import { parseRichText } from "./blogText";

export default function RichText({ text, highlightClassName = "text-[#79C1E0]", italicHighlight = false }) {
  const lines = parseRichText(text);
  return (
    <>
      {lines.map((segments, i) => (
        <span key={i} className="block">
          {segments.map((seg, j) =>
            seg.highlight ? (
              <span key={j} className={`${highlightClassName}${italicHighlight ? " editorial" : ""}`}>{seg.text}</span>
            ) : (
              <span key={j}>{seg.text}</span>
            )
          )}
        </span>
      ))}
    </>
  );
}
