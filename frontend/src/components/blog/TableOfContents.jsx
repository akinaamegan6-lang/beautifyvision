import { useEffect, useState } from "react";
import { plainText, slugifyHeading } from "./blogText";

export default function TableOfContents({ blocks = [] }) {
  const items = blocks.filter((b) => b.type === "heading2").map((b) => ({ id: slugifyHeading(b.text), label: plainText(b.text) }));
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -70% 0px" }
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  if (items.length === 0) return null;

  return (
    <div className="bg-[#FEC4D2]/10 rounded-2xl p-5" data-testid="table-of-contents">
      <p className="text-sm font-bold text-neutral-900 mb-3">Sommaire</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-sm px-3 py-1.5 rounded-lg transition ${
                activeId === item.id ? "bg-[#79C1E0]/15 text-[#79C1E0] font-medium" : "text-neutral-600 hover:text-[#79C1E0]"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
