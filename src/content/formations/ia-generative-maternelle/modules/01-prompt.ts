import type { Module } from "@/content/types";

/**
 * Module 1 — Qu’est-ce qu’un prompt ? (0:10, 10 min).
 * Source : diapositives 3 et 4 du diaporama « IA générative au service de la
 * maternelle » (Eddy Bachaalany, 2026-2027) et leurs notes de l’animateur :
 * échauffement en binôme, exemples de demandes, définition « À retenir » et
 * annonce des cinq lettres de la méthode ACTIF.
 */
export const quEstCeQuUnPrompt: Module = {
  slug: "qu-est-ce-qu-un-prompt",
  numero: 1,
  titre: "Qu’est-ce qu’un prompt ?",
  sousTitre: "Échauffement et définition",
  duree: 10,
  horaire: "0:10",
  objectif:
    "Vous saurez expliquer en une phrase ce qu’est un prompt, et nommer les cinq informations — A, C, T, I, F — qu’une demande adressée à une IA a intérêt à préciser.",
  blocs: [
    {
      type: "paragraphe",
      texte:
        "Avant toute méthode, une question simple : de quoi parle-t-on ? La séquence commence donc par un échauffement en binôme, avant que la définition ne soit donnée. Elle se termine par l’annonce des cinq lettres qui structureront la suite de la séance.",
    },

    { type: "titre", texte: "Échauffement : la question avant la réponse" },
    {
      type: "encadre",
      ton: "info",
      titre: "La question",
      texte:
        "En une phrase : comment expliqueriez-vous le mot « prompt » à un collègue ?",
    },
    {
      type: "paragraphe",
      texte:
        "Trente secondes, en binôme avec votre voisine ou votre voisin. Puis partagez une réponse avec le groupe. Il n’y a pas de bonne formulation attendue : l’intérêt est d’entendre les mots que chacune emploie spontanément — consigne, demande, question, instruction — avant de fixer une définition commune.",
    },

    { type: "titre", texte: "Des demandes que vous formulez déjà" },
    {
      type: "paragraphe",
      texte:
        "Le mot est nouveau, la chose l’est moins. Voici quatre demandes telles qu’on les écrit tous les jours dans une conversation avec une IA :",
    },
    {
      type: "liste",
      items: [
        "Explique-moi ce concept.",
        "Résume ce texte.",
        "Propose 5 idées.",
        "Corrige ce paragraphe.",
      ],
    },
    {
      type: "paragraphe",
      texte:
        "Chacune de ces phrases est un prompt. Aucune n’est longue, aucune n’emploie de vocabulaire technique. Ce qui les distingue, c’est ce qu’elles précisent — et ce qu’elles laissent dans le flou : quel concept, quel texte, cinq idées pour quoi faire, corriger dans quel sens.",
    },

    { type: "titre", texte: "Définition : un prompt, c’est une consigne" },
    {
      type: "encadre",
      ton: "regle",
      titre: "À retenir",
      texte:
        "Un prompt est la demande que vous adressez à une IA pour lui indiquer ce que vous voulez obtenir. Plus la consigne est précise, plus la réponse a de chances d’être adaptée à votre contexte.",
    },
    {
      type: "paragraphe",
      texte:
        "Retenez surtout la seconde phrase. Elle ne dit pas qu’il faut écrire long : elle dit que la précision de la consigne change la réponse obtenue. « Propose des idées d’activités » et « Propose 5 idées d’activités de langage oral pour une Moyenne Section, sur le thème de la ferme » demandent le même effort d’écriture ou presque, et ne donnent pas du tout le même résultat.",
    },

    { type: "titre", texte: "Un bon prompt précise cinq choses" },
    {
      type: "paragraphe",
      texte:
        "Ces cinq informations forment la méthode ACTIF, que nous détaillerons lettre par lettre dans la séquence suivante. À ce stade, il suffit de les connaître de nom : ce sont cinq informations faciles à vérifier avant d’envoyer une demande.",
    },
    {
      type: "tableau",
      entetes: ["Lettre", "Ce que la lettre précise", "La question"],
      lignes: [
        ["A", "Acteur / Identité", "Qui parle ?"],
        ["C", "Contexte", "Pourquoi ?"],
        ["T", "Tâche / Action", "Quoi exactement ?"],
        ["I", "Intention / Tonalité", "Quel style ?"],
        ["F", "Format", "Sous quelle forme ?"],
      ],
    },
    {
      type: "paragraphe",
      texte:
        "Relisez maintenant les quatre demandes du début avec ces cinq questions en tête : « Résume ce texte. » ne dit ni qui parle, ni pourquoi, ni sous quelle forme. C’est exactement ce que la méthode vient combler.",
    },

    {
      type: "quiz",
      id: "quiz-prompt",
      consigne:
        "Quatre affirmations pour vérifier la définition. En séance, le vote se fait à main levée ; ici, répondez avant d’afficher le corrigé.",
      items: [
        {
          affirmation: "« Propose 5 idées. » est trop court pour être un prompt.",
          reponse: false,
          explication:
            "C’est l’un des quatre exemples de demandes du support : une demande courte reste un prompt. Ce qui compte n’est pas sa longueur, mais ce qu’elle précise.",
        },
        {
          affirmation: "Un prompt long est forcément un meilleur prompt.",
          reponse: false,
          explication:
            "La définition parle de précision, pas de longueur. Un prompt peut rester court dès lors que les informations essentielles y figurent.",
        },
        {
          affirmation:
            "Plus la consigne est précise, plus la réponse a de chances d’être adaptée à votre contexte.",
          reponse: true,
          explication:
            "C’est la phrase « À retenir » de la définition : la précision de la demande est ce qui rapproche la réponse de votre besoin réel de classe.",
        },
        {
          affirmation:
            "ACTIF désigne cinq informations à vérifier avant d’envoyer une demande.",
          reponse: true,
          explication:
            "Acteur / Identité, Contexte, Tâche / Action, Intention / Tonalité, Format : cinq informations faciles à vérifier avant d’envoyer une demande. Nous les reprenons une à une dans la séquence suivante.",
        },
      ],
    },

    {
      type: "notesAnimateur",
      texte:
        "0:10 — 10 min. Posez la question avant de donner la définition : « En une phrase : comment expliqueriez-vous le mot “prompt” à un collègue ? ». Laissez 30 secondes en binôme, puis prenez 2 ou 3 réponses à voix haute — sans corriger, en notant simplement les mots employés. Cette étape remplace le Collaborate Board de Nearpod : l’échange oral en binôme suffit, aucun outil à ouvrir. Lisez ensuite les quatre exemples de demandes, puis donnez la définition simplement : une consigne adressée à l’IA. Annoncez enfin la méthode ACTIF : cinq informations faciles à vérifier avant d’envoyer une demande. Restez au niveau de l’annonce — le détail lettre par lettre vient juste après.",
    },
  ],
};
