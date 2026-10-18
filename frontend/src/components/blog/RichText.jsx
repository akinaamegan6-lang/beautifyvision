import { parseRichText } from "./blogText";

export default function RichText({ text, highlightClassName = "text-[#79C1E0]", italicHighlight = false, block = true }) {
  const lines = parseRichText(text);
  const renderSegment = (seg, j) => {
    if (seg.link) {
      return (
        <a
          key={j}
          href={seg.link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="text-[#79C1E0] underline decoration-[#79C1E0]/40 hover:decoration-[#79C1E0] font-medium"
        >
          {seg.text}
        </a>
      );
    }
    return seg.highlight ? (
      <span key={j} className={`${highlightClassName}${italicHighlight ? " editorial" : ""}`}>{seg.text}</span>
    ) : (
      <span key={j}>{seg.text}</span>
    );
  };
  return (
    <>
      {lines.map((segments, i) =>
        block ? (
          <span key={i} className="block">{segments.map(renderSegment)}</span>
        ) : (
          <span key={i}>{segments.map(renderSegment)}</span>
        )
      )}
    </>
  );
}
