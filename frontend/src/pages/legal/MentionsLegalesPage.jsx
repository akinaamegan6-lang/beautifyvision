import LegalPage from "../../components/legal/LegalPage";
import { MENTIONS_LEGALES_SECTIONS } from "../../data/legalContent";

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      breadcrumbLabel="Mentions légales"
      titleBlack="Mentions"
      titleBlue="légales"
      intro="Retrouve sur cette page l'ensemble des informations légales relatives au site Beautify Vision."
      sections={MENTIONS_LEGALES_SECTIONS}
      metaTitle="Mentions légales | Beautify Vision"
      metaDescription="Mentions légales du site Beautify Vision : éditeur, hébergeur, propriété intellectuelle, responsabilité, affiliation et droit applicable."
      path="/mentions-legales"
    />
  );
}
