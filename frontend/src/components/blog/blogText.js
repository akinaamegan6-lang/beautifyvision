// Convention utilisee pour les titres/H2/H3/H4 des articles de blog :
// - "\n" insere un retour a la ligne
// - "{{mot ou phrase}}" met en avant ce segment (couleur/italique selon le bloc)

export function parseRichText(input) {
  if (!input) return [];
  return input.split("\n").map((line) => {
    const segments = [];
    const regex = /\{\{(.+?)\}\}/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) segments.push({ text: line.slice(lastIndex, match.index), highlight: false });
      segments.push({ text: match[1], highlight: true });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) segments.push({ text: line.slice(lastIndex), highlight: false });
    return segments;
  });
}

export function plainText(input) {
  if (!input) return "";
  return input.replace(/\n/g, " ").replace(/\{\{(.+?)\}\}/g, "$1").trim();
}

export function slugifyHeading(input) {
  return plainText(input)
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
