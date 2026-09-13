import type { Questionnaire, ChampRestitution } from "@/content/types";

/**
 * Les deux questionnaires de la séance et la trame de restitution de l’atelier.
 *
 * Source : le diaporama « IA générative au service de la maternelle »
 * (2026-2027) — diapositive 2 pour les trois objectifs repris
 * dans l’enquête de satisfaction, diapositives 13 et 14 pour l’atelier « À vous
 * de jouer ! » dont la trame de restitution recueille le résultat, diapositive 16
 * pour la vigilance sur les données.
 *
 * Le sondage d’entrée est rempli pendant l’installation et ses résultats sont
 * projetés en direct : ils servent à caler la séance sur les usages réels des
 * enseignants de l’établissement plutôt que sur des généralités.
 *
 * Les deux questionnaires sont anonymes : ni nom, ni adresse, ni identifiant.
 * La seule identité du site est le champ « membres du groupe » de la trame de
 * restitution — celle d’adultes, saisie volontairement, jamais affichée sur le
 * mur des contributions. La trame rappelle en plus qu’aucune donnée d’élève ne
 * doit y figurer — c’est le réflexe « Protéger » de la diapositive 16.
 */

/* ------------------------------------------------------------------ */
/* Sondage d’entrée — à l’arrivée, pendant l’installation              */
/* ------------------------------------------------------------------ */

