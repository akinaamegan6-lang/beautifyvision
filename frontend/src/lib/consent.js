// Choix de la visiteuse pour le suivi d'affiliation (Awin). Memorise 6 mois
// dans le navigateur (bonne pratique CNIL), puis le bandeau reapparait.
const KEY = "bv_consent";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 180;

export function getConsent() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (v && (v.choice === "accepted" || v.choice === "refused") && Date.now() - v.ts < MAX_AGE_MS) {
      return v.choice;
    }
  } catch { /* stockage indisponible : on considere qu'aucun choix n'a ete fait */ }
  return null;
}

export function setConsent(choice) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ choice, ts: Date.now() }));
  } catch { /* le choix vaudra pour cette page seulement */ }
  window.dispatchEvent(new Event("bv-consent-changed"));
}

export function openCookieSettings() {
  window.dispatchEvent(new Event("bv-open-cookies"));
}

const AWIN_RE = /awin1\.com\/pclick\.php/;

// Signal de consentement Awin (hors TCF) : cons=1 = cookie accepte, cons=0 =
// refuse ou pas encore de choix. Avec cons=0, Awin ne depose aucun cookie et
// ne transmet pas d'identifiant de clic au marchand.
export function withAwinConsent(url) {
  if (!AWIN_RE.test(url || "")) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("cons", getConsent() === "accepted" ? "1" : "0");
    return u.toString();
  } catch {
    return url;
  }
}

// Reecrit le lien Awin au moment ou on interagit avec lui (clic, clic droit,
// toucher, clic molette), pour qu'il porte toujours le choix le plus recent.
export function installAwinConsentLinks() {
  const handler = (e) => {
    const a = e.target?.closest?.('a[href*="awin1.com/pclick.php"]');
    if (a) a.href = withAwinConsent(a.href);
  };
  const events = ["pointerdown", "click", "auxclick", "contextmenu", "touchstart", "focusin"];
  events.forEach((ev) => document.addEventListener(ev, handler, true));
  return () => events.forEach((ev) => document.removeEventListener(ev, handler, true));
}
