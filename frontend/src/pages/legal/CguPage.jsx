import LegalPage from "../../components/legal/LegalPage";
import { CGU_SECTIONS } from "../../data/legalContent";

export default function CguPage() {
  return (
    <LegalPage
      breadcrumbLabel="CGU"
      titleBlack="Conditions générales"
      titleBlue="d'utilisation"
      intro="Les règles qui encadrent l'utilisation du site et des services Beautify Vision."
      sections={CGU_SECTIONS}
      metaTitle="Conditions générales d'utilisation | Beautify Vision"
      metaDescription="Conditions générales d'utilisation du site Beautify Vision : accès au service, fonctionnalités IA, recommandations produits et affiliation."
      path="/cgu"
    />
  );
}
