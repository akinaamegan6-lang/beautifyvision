// Contenu des pages legales (Mentions legales, Politique de confidentialite, CGU).
// Redige a partir des obligations LCEN (mentions legales), des recommandations
// CNIL (donnees personnelles / cookies) et du contrat d'exploitation du
// Programme Partenaires Amazon (mention de divulgation obligatoire).
//
// A COMPLETER : le numero SIRET n'a pas encore ete fourni (voir section
// "Editeur du site" ci-dessous). A remplacer des que disponible.

export const CONTACT_EMAIL = "contactbeautifyvision@gmail.com";
export const LAST_UPDATED = "24 septembre 2026";

export const MENTIONS_LEGALES_SECTIONS = [
  {
    title: "Éditeur du site",
    summary: "Informations sur l'éditeur du site Beautify Vision : identité, adresse, contact.",
    body: [
      { type: "p", text: "Le site beautifyvision.fr (« le Site ») est édité par Akina Mégan, entrepreneure individuelle (auto-entrepreneur), exerçant sous le nom commercial Beautify Vision." },
      {
        type: "ul",
        items: [
          "Adresse : 78400 Chatou, France",
          "SIRET : (à compléter)",
          `E-mail : ${CONTACT_EMAIL}`,
          "Directeur de la publication : Akina Mégan",
        ],
      },
    ],
  },
  {
    title: "Hébergeur du site",
    summary: "Informations sur l'hébergeur du site : nom de l'hébergeur, adresse, contact.",
    body: [
      { type: "p", text: "Le Site est hébergé par Vercel Inc., dont le siège est situé au 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis." },
      { type: "p", text: "Site web : vercel.com" },
    ],
  },
  {
    title: "Propriété intellectuelle",
    summary: "Informations relatives aux droits de propriété intellectuelle sur les contenus du site (textes, images, logo, etc.).",
    body: [
      { type: "p", text: "L'ensemble des éléments composant le Site (textes, visuels, illustrations, logo, charte graphique, structure, code) est la propriété exclusive de Beautify Vision, sauf mention contraire, et est protégé par le droit de la propriété intellectuelle." },
      { type: "p", text: "Toute reproduction, représentation, modification ou exploitation, totale ou partielle, de ces éléments sans autorisation écrite préalable est interdite." },
      { type: "p", text: "Les marques, logos et noms de produits cités sur le Site appartiennent à leurs propriétaires respectifs et sont mentionnés à titre informatif dans le cadre des comparatifs et recommandations proposés." },
    ],
  },
  {
    title: "Responsabilité",
    summary: "Limitation de responsabilité concernant l'utilisation des informations présentes sur le site.",
    body: [
      { type: "p", text: "Les contenus du Site (comparatifs, recommandations, diagnostics et essayages générés par intelligence artificielle) sont fournis à titre informatif et indicatif. Ils ne constituent en aucun cas un avis médical, dermatologique ou professionnel." },
      { type: "p", text: "Beautify Vision met tout en œuvre pour proposer des informations fiables mais ne garantit pas l'exactitude, l'exhaustivité ou l'adéquation des recommandations à chaque situation individuelle." },
      { type: "p", text: "Il est recommandé de réaliser un test cutané préalable avant toute utilisation d'un nouveau produit et de consulter un professionnel de santé en cas de doute ou de réaction." },
      { type: "p", text: "Beautify Vision ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du Site ou des produits recommandés." },
    ],
  },
  {
    title: "Liens externes et affiliation",
    summary: "Informations sur les liens vers des sites tiers et la participation au programme d'affiliation Amazon.",
    body: [
      { type: "p", text: "Le Site peut contenir des liens hypertextes vers des sites tiers (marques, boutiques partenaires, réseaux sociaux). Beautify Vision n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu." },
      { type: "p", text: "Beautify Vision participe au Programme Partenaires d'Amazon EU, un programme d'affiliation conçu pour permettre à des sites de percevoir une rémunération grâce à la création de liens vers Amazon.fr. En tant que Partenaire Amazon, Beautify Vision réalise un bénéfice sur les achats remplissant les conditions requises, sans coût supplémentaire pour l'acheteur." },
    ],
  },
  {
    title: "Données personnelles",
    summary: "Informations sur la collecte et le traitement des données personnelles dans le cadre de l'utilisation du site.",
    body: [
      { type: "p", text: "Le traitement des données personnelles des utilisateurs du Site est détaillé dans la Politique de confidentialité, accessible depuis le pied de page du Site." },
    ],
  },
  {
    title: "Droit applicable",
    summary: "Informations sur le droit applicable et le règlement des litiges éventuels.",
    body: [
      { type: "p", text: "Les présentes mentions légales sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents." },
    ],
  },
];

