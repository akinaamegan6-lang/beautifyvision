import LegalPage from "../../components/legal/LegalPage";
import { POLITIQUE_CONFIDENTIALITE_SECTIONS } from "../../data/legalContent";

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPage
      breadcrumbLabel="Politique de confidentialité"
      titleBlack="Politique de"
      titleBlue="confidentialité"
      intro="Comment Beautify Vision collecte, utilise et protège tes données personnelles."
      sections={POLITIQUE_CONFIDENTIALITE_SECTIONS}
      metaTitle="Politique de confidentialité | Beautify Vision"
      metaDescription="Découvre comment Beautify Vision collecte, utilise et protège tes données personnelles, ainsi que tes droits RGPD."
      path="/politique-de-confidentialite"
    />
  );
}