export const sondageEntree: Questionnaire = {
  slug: "sondage",
  titre: "Sondage d’entrée",
  intro:
    "Trois questions et une question ouverte, avant de commencer. Les réponses sont anonymes : ni nom, ni adresse, ni identifiant — rien ne permet de savoir qui a répondu quoi. Les résultats sont projetés en direct dans la salle et servent à adapter les exemples à vos usages réels en classe.",
  remerciement:
    "Merci — votre réponse est enregistrée. Installez-vous : les résultats s’affichent dans quelques minutes.",
  moment: "À l’arrivée, pendant l’installation — 5 minutes",
  questions: [
    {
      id: "usage",
      type: "choix-unique",
      libelle: "Utilisez-vous des outils d’IA pour préparer votre classe ?",
      options: ["Jamais", "Rarement", "Souvent", "Tous les jours"],
      ordonnee: true,
      obligatoire: true,
    },
    {
      id: "pourquoi",
      type: "choix-multiple",
      libelle: "Pour quoi faire ?",
      options: [
        "Préparer des séances ou des activités",
        "Trouver des idées de séquences",
        "Créer des exercices ou une évaluation",
        "Adapter ou simplifier une consigne",
        "Rédiger des documents pour les familles",
        "Usage personnel",
        "Je n’en utilise pas",
      ],
    },
    {
      id: "aisance",
      type: "echelle",
      libelle: "Comment vous situez-vous face à ces outils aujourd’hui ?",
      min: 1,
      max: 5,
      libelleMin: "Pas du tout à l’aise",
      libelleMax: "Tout à fait à l’aise",
      obligatoire: true,
    },
    {
      id: "question",
      type: "texte-libre",
      libelle: "Quelle est votre principale question sur l’IA aujourd’hui ?",
      aide: "Une phrase suffit. Les questions posées ici sont projetées telles quelles et orientent la séance.",
      lignes: 3,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Enquête de satisfaction — à la clôture (objectifs, diapositive 2)   */
/* ------------------------------------------------------------------ */

export const enqueteSatisfaction: Questionnaire = {
  slug: "satisfaction",
  titre: "Enquête de satisfaction",
  intro:
    "Quatre questions, deux minutes, avant de quitter la salle. Les trois premières reprennent les objectifs annoncés au début : mieux formuler, mieux dialoguer, mieux exploiter vos sources. Les réponses sont anonymes : ni nom, ni adresse, ni identifiant. Elles servent à améliorer la séance et à cerner les besoins qui restent.",
  remerciement:
    "Merci pour votre retour. Votre prochaine action tient en une phrase : choisissez une préparation de la semaine et testez un prompt ACTIF, puis comparez le temps gagné et la qualité obtenue.",
  moment: "À la fin de la séance — 2 minutes",
  questions: [
    {
      id: "actif",
      type: "echelle",
      libelle: "Je sais construire un prompt précis avec la méthode ACTIF.",
      min: 1,
      max: 5,
      libelleMin: "Pas du tout",
      libelleMax: "Tout à fait",
      obligatoire: true,
    },
    {
      id: "iterer",
      type: "echelle",
      libelle:
        "Je sais comment améliorer une première réponse qui ne me convient pas.",
      min: 1,
      max: 5,
      libelleMin: "Pas du tout",
      libelleMax: "Tout à fait",
      obligatoire: true,
    },
    {
      id: "notebooklm",
      type: "echelle",
      libelle:
        "Je me sens capable d’utiliser NotebookLM à partir d’un de mes documents.",
      min: 1,
      max: 5,
      libelleMin: "Pas du tout",
      libelleMax: "Tout à fait",
      obligatoire: true,
    },
    {
      id: "suite",
      type: "texte-libre",
      libelle: "De quel atelier auriez-vous besoin ensuite ?",
      aide: "Une ligne suffit : le thème, le moment de l’année, l’outil que vous voudriez approfondir.",
      lignes: 3,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Trame de restitution de l’atelier (diapositives 13, 14 et 16)       */
/* ------------------------------------------------------------------ */

/**
 * Ce que chaque groupe dépose après l’atelier « À vous de jouer ! » : le prompt
 * rédigé, ce que l’IA en a fait, et ce qu’il a fallu corriger.
 *
 * Les identifiants sont ceux que la collecte attend, sans exception :
 * « niveau », « besoin », « membres », « outil », « ressource », « requete »,
 * « corrections » et « vigilance ». Ce sont les colonnes de la table des
 * restitutions, les clés que la route de dépôt accepte et l’ordre d’affichage
 * du mur des contributions comme du tableau de bord animateur.
 *
 * « requete » est aussi l’identifiant du champ « Votre prompt assemblé » de
 * l’exercice « exercice-prompt-actif » du module 3, qui alimente la
 * restitution : le prompt s’y retrouve pré-rempli, il ne reste qu’à raconter le
 * résultat obtenu.
 *
 * Un seul champ nominatif, « membres du groupe » : celui d’adultes, facultatif,
 * visible du seul animateur.
 */
export const champsRestitution: ChampRestitution[] = [
  {
    id: "niveau",
    libelle: "Niveau de la classe",
    aide: "Il sert de titre à votre contribution sur le mur des collègues.",
    type: "choix",
    options: [
      "Maternelle",
      "Élémentaire",
      "Collège",
      "Lycée",
      "Plusieurs niveaux",
    ],
    obligatoire: true,
  },
  {
    id: "membres",
    libelle: "Membres du groupe",
    aide: "Les prénoms suffisent : inutile d’indiquer les noms complets. Ce champ ne figure pas sur le mur des contributions.",
    type: "texte",
  },
  {
    id: "besoin",
    libelle: "Le besoin de la semaine",
    aide: "La préparation réelle que vous avez choisie : un atelier de langage, une série d’exercices, un résumé de chapitre, une grille d’évaluation…",
    type: "texte",
    obligatoire: true,
  },
  {
    id: "outil",
    libelle: "L’outil utilisé",
    type: "choix",
    options: ["ChatGPT", "NotebookLM"],
    obligatoire: true,
  },
  {
    id: "requete",
    libelle: "Votre prompt assemblé",
    aide: "Collez-le tel quel, avec ses cinq éléments ACTIF : rôle, contexte, tâche, ton, format. C’est lui qui sert aux collègues. Aucune donnée d’élève ne doit y figurer — ni prénom, ni observation nominative.",
    type: "texte-long",
    obligatoire: true,
  },
  {
    id: "ressource",
    libelle: "Ce que l’IA a répondu, en deux ou trois phrases",
    aide: "Directement exploitable, à retravailler un peu, hors sujet ? Dites-le simplement.",
    type: "texte-long",
    obligatoire: true,
  },
  {
    id: "corrections",
    libelle: "Ce qu’il a fallu corriger ou relancer",
    aide: "Les relances du type « refais plus court », « mets en tableau », « adapte à la MS », et ce qui manquait dans la première réponse.",
    type: "texte-long",
  },
  {
    id: "vigilance",
    libelle: "Une vigilance à partager avec les collègues",
    aide: "Une seule, la plus utile : un fait à vérifier, une donnée à ne pas envoyer, un contenu à adapter avant la classe.",
    type: "texte-long",
  },
];
