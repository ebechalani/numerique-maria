import type { Module } from "@/content/types";

/**
 * Module 5 — NotebookLM (1:25, 25 min).
 * Source : diapositives 17, 18, 19 et 20 du diaporama « IA générative au
 * service de la maternelle » (2026-2027) et leurs notes de
 * l’animateur : la définition de NotebookLM et l’idée clé des documents
 * devenus contexte de travail, les ressources acceptées et ce que l’outil
 * peut produire, le workflow en quatre étapes, puis la démonstration à
 * partir du règlement intérieur importé en PDF.
 */
export const notebookLm: Module = {
  slug: "notebooklm",
  numero: 5,
  titre: "NotebookLM",
  sousTitre: "Faire travailler l’IA à partir de vos documents",
  duree: 25,
  horaire: "1:25",
  objectif:
    "Vous saurez créer un carnet NotebookLM à partir de vos propres documents, y poser une question précise, en demander une transformation exploitable en classe et ouvrir une citation pour remonter au passage d’origine.",
  blocs: [
    {
      type: "paragraphe",
      texte:
        "Jusqu’ici, nous avons appris à mieux parler à l’IA : cinq réflexes pour formuler une demande claire, puis une première réponse que l’on ajuste. Avec NotebookLM, nous ajoutons une autre idée — donner à l’IA nos propres sources de référence. Ce n’est plus seulement la consigne qui change, c’est la matière sur laquelle l’outil travaille.",
    },
    {
      type: "citation",
      texte:
        "Un assistant IA qui travaille à partir de vos sources pour vous aider à comprendre, synthétiser et transformer vos documents.",
    },
    {
      type: "encadre",
      ton: "regle",
      titre: "Idée clé",
      texte:
        "Vos documents deviennent le contexte de travail. L’outil ne part plus de ce qu’il a appris en général : il part de ce que vous avez déposé — votre projet d’école, votre progression, la fiche d’une séquence, un document de l’établissement.",
    },

    { type: "titre", texte: "Vous ajoutez vos ressources" },
    {
      type: "paragraphe",
      texte:
        "Un carnet commence toujours par des sources. NotebookLM accepte plusieurs formats, et l’on peut en réunir plusieurs dans un même carnet — par exemple tout ce qui concerne une période ou un thème de classe.",
    },
    {
      type: "liste",
      items: [
        "PDF",
        "Google Docs / Slides",
        "Pages web",
        "Audio / vidéo",
      ],
    },
    {
      type: "paragraphe",
      texte:
        "…puis vous interrogez le notebook. C’est là que la méthode ACTIF continue de servir : la question posée au carnet gagne, elle aussi, à dire qui parle, pour quel niveau, ce qui est attendu et sous quelle forme.",
    },
    {
      type: "citation",
      texte:
        "Google décrit NotebookLM comme un assistant de recherche alimenté par l’IA. Il peut travailler à partir de PDF, documents Google, pages web, audio et vidéo, puis répondre avec des citations liées aux sources.",
      source: "Google NotebookLM Help — « Learn about NotebookLM »",
    },

    { type: "titre", texte: "Ce qu’il peut produire" },
    {
      type: "cartes",
      colonnes: 3,
      cartes: [
        {
          titre: "Réponses avec citations",
          texte: "Retrouver rapidement l’origine d’une information.",
        },
        {
          titre: "Synthèses & briefings",
          texte: "Transformer un document long en points clés.",
        },
        {
          titre: "Guides, quiz, cartes mentales…",
          texte: "Créer des supports à partir des mêmes sources.",
        },
      ],
    },
    {
      type: "paragraphe",
      texte:
        "Concrètement : reprendre en points clés un document de plusieurs pages avant une réunion, retrouver ce que le projet d’établissement dit d’un point précis, tirer d’un chapitre de cours un guide d’étude ou un QCM, ou préparer un support de travail pour l’équipe — sans ressaisir le document. Le geste est le même de la maternelle au lycée : seule change la source que vous importez.",
    },

    { type: "titre", texte: "Le workflow en 4 étapes" },
    {
      type: "etapes",
      etapes: [
        {
          titre: "Importer",
          texte: "Ajoutez vos documents de référence.",
        },
        {
          titre: "Questionner",
          texte: "Posez une question précise sur ces sources.",
        },
        {
          titre: "Transformer",
          texte: "Demandez un résumé, un quiz, une fiche…",
        },
        {
          titre: "Vérifier",
          texte: "Ouvrez les citations et relisez avant usage.",
        },
      ],
    },
    {
      type: "encadre",
      ton: "attention",
      titre: "Bon réflexe",
      texte:
        "Une citation facilite la vérification, mais ne remplace pas votre lecture du document source. NotebookLM aide à retrouver la source ; l’enseignant relit toujours le passage important.",
    },

    { type: "titre", texte: "Démonstration : transformer un document en activité" },
    {
      type: "paragraphe",
      texte:
        "La source de la démonstration est le règlement intérieur de l’établissement, importé dans NotebookLM sous forme de PDF. Une fois la source déposée, une seule demande suffit à en tirer un support de travail.",
    },
    {
      type: "requete",
      titre: "Le prompt de la démonstration",
      texte:
        "À partir du règlement intérieur, génère un QCM sur les droits et devoirs des élèves. Crée 6 questions, 4 choix par question, indique la bonne réponse et cite le passage utilisé.",
      commentaire:
        "On peut ensuite demander une version plus simple, un vrai/faux ou des cas pratiques.",
    },
    {
      type: "paragraphe",
      texte:
        "À partir de la même source, plusieurs sorties sont possibles — c’est la demande qui change, pas le document :",
    },
    {
      type: "liste",
      items: [
        "QCM",
        "Texte à trous",
        "Cas pratique",
        "Résumé",
        "Questions",
      ],
    },

    {
      type: "exercice",
      id: "exercice-notebooklm",
      titre: "Votre premier carnet",
      consigne:
        "Reprenez les quatre étapes dans NotebookLM, sur un document de travail à vous, puis notez ce que vous obtenez.",
      duree: "10 min",
      etapes: [
        "Ouvrez notebooklm.google.com et connectez-vous.",
        "Créez un carnet.",
        "Importez UN document de travail — sans aucune donnée d’élève.",
        "Posez une question précise sur ce document.",
        "Demandez une transformation : un résumé, un QCM, une fiche…",
        "Ouvrez une citation et relisez le passage d’origine.",
      ],
      champs: [
        {
          id: "document-importe",
          type: "texte",
          libelle: "Le document importé",
          aide: "Titre ou nature du document — sans aucune donnée d’élève.",
        },
        {
          id: "question-posee",
          type: "texte-long",
          libelle: "La question posée au carnet",
          lignes: 3,
        },
        {
          id: "transformation-demandee",
          type: "choix",
          libelle: "La transformation demandée",
          options: [
            "Résumé",
            "QCM",
            "Guide d’étude",
            "Questions",
            "Autre",
          ],
        },
        {
          id: "verification-citation",
          type: "texte-long",
          libelle: "Ce que la citation a permis de vérifier",
          aide: "Le passage disait-il bien ce que la réponse affirmait ?",
          lignes: 3,
        },
      ],
      retour: {
        titre: "Ce qu’on observe",
        texte:
          "NotebookLM aide à retrouver la source, mais l’enseignant relit toujours le passage important. La citation raccourcit la vérification — elle ne la remplace pas.",
      },
    },

    {
      type: "notesAnimateur",
      texte:
        "1:25 — 25 min. Diapositive 17 : posez la transition — jusqu’ici, nous avons appris à mieux parler à l’IA ; avec NotebookLM, nous ajoutons une autre idée, donner à l’IA nos propres sources de référence. Diapositive 18 : Google décrit NotebookLM comme un assistant de recherche alimenté par l’IA ; il travaille à partir de PDF, documents Google, pages web, audio et vidéo, puis répond avec des citations liées aux sources. Diapositive 19 : expliquez les quatre étapes comme une routine, et insistez sur la dernière — NotebookLM aide à retrouver la source, mais l’enseignant relit toujours le passage important. Diapositive 20 : faites la démonstration avec un vrai document si possible. Montrez d’abord une question simple, puis une transformation : QCM, résumé, cas pratique, etc. Terminez en ouvrant une citation pour montrer d’où vient l’information. Pendant l’exercice, prévoyez un document de démonstration pour celles qui n’ont rien apporté, et rappelez qu’aucune donnée d’élève n’est importée.",
    },
  ],
};
