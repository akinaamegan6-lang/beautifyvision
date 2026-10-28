// Contenu des pages « routine par type de peau » + cartes de la page d'accueil.
// Les identifiants de produits (ids) pointent vers le catalogue réel (flux Awin) ;
// ils sont chargés via GET /api/products/by-ids.
// Vocabulaire SEO volontairement identique d'une page à l'autre :
// « routine », « peau X », « soins », « produits adaptés », « dermocosmétique ».

export const SKIN_ROUTINES = [
  /* ------------------------------------------------------------------ */
  {
    key: "grasse",
    path: "/routine/peau-grasse",
    breadcrumb: "Peau grasse",
    homeLabel: "PEAU GRASSE",
    homeTitle: ["Adieu les", "brillances"],
    homeText: "Purifie, matifie et équilibre sans décaper : une routine douce pour un teint net toute la journée.",
    seoTitle: "Peau grasse : quelle routine adopter ? Soins et conseils | Beautify Vision",
    seoDescription:
      "Peau grasse : comprends l'excès de sébum, découvre les meilleurs nettoyants et soins matifiants, la routine complète en 4 étapes et les erreurs à éviter.",
    h1: ["Peau grasse :", "quelle routine adopter ?"],
    intro: [
      "La peau grasse se reconnaît à son aspect brillant, surtout sur la zone T, à ses pores visibles et à sa tendance aux imperfections. Elle n'est pas un défaut : elle produit simplement plus de sébum que la moyenne, et c'est aussi ce qui la protège souvent mieux du vieillissement. Avec la bonne routine, on peut la matifier sans la dessécher.",
      "Sur cette page, Beautify Vision t'aide à comprendre ta peau grasse, à choisir des produits adaptés (nettoyants, soins matifiants, crèmes hydratantes légères et protection solaire) et à construire une routine simple, efficace et réaliste, du matin au soir.",
    ],
    heroImage: "/image/routines/hero-grasse.webp",
    heroTagline: "Matifiée, jamais agressée.",
    understand: {
      title: "Comprendre la peau grasse",
      text: [
        "Une peau grasse est une peau dont les glandes sébacées sont particulièrement actives. Le sébum en excès donne un aspect luisant, dilate les pores et peut favoriser les points noirs et les boutons. Les hormones, le stress, la chaleur, l'hérédité et parfois certains soins trop décapants jouent un rôle important.",
        "Contrairement à une idée reçue, une peau grasse a aussi besoin d'hydratation. Quand on la nettoie trop fort, elle se défend en produisant encore plus de sébum : c'est l'effet rebond. L'objectif d'une bonne routine pour peau grasse est donc de réguler, pas d'assécher.",
      ],
      points: [
        { icon: "drop", title: "Excès de sébum", text: "Brillance sur le front, le nez et le menton, souvent dès la fin de matinée." },
        { icon: "circle-dashed", title: "Pores dilatés", text: "Grain de peau irrégulier et points noirs, surtout sur les ailes du nez." },
        { icon: "bandaids", title: "Imperfections", text: "Boutons occasionnels, favorisés par le sébum et les cellules mortes." },
        { icon: "sun-horizon", title: "Peau résistante", text: "Elle marque souvent moins vite les rides, mais reste sensible au soleil." },
      ],
    },
    productSections: [
      {
        title: "Les meilleurs nettoyants pour peau grasse",
        text: "Un bon nettoyant pour peau grasse élimine le sébum, la pollution et le maquillage sans laisser la peau qui tire. Privilégie les gels et mousses doux, utilisés matin et soir, qui purifient en profondeur tout en respectant le film hydrolipidique.",
        ids: ["321f7cde-6481-565e-9580-2aa922da3c1b", "e3d4b0d1-7317-54c4-83c1-9eb3c2593721", "93549950-a558-569e-9336-2cd477421bbb", "9b1e3530-b65a-588a-b384-ccca4e035be9"],
      },
      {
        title: "Les meilleures crèmes et soins pour peau grasse",
        text: "Côté soins, on cherche des textures légères : gels-crèmes, fluides et sérums matifiants qui hydratent sans graisser. Les actifs comme la niacinamide, le zinc ou l'acide salicylique aident à resserrer les pores et à limiter la brillance.",
        ids: ["de310020-4ab0-5ec2-b7a5-0fa7453fe046", "114b7dc7-86b7-5121-ac17-e81ac470572b", "1a7c173e-abba-5c2f-8484-828bd86ac484", "9db6cd86-008a-54bd-a8e9-903339c7abce"],
      },
    ],
    tips: {
      title: "Nos conseils pour réduire l'excès de sébum",
      text: "Quelques gestes simples, répétés chaque jour, font une vraie différence sur une peau grasse. Voici ce que nous recommandons pour garder un teint net sans abîmer ta peau.",
      items: [
        "Nettoie ta peau deux fois par jour seulement, avec un gel doux : plus souvent, tu stimules la production de sébum.",
        "N'oublie jamais l'hydratation : une crème gel légère évite l'effet rebond et garde la peau confortable.",
        "Intègre un actif régulateur (niacinamide, zinc, acide salicylique) une à deux fois par jour selon la tolérance.",
        "Exfolie en douceur une à deux fois par semaine pour désincruster les pores sans irriter.",
        "Choisis des textures non comédogènes, y compris pour ton maquillage et ta protection solaire.",
        "Change ta taie d'oreiller régulièrement et évite de toucher ton visage dans la journée.",
      ],
    },
    routine: [
      { name: "Nettoyer", icon: "drop", text: "Un gel ou une mousse purifiante, matin et soir, pour retirer l'excès de sébum et les impuretés." },
      { name: "Traiter", icon: "flask", text: "Un sérum ou un soin ciblé (niacinamide, zinc, acide salicylique) pour réguler le sébum et affiner le grain de peau." },
      { name: "Hydrater", icon: "drop-half", text: "Un gel-crème ou un fluide matifiant qui hydrate sans graisser et prévient l'effet rebond." },
      { name: "Protéger", icon: "shield-check", text: "Une protection solaire SPF 50 texture fluide, non comédogène, tous les matins toute l'année." },
    ],
    mistakes: [
      { title: "Décaper la peau", text: "Les produits trop agressifs ou l'alcool dessèchent et déclenchent une surproduction de sébum." },
      { title: "Sauter l'hydratation", text: "Une peau grasse déshydratée brille encore plus et se couvre plus facilement d'imperfections." },
      { title: "Percer les boutons", text: "Cela aggrave l'inflammation et peut laisser des marques durables." },
      { title: "Multiplier les actifs", text: "Mieux vaut introduire un actif à la fois et laisser à la peau le temps de s'adapter." },
      { title: "Oublier la protection solaire", text: "Le soleil épaissit la peau et fonce les marques d'imperfections : l'écran solaire reste indispensable." },
    ],
    articleSlugs: ["pores-dilates-ce-qui-marche-vraiment", "niacinamide-bienfaits-avec-quoi-ne-pas-melanger", "peau-mixte-quelle-routine-adopter"],
    articleKeywords: ["grasse", "pores", "sébum", "niacinamide", "mixte"],
  },

  /* ------------------------------------------------------------------ */
  {
    key: "taches",
    path: "/routine/peau-a-taches",
    breadcrumb: "Taches pigmentaires",
    homeLabel: "TACHES PIGMENTAIRES",
    homeTitle: ["Un teint", "uniforme"],
    homeText: "Atténue les taches brunes, illumine le teint et protège ta peau pour éviter qu'elles reviennent.",
    seoTitle: "Taches pigmentaires : quelle routine adopter ? Soins et conseils | Beautify Vision",
    seoDescription:
      "Taches pigmentaires : comprends leurs causes, découvre les meilleurs sérums anti-taches et protections solaires, la routine complète en 4 étapes et les erreurs à éviter.",
    h1: ["Taches pigmentaires :", "quelle routine adopter ?"],
    intro: [
      "Les taches pigmentaires sont des zones de la peau plus foncées que le reste du teint : taches brunes liées au soleil, marques laissées par les boutons, masque de grossesse ou taches de l'âge. Elles sont fréquentes, bénignes dans la grande majorité des cas, et peuvent s'atténuer avec une routine régulière et adaptée.",
      "Sur cette page, Beautify Vision t'explique d'où viennent les taches, comment les prévenir et quels produits adaptés choisir : sérums anti-taches, protection solaire haute, soins éclat. Tu trouveras aussi une routine complète en 4 étapes et les erreurs qui retardent les résultats.",
    ],
    heroImage: "/image/routines/hero-taches.webp",
    heroTagline: "Un teint lumineux, jour après jour.",
    understand: {
      title: "Comprendre les taches pigmentaires",
      text: [
        "Les taches apparaissent quand les mélanocytes, les cellules qui fabriquent le pigment de la peau, produisent de la mélanine de façon trop importante et irrégulière. Le soleil est la première cause, mais les hormones, l'inflammation (après un bouton, par exemple) et certains traitements peuvent aussi les provoquer.",
        "La clé d'une routine efficace contre les taches pigmentaires tient en deux mots : régularité et protection. Les actifs éclaircissants agissent lentement, souvent en quelques semaines, et leurs effets disparaissent vite si la peau n'est pas protégée du soleil chaque jour. En cas de tache qui change d'aspect, consulte un dermatologue.",
      ],
      points: [
        { icon: "sun", title: "Soleil", text: "Les UV stimulent la mélanine : c'est la première cause de taches brunes." },
        { icon: "drop-half", title: "Après un bouton", text: "Une inflammation peut laisser une marque brune qui met des mois à s'estomper." },
        { icon: "flower-lotus", title: "Hormones", text: "Grossesse ou contraception peuvent favoriser le masque de grossesse." },
        { icon: "clock", title: "Temps", text: "Les taches de l'âge apparaissent avec les années d'exposition cumulées." },
      ],
    },
    productSections: [
      {
        title: "Les meilleurs sérums anti-taches",
        text: "Un sérum anti-taches concentre les actifs qui agissent sur la pigmentation : niacinamide, vitamine C, acide tranexamique ou dérivés éclaircissants. Applique-le matin ou soir, sur peau propre, et compte au minimum quatre à huit semaines avant de juger le résultat.",
        ids: ["6e645561-c1db-5ac8-b6f1-e6890bedaf5b", "76e190b4-8583-57a3-8a7c-409d219612fb", "3391221e-b656-5b64-a10a-c7ff2b4ddab2", "329f992c-18fb-5164-b34c-1b1b7a1414b8"],
      },
      {
        title: "Les meilleures protections solaires pour le visage",
        text: "Sans écran solaire, aucun soin anti-taches ne peut fonctionner durablement. Choisis un SPF 50 avec une bonne protection UVA, dans une texture que tu aimes porter tous les jours : fluide invisible, crème légère ou version teintée.",
        ids: ["ff93c09a-f0dd-5c12-96aa-192c77c35616", "00ed8980-2a3c-5507-a2b6-79d9d4d37c97", "ba8f2cc4-a2f9-5ef9-8954-ddbaa3dc7cf8", "d09f2fcd-61e6-50be-b4eb-25c80327f851"],
      },
    ],
    tips: {
      title: "Nos conseils pour atténuer les taches pigmentaires",
      text: "Atténuer une tache demande de la patience et un peu de méthode. Voici les gestes qui comptent vraiment pour retrouver un teint plus uniforme et éviter que les marques reviennent.",
      items: [
        "Applique une protection solaire SPF 50 chaque matin, même en hiver et par temps nuageux, et renouvelle-la en cas d'exposition prolongée.",
        "Introduis un sérum anti-taches progressivement, un jour sur deux au début, pour limiter les irritations.",
        "Évite de gratter ou de frotter les zones pigmentées : toute inflammation peut aggraver la tache.",
        "Associe un actif éclaircissant le matin (vitamine C) et un soin réparateur le soir pour soutenir la peau.",
        "Sois constante : les résultats se voient en général après un à trois mois d'utilisation régulière.",
        "Consulte un dermatologue si une tache grandit, saigne, change de couleur ou de forme.",
      ],
    },
    routine: [
      { name: "Nettoyer", icon: "drop", text: "Un nettoyant doux, sans savon, matin et soir, pour préparer la peau sans l'irriter." },
      { name: "Traiter", icon: "flask", text: "Un sérum anti-taches (niacinamide, vitamine C…) appliqué sur l'ensemble du visage pour uniformiser le teint." },
      { name: "Hydrater", icon: "drop-half", text: "Une crème hydratante confortable pour renforcer la barrière cutanée et mieux tolérer les actifs." },
      { name: "Protéger", icon: "shield-check", text: "Un écran solaire SPF 50 tous les matins : l'étape la plus importante de la routine anti-taches." },
    ],
    mistakes: [
      { title: "Négliger la protection solaire", text: "Sans SPF, les taches foncent à nouveau et les soins perdent leur effet." },
      { title: "Utiliser des produits irritants", text: "Les gommages trop forts ou les remèdes maison (citron) peuvent aggraver la pigmentation." },
      { title: "Chercher un résultat immédiat", text: "Les actifs agissent sur le renouvellement de la peau : il faut compter plusieurs semaines." },
      { title: "Changer de soin trop souvent", text: "Un soin n'a pas le temps de montrer son efficacité si on l'abandonne au bout de dix jours." },
      { title: "Percer les boutons", text: "Chaque bouton percé est une future tache : mieux vaut les traiter sans y toucher." },
    ],
    articleSlugs: ["niacinamide-bienfaits-avec-quoi-ne-pas-melanger", "barriere-cutanee-abimee-signes-comment-reparer", "routine-skincare-petit-budget-moins-de-30-euros"],
    articleKeywords: ["taches", "niacinamide", "vitamine", "soleil", "éclat"],
  },

  /* ------------------------------------------------------------------ */
  {
    key: "boutons",
    path: "/routine/peau-acneique",
    breadcrumb: "Peau à tendance acnéique",
    homeLabel: "PEAU À TENDANCE ACNÉIQUE",
    homeTitle: ["Stop aux", "boutons"],
    homeText: "Assainis, apaise et traite les imperfections avec des soins ciblés, sans agresser ta peau.",
    seoTitle: "Peau à tendance acnéique : quelle routine adopter ? Soins et conseils | Beautify Vision",
    seoDescription:
      "Peau à tendance acnéique : comprends les boutons, découvre les meilleurs nettoyants et soins anti-imperfections, la routine complète en 4 étapes et les erreurs à éviter.",
    h1: ["Peau à tendance acnéique :", "quelle routine adopter ?"],
    intro: [
      "Une peau à tendance acnéique se caractérise par des boutons, des points noirs ou des microkystes qui reviennent régulièrement, souvent sur le front, le menton et les joues. Elle concerne les adolescents comme beaucoup d'adultes, et n'a rien à voir avec un manque d'hygiène : elle dépend surtout du sébum, des hormones et de l'inflammation.",
      "Sur cette page, Beautify Vision t'aide à comprendre ta peau à tendance acnéique et à choisir des produits adaptés : nettoyants assainissants, soins anti-imperfections ciblés et hydratants non comédogènes. Tu trouveras aussi une routine complète en 4 étapes et les erreurs à éviter.",
    ],
    heroImage: "/image/routines/hero-boutons.webp",
    heroTagline: "Des soins ciblés, une peau apaisée.",
    understand: {
      title: "Comprendre la peau à tendance acnéique",
      text: [
        "Les boutons naissent quand un pore se bouche : le sébum et les cellules mortes forment un bouchon, les bactéries prolifèrent et la peau s'enflamme. Les variations hormonales, le stress, certains cosmétiques gras et une mauvaise gestion de la peau (frotter, percer) peuvent entretenir le problème.",
        "Une routine pour peau à tendance acnéique doit donc faire trois choses à la fois : purifier les pores, calmer l'inflammation et respecter la barrière cutanée. Les actifs comme l'acide salicylique, le zinc, la niacinamide ou le peroxyde de benzoyle sont efficaces, mais s'introduisent un à un. Si l'acné est sévère ou douloureuse, un avis médical s'impose.",
      ],
      points: [
        { icon: "circle-dashed", title: "Pores bouchés", text: "Points noirs et microkystes dus à l'accumulation de sébum et de cellules mortes." },
        { icon: "fire", title: "Inflammation", text: "Boutons rouges, parfois douloureux, qui peuvent laisser des marques." },
        { icon: "drop", title: "Sébum", text: "Une production élevée de sébum favorise le développement des bactéries." },
        { icon: "shield-check", title: "Barrière fragilisée", text: "Des soins trop agressifs aggravent les rougeurs et les poussées." },
      ],
    },
    productSections: [
      {
        title: "Les meilleurs nettoyants pour peau à tendance acnéique",
        text: "Le nettoyant est la base de la routine anti-boutons. Choisis un gel ou une mousse assainissante, sans savon ni alcool, qui élimine le sébum et les impuretés sans irriter. Un lavage matin et soir suffit largement.",
        ids: ["02c55c9d-46d4-5492-900a-dec1cef82b16", "69862816-61db-5773-a709-4f6c31276555", "8e9fe305-546b-5f57-919c-1a70b2772924", "9156e0a8-adf3-5e90-9795-ecccb8cd6023"],
      },
      {
        title: "Les meilleurs soins anti-imperfections",
        text: "Les soins ciblés combinent des actifs kératolytiques et apaisants pour désobstruer les pores et réduire les boutons existants. Applique-les en fine couche sur les zones concernées ou sur tout le visage selon les indications du produit.",
        ids: ["bdce14e1-5d23-5016-b558-d3c67cf1c03b", "d9f52671-0abe-5446-a57f-d591b4283f8d", "de514cbe-c591-5c30-b0a8-ccc47d8c9137", "273ada16-c150-5123-b23d-f8e4227e68eb"],
      },
    ],
    tips: {
      title: "Nos conseils pour limiter les boutons",
      text: "Pour une peau à tendance acnéique, la constance compte plus que l'intensité. Ces gestes t'aideront à calmer les poussées et à éviter les marques sur le long terme.",
      items: [
        "Ne perce jamais un bouton : tu risques d'aggraver l'inflammation et de laisser une cicatrice.",
        "Introduis un seul actif nouveau à la fois, et attends deux à trois semaines avant d'en ajouter un autre.",
        "Hydrate ta peau avec une crème non comédogène : une peau sèche et irritée produit plus d'imperfections.",
        "Nettoie tes téléphones, pinceaux de maquillage et taies d'oreiller régulièrement.",
        "Protège ta peau du soleil avec un SPF léger : il limite aussi les marques post-boutons.",
        "Si les boutons sont nombreux, profonds ou douloureux, consulte un dermatologue sans attendre.",
      ],
    },
    routine: [
      { name: "Nettoyer", icon: "drop", text: "Un gel assainissant doux, matin et soir, pour purifier les pores sans décaper." },
      { name: "Traiter", icon: "flask", text: "Un soin anti-imperfections (acide salicylique, zinc, niacinamide) sur les zones à boutons, le soir de préférence." },
      { name: "Hydrater", icon: "drop-half", text: "Une crème légère non comédogène qui apaise et répare la barrière cutanée." },
      { name: "Protéger", icon: "shield-check", text: "Un SPF 50 fluide et non gras, pour éviter que les marques ne foncent au soleil." },
    ],
    mistakes: [
      { title: "Se laver trop souvent", text: "Plus de deux nettoyages par jour irritent la peau et aggravent les poussées." },
      { title: "Utiliser des produits trop forts", text: "Cumuler acides, gommages et alcool fragilise la barrière cutanée et fait réagir la peau." },
      { title: "Sauter l'hydratation", text: "Même grasse et boutonneuse, la peau a besoin d'une crème légère pour se réparer." },
      { title: "Percer ou gratter", text: "Les gestes brusques créent des marques et prolongent la durée des boutons." },
      { title: "Abandonner trop vite", text: "Un soin anti-imperfections demande souvent six à huit semaines pour montrer ses effets." },
    ],
    articleSlugs: ["pores-dilates-ce-qui-marche-vraiment", "barriere-cutanee-abimee-signes-comment-reparer", "niacinamide-bienfaits-avec-quoi-ne-pas-melanger"],
    articleKeywords: ["acné", "boutons", "imperfections", "pores", "barrière"],
  },

  /* ------------------------------------------------------------------ */
  {
    key: "seche",
    path: "/routine/peau-seche",
    breadcrumb: "Peau sèche",
    homeLabel: "PEAU SÈCHE",
    homeTitle: ["Un confort", "durable"],
    homeText: "Nourris, répare et protège ta peau pour dire adieu aux tiraillements et aux sensations d'inconfort.",
    seoTitle: "Peau sèche : quelle routine adopter ? Soins et conseils | Beautify Vision",
    seoDescription:
      "Peau sèche : comprends les tiraillements, découvre les meilleures crèmes et nettoyants doux, la routine complète en 4 étapes et les erreurs à éviter.",
    h1: ["Peau sèche :", "quelle routine adopter ?"],
    intro: [
      "La peau sèche manque de lipides : elle tiraille, devient rugueuse, peut peler ou rougir, surtout après la douche ou en hiver. Elle est souvent plus fine et plus sensible aux agressions extérieures, mais elle réagit très bien à une routine nourrissante, régulière et sans produits irritants.",
      "Sur cette page, Beautify Vision t'aide à comprendre ta peau sèche et à choisir des produits adaptés : nettoyants doux, crèmes riches, sérums hydratants et protection solaire. Tu trouveras aussi une routine complète en 4 étapes et les erreurs à éviter pour retrouver confort et souplesse.",
    ],
    heroImage: "/image/routines/hero-seche.webp",
    heroTagline: "Nourrie, apaisée, confortable.",
    understand: {
      title: "Comprendre la peau sèche",
      text: [
        "La peau sèche produit moins de sébum et possède une barrière cutanée moins efficace : l'eau s'évapore plus facilement et la peau perd en souplesse. Il ne faut pas la confondre avec une peau déshydratée, qui manque d'eau et peut toucher tous les types de peau, y compris les peaux grasses.",
        "Le froid, le chauffage, l'eau très chaude, les savons détergents et certains traitements accentuent la sécheresse. Une bonne routine pour peau sèche associe des produits doux, des actifs hydratants (acide hyaluronique, glycérine) et des corps gras réparateurs (céramides, beurre de karité) pour restaurer la barrière cutanée.",
      ],
      points: [
        { icon: "snowflake", title: "Tiraillements", text: "Une sensation de peau qui tire, surtout après le nettoyage et en hiver." },
        { icon: "waves", title: "Barrière affaiblie", text: "L'eau s'évapore plus vite : la peau devient rugueuse et peut peler." },
        { icon: "thermometer-simple", title: "Sensibilité", text: "Chaleur, vent et eau chaude provoquent rougeurs et inconfort." },
        { icon: "heart", title: "Besoin de confort", text: "Elle réclame des textures riches, régulières et sans parfum agressif." },
      ],
    },
    productSections: [
      {
        title: "Les meilleures crèmes pour peau sèche",
        text: "Pour une peau sèche, choisis des crèmes riches en céramides, glycérine, beurre de karité ou acide hyaluronique. Elles nourrissent en profondeur, réparent la barrière cutanée et assurent un confort qui dure toute la journée.",
        ids: ["5dccfe9d-3a0e-59a9-bc0e-d415669ce744", "ecfba931-df9e-545a-b772-58acbf3edafa", "092c648a-eb37-5e1d-b033-e2d4ed7a8f74", "1de5b6ad-979c-5150-b9c9-dcb5888326c1"],
      },
      {
        title: "Les meilleurs nettoyants doux pour peau sèche",
        text: "Un nettoyant pour peau sèche doit respecter le film hydrolipidique : huiles, laits et eaux micellaires sont de bons alliés. Évite les gels moussants détergents et rince à l'eau tiède pour préserver le confort de ta peau.",
        ids: ["873bd077-b06b-59b7-9d6e-a924df866af7", "1b6f83f4-0862-50a0-ae8b-286c0ac4a53f", "64f1a5ba-8045-5ec1-9274-cab817b3b5b6", "fc559506-16b9-555d-ab0d-1c5a2d5abd58"],
      },
    ],
    tips: {
      title: "Nos conseils pour soulager la peau sèche",
      text: "Une peau sèche aime la douceur et la régularité. Ces habitudes t'aideront à retrouver du confort et à renforcer ta barrière cutanée durablement.",
      items: [
        "Utilise de l'eau tiède plutôt que chaude, pour le visage comme pour la douche.",
        "Applique ta crème sur peau légèrement humide pour mieux retenir l'hydratation.",
        "Ajoute un sérum à l'acide hyaluronique sous ta crème pour les périodes de sécheresse marquée.",
        "Choisis des produits sans parfum ni alcool, qui limitent les réactions d'inconfort.",
        "Prévois un masque nourrissant une à deux fois par semaine, et un baume sur les zones les plus sèches.",
        "Bois suffisamment et humidifie l'air de ta pièce si le chauffage est fort en hiver.",
      ],
    },
    routine: [
      { name: "Nettoyer", icon: "drop", text: "Une huile, un lait ou une eau micellaire douce, matin et soir, sans frotter ni utiliser d'eau chaude." },
      { name: "Traiter", icon: "flask", text: "Un sérum hydratant à l'acide hyaluronique ou aux céramides pour repulper et réparer la peau." },
      { name: "Hydrater", icon: "drop-half", text: "Une crème riche et nourrissante, appliquée matin et soir, pour sceller l'hydratation." },
      { name: "Protéger", icon: "shield-check", text: "Une protection solaire SPF 50 de texture crème, qui complète l'hydratation tout au long de l'année." },
    ],
    mistakes: [
      { title: "Utiliser de l'eau trop chaude", text: "Elle dissout les lipides naturels de la peau et accentue les tiraillements." },
      { title: "Choisir des savons détergents", text: "Les produits très moussants assèchent la peau : préfère laits, huiles et eaux micellaires." },
      { title: "Exfolier trop souvent", text: "Un gommage doux, une fois par semaine au maximum, suffit pour ne pas fragiliser la barrière cutanée." },
      { title: "Négliger l'hiver", text: "Froid et chauffage aggravent la sécheresse : adapte tes soins avec des textures plus riches." },
      { title: "Hydrater seulement quand ça tire", text: "L'hydratation doit être quotidienne, matin et soir, pas seulement en cas d'inconfort." },
    ],
    articleSlugs: ["barriere-cutanee-abimee-signes-comment-reparer", "peau-tres-seche-du-corps-en-hiver-la-routine", "routine-skincare-petit-budget-moins-de-30-euros"],
    articleKeywords: ["sèche", "barrière", "hiver", "hydrat"],
  },
];

export function getSkinRoutine(key) {
  return SKIN_ROUTINES.find((r) => r.key === key);
}
