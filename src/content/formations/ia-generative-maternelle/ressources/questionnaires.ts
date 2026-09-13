import type { Questionnaire, ChampRestitution } from "@/content/types";

/**
 * Les deux questionnaires de la séance et la trame de restitution de l’atelier.
 *
 * Source : le diaporama « IA générative au service de la maternelle »
 * (Eddy Bachaalany, 2026-2027) — diapositive 2 pour les trois objectifs repris
 * dans l’enquête de satisfaction, diapositives 13 et 14 pour l’atelier « À vous
 * de jouer ! » dont la trame de restitution recueille le résultat, diapositive 16
 * pour la vigilance sur les données.
 *
 * Le sondage d’entrée est rempli pendant l’installation et ses résultats sont
 * projetés en direct : ils servent à caler la séance sur les usages réels des
 * enseignantes de maternelle plutôt que sur des généralités.
 *
 * Aucun champ nominatif nulle part : ni nom, ni adresse, ni identifiant. La
 * trame de restitution rappelle en plus qu’aucune donnée d’enfant ne doit y
 * figurer — c’est le réflexe « Protéger » de la diapositive 16.
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
        "Préparer des activités",
        "Trouver des idées de séquences",
        "Rédiger des documents pour les familles",
        "Adapter ou simplifier une consigne",
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
    "Quatre questions, deux minutes, avant de quitter la salle. Les trois premières reprennent les objectifs annoncés au début : mieux formuler, mieux dialoguer, mieux exploiter vos sources. Les réponses sont anonymes : ni nom, ni adresse, ni identifiant. Elles servent à améliorer la séance et à choisir l’atelier suivant.",
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
 * Ce que chacune dépose après l’atelier « À vous de jouer ! » : le prompt
 * rédigé, ce que l’IA en a fait, et ce qu’il a fallu corriger.
 *
 * Les identifiants « acteur », « contexte », « tache », « intention »,
 * « format » et « prompt » sont ceux de l’exercice « exercice-prompt-actif » du
 * module 3 : le brouillon s’y pré-remplit tout seul, il ne reste qu’à raconter
 * le résultat obtenu.
 *
 * Aucun champ nominatif : les dépôts alimentent la mise en commun, pas un
 * relevé individuel.
 */
export const champsRestitution: ChampRestitution[] = [
  {
    id: "niveau",
    libelle: "Niveau de la classe",
    type: "choix",
    options: [
      "Petite Section",
      "Moyenne Section",
      "Grande Section",
      "Classe multi-niveaux",
    ],
    obligatoire: true,
  },
  {
    id: "besoin",
    libelle: "Le besoin de la semaine",
    aide: "La préparation réelle que vous avez choisie : un atelier de langage, un rituel, une comptine, une séance de motricité…",
    type: "texte",
    obligatoire: true,
  },
  {
    id: "acteur",
    libelle: "A — Acteur / Identité",
    aide: "Le rôle donné à l’IA, par exemple « Tu es mon assistant pédagogique en maternelle ».",
    type: "texte",
  },
  {
    id: "contexte",
    libelle: "C — Contexte",
    aide: "Le niveau, le thème, l’objectif et la durée visée.",
    type: "texte",
  },
  {
    id: "tache",
    libelle: "T — Tâche / Action",
    aide: "L’action concrète attendue : produire, expliquer, reformuler, comparer, corriger…",
    type: "texte",
  },
  {
    id: "intention",
    libelle: "I — Intention / Tonalité",
    aide: "Le niveau de langage et le ton demandés, pour des enfants de 3 à 5 ans.",
    type: "texte",
  },
  {
    id: "format",
    libelle: "F — Format",
    aide: "La forme attendue : liste, tableau, puces, longueur.",
    type: "texte",
  },
  {
    id: "prompt",
    libelle: "Votre prompt assemblé",
    aide: "Collez-le tel quel : c’est lui qui sert aux collègues. Aucune donnée d’enfant ne doit y figurer — ni prénom, ni observation nominative.",
    type: "texte-long",
    obligatoire: true,
  },
  {
    id: "resultat",
    libelle: "Ce que l’IA a répondu, en deux ou trois phrases",
    aide: "Directement exploitable, à retravailler un peu, hors sujet ? Dites-le simplement.",
    type: "texte-long",
  },
  {
    id: "ajustement",
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
