import type { SectionDeroule } from "@/content/types";

/**
 * Déroulé animateur — « IA générative au service de la classe ».
 *
 * Reconstitué à partir des vingt-et-une pages de notes du diaporama du même
 * titre (2026-2027), diapositives 1 à 21 : intention de la
 * séance (diapositives 1 et 2), préparation de la démonstration NotebookLM
 * (diapositive 20), minutage déduit du contenu, et la note de chacune des
 * vingt-et-une diapositives reprise telle qu’elle figure au support.
 *
 * Réservé à l’animation : cette ressource n’est pas destinée aux participants.
 */
export const deroule: SectionDeroule[] = [
  {
    slug: "intention",
    titre: "Intention et posture",
    blocs: [
      { type: "titre", texte: "Ce que la séance vise" },
      {
        type: "paragraphe",
        texte:
          "La première phrase de la séance donne le cadre, et il faut la dire telle quelle : l’objectif aujourd’hui n’est pas de devenir expert en intelligence artificielle. Nous allons surtout apprendre à mieux formuler nos demandes, puis voir deux usages concrets pour gagner du temps en préparation pédagogique.",
      },
      {
        type: "paragraphe",
        texte:
          "Les trois objectifs de la diapositive 2 découpent ce cadre : mieux formuler, en construisant un prompt précis avec la méthode ACTIF ; mieux dialoguer, en obtenant une première réponse utile… puis en l’améliorant ; mieux exploiter vos sources, en utilisant NotebookLM à partir de documents pédagogiques. Insistez sur le fait que la méthode sert à réduire les réponses trop générales et à obtenir des contenus plus proches du besoin réel de la classe.",
      },
      {
        type: "encadre",
        ton: "info",
        titre: "L’objectif de la séance",
        texte:
          "L’objectif n’est pas de former des expertes en intelligence artificielle, mais d’apprendre à mieux formuler ses demandes. Tout le reste de la séance — les cinq lettres, l’atelier, les deux outils — sert cette seule ambition.",
      },

      { type: "titre", texte: "Le fil rouge" },
      {
        type: "paragraphe",
        texte:
          "Une IA utile commence par une intention pédagogique claire. C’est la phrase de la diapositive 2, et c’est celle sur laquelle revenir chaque fois qu’une question dérive vers la technique : ce qui change la qualité d’une réponse, ce n’est pas l’outil, c’est la précision de la demande — et la demande part d’une intention de classe.",
      },

      { type: "titre", texte: "Le ton" },
      {
        type: "paragraphe",
        texte:
          "Le public réunit tout l’établissement, de la maternelle au secondaire, toutes disciplines. Le diaporama d’origine étant écrit pour la maternelle, ses exemples y restent — le vocabulaire d’un thème, la reformulation d’une consigne — et servent de fil rouge ; donnez systématiquement leur équivalent dans un autre cycle, pour que chacun se reconnaisse : une série d’exercices en élémentaire, un résumé de chapitre au collège, une grille d’évaluation au lycée. Deux outils seulement sont manipulés, ChatGPT et NotebookLM.",
      },
      {
        type: "paragraphe",
        texte:
          "La posture est celle d’une démonstration partagée, pas d’un cours magistral : on pose la question avant de donner la définition (diapositive 3), on fait proposer des exemples aux participants à chaque lettre de ACTIF (diapositives 6 à 10), et on corrige uniquement ce qui manque dans un prompt, sans le réécrire à la place de son auteur (diapositive 13). Quand le groupe mélange les cycles, faites lire deux prompts issus de deux niveaux différents : la méthode se montre mieux ainsi qu’en l’expliquant.",
      },
      {
        type: "encadre",
        ton: "regle",
        titre: "La phrase à ne pas perdre",
        texte:
          "L’enseignant garde la décision pédagogique. L’IA accélère la préparation ; elle ne remplace pas votre jugement. C’est la conclusion de la diapositive 16, et c’est la réponse à la plupart des inquiétudes exprimées en séance.",
      },
    ],
  },

  {
    slug: "preparation",
    titre: "Préparation",
    blocs: [
      {
        type: "paragraphe",
        texte:
          "La séance n’exige rien d’exceptionnel, mais la démonstration NotebookLM de la diapositive 20 se prépare à l’avance : la note demande de la faire « avec un vrai document si possible », ce qui suppose d’avoir importé ce document avant l’arrivée du groupe.",
      },
      {
        type: "checklist",
        id: "deroule-preparation",
        consigne:
          "À vérifier avant l’arrivée des participants. Les quatre points tiennent en une dizaine de minutes si le document de démonstration est déjà choisi.",
        items: [
          {
            titre: "La salle et la projection",
            texte:
              "Vidéoprojecteur testé avec l’ordinateur de l’animateur, diaporama ouvert, connexion vérifiée. Prévoir des places en binôme : la diapositive 3 demande un échange de 30 secondes à deux, et l’atelier de la diapositive 13 se relit volontiers à deux.",
          },
          {
            titre: "Un document PDF réel pour la démonstration NotebookLM",
            texte:
              "La diapositive 20 prend pour exemple le règlement intérieur de l’établissement, importé dans NotebookLM. Choisissez un document que vous connaissez, importez-le avant la séance et posez-lui une première question pour vérifier que les citations s’ouvrent : la démonstration se termine en ouvrant une citation pour montrer d’où vient l’information.",
          },
          {
            titre: "Un compte ChatGPT et un compte NotebookLM ouverts",
            texte:
              "Dans deux onglets déjà connectés, prêts à projeter. ChatGPT sert à montrer le prompt complet de la diapositive 11 en direct ; NotebookLM sert à la séquence des diapositives 17 à 20. Ouvrir une session au dernier moment devant le groupe coûte plusieurs minutes.",
          },
          {
            titre: "Le tableau de bord animateur ouvert",
            texte:
              "À la page /formations/ia-generative-en-classe/animateur, dans un troisième onglet. Il affiche les trois QR codes de la séance : le sondage d’entrée à projeter pendant l’installation — dont les résultats se commentent ensuite —, la trame de restitution à ouvrir à la fin de l’atelier de la diapositive 13, et l’enquête de satisfaction avant de quitter la salle.",
          },
        ],
      },
      {
        type: "encadre",
        ton: "astuce",
        titre: "Un exemple de prompt sous la main",
        texte:
          "Gardez le prompt complet de la diapositive 11 — Moyenne Section, thème de la ferme, 12 mots concrets, une phrase-modèle de 5 mots maximum et une devinette en 3 indices, présentés dans un tableau — prêt à coller dans ChatGPT. C’est l’exemple que le groupe reconnaîtra ensuite dans son propre atelier.",
      },
    ],
  },

  {
    slug: "minutage",
    titre: "Minute par minute",
    blocs: [
      {
        type: "paragraphe",
        texte:
          "Le diaporama ne porte pas de minutage : celui-ci est déduit du contenu — un atelier de quatre minutes annoncé diapositive 13, une démonstration diapositive 20 — pour une séance de deux heures, pause comprise. La colonne « Support » indique les diapositives à projeter.",
      },
      {
        type: "tableau",
        entetes: ["Repère", "Séquence", "Durée", "Support"],
        lignes: [
          ["0:00", "Accueil et sondage d’entrée", "10 min", "diapositives 1-2"],
          ["0:10", "Qu’est-ce qu’un prompt ?", "10 min", "diapositives 3-4"],
          ["0:20", "La méthode ACTIF", "25 min", "diapositives 5-10"],
          ["0:45", "Assembler un prompt ACTIF", "20 min", "diapositives 11-14"],
          ["1:05", "Pause", "5 min", "—"],
          ["1:10", "Comprendre ChatGPT", "15 min", "diapositives 15-16"],
          ["1:25", "NotebookLM", "25 min", "diapositives 17-20"],
          [
            "1:50",
            "Bilan et enquête de satisfaction",
            "10 min",
            "diapositive 21",
          ],
        ],
      },
      {
        type: "encadre",
        ton: "attention",
        titre: "Les deux repères à tenir",
        texte:
          "L’atelier de la diapositive 13 doit commencer au plus tard à 0:50 : quatre minutes d’écriture, puis deux lectures à voix haute. Et la démonstration NotebookLM ne doit pas démarrer après 1:35, sans quoi il ne reste pas le temps d’ouvrir une citation — ce qui est pourtant le geste à montrer.",
      },
    ],
  },

  {
    slug: "notes-diapositives",
    titre: "Les notes, diapositive par diapositive",
    blocs: [
      {
        type: "paragraphe",
        texte:
          "Les vingt-et-une notes de l’animateur, dans l’ordre du diaporama. Elles suffisent à animer la séance sans autre support que les diapositives elles-mêmes.",
      },
      {
        type: "tableau",
        entetes: ["Diapositive", "Ce que dit l’animateur"],
        lignes: [
          [
            "1 — Ouverture",
            "Bonjour. L’objectif aujourd’hui n’est pas de devenir expert en intelligence artificielle. Nous allons surtout apprendre à mieux formuler nos demandes, puis voir deux usages concrets pour gagner du temps en préparation pédagogique.",
          ],
          [
            "2 — Objectifs",
            "Présentez les trois objectifs. Insistez sur le fait que la méthode sert à réduire les réponses trop générales et à obtenir des contenus plus proches du besoin réel de la classe.",
          ],
          [
            "3 — Qu’est-ce qu’un prompt ?",
            "Posez la question avant de donner la définition. Laissez 30 secondes en binôme puis prenez 2 ou 3 réponses.",
          ],
          [
            "4 — Un prompt, c’est une consigne",
            "Donnez la définition simplement : une consigne adressée à l’IA. Annoncez ensuite la méthode ACTIF : cinq informations faciles à vérifier avant d’envoyer une demande.",
          ],
          [
            "5 — La méthode ACTIF en 5 réflexes",
            "Présentez ACTIF comme une checklist mentale, pas comme une formule rigide. Un prompt peut rester court, à condition que les informations essentielles soient présentes.",
          ],
          [
            "6 — A, Acteur / Identité",
            "Expliquez le A de ACTIF : Acteur / Identité. Définir le rôle ou l’expertise que l’IA doit adopter pour cadrer sa réponse. Lisez un ou deux exemples puis demandez aux participants d’en proposer un adapté à leur prochaine séquence.",
          ],
          [
            "7 — C, Contexte",
            "Expliquez le C de ACTIF : Contexte. Donner les informations qui expliquent la situation, le niveau, le thème et l’objectif. Lisez un ou deux exemples puis demandez aux participants d’en proposer un adapté à leur prochaine séquence.",
          ],
          [
            "8 — T, Tâche / Action",
            "Expliquez le T de ACTIF : Tâche / Action. Dire précisément ce que vous attendez : produire, expliquer, reformuler, comparer, corriger… Lisez un ou deux exemples puis demandez aux participants d’en proposer un adapté à leur prochaine séquence.",
          ],
          [
            "9 — I, Intention / Tonalité",
            "Expliquez le I de ACTIF : Intention / Tonalité. Préciser le niveau de langage, le ton et l’intention : simple, rassurant, dynamique, professionnel… Lisez un ou deux exemples puis demandez aux participants d’en proposer un adapté à leur prochaine séquence.",
          ],
          [
            "10 — F, Format",
            "Expliquez le F de ACTIF : Format. Indiquer la forme attendue afin que la réponse soit directement exploitable. Lisez un ou deux exemples puis demandez aux participants d’en proposer un adapté à leur prochaine séquence.",
          ],
          [
            "11 — Assembler ACTIF : un prompt complet",
            "Lisez le prompt complet en montrant les couleurs ACTIF. Soulignez qu’il n’est pas nécessaire d’utiliser les lettres dans le prompt : elles servent seulement à structurer votre pensée.",
          ],
          [
            "12 — Avant / après",
            "Montrez la différence entre une demande vague et une demande structurée. Le but n’est pas d’obtenir une réponse parfaite du premier coup, mais une base de travail beaucoup plus proche du besoin.",
          ],
          [
            "13 — Atelier, 4 minutes",
            "Donnez 4 minutes. Demandez ensuite à deux personnes de lire leur prompt. Corrigez uniquement ce qui manque dans ACTIF, sans réécrire tout le prompt à leur place.",
          ],
          [
            "14 — Check-list 5/5",
            "Utilisez cette slide comme checklist finale. Expliquez qu’en pratique on peut aussi corriger après la première réponse : « refais plus court », « mets en tableau », « adapte à la MS », etc.",
          ],
          [
            "15 — Comment ChatGPT produit une réponse",
            "Restez simple : prompt → modèle → réponse → vérification. Évitez l’idée que ChatGPT « comprend comme un humain ». Il produit des réponses à partir de modèles statistiques appris. OpenAI indique que ChatGPT peut rechercher le web pour des informations actuelles, mais recommande aussi de vérifier les sources.",
          ],
          [
            "16 — Trois réflexes professionnels",
            "Présentez ces trois réflexes comme non négociables. Le plus important : l’enseignant reste responsable du contenu final et de son adaptation à la classe.",
          ],
          [
            "17 — NotebookLM",
            "Transition : jusqu’ici, nous avons appris à mieux parler à l’IA. Avec NotebookLM, nous ajoutons une autre idée : donner à l’IA nos propres sources de référence.",
          ],
          [
            "18 — Un assistant ancré dans vos sources",
            "Google décrit NotebookLM comme un assistant de recherche alimenté par l’IA. Il peut travailler à partir de PDF, documents Google, pages web, audio et vidéo, puis répondre avec des citations liées aux sources.",
          ],
          [
            "19 — Le workflow en 4 étapes",
            "Expliquez les quatre étapes comme une routine. Insistez sur la dernière : NotebookLM aide à retrouver la source, mais l’enseignant relit toujours le passage important.",
          ],
          [
            "20 — Démonstration",
            "Faites la démonstration avec un vrai document si possible. Montrez d’abord une question simple, puis une transformation : QCM, résumé, cas pratique, etc. Terminez en ouvrant une citation pour montrer d’où vient l’information.",
          ],
          [
            "21 — Bilan",
            "Terminez par les trois idées clés. Proposez une action très concrète : utiliser ACTIF sur une préparation réelle dès cette semaine. Références : OpenAI Help Center — « Searching the web with ChatGPT » ; Google NotebookLM Help — « Learn about NotebookLM ».",
          ],
        ],
      },
      {
        type: "encadre",
        ton: "info",
        titre: "Diapositive 3 : l’échange en binôme",
        texte:
          "La note précise que cette étape remplace le Collaborate Board de Nearpod : la question « comment expliqueriez-vous le mot “prompt” à un collègue ? » se traite à l’oral, 30 secondes en binôme, puis 2 ou 3 réponses prises au groupe. Aucun outil n’est nécessaire pour ce temps-là.",
      },
    ],
  },

  {
    slug: "variantes",
    titre: "Variantes et imprévus",
    blocs: [
      {
        type: "paragraphe",
        texte:
          "Quatre situations fréquentes, et l’aménagement raisonnable dans chaque cas. Le principe reste le même : ce qui ne se supprime jamais, c’est l’atelier de la diapositive 13 — le moment où chacune écrit un prompt sur son vrai besoin de la semaine.",
      },
      {
        type: "etapes",
        etapes: [
          {
            titre: "Si le temps manque",
            texte:
              "Réduisez les cinq lettres à une lecture rapide : une diapositive par lettre, la signification et un seul exemple, sans faire proposer d’exemples au groupe — c’est le temps le plus extensible de la séance. Gardez l’atelier de la diapositive 13 dans son intégralité, ses quatre minutes et ses deux lectures à voix haute. Le prompt complet de la diapositive 11 suffit alors à montrer les cinq lettres assemblées.",
          },
          {
            titre: "S’il n’y a pas de connexion",
            texte:
              "Faites l’atelier sur papier : la check-list de la diapositive 14 suffit à écrire et à vérifier un prompt — rôle, contexte, tâche, ton, format, 5/5 avant d’envoyer. Les prompts écrits seront testés plus tard, chez soi ou en salle des maîtres. Les diapositives 15 à 20 se commentent alors sans manipulation, et la démonstration NotebookLM est reportée à une prochaine rencontre.",
          },
          {
            titre: "Si le groupe est déjà à l’aise",
            texte:
              "Passez plus vite sur les diapositives 3 et 4 — la définition d’un prompt est déjà acquise, un échange de 30 secondes et la définition lue suffisent — et allongez d’autant la séquence NotebookLM. Le temps gagné sert à importer un deuxième document, à comparer deux transformations d’une même source, ou à laisser les participants poser leurs propres questions au notebook de démonstration.",
          },
          {
            titre: "Si personne n’a de compte ChatGPT",
            texte:
              "Faites la démonstration au vidéoprojecteur, depuis votre propre compte, et mettez les participants en binôme pour l’atelier : l’une écrit le prompt, l’autre vérifie les cinq lettres de la check-list. L’écriture d’un prompt ACTIF ne demande pas de compte ; seul l’envoi du prompt en demande un, et il peut attendre.",
          },
        ],
      },
      {
        type: "encadre",
        ton: "astuce",
        titre: "Ce qui reste vrai dans tous les cas",
        texte:
          "Terminez toujours sur l’action concrète de la diapositive 21 : choisir une préparation de la semaine et y tester un prompt ACTIF, puis comparer le temps gagné et la qualité obtenue. Une séance écourtée qui se termine sur cette action vaut mieux qu’une séance complète sans engagement.",
      },
    ],
  },
];
