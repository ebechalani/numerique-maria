import type { Tutoriel } from "./types";

/**
 * Tutoriel Coggle — construire une carte mentale, seul ou à plusieurs.
 *
 * Source : le support de prise en main fourni par l’établissement (trois
 * pages, « Structurer sa carte avec Coggle »). Les gestes décrits en sont
 * repris dans le même ordre : créer un diagramme, nommer et mettre en forme
 * le sujet central, insérer des branches, les modifier par le menu
 * contextuel, ajouter des sous-sujets.
 *
 * Y sont ajoutés le partage, l’export et les usages de classe, que le support
 * n’aborde pas et sans lesquels le tutoriel ne se suffirait pas à lui-même.
 *
 * Coggle n’est pas un outil d’IA et ne fait pas partie de la formation : il
 * n’a donc pas de renvoi vers un module.
 */
export const coggle: Tutoriel = {
  slug: "coggle",
  outil: "Coggle",
  editeur: "Coggle",
  sousTitre: "Construire une carte mentale, seul ou à plusieurs",
  accroche:
    "Une carte qui pousse par branches, à la souris : un sujet au centre, des ramifications autour, des couleurs, des images et des commentaires — et plusieurs personnes dessus en même temps.",
  adresse: "https://coggle.it",
  cout: "Offre gratuite, avec un compte",
  duree: "15 minutes pour une première carte",
  interfaceDecrite: "Interface de Coggle au printemps 2026",

  prerequis: [
    {
      titre: "Un compte gratuit",
      texte:
        "La création se fait en quelques minutes sur coggle.it. Une fois connecté, vous arrivez sur un tableau de bord qui récapitule vos cartes et celles partagées avec vous.",
    },
    {
      titre: "Un navigateur à jour",
      texte:
        "Coggle fonctionne dans le navigateur, sans rien installer. Une souris ou un pavé tactile confortable aide : tout se fait au clic et au glisser.",
    },
    {
      titre: "Un contenu à structurer",
      texte:
        "Une séquence à organiser, une notion à décomposer, un projet à cadrer. Une carte se construit mieux à partir d’un vrai contenu que d’un exemple fabriqué.",
    },
  ],

  blocs: [
    /* ---------------- À quoi ça sert ---------------- */
    { type: "titre", texte: "À quoi sert Coggle" },
    {
      type: "paragraphe",
      texte:
        "Coggle sert à faire une carte mentale : un sujet au centre, des branches qui partent autour, et des sous-branches qui se ramifient. C’est utile quand l’information n’est pas linéaire — décomposer une notion, cartographier un chapitre, organiser un projet — et quand on veut voir la structure d’un coup d’œil plutôt que de la lire de haut en bas.",
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "Carte mentale ou plan ?",
      texte:
        "Une carte montre les liens entre les idées ; un plan montre leur ordre. Si votre contenu a un début et une fin, un document ordinaire fera mieux. Si vos idées se rattachent les unes aux autres sans ordre imposé, la carte est le bon outil.",
    },

    /* ---------------- 1. Créer ---------------- */
    { type: "titre", texte: "1. Créer votre première carte" },
    {
      type: "etapes",
      etapes: [
        {
          titre: "Se connecter",
          texte:
            "Après la création de votre compte gratuit, vous arrivez sur un tableau de bord qui récapitule les cartes créées et celles qui ont été partagées avec vous.",
        },
        {
          titre: "Créer un diagramme",
          texte:
            "Le bouton « Créer un diagramme » ouvre une carte vierge, avec en son centre le cœur qui attend d’être nommé.",
        },
      ],
    },

    /* ---------------- 2. Sujet central ---------------- */
    { type: "titre", texte: "2. Nommer et mettre en forme le sujet central" },
    {
      type: "paragraphe",
      texte:
        "Cliquez sur le sujet central pour le renommer. Dès que vous inscrivez un titre, cinq icônes de mise en page apparaissent : elles s’appliquent au sujet sélectionné, et se retrouveront à l’identique sur chaque branche.",
    },
    {
      type: "tableau",
      entetes: ["Icône", "Ce qu’elle fait", "Quand s’en servir"],
      lignes: [
        ["Gras", "Met le texte en gras", "Les nœuds qui structurent la carte"],
        ["Italique", "Met le texte en italique", "Une nuance, un exemple, une citation"],
        [
          "Lien",
          "Insère une adresse web",
          "Renvoyer vers la source, une vidéo, un exercice en ligne",
        ],
        [
          "Image",
          "Insère une image depuis votre disque dur",
          "Un schéma, une photo de tableau, une illustration",
        ],
        ["Icône", "Insère une icône", "Marquer un statut : à faire, acquis, à revoir"],
      ],
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "Agrandir le texte",
      texte:
        "La poignée en bas à droite du sujet augmente la taille des caractères par un cliquer-glisser. C’est ce qui donne à la carte sa hiérarchie visuelle : le cœur plus gros que les branches, les branches plus grosses que les feuilles.",
    },

    /* ---------------- 3. Branches ---------------- */
    { type: "titre", texte: "3. Insérer des branches" },
    {
      type: "etapes",
      etapes: [
        {
          titre: "Survoler le sujet",
          texte:
            "Passez la souris sur le sujet : deux icônes en forme de croix apparaissent, une de chaque côté.",
        },
        {
          titre: "Cliquer sur une croix",
          texte: "La branche apparaît, prête à être nommée.",
        },
        {
          titre: "Recommencer",
          texte:
            "Chaque nouveau clic sur la croix crée une branche de même niveau. C’est ainsi qu’on étale les grandes parties autour du cœur.",
        },
      ],
    },
    {
      type: "paragraphe",
      texte:
        "À la création d’une branche, Coggle propose aussitôt de nommer le sujet et affiche les mêmes icônes de mise en forme que pour le cœur.",
    },
    {
      type: "paragraphe",
      texte:
        "Pour ajouter un sous-sujet à une branche existante, passez la souris sur l’extrémité de cette branche : le signe en croix réapparaît. Un clic crée à la fois le nouveau sujet et sa ramification.",
    },

    /* ---------------- 4. Modifier ---------------- */
    { type: "titre", texte: "4. Modifier une branche" },
    {
      type: "paragraphe",
      texte:
        "Un clic droit sur une branche ouvre son menu. Sept actions y sont disponibles :",
    },
    {
      type: "tableau",
      entetes: ["Action", "Ce qu’elle permet"],
      lignes: [
        ["Choisir une couleur", "Appliquer une couleur à la branche et la distinguer des autres"],
        ["Supprimer la branche", "L’effacer, avec tout son contenu — sous-branches comprises"],
        ["Copier la branche", "La dupliquer pour la réutiliser ailleurs"],
        [
          "Transplanter une branche",
          "La déplacer et l’accrocher à un autre sujet de la carte, sans la reconstruire",
        ],
        ["Ajouter une branche", "Créer une ramification depuis le menu plutôt qu’à la souris"],
        [
          "Ajouter des commentaires",
          "Insérer une note avec des informations utiles ; son contenu se met en page comme un sujet",
        ],
        [
          "Ajouter un lien",
          "Tracer une relation entre deux sujets de la carte, même éloignés",
        ],
      ],
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "Les deux actions qui font gagner du temps",
      texte:
        "« Transplanter » évite de tout refaire quand la structure change en cours de route — et elle change presque toujours. « Ajouter un lien » sert à montrer qu’une idée d’une branche en rejoint une autre : c’est ce qui distingue une vraie carte mentale d’un plan déguisé.",
    },

    /* ---------------- 5. Partager ---------------- */
    { type: "titre", texte: "5. Partager, suivre, exporter" },
    {
      type: "paragraphe",
      texte:
        "Une carte se partage depuis son menu de partage : les personnes invitées la voient, et selon le droit accordé peuvent la modifier en même temps que vous — les curseurs des uns et des autres apparaissent sur la carte. C’est ce qui explique que le tableau de bord distingue vos cartes de celles partagées avec vous.",
    },
    {
      type: "paragraphe",
      texte:
        "Une carte terminée s’exporte, en image ou en document, pour être projetée, imprimée ou déposée dans un espace de classe. Les formats proposés et les limites de l’offre gratuite — notamment le nombre de cartes privées — évoluent : l’aide officielle, liée en bas de page, donne l’état du jour.",
    },
    {
      type: "encadre",
      ton: "attention",
      titre: "Avant de partager",
      texte:
        "Une carte partagée par lien peut être vue par toute personne qui l’obtient. Vérifiez ce qu’elle contient avant de l’ouvrir — et n’y portez aucune donnée personnelle d’élève : ni nom, ni note, ni observation individuelle.",
    },

    /* ---------------- En classe ---------------- */
    { type: "titre", texte: "Quelques usages en classe" },
    {
      type: "cartes",
      colonnes: 3,
      cartes: [
        {
          titre: "Cartographier un chapitre",
          texte:
            "Le cœur porte la notion, les branches les grandes parties, les feuilles les mots clés. La carte devient la fiche de révision.",
        },
        {
          titre: "Construire à plusieurs",
          texte:
            "Une carte partagée en groupe, chacun sa branche : la structure se discute en la construisant, pas avant.",
        },
        {
          titre: "Cadrer un projet",
          texte:
            "Une branche par étape, des commentaires pour les responsabilités, des liens pour les dépendances entre étapes.",
        },
      ],
    },

    /* ---------------- Check-list ---------------- */
    { type: "titre", texte: "Votre première carte, pas à pas" },
    {
      type: "checklist",
      id: "tutoriel-coggle",
      consigne:
        "Six gestes, un quart d’heure. Cochez au fur et à mesure : à la fin, vous avez une carte qui sert vraiment.",
      items: [
        {
          titre: "J’ai créé un diagramme et nommé le cœur",
          texte: "Le sujet réel que je veux structurer, pas « Essai ».",
        },
        {
          titre: "J’ai créé mes branches principales",
          texte:
            "En survolant le cœur et en cliquant sur la croix, autant de fois que de grandes parties.",
        },
        {
          titre: "J’ai mis en forme au moins un sujet",
          texte:
            "Gras, couleur, et la poignée pour agrandir : la hiérarchie doit se voir sans lire.",
        },
        {
          titre: "J’ai ajouté un sous-sujet",
          texte: "En cliquant sur la croix à l’extrémité d’une branche.",
        },
        {
          titre: "J’ai essayé le clic droit",
          texte:
            "Au moins une couleur, et une transplantation — c’est ce qui sert quand la structure bouge.",
        },
        {
          titre: "J’ai vérifié le contenu avant de partager",
          texte: "Aucune donnée d’élève sur la carte.",
        },
      ],
    },
  ],

  liens: [
    {
      libelle: "Ouvrir Coggle",
      href: "https://coggle.it",
      description: "L’outil lui-même, dans votre navigateur.",
    },
    {
      libelle: "Aide officielle Coggle",
      href: "https://coggle.it/help",
      description:
        "La documentation de l’éditeur : formats d’export, partage, limites de l’offre gratuite.",
    },
  ],
};
