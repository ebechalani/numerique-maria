import type { Tutoriel } from "./types";

/**
 * Tutoriel Keamk — constituer des équipes au hasard, équilibrées ou non.
 *
 * Source : le support de prise en main fourni par l’établissement (deux
 * pages, cinq étapes). Les étapes en sont reprises dans le même ordre :
 * lancer un tirage, régler le titre et les effectifs, choisir le type de
 * tirage, saisir les noms et nommer les groupes, obtenir le résultat.
 *
 * Y sont ajoutés le point sur les données personnelles et les usages de
 * classe, que le support n’aborde pas.
 *
 * Keamk n’est pas un outil d’IA et ne fait pas partie de la formation : il
 * n’a donc pas de renvoi vers un module.
 */
export const keamk: Tutoriel = {
  slug: "keamk",
  outil: "Keamk",
  editeur: "Keamk",
  sousTitre: "Constituer des équipes au hasard, en une minute",
  accroche:
    "Un tirage au sort qui répartit une classe en groupes — purement aléatoire, ou équilibré selon un critère que vous choisissez — et qui affiche le résultat à projeter.",
  adresse: "https://www.keamk.com",
  cout: "Gratuit",
  duree: "5 minutes pour un premier tirage",
  interfaceDecrite: "Interface de Keamk au printemps 2026",

  prerequis: [
    {
      titre: "Un navigateur",
      texte:
        "Keamk fonctionne directement dans le navigateur. Aucun compte n’est nécessaire pour un tirage simple.",
    },
    {
      titre: "Votre liste de participants",
      texte:
        "Les prénoms suffisent — voyez plus bas pourquoi c’est le choix à privilégier. Prévoyez aussi le nombre de groupes que vous voulez obtenir.",
    },
    {
      titre: "Un critère, si vous voulez équilibrer",
      texte:
        "Un niveau, une appétence, une langue : ce qui doit être réparti entre les groupes plutôt que concentré dans l’un d’eux. Facultatif, le tirage peut rester purement aléatoire.",
    },
  ],

  blocs: [
    /* ---------------- À quoi ça sert ---------------- */
    { type: "titre", texte: "À quoi sert Keamk" },
    {
      type: "paragraphe",
      texte:
        "Keamk répartit une liste de personnes en équipes. Sa valeur n’est pas le hasard — on sait tirer au sort sans outil — mais l’équilibrage : il peut répartir les participants de façon que chaque groupe reçoive à peu près autant de chaque profil, au lieu de laisser le hasard concentrer tous les mêmes dans la même équipe.",
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "Le vrai gain : la neutralité",
      texte:
        "Un tirage projeté à l’écran désamorce les discussions sur la composition des groupes. Ce n’est plus l’enseignant qui a mis untel avec untel : c’est le tirage, et il est visible par tous.",
    },

    /* ---------------- Étapes ---------------- */
    { type: "titre", texte: "1. Lancer un tirage" },
    {
      type: "paragraphe",
      texte:
        "Sur la page d’accueil de keamk.com, le bouton « Create Teams » ouvre directement l’écran de réglage. Il n’y a rien à installer ni, pour un tirage simple, de compte à créer.",
    },

    { type: "titre", texte: "2. Régler le tirage" },
    {
      type: "etapes",
      etapes: [
        {
          titre: "Donner un titre",
          texte:
            "Le titre du tirage s’affichera au-dessus du résultat : « Ateliers du mardi », « Exposés — chapitre 3 ». C’est ce qui rend la projection lisible.",
        },
        {
          titre: "Choisir le nombre de participants",
          texte:
            "L’effectif que vous allez saisir. Il se corrige ensuite si un élève manque.",
        },
        {
          titre: "Choisir le nombre d’équipes",
          texte:
            "Keamk répartit au mieux : si l’effectif ne tombe pas juste, les groupes n’auront pas tous la même taille — vérifiez que cela vous convient avant de lancer.",
        },
      ],
    },

    { type: "titre", texte: "3. Choisir le type de tirage" },
    {
      type: "paragraphe",
      texte:
        "Trois modes sont proposés. Par défaut, le tirage est purement aléatoire ; les deux autres demandent une information de plus pour chaque participant, et s’en servent pour équilibrer les groupes.",
    },
    {
      type: "tableau",
      entetes: ["Mode", "Ce qu’il fait", "Quand le choisir"],
      lignes: [
        [
          "Normal (par défaut)",
          "Répartit au hasard, sans autre contrainte",
          "Des groupes de travail ordinaires, quand aucun équilibre particulier n’est visé",
        ],
        [
          "Par niveau",
          "Répartit les participants d’après une note que vous attribuez, pour que les groupes se valent",
          "Un travail où un groupe entièrement composé d’élèves fragiles serait en difficulté",
        ],
        [
          "Par sexe",
          "Répartit filles et garçons entre les groupes",
          "Quand la mixité des groupes fait partie de l’intention pédagogique",
        ],
      ],
    },
    {
      type: "encadre",
      ton: "attention",
      titre: "Le « niveau » reste votre jugement",
      texte:
        "La note que vous attribuez à chacun n’est visible que de vous, mais elle formalise un classement. Servez-vous-en pour équilibrer un groupe de travail, jamais comme une évaluation — et évitez de projeter cet écran de saisie.",
    },

    { type: "titre", texte: "4. Saisir les participants et les groupes" },
    {
      type: "paragraphe",
      texte:
        "Ajoutez les noms des participants, puis nommez les groupes — « Groupe 1 », ou des noms qui parlent à la classe. Si vous avez choisi un tirage par niveau ou par sexe, c’est ici que l’information se renseigne, participant par participant. Puis lancez le tirage.",
    },
    {
      type: "encadre",
      ton: "regle",
      titre: "Des prénoms, rien de plus",
      texte:
        "Keamk est un site tiers : ce que vous y saisissez lui est transmis. Un prénom, ou un prénom et l’initiale du nom quand deux élèves le partagent, suffit toujours à un tirage — et vous évite d’y déposer une liste de classe nominative. N’y portez ni nom complet, ni note réelle, ni information sur la situation d’un élève.",
    },

    { type: "titre", texte: "5. Obtenir le résultat" },
    {
      type: "paragraphe",
      texte:
        "Les équipes s’affichent, prêtes à être projetées. Relancez le tirage si la composition ne convient pas — mais annoncez-le : relancer discrètement jusqu’à obtenir le résultat souhaité vide le procédé de ce qui fait son intérêt.",
    },

    /* ---------------- En classe ---------------- */
    { type: "titre", texte: "Quelques usages en classe" },
    {
      type: "cartes",
      colonnes: 3,
      cartes: [
        {
          titre: "Groupes de travail",
          texte:
            "Un tirage par niveau évite le groupe où personne ne peut lancer le travail, et celui qui finit en dix minutes.",
        },
        {
          titre: "Exposés et ateliers",
          texte:
            "Nommez les groupes d’après les sujets : le tirage attribue les équipes et les thèmes d’un seul coup.",
        },
        {
          titre: "Rotations sur l’année",
          texte:
            "Un nouveau tirage à chaque séquence évite que les mêmes se retrouvent toujours ensemble.",
        },
      ],
    },

    /* ---------------- Check-list ---------------- */
    { type: "titre", texte: "Votre premier tirage, pas à pas" },
    {
      type: "checklist",
      id: "tutoriel-keamk",
      consigne:
        "Cinq gestes, cinq minutes. Cochez au fur et à mesure : à la fin, vous avez des groupes prêts à projeter.",
      items: [
        {
          titre: "J’ai donné un titre au tirage",
          texte: "Celui qui s’affichera au-dessus du résultat projeté.",
        },
        {
          titre: "J’ai réglé l’effectif et le nombre d’équipes",
          texte:
            "Et j’ai vérifié ce que donne la division quand elle ne tombe pas juste.",
        },
        {
          titre: "J’ai choisi le type de tirage",
          texte:
            "Aléatoire par défaut ; par niveau ou par sexe si l’équilibre fait partie de l’intention.",
        },
        {
          titre: "Je n’ai saisi que des prénoms",
          texte: "Ni nom complet, ni note réelle, ni information personnelle.",
        },
        {
          titre: "J’ai projeté le résultat",
          texte:
            "Et annoncé la règle avant : un tirage, relancé seulement si je le dis.",
        },
      ],
    },
  ],

  liens: [
    {
      libelle: "Ouvrir Keamk",
      href: "https://www.keamk.com",
      description: "L’outil lui-même, dans votre navigateur.",
    },
    {
      libelle: "Tutoriel Coggle",
      href: "/tutoriels/coggle",
      description:
        "L’autre outil du quotidien numérique publié ici : la carte mentale.",
    },
  ],
};