export const POLITIQUE_CONFIDENTIALITE_SECTIONS = [
  {
    title: "Responsable du traitement",
    summary: "Qui est responsable du traitement de tes données personnelles.",
    body: [
      { type: "p", text: "Le responsable du traitement des données collectées sur beautifyvision.fr est Akina Mégan, entrepreneure individuelle exerçant sous le nom commercial Beautify Vision, 78400 Chatou." },
      { type: "p", text: `Pour toute question relative à tes données personnelles, tu peux nous contacter à ${CONTACT_EMAIL}.` },
    ],
  },
  {
    title: "Données collectées",
    summary: "Quelles données sont collectées lorsque tu utilises le site.",
    body: [
      {
        type: "ul",
        items: [
          "Données de compte : e-mail, nom, mot de passe (stocké de façon chiffrée), ou informations transmises par Google si tu te connectes via Google.",
          "Données d'usage du diagnostic beauté : réponses au quiz, teinte de peau sélectionnée, préférences indiquées pour générer tes recommandations.",
          "Photo pour l'essayage virtuel : si tu utilises cette fonctionnalité, ta photo est transmise de façon sécurisée à notre prestataire d'intelligence artificielle pour générer le rendu, puis n'est pas conservée sur nos serveurs.",
          "Liste de favoris (wishlist) : conservée localement dans ton navigateur.",
          "Commentaires publiés sur le blog : prénom et texte du commentaire, affichés publiquement sous l'article concerné.",
        ],
      },
    ],
  },
  {
    title: "Finalités du traitement",
    summary: "Pourquoi nous utilisons ces données.",
    body: [
      {
        type: "ul",
        items: [
          "Créer et gérer ton compte utilisateur.",
          "Générer tes recommandations produits et tes diagnostics beauté personnalisés.",
          "Faire fonctionner l'essayage virtuel par intelligence artificielle.",
          "Permettre la publication de commentaires sur le blog.",
          "Assurer la sécurité et le bon fonctionnement du Site.",
        ],
      },
    ],
  },
  {
    title: "Base légale des traitements",
    summary: "Sur quelle base légale reposent ces traitements.",
    body: [
      {
        type: "ul",
        items: [
          "Exécution du contrat : pour la création de compte et la fourniture du service que tu demandes (diagnostics, essayages, recommandations).",
          "Intérêt légitime : pour améliorer et sécuriser le Site.",
          "Consentement : lorsque tu choisis volontairement de nous transmettre une photo pour l'essayage virtuel, ou de publier un commentaire.",
        ],
      },
    ],
  },
  {
    title: "Destinataires et sous-traitants",
    summary: "Qui peut avoir accès à tes données : hébergement, base de données, prestataires d'intelligence artificielle.",
    body: [
      { type: "p", text: "Tes données sont hébergées par Vercel Inc. (hébergement du Site) et stockées dans une base de données MongoDB Atlas." },
      { type: "p", text: "Pour générer les recommandations et les essayages virtuels, certaines informations (préférences beauté, ou ta photo si tu utilises l'essayage virtuel) sont transmises à nos prestataires d'intelligence artificielle (Anthropic et Google), uniquement le temps du traitement de ta demande." },
      { type: "p", text: "Beautify Vision ne vend ni ne loue tes données personnelles à des tiers à des fins commerciales." },
    ],
  },
  {
    title: "Durée de conservation",
    summary: "Combien de temps tes données sont conservées.",
    body: [
      { type: "p", text: "Les données de ton compte sont conservées tant que celui-ci est actif. Tu peux demander la suppression de ton compte et de tes données à tout moment." },
      { type: "p", text: "Les photos transmises pour l'essayage virtuel ne sont pas conservées : elles sont traitées puis supprimées immédiatement après génération du résultat." },
      { type: "p", text: "Les commentaires publiés sur le blog sont conservés jusqu'à leur suppression, par toi ou par Beautify Vision." },
    ],
  },
  {
    title: "Tes droits",
    summary: "Les droits dont tu disposes sur tes données personnelles (RGPD).",
    body: [
      { type: "p", text: "Conformément au Règlement Général sur la Protection des Données (RGPD), tu disposes d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de tes données." },
      { type: "p", text: `Pour exercer ces droits, contacte-nous à ${CONTACT_EMAIL}.` },
      { type: "p", text: "Tu disposes également du droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr) si tu estimes que tes droits ne sont pas respectés." },
    ],
  },
  {
    title: "Cookies et traceurs",
    summary: "Ce que nous stockons dans ton navigateur, et pourquoi.",
    body: [
      { type: "p", text: "Beautify Vision n'utilise aucun cookie publicitaire, ni aucun outil de mesure d'audience ou de traçage à des fins commerciales." },
      { type: "p", text: "Le Site utilise uniquement le stockage local de ton navigateur (localStorage) pour deux usages strictement nécessaires à son fonctionnement : garder ta session de connexion active, et mémoriser ta liste de favoris. Conformément aux recommandations de la CNIL, ces éléments sont exemptés de consentement préalable car indispensables au service que tu demandes." },
      { type: "p", text: "Les liens vers Amazon présents sur le Site sont des liens d'affiliation : ils ne déposent aucun cookie sur beautifyvision.fr, mais Amazon peut déposer ses propres cookies une fois que tu es redirigé·e vers son site, dans les conditions prévues par sa propre politique de confidentialité." },
    ],
  },
  {
    title: "Modification de cette politique",
    summary: "Mise à jour de cette politique de confidentialité.",
    body: [
      { type: "p", text: `Cette politique de confidentialité peut être mise à jour à tout moment, notamment pour refléter l'évolution du Site ou de la réglementation. Dernière mise à jour : ${LAST_UPDATED}.` },
    ],
  },
];

