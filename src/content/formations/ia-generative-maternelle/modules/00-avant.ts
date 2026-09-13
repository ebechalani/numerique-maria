import type { Module } from "@/content/types";

/**
 * Module 0 — Avant de commencer : cadre de la séance et sondage d’entrée
 * (0:00, 10 min).
 * Source : diapositives 1 et 2 du diaporama « IA générative au service de la
 * maternelle » (Eddy Bachaalany, 2026-2027) et leurs notes de l’animateur.
 */
export const avantDeCommencer: Module = {
  slug: "avant-de-commencer",
  numero: 0,
  titre: "Avant de commencer",
  sousTitre: "Objectifs de la séance et sondage d’entrée",
  duree: 10,
  horaire: "0:00",
  objectif:
    "Vous saurez ce que la séance vise — mieux formuler, mieux dialoguer, mieux exploiter vos sources —, ce qu’elle ne vise pas, et vous aurez situé votre pratique par le sondage d’entrée.",
  blocs: [
    { type: "titre", texte: "Le cadre de la séance" },
    {
      type: "paragraphe",
      texte:
        "L’objectif aujourd’hui n’est pas de devenir expert en intelligence artificielle. Nous allons surtout apprendre à mieux formuler nos demandes, puis voir deux usages concrets pour gagner du temps en préparation pédagogique.",
    },
    {
      type: "paragraphe",
      texte:
        "Le fil de la séance tient en trois temps : créer de meilleurs prompts avec la méthode ACTIF, utiliser ChatGPT avec méthode, puis exploiter NotebookLM à partir de vos propres ressources. Deux outils, pas davantage — et des exemples pris dans vos classes : le langage oral, le vocabulaire d’un thème comme la ferme, la reformulation d’une consigne.",
    },
    {
      type: "encadre",
      ton: "info",
      titre: "Ce que la séance ne vise pas",
      texte:
        "Ni cours technique sur le fonctionnement des modèles, ni catalogue d’outils. Ce que nous cherchons, c’est à réduire les réponses trop générales et à obtenir des contenus plus proches du besoin réel de la classe.",
    },

    { type: "titre", texte: "Aujourd’hui, vous allez…" },
    {
      type: "cartes",
      colonnes: 3,
      cartes: [
        {
          numero: "1",
          titre: "Mieux formuler",
          texte: "Construire un prompt précis avec la méthode ACTIF.",
        },
        {
          numero: "2",
          titre: "Mieux dialoguer",
          texte: "Obtenir une première réponse utile… puis l’améliorer.",
        },
        {
          numero: "3",
          titre: "Mieux exploiter vos sources",
          texte: "Utiliser NotebookLM à partir de documents pédagogiques.",
        },
      ],
    },
    {
      type: "encadre",
      ton: "regle",
      titre: "Le fil rouge de la séance",
      texte:
        "Une IA utile commence par une intention pédagogique claire. C’est vous qui savez ce que vos élèves de Petite, Moyenne et Grande Section doivent apprendre cette semaine : l’outil ne le devinera pas à votre place.",
    },

    { type: "titre", texte: "Le sondage d’entrée" },
    {
      type: "paragraphe",
      texte:
        "Le sondage se remplit sur ce site pendant l’installation, à la page « Sondage d’entrée » : /formations/ia-generative-maternelle/participer/sondage. Scannez le QR code projeté, ou saisissez l’adresse — aucune application à installer. Trois questions et une question ouverte, pas davantage.",
    },
    {
      type: "paragraphe",
      texte:
        "Les résultats sont projetés en direct et commentés juste après : ils servent à ajuster le rythme de la séance et à partir de vos usages réels plutôt que de généralités.",
    },
    {
      type: "encadre",
      ton: "info",
      titre: "Réponses anonymes",
      texte:
        "Le questionnaire ne demande ni nom, ni adresse, ni identifiant : rien ne permet de savoir qui a répondu quoi. Seuls les totaux sont projetés.",
    },

    { type: "titre", texte: "Ce qu’il faut avoir sous la main" },
    {
      type: "checklist",
      id: "checklist-avant-de-commencer",
      consigne:
        "Quatre points seulement. Cochez au fur et à mesure : tout doit être prêt avant le début de la séance.",
      items: [
        {
          titre: "Un ordinateur ou une tablette",
          texte:
            "Un appareil par participante, ou un pour deux : les ateliers se font en manipulant, pas en regardant.",
        },
        {
          titre: "Un accès à ChatGPT",
          texte:
            "Testez la connexion avant la séance. Si vous n’avez pas de compte, mettez-vous en binôme avec une collègue : la démonstration se fait aussi au vidéoprojecteur.",
        },
        {
          titre: "Un compte Google actif",
          texte:
            "Il donne accès à notebooklm.google.com. Vérifiez que l’adresse s’ouvre bien depuis votre appareil avant la démonstration.",
        },
        {
          titre: "Un document de travail au format PDF",
          texte:
            "Une fiche de séquence, une progression ou un règlement — un document que vous utilisez vraiment. Sans aucune donnée d’enfant : ni nom, ni photo, ni observation individuelle.",
        },
      ],
    },

    {
      type: "notesAnimateur",
      texte:
        "0:00 — 10 min. Accueil. Annoncer d’emblée le cadre : l’objectif n’est pas de devenir expert en intelligence artificielle, mais d’apprendre à mieux formuler ses demandes, puis de voir deux usages concrets pour gagner du temps en préparation pédagogique. Pendant l’installation, projeter le QR code du sondage affiché par le tableau de bord animateur (/formations/ia-generative-maternelle/animateur) et écrire aussi l’adresse au tableau, pour celles qui n’ont pas de téléphone à portée ; garder le tableau de bord ouvert dans un onglet et projeter les résultats dès que le groupe a répondu, pour les commenter en deux ou trois phrases. Présenter ensuite les trois objectifs : mieux formuler, mieux dialoguer, mieux exploiter vos sources. Insister sur le fait que la méthode sert à réduire les réponses trop générales et à obtenir des contenus plus proches du besoin réel de la classe. Terminer sur le fil rouge : une IA utile commence par une intention pédagogique claire.",
    },
  ],
};
