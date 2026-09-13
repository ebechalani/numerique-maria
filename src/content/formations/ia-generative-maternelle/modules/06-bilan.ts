import type { Module } from "@/content/types";

/**
 * Module 6 — Bilan et suite (1:50, 10 min).
 * Source : diapositive 21 du diaporama « IA générative au service de la
 * maternelle » (Eddy Bachaalany, 2026-2027) et sa note de l’animateur :
 * les trois idées à garder, l’action très concrète à mener dès cette
 * semaine, et les deux références citées en fin de note.
 */
export const bilanEtSuite: Module = {
  slug: "bilan-et-suite",
  numero: 6,
  titre: "Bilan et suite",
  sousTitre: "Trois idées à garder, une action pour la semaine",
  duree: 10,
  horaire: "1:50",
  objectif:
    "Vous saurez redire en trois phrases ce qui change dans votre façon de demander, et vous repartirez avec une préparation de la semaine choisie, un prompt ACTIF écrit et une date pour le tester.",
  blocs: [
    {
      type: "paragraphe",
      texte:
        "Deux heures se terminent. L’objectif n’était pas de devenir experte en intelligence artificielle, mais de mieux formuler nos demandes et de voir deux usages concrets — ChatGPT avec la méthode ACTIF, NotebookLM à partir de vos propres documents. De tout ce qui a été dit, trois idées suffisent à emporter le reste.",
    },

    { type: "titre", texte: "Trois idées à garder" },
    {
      type: "cartes",
      colonnes: 3,
      cartes: [
        {
          numero: "1",
          titre: "Un bon prompt donne un cadre",
          texte:
            "ACTIF = rôle, contexte, tâche, tonalité, format. Cinq informations faciles à vérifier avant d’envoyer une demande. Le prompt peut rester court : ACTIF ne le rallonge pas forcément, il enlève surtout les zones floues.",
        },
        {
          numero: "2",
          titre: "L’IA propose ; l’enseignant décide",
          texte:
            "Vérifier, protéger les données, ajuster. Relire les faits et les consignes avant la classe, n’envoyer aucune donnée identifiante sur les enfants, demander une version plus courte, plus simple ou mieux structurée. La décision pédagogique reste la vôtre.",
        },
        {
          numero: "3",
          titre: "De bonnes sources changent la qualité",
          texte:
            "NotebookLM aide à exploiter vos propres documents. Vos ressources deviennent le contexte de travail : le carnet répond en citant les passages utilisés, et vous relisez le passage d’origine avant usage.",
        },
      ],
    },

    { type: "titre", texte: "Votre prochaine action" },
    {
      type: "encadre",
      ton: "regle",
      titre: "Cette semaine",
      texte:
        "Choisissez une préparation de la semaine et testez un prompt ACTIF. Puis comparez le temps gagné et la qualité obtenue.",
    },
    {
      type: "paragraphe",
      texte:
        "Une vraie préparation, pas un exercice : la séance de langage oral de jeudi, la comptine du rituel du matin, la fiche de l’atelier de motricité, les mots à installer avant la sortie. Le test est utile parce que le besoin est réel — et la comparaison ne demande que deux observations : combien de temps la première version vous a fait gagner, et ce qu’il a fallu ajuster pour qu’elle serve en classe.",
    },
    {
      type: "exercice",
      id: "exercice-engagement",
      titre: "L’action de la semaine",
      consigne:
        "Écrivez maintenant les trois lignes de votre engagement : la préparation que vous choisissez, le prompt ACTIF que vous testerez, et le jour où vous le ferez.",
      duree: "3 min",
      champs: [
        {
          id: "preparation-choisie",
          type: "texte",
          libelle: "La préparation choisie",
          aide: "Une préparation réelle de la semaine : séance, atelier, rituel, comptine…",
        },
        {
          id: "prompt-actif",
          type: "texte-long",
          libelle: "Le prompt ACTIF que vous testerez",
          aide: "Les cinq éléments : rôle, contexte, tâche, tonalité, format. Une seule phrase suffit.",
          lignes: 5,
        },
        {
          id: "date-du-test",
          type: "texte",
          libelle: "La date à laquelle vous le testerez",
          aide: "Un jour précis de la semaine.",
        },
      ],
      retour: {
        titre: "Ce qu’on observe",
        texte:
          "Une action datée et écrite est tenue ; celle qui reste une intention ne l’est pas. Relisez vos trois lignes : si la date manque ou si la préparation reste vague, l’essai n’aura pas lieu.",
      },
      alimenteRestitution: true,
    },

    { type: "titre", texte: "Après la séance" },
    {
      type: "paragraphe",
      texte:
        "Prenez deux minutes pour l’enquête de satisfaction, à la page /formations/ia-generative-maternelle/participer/satisfaction : elle est anonyme et sert à ajuster la prochaine session. Les ressources du site restent ouvertes ensuite — la fiche méthode ACTIF, qui reprend la définition, les cinq lettres, un prompt complet ligne à ligne et la check-list ; la bibliothèque de requêtes, à copier et à adapter à votre section ; et les questions fréquentes, où figurent les réponses aux questions posées en séance.",
    },

    { type: "titre", texte: "Références" },
    {
      type: "liste",
      items: [
        "OpenAI Help Center — “Searching the web with ChatGPT”",
        "Google NotebookLM Help — “Learn about NotebookLM”",
      ],
    },

    {
      type: "notesAnimateur",
      texte:
        "1:50 — 10 min. Diapositive 21 : terminez par les trois idées clés — un bon prompt donne un cadre, l’IA propose et l’enseignant décide, de bonnes sources changent la qualité. Proposez ensuite une action très concrète : utiliser ACTIF sur une préparation réelle dès cette semaine. Laissez trois minutes pour remplir l’engagement, puis demandez à deux personnes de lire la préparation choisie et la date retenue. Terminez en indiquant la page de l’enquête de satisfaction et les ressources du site. Références à citer si la question est posée : OpenAI Help Center — “Searching the web with ChatGPT” ; Google NotebookLM Help — “Learn about NotebookLM”.",
    },
  ],
};