export const CGU_SECTIONS = [
  {
    title: "Objet",
    summary: "Présentation de Beautify Vision et objet des présentes conditions.",
    body: [
      { type: "p", text: "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site beautifyvision.fr (« le Site »), édité par Beautify Vision : un comparateur beauté propulsé par l'intelligence artificielle proposant diagnostics personnalisés, essayage virtuel de maquillage, recommandations de produits et articles de blog." },
      { type: "p", text: "L'utilisation du Site implique l'acceptation pleine et entière des présentes CGU." },
    ],
  },
  {
    title: "Accès au service",
    summary: "Comment accéder au site et à ses fonctionnalités.",
    body: [
      { type: "p", text: "L'accès au Site et à la majorité de ses fonctionnalités est gratuit. La création d'un compte est nécessaire pour certaines fonctionnalités (sauvegarde de favoris, commentaires...)." },
      { type: "p", text: "Beautify Vision se réserve le droit de faire évoluer, suspendre ou interrompre tout ou partie du Site sans préavis, notamment pour des raisons de maintenance." },
    ],
  },
  {
    title: "Création de compte",
    summary: "Tes engagements lors de la création d'un compte utilisateur.",
    body: [
      { type: "p", text: "Tu t'engages à fournir des informations exactes lors de la création de ton compte et à maintenir la confidentialité de ton mot de passe." },
      { type: "p", text: "Tu es seul·e responsable de toute activité effectuée depuis ton compte." },
      { type: "p", text: "Le Site est destiné aux personnes majeures, ou aux mineurs disposant de l'autorisation de leur représentant légal." },
    ],
  },
  {
    title: "Fonctionnalités d'intelligence artificielle",
    summary: "Le fonctionnement et les limites du diagnostic beauté et de l'essayage virtuel par IA.",
    body: [
      { type: "p", text: "Les diagnostics beauté, recommandations de produits et essayages virtuels proposés par Beautify Vision sont générés par intelligence artificielle à partir des informations que tu fournis (réponses au quiz, teinte de peau, photo le cas échéant)." },
      { type: "p", text: "Ces résultats sont fournis à titre indicatif : ils ne remplacent pas l'avis d'un professionnel de santé ou d'un dermatologue et peuvent comporter des approximations propres aux technologies d'intelligence artificielle générative." },
      { type: "p", text: "Tu restes seul·e responsable du choix d'utilisation ou d'achat des produits recommandés. Un test cutané préalable est recommandé avant toute utilisation d'un nouveau produit." },
    ],
  },
  {
    title: "Recommandations produits et affiliation",
    summary: "Le fonctionnement des recommandations produits et la participation de Beautify Vision au programme d'affiliation Amazon.",
    body: [
      { type: "p", text: "Beautify Vision n'est pas vendeur des produits présentés sur le Site : les achats s'effectuent directement auprès des marques ou plateformes partenaires (dont Amazon), qui restent seules responsables de la vente, de la livraison et du service après-vente." },
      { type: "p", text: "Beautify Vision participe au Programme Partenaires d'Amazon EU. En tant que Partenaire Amazon, Beautify Vision réalise un bénéfice sur les achats remplissant les conditions requises, sans coût supplémentaire pour toi." },
    ],
  },
  {
    title: "Commentaires et contenus publiés par les utilisateurs",
    summary: "Les règles applicables aux commentaires publiés sur le blog.",
    body: [
      { type: "p", text: "Les commentaires publiés sur le blog sont librement rédigés par leurs auteurs, qui en restent seuls responsables." },
      { type: "p", text: "Beautify Vision se réserve le droit de supprimer, sans préavis, tout commentaire jugé inapproprié, injurieux, illicite ou hors sujet." },
    ],
  },
  {
    title: "Propriété intellectuelle",
    summary: "Renvoi vers les droits de propriété intellectuelle applicables au site.",
    body: [
      { type: "p", text: "Les droits de propriété intellectuelle relatifs aux contenus du Site sont détaillés dans les Mentions légales." },
    ],
  },
  {
    title: "Résiliation",
    summary: "Comment supprimer ton compte.",
    body: [
      { type: "p", text: `Tu peux demander la suppression de ton compte et de tes données à tout moment en nous contactant à ${CONTACT_EMAIL}.` },
      { type: "p", text: "Beautify Vision se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des présentes CGU." },
    ],
  },
  {
    title: "Modification des CGU",
    summary: "Mise à jour des présentes conditions.",
    body: [
      { type: "p", text: `Beautify Vision se réserve le droit de modifier les présentes CGU à tout moment. La version en vigueur est celle publiée sur le Site à la date de ta consultation. Dernière mise à jour : ${LAST_UPDATED}.` },
    ],
  },
  {
    title: "Droit applicable",
    summary: "Droit applicable et tribunaux compétents en cas de litige.",
    body: [
      { type: "p", text: "Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents." },
    ],
  },
];
