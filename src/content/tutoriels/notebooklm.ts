import type { Tutoriel } from "./types";

/**
 * Tutoriel NotebookLM — prise en main complète, du premier carnet au partage.
 *
 * Il prolonge le module 5 de la formation, qui présente l’outil en 25 minutes
 * (diapositives 17 à 20 du diaporama source) : le workflow en quatre étapes,
 * les sources acceptées et le prompt de démonstration en sont repris tels
 * quels. Tout le reste — les gestes précis, les limites, le partage — est
 * ajouté ici, car un tutoriel doit se suffire à lui-même.
 *
 * Les interfaces des outils d’IA changent souvent. Les intitulés de boutons
 * sont donc décrits par ce qu’ils font autant que par leur libellé, et la page
 * affiche en tête la version décrite ainsi que le lien vers l’aide officielle.
 */
export const notebookLm: Tutoriel = {
  slug: "notebooklm",
  outil: "NotebookLM",
  editeur: "Google",
  sousTitre: "Faire travailler l’IA à partir de vos propres documents",
  accroche:
    "Importez vos documents, posez vos questions, obtenez des réponses qui citent le passage d’origine — et transformez la même source en résumé, en QCM ou en guide d’étude.",
  adresse: "https://notebooklm.google.com",
  cout: "Gratuit, avec un compte Google",
  duree: "20 minutes pour un premier carnet",
  interfaceDecrite: "Interface de NotebookLM au printemps 2026",

  renvoiModule: {
    formation: "ia-generative-en-classe",
    module: "notebooklm",
    libelle: "Module 5 — NotebookLM",
  },

  prerequis: [
    {
      titre: "Un compte Google",
      texte:
        "Personnel ou fourni par l’établissement. La création est gratuite et prend quelques minutes.",
    },
    {
      titre: "Un navigateur à jour",
      texte:
        "Chrome, Edge, Firefox ou Safari. NotebookLM fonctionne dans le navigateur : il n’y a rien à installer.",
    },
    {
      titre: "Un document de travail",
      texte:
        "Une fiche de séquence, une progression, un chapitre de cours, un règlement — un document que vous utilisez vraiment, sans aucune donnée personnelle d’élève.",
    },
  ],

  blocs: [
    /* ---------------- À quoi ça sert ---------------- */
    { type: "titre", texte: "À quoi sert NotebookLM" },
    {
      type: "paragraphe",
      texte:
        "NotebookLM est un assistant de recherche qui travaille à partir des documents que vous lui donnez, et d’eux seuls. Vous créez un carnet, vous y déposez vos sources, puis vous les interrogez : il répond en citant le passage d’où vient chaque affirmation. C’est ce qui le distingue d’un assistant généraliste, qui répond de mémoire à partir de ce qu’il a appris.",
    },
    {
      type: "encadre",
      ton: "regle",
      titre: "L’idée clé",
      texte:
        "Vos documents deviennent le contexte de travail. Tout ce que NotebookLM vous répond doit pouvoir être retrouvé dans les sources que vous avez importées.",
    },
    {
      type: "tableau",
      entetes: ["", "ChatGPT", "NotebookLM"],
      lignes: [
        [
          "Sur quoi il s’appuie",
          "Ce qu’il a appris, plus le web s’il le consulte",
          "Les sources que vous avez importées",
        ],
        [
          "Ce qu’il fait le mieux",
          "Produire à partir de rien : des idées, un texte, une reformulation",
          "Exploiter un document que vous avez déjà : synthétiser, retrouver, transformer",
        ],
        [
          "Vérification",
          "À faire vous-même, la réponse ne cite pas ses sources",
          "Chaque réponse renvoie au passage de la source",
        ],
        [
          "Le bon réflexe",
          "Relire les faits avant usage",
          "Ouvrir la citation et relire le passage",
        ],
      ],
    },

    /* ---------------- 1. Créer un carnet ---------------- */
    { type: "titre", texte: "1. Créer votre premier carnet" },
    {
      type: "etapes",
      etapes: [
        {
          titre: "Ouvrir notebooklm.google.com",
          texte:
            "Connectez-vous avec votre compte Google. Si l’outil n’est pas disponible dans la langue attendue, le réglage de langue de votre compte Google s’applique.",
        },
        {
          titre: "Créer un carnet",
          texte:
            "Le bouton de création est le premier élément de la page d’accueil. Un carnet vide s’ouvre, avec un panneau de sources à gauche, la conversation au centre et les supports à produire à droite.",
        },
        {
          titre: "Le nommer",
          texte:
            "Le titre se modifie en cliquant dessus. Donnez-lui le nom du chapitre ou du projet : c’est ce qui vous permettra de le retrouver dans six mois.",
        },
      ],
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "Un carnet par sujet, pas un carnet par année",
      texte:
        "NotebookLM répond d’autant mieux que les sources d’un carnet parlent de la même chose. Mélanger un chapitre de cours, le règlement intérieur et un projet de sortie dans un seul carnet dilue les réponses. Créez plutôt un carnet par séquence, par projet ou par document de référence.",
    },

    /* ---------------- 2. Importer des sources ---------------- */
    { type: "titre", texte: "2. Importer vos sources" },
    {
      type: "paragraphe",
      texte:
        "Le panneau des sources porte un bouton d’ajout. Vous pouvez aussi glisser-déposer un fichier directement dessus. Une source importée est analysée en quelques secondes ; elle apparaît ensuite dans la liste, avec une case qui permet de l’inclure ou non dans les réponses.",
    },
    {
      type: "tableau",
      entetes: ["Type de source", "Comment l’ajouter", "Bon à savoir"],
      lignes: [
        [
          "PDF",
          "Glisser-déposer, ou parcourir vos fichiers",
          "Le texte doit être sélectionnable. Un PDF qui n’est qu’une photo de page ne sera pas lu : repassez-le par une reconnaissance de texte.",
        ],
        [
          "Google Docs, Slides, Sheets",
          "Choisir le fichier dans votre Drive",
          "NotebookLM en lit une copie figée au moment de l’import. Si vous modifiez le document ensuite, il faut demander la resynchronisation de la source.",
        ],
        [
          "Page web",
          "Coller l’adresse",
          "Seules les pages publiques sont lisibles. Une page derrière un identifiant ou un paywall ne passera pas.",
        ],
        [
          "Vidéo YouTube",
          "Coller le lien",
          "C’est la transcription qui est lue, pas l’image. La vidéo doit être publique et disposer d’une transcription.",
        ],
        [
          "Fichier audio",
          "Téléverser le fichier",
          "L’audio est transcrit automatiquement, puis traité comme du texte.",
        ],
        [
          "Texte collé",
          "Choisir « texte copié » et coller",
          "Le plus rapide pour un extrait, un courriel ou une consigne isolée.",
        ],
      ],
    },
    {
      type: "encadre",
      ton: "attention",
      titre: "Ce qu’on n’importe jamais",
      texte:
        "Aucun document contenant une donnée personnelle d’élève : ni liste de classe, ni notes, ni appréciation nominative, ni compte rendu d’entretien avec une famille, ni photo. Si vous avez besoin d’aide sur une situation, décrivez-la sans le moindre élément identifiant — « élève A », « élève B ».",
    },
    {
      type: "encadre",
      ton: "info",
      titre: "Les limites, en pratique",
      texte:
        "L’offre gratuite autorise plusieurs dizaines de sources par carnet et une centaine de carnets, chaque source pouvant peser plusieurs centaines de milliers de mots — largement de quoi travailler un chapitre ou un projet. Google fait évoluer ces plafonds régulièrement : le chiffre exact du jour se lit dans l’aide officielle, liée en bas de cette page.",
    },

    /* ---------------- 3. Interroger ---------------- */
    { type: "titre", texte: "3. Interroger le carnet" },
    {
      type: "paragraphe",
      texte:
        "La zone de conversation se trouve au centre. Posez une question précise plutôt qu’un mot-clé : NotebookLM ne cherche pas dans un index, il lit vos sources pour vous répondre. La méthode ACTIF vaut ici comme ailleurs — le contexte, la tâche et le format changent la réponse autant que dans ChatGPT.",
    },
    {
      type: "requete",
      titre: "Une question qui donne une réponse exploitable",
      texte:
        "À partir des sources de ce carnet, réponds à la question suivante : [votre question précise]. N’indique que ce qui figure dans les sources, cite le passage utilisé, et signale explicitement ce que les sources ne disent pas. Réponds en 5 lignes maximum.",
      commentaire:
        "La dernière consigne est la plus utile : demander ce que les sources ne disent pas évite les réponses qui comblent les trous.",
    },
    {
      type: "paragraphe",
      texte:
        "Chaque réponse porte des numéros de citation. Un clic ouvre la source au passage exact qui a servi à la formuler. C’est le geste qui fait toute la différence avec un assistant généraliste : la vérification prend quelques secondes au lieu d’une recherche complète.",
    },
    {
      type: "encadre",
      ton: "regle",
      titre: "Le bon réflexe",
      texte:
        "Une citation facilite la vérification, mais ne remplace pas votre lecture du document source. Ouvrez le passage avant d’utiliser une information en classe.",
    },

    /* ---------------- 4. Transformer ---------------- */
    { type: "titre", texte: "4. Transformer vos sources en supports" },
    {
      type: "paragraphe",
      texte:
        "Le panneau de droite produit des supports à partir des mêmes sources, en un clic. C’est là que l’outil fait gagner le plus de temps : le document a déjà été lu, il ne reste qu’à choisir la forme.",
    },
    {
      type: "cartes",
      colonnes: 3,
      cartes: [
        {
          titre: "Guide d’étude",
          texte:
            "Les notions à retenir, des questions de révision et leur corrigé, tirés de vos sources.",
        },
        {
          titre: "Document de briefing",
          texte:
            "La synthèse d’un document long en points clés — utile avant une réunion d’équipe.",
        },
        {
          titre: "Questions fréquentes",
          texte:
            "Les questions que le document appelle, avec les réponses qu’il contient.",
        },
        {
          titre: "Chronologie",
          texte:
            "Les événements et les dates remis dans l’ordre, quand la source s’y prête.",
        },
        {
          titre: "Carte mentale",
          texte:
            "L’arborescence des notions du document, à projeter ou à distribuer.",
        },
        {
          titre: "Résumé audio",
          texte:
            "Une conversation générée entre deux voix, qui reprend le contenu des sources. À écouter en préparant, plutôt qu’à diffuser tel quel.",
        },
      ],
    },
    {
      type: "paragraphe",
      texte:
        "Tout ce que ces boutons produisent peut aussi être demandé dans la conversation, avec vos propres contraintes. C’est ce que montre la démonstration de la formation :",
    },
    {
      type: "requete",
      titre: "La démonstration de la séance",
      texte:
        "À partir du règlement intérieur, génère un QCM sur les droits et devoirs des élèves. Crée 6 questions, 4 choix par question, indique la bonne réponse et cite le passage utilisé.",
      commentaire:
        "On peut ensuite demander une version plus simple, un vrai/faux ou des cas pratiques — sans réimporter le document.",
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "La première réponse n’est qu’un point de départ",
      texte:
        "Relancez dans la même conversation, une demande à la fois : « Refais plus court. », « Mets le résultat en tableau. », « Adapte à une classe de 6e. », « Ajoute un exemple pour chaque point. »",
    },

    /* ---------------- 5. Garder et partager ---------------- */
    { type: "titre", texte: "5. Garder et partager" },
    {
      type: "etapes",
      etapes: [
        {
          titre: "Épingler une réponse",
          texte:
            "Une réponse utile s’enregistre en note dans le carnet. Sans cela elle disparaît avec la conversation.",
        },
        {
          titre: "Reprendre une note comme source",
          texte:
            "Une note enregistrée peut être reversée dans les sources du carnet : le travail fait sert de matière au travail suivant.",
        },
        {
          titre: "Partager le carnet",
          texte:
            "Le partage se fait par adresse Google, en lecture ou en édition, comme pour un document Drive. Un collègue invité voit les sources et peut interroger le carnet.",
        },
        {
          titre: "Sortir le contenu",
          texte:
            "Les textes produits se copient dans un document ordinaire pour être mis en page, imprimés ou distribués.",
        },
      ],
    },
    {
      type: "encadre",
      ton: "attention",
      titre: "Partager un carnet, c’est partager ses sources",
      texte:
        "La personne invitée accède aux documents importés, pas seulement aux réponses. Vérifiez le contenu du carnet avant de l’ouvrir à quelqu’un — et souvenez-vous qu’un document de travail interne n’a pas vocation à circuler.",
    },

    /* ---------------- Limites ---------------- */
    { type: "titre", texte: "Ce que NotebookLM ne fait pas" },
    {
      type: "liste",
      items: [
        "Il ne sait rien de ce qui n’est pas dans vos sources : une question hors sujet reçoit une réponse vide ou hors sol.",
        "Il peut mal lire un passage, surtout dans un tableau, un schéma ou un PDF mal structuré. La citation sert précisément à le repérer.",
        "Il ne remplace pas votre lecture du document : il vous fait gagner le temps de la recherche, pas celui de la relecture.",
        "Il ne juge pas les acquis d’un élève, et ne doit recevoir aucune donnée qui permette d’en identifier un.",
      ],
    },

    /* ---------------- Check-list ---------------- */
    { type: "titre", texte: "Votre premier carnet, pas à pas" },
    {
      type: "checklist",
      id: "tutoriel-notebooklm",
      consigne:
        "Six gestes, une vingtaine de minutes. Cochez au fur et à mesure : à la fin, vous avez un carnet qui sert vraiment.",
      items: [
        {
          titre: "J’ai créé un carnet et je l’ai nommé",
          texte: "Le nom du chapitre ou du projet, pas « Essai 1 ».",
        },
        {
          titre: "J’ai importé un document, sans donnée d’élève",
          texte:
            "Un document que j’utilise vraiment, et dont le texte est sélectionnable.",
        },
        {
          titre: "J’ai posé une question précise",
          texte:
            "Une vraie question de préparation, pas un mot-clé ni un test.",
        },
        {
          titre: "J’ai ouvert une citation et relu le passage",
          texte:
            "Le passage dit-il bien ce que la réponse affirme ? C’est le geste à ne jamais sauter.",
        },
        {
          titre: "J’ai demandé une transformation",
          texte:
            "Un guide d’étude, un QCM, une synthèse — puis une relance pour l’ajuster.",
        },
        {
          titre: "J’ai enregistré ce qui me sert",
          texte:
            "En note dans le carnet, ou copié dans mon document de préparation.",
        },
      ],
    },
  ],

  liens: [
    {
      libelle: "Ouvrir NotebookLM",
      href: "https://notebooklm.google.com",
      description: "L’outil lui-même, dans votre navigateur.",
    },
    {
      libelle: "Aide officielle NotebookLM",
      href: "https://support.google.com/notebooklm",
      description:
        "La documentation de Google : formats acceptés, limites du jour, nouveautés.",
    },
    {
      libelle: "Tutoriel ChatGPT",
      href: "/tutoriels/chatgpt",
      description:
        "L’autre outil de la formation, pour produire à partir de rien plutôt qu’à partir d’un document.",
    },
  ],
};
