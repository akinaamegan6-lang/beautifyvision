import { Helmet } from "react-helmet-async";

export const SITE_NAME = "Beautify Vision";
export const SITE_URL = "https://beautifyvision.fr";

export function absoluteUrl(path = "") {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Balises SEO pour une page (title, meta description, canonical,
 * Open Graph, Twitter Card, et JSON-LD optionnel).
 *
 * Utilisation :
 *   <Seo
 *     title="Titre de la page | Beautify Vision"
 *     description="Description de ~150-160 caracteres."
 *     path="/blog/mon-article"
 *     image="/image/mon-image.png"   // optionnel, chemin relatif ou URL absolue
 *     type="article"                  // "website" par defaut
 *     jsonLd={{ ... }}                 // optionnel, objet schema.org
 *     noindex                          // optionnel, pour une page a ne pas indexer
 *   />
 */
export default function Seo({ title, description, path = "", image, type = "website", jsonLd, noindex = false }) {
  const url = absoluteUrl(path);
  const resolvedImage = image ? absoluteUrl(image) : undefined;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      {resolvedImage && <meta property="og:image" content={resolvedImage} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={resolvedImage ? "summary_large_image" : "summary"} />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {resolvedImage && <meta name="twitter:image" content={resolvedImage} />}

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
