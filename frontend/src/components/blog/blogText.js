// Convention utilisee pour les titres/H2/H3/H4 ET pour les paragraphes des
// articles de blog :
// - "\n" insere un retour a la ligne
// - "{{mot ou phrase}}" met en avant ce segment (couleur/italique selon le bloc)
// - "[[texte affiche|https://url]]" insere un lien cliquable (utilise pour
//   les mentions de produits Awin/Amazon dans le corps d'un article) ; le
//   lien s'ouvre dans un nouvel onglet avec rel="noopener noreferrer sponsored"
//   (cote rendu, voir RichText.jsx).

const LINK_RE = /\[\[(.+?)\|(.+?)\]\]/g;
const HIGHLIGHT_RE = /\{\{(.+?)\}\}/g;

function parseLine(line) {
  // D'abord les liens [[texte|url]], puis {{highlight}} a l'interieur des
  // morceaux de texte restants (un lien n'est jamais lui-meme surligne).
  const segments = [];
  let lastIndex = 0;
  let match;
  LINK_RE.lastIndex = 0;
  while ((match = LINK_RE.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ raw: line.slice(lastIndex, match.index) });
    }
    segments.push({ text: match[1], link: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) segments.push({ raw: line.slice(lastIndex) });

  const out = [];
  for (const seg of segments) {
    if (seg.link) {
      out.push({ text: seg.text, highlight: false, link: seg.link });
      continue;
    }
    const text = seg.raw;
    let idx = 0;
    let m;
    HIGHLIGHT_RE.lastIndex = 0;
    while ((m = HIGHLIGHT_RE.exec(text)) !== null) {
      if (m.index > idx) out.push({ text: text.slice(idx, m.index), highlight: false });
      out.push({ text: m[1], highlight: true });
      idx = m.index + m[0].length;
    }
    if (idx < text.length) out.push({ text: text.slice(idx), highlight: false });
  }
  return out;
}

export function parseRichText(input) {
  if (!input) return [];
  return input.split("\n").map(parseLine);
}

export function plainText(input) {
  if (!input) return "";
  return input
    .replace(/\n/g, " ")
    .replace(LINK_RE, "$1")
    .replace(HIGHLIGHT_RE, "$1")
    .trim();
}

export function slugifyHeading(input) {
  return plainText(input)
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
