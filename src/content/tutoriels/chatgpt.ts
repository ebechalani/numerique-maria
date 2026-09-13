import type { Tutoriel } from "./types";

/**
 * Tutoriel ChatGPT — prise en main, de la première demande aux réglages de
 * confidentialité.
 *
 * Il prolonge le module 4 de la formation, qui explique en quinze minutes
 * comment ChatGPT produit une réponse et pose les trois réflexes
 * professionnels — vérifier, protéger, itérer (diapositives 15 et 16 du
 * diaporama source). Ces trois réflexes structurent le tutoriel : chacun y
 * trouve sa traduction en gestes concrets.
 *
 * Les interfaces des outils d’IA changent souvent, et ChatGPT plus vite que la
 * moyenne : noms de modèles, formules payantes et emplacements de menus
 * bougent d’un trimestre à l’autre. Les fonctions sont donc décrites par ce
 * qu’elles font et par l’endroit où les chercher, jamais par un libellé de
 * bouton seul, et aucun prix n’est cité.
 */
export const chatGpt: Tutoriel = {
  slug: "chatgpt",
  outil: "ChatGPT",
  editeur: "OpenAI",
  sousTitre: "Formuler une demande, obtenir une réponse utile, l’ajuster",
  accroche:
    "Écrivez ce dont vous avez besoin, obtenez une première version, puis relancez jusqu’à ce qu’elle serve vraiment — en gardant la main sur ce que vous envoyez et sur ce que l’outil retient.",
  adresse: "https://chatgpt.com",
  cout: "Offre gratuite, avec un compte",
  duree: "15 minutes pour prendre la main",
  icone: "outils",
  interfaceDecrite: "Interface de ChatGPT au printemps 2026",

  renvoiModule: {
    formation: "ia-generative-en-classe",
    module: "comprendre-chatgpt",
    libelle: "Module 4 — Comprendre ChatGPT",
  },

  prerequis: [
    {
      titre: "Un compte",
      texte:
        "La création est gratuite : une adresse de courriel suffit, ou un compte Google, Microsoft ou Apple. L’offre gratuite couvre tout ce qui est vu en formation.",
    },
    {
      titre: "Un navigateur à jour",
      texte:
        "ChatGPT fonctionne dans le navigateur, sur ordinateur comme sur tablette. Des applications existent, elles ne sont pas nécessaires.",
    },
    {
      titre: "Un vrai besoin de la semaine",
      texte:
        "Une préparation que vous avez réellement à faire. Un essai « pour voir » n’apprend presque rien ; une vraie demande montre tout de suite ce qui manque dans la consigne.",
    },
  ],

  blocs: [
    /* ---------------- À quoi ça sert ---------------- */
    { type: "titre", texte: "À quoi sert ChatGPT" },
    {
      type: "paragraphe",
      texte:
        "ChatGPT produit du texte à partir de votre demande. Il ne consulte pas une base de connaissances qui ferait autorité : il construit une réponse à partir de motifs appris dans de grandes quantités de données. C’est ce qui le rend utile pour produire à partir de rien — des idées, un exercice, une reformulation — et c’est aussi ce qui impose de relire ce qu’il avance.",
    },
    {
      type: "encadre",
      ton: "attention",
      titre: "Il ne « comprend » pas comme un humain",
      texte:
        "La réponse peut être utile, mais elle peut aussi être inexacte ou trop générale, et elle est formulée avec le même aplomb dans les deux cas. L’assurance du ton n’est pas un indice de justesse.",
    },
    {
      type: "tableau",
      entetes: ["Votre besoin", "L’outil"],
      lignes: [
        [
          "Produire à partir de rien : des idées d’activités, un exercice, une reformulation, un message aux familles",
          "ChatGPT",
        ],
        [
          "Exploiter un document que vous avez déjà : le synthétiser, y retrouver un point, le transformer en QCM",
          "NotebookLM",
        ],
        [
          "Une information factuelle vérifiable",
          "Ni l’un ni l’autre sans vérification : ouvrez la source",
        ],
      ],
    },

    /* ---------------- 1. Première demande ---------------- */
    { type: "titre", texte: "1. Ouvrir une conversation" },
    {
      type: "etapes",
      etapes: [
        {
          titre: "Aller sur chatgpt.com et se connecter",
          texte:
            "La page s’ouvre sur une zone de saisie. La colonne de gauche garde l’historique de vos conversations ; elle se replie si l’écran est étroit.",
        },
        {
          titre: "Écrire sa demande, puis envoyer",
          texte:
            "Une conversation = un sujet. Pour une autre préparation, ouvrez une nouvelle conversation plutôt que d’enchaîner : le contexte accumulé finit par parasiter les réponses.",
        },
        {
          titre: "Repérer le sélecteur de modèle",
          texte:
            "En haut de la conversation, un menu propose plusieurs modèles — les plus rapides, les plus soignés. Leurs noms changent souvent. En cas de doute, gardez celui proposé par défaut.",
        },
        {
          titre: "Renommer la conversation",
          texte:
            "Le titre se modifie depuis la liste de gauche. C’est ce qui vous permettra de la retrouver quand elle servira une deuxième fois.",
        },
      ],
    },

    /* ---------------- 2. Bien formuler ---------------- */
    { type: "titre", texte: "2. Formuler une demande qui donne une réponse utile" },
    {
      type: "paragraphe",
      texte:
        "C’est ici que tout se joue. Plus la consigne est précise, plus la réponse a de chances d’être adaptée à votre contexte. La méthode ACTIF, vue en formation, tient en cinq éléments à vérifier avant d’envoyer : le rôle que vous donnez à l’IA, votre contexte, la tâche attendue, le ton, le format.",
    },
    {
      type: "tableau",
      entetes: ["Lettre", "Ce qu’elle précise", "Exemple"],
      lignes: [
        [
          "A — Acteur",
          "Le rôle ou l’expertise que l’IA adopte",
          "Tu es un professeur qui m’aide à reformuler mes consignes.",
        ],
        [
          "C — Contexte",
          "Le niveau, le thème, l’objectif, la durée",
          "Je prépare une séance de 20 minutes en CE2 sur les fractions.",
        ],
        [
          "T — Tâche",
          "L’action concrète et le résultat attendu",
          "Propose 8 exercices progressifs avec leur corrigé.",
        ],
        [
          "I — Intention",
          "Le niveau de langage et le ton",
          "Utilise des énoncés courts et un vocabulaire courant.",
        ],
        [
          "F — Format",
          "La forme sous laquelle la réponse est exploitable",
          "Présente le résultat dans un tableau : Exercice | Énoncé | Corrigé.",
        ],
      ],
    },
    {
      type: "encadre",
      ton: "info",
      titre: "Les lettres ne s’écrivent pas",
      texte:
        "ACTIF est une grille de relecture, pas un gabarit à recopier. Vous écrivez un paragraphe ordinaire ; les cinq lettres servent seulement à repérer ce qui manque avant d’envoyer. Un prompt court et complet vaut mieux qu’un prompt long et flou.",
    },
    {
      type: "requete",
      titre: "Un exemple complet, prêt à adapter",
      texte:
        "Tu es un professeur qui m’aide à reformuler mes consignes. Je travaille avec des élèves de [niveau] pendant [une séance de 20 minutes] sur [le thème]. Reformule cette consigne en langage plus simple : [consigne actuelle]. Utilise un vocabulaire simple et clair, des phrases courtes. Donne trois reformulations sous forme de puces, de la plus courte à la plus détaillée.",
      commentaire:
        "Les crochets marquent ce que vous remplacez. Le rédacteur de prompt du site compose ce paragraphe pour vous, étape par étape.",
    },

    /* ---------------- 3. Itérer ---------------- */
    { type: "titre", texte: "3. Relancer : le réflexe qui change tout" },
    {
      type: "paragraphe",
      texte:
        "Le but n’est pas d’obtenir la réponse parfaite du premier coup, mais une base de travail à ajuster. La conversation garde le contexte : une relance courte suffit, et il vaut mieux en envoyer une à la fois pour voir ce que chacune change.",
    },
    {
      type: "liste",
      items: [
        "« Refais plus court. »",
        "« Mets le résultat en tableau. »",
        "« Adapte à une classe de 6e. »",
        "« Propose une version plus simple, pour des élèves qui lisent difficilement. »",
        "« Ajoute un exemple pour chaque point. »",
        "« Reprends seulement le point 3 et développe-le. »",
      ],
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "Deux gestes moins connus",
      texte:
        "Vous pouvez modifier votre propre message plutôt que d’en écrire un nouveau : la conversation repart de là, sans traîner la réponse ratée. Et vous pouvez demander à régénérer une réponse pour en obtenir une autre formulation, sans rien réécrire.",
    },

    /* ---------------- 4. Documents ---------------- */
    { type: "titre", texte: "4. Joindre un document ou une image" },
    {
      type: "paragraphe",
      texte:
        "Le bouton d’ajout, à côté de la zone de saisie, permet de joindre un fichier — un PDF, un document texte, un tableur, une photo de tableau ou de manuel. ChatGPT le lit et répond dessus. Précisez toujours ce que vous attendez du document : joint sans consigne, il ne produit qu’un résumé générique.",
    },
    {
      type: "encadre",
      ton: "attention",
      titre: "Ce qu’on ne joint jamais",
      texte:
        "Aucune liste de classe, aucune copie, aucune note, aucune appréciation nominative, aucune photo d’élève. Si vous avez besoin d’aide sur une situation, décrivez-la sans le moindre élément identifiant — « élève A », « élève B ».",
    },
    {
      type: "paragraphe",
      texte:
        "Pour un travail répété sur les mêmes documents — un chapitre, un règlement, un projet d’établissement — NotebookLM est mieux placé : il garde les sources d’un bout à l’autre et cite le passage d’origine à chaque réponse.",
    },

    /* ---------------- 5. Web ---------------- */
    { type: "titre", texte: "5. Faire chercher sur le web" },
    {
      type: "paragraphe",
      texte:
        "ChatGPT peut aussi rechercher sur le web lorsque des informations actuelles sont nécessaires, et cite alors les pages consultées. Demandez-le explicitement quand la question porte sur une actualité, une date ou une référence : « cherche sur le web et cite tes sources ».",
    },
    {
      type: "encadre",
      ton: "regle",
      titre: "Réflexe « Vérifier »",
      texte:
        "Vérifiez toujours les sources importantes, en ouvrant les liens — c’est ce que recommande OpenAI. Une référence d’ouvrage, une date, un chiffre : ce sont précisément les éléments qui se contrôlent en une minute, et ceux qu’il ne faut jamais recopier tels quels dans une fiche de séquence.",
    },

    /* ---------------- 6. Confidentialité ---------------- */
    { type: "titre", texte: "6. Régler ce que ChatGPT retient de vous" },
    {
      type: "paragraphe",
      texte:
        "Trois réglages méritent cinq minutes, dans les paramètres du compte. Leur emplacement bouge, mais ils se trouvent tous dans les rubriques de personnalisation et de contrôle des données.",
    },
    {
      type: "cartes",
      colonnes: 3,
      cartes: [
        {
          numero: "1",
          titre: "La mémoire",
          texte:
            "ChatGPT peut retenir d’une conversation à l’autre ce que vous lui avez dit de vous. Pratique — il réapprend moins souvent votre niveau de classe — mais à connaître : la mémoire se consulte, s’efface entrée par entrée, et se désactive entièrement.",
        },
        {
          numero: "2",
          titre: "Les instructions permanentes",
          texte:
            "Vous pouvez enregistrer une fois pour toutes qui vous êtes et comment vous voulez qu’on vous réponde : « J’enseigne en cycle 3 », « Réponds en français, avec des phrases courtes ». Cela évite de réécrire le contexte à chaque demande.",
        },
        {
          numero: "3",
          titre: "L’usage de vos échanges",
          texte:
            "Sur les offres grand public, vos conversations peuvent servir à améliorer les modèles, sauf si vous désactivez l’option dans les contrôles de données. Il existe aussi une conversation éphémère, qui n’est ni enregistrée ni versée à la mémoire.",
        },
      ],
    },
    {
      type: "encadre",
      ton: "regle",
      titre: "Réflexe « Protéger »",
      texte:
        "Quel que soit le réglage, la règle ne change pas : aucune donnée personnelle d’élève dans un outil d’IA, quel que soit le compte. Un réglage bien posé réduit un risque ; il ne l’annule pas, et il peut être remis à zéro par une mise à jour.",
    },

    /* ---------------- Limites ---------------- */
    { type: "titre", texte: "Ce que ChatGPT ne fait pas" },
    {
      type: "liste",
      items: [
        "Il ne garantit pas l’exactitude : un fait, une date, une référence d’ouvrage se vérifient toujours avant d’entrer en classe.",
        "Il ne connaît ni vos élèves, ni vos programmes, ni vos habitudes de classe — sauf ce que vous lui en dites dans la demande.",
        "Il ne juge pas les acquis d’un élève : la décision pédagogique reste la vôtre.",
        "Il ne cite pas ses sources spontanément, contrairement à NotebookLM : il faut les lui demander, et les ouvrir.",
      ],
    },
    {
      type: "encadre",
      ton: "regle",
      titre: "La phrase à garder",
      texte:
        "L’enseignant garde la décision pédagogique. L’IA accélère la préparation ; elle ne remplace pas votre jugement.",
    },

    /* ---------------- Check-list ---------------- */
    { type: "titre", texte: "Votre première demande, pas à pas" },
    {
      type: "checklist",
      id: "tutoriel-chatgpt",
      consigne:
        "Six gestes, un quart d’heure. Cochez au fur et à mesure : à la fin, vous avez une préparation qui sert vraiment, et un compte réglé.",
      items: [
        {
          titre: "J’ai ouvert une conversation pour un vrai besoin",
          texte:
            "Une préparation que j’ai réellement à faire cette semaine, pas un essai « pour voir ».",
        },
        {
          titre: "J’ai passé la check-list ACTIF avant d’envoyer",
          texte:
            "Le rôle, le contexte, la tâche, le ton, le format. Si un élément manque, je l’ajoute.",
        },
        {
          titre: "J’ai relancé au moins une fois",
          texte:
            "Plus court, en tableau, adapté à mon niveau — une demande à la fois.",
        },
        {
          titre: "J’ai vérifié ce qui devait l’être",
          texte:
            "Les faits, les références, les chiffres. Rien n’est recopié tel quel dans ma fiche.",
        },
        {
          titre: "Je n’ai envoyé aucune donnée d’élève",
          texte: "Ni nom, ni note, ni copie, ni photo — « élève A » suffit.",
        },
        {
          titre: "J’ai regardé mes réglages",
          texte:
            "La mémoire, les instructions permanentes, l’usage de mes échanges. Cinq minutes, une fois.",
        },
      ],
    },
  ],

  liens: [
    {
      libelle: "Ouvrir ChatGPT",
      href: "https://chatgpt.com",
      description: "L’outil lui-même, dans votre navigateur.",
    },
    {
      libelle: "Aide officielle OpenAI",
      href: "https://help.openai.com",
      description:
        "La documentation d’OpenAI : formules, réglages de confidentialité, nouveautés.",
    },
    {
      libelle: "Rédacteur de prompt ACTIF",
      href: "/outils/redacteur-de-prompt",
      description:
        "L’outil du site : il compose votre demande en cinq étapes et la rend prête à coller.",
    },
    {
      libelle: "Tutoriel NotebookLM",
      href: "/tutoriels/notebooklm",
      description:
        "L’autre outil de la formation, pour travailler à partir de vos propres documents.",
    },
  ],
};
