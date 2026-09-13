import { METHODE_ACTIF, type LettreActif } from "@/content/outils/actif";
import type { LigneRequete } from "@/content/types";

/**
 * Ressource « requêtes » de la formation, tirée du diaporama « IA générative
 * au service de la maternelle » (2026-2027).
 *
 * Deux jeux de données :
 * — les cinq briques du constructeur, qui sont les cinq lettres de la méthode
 *   ACTIF (diapositives 4 à 10, textes repris de `@/content/outils/actif`) ;
 * — une bibliothèque de requêtes prêtes à l’emploi, construites sur le modèle
 *   complet de la diapositive 11 et sur les exemples des diapositives 7 à 10,
 *   16, 18, 19 et 20.
 *
 * La structure vaut pour les deux outils de la formation, ChatGPT et
 * NotebookLM.
 */

/* ------------------------------------------------------------------ */
/* Les cinq briques d’une requête — méthode ACTIF                      */
/* ------------------------------------------------------------------ */

export interface BriqueRequete {
  cle: "acteur" | "contexte" | "tache" | "intention" | "format";
  /** Le titre de la diapositive : « Acteur / Identité », « Contexte »… */
  titre: string;
  /** La question à se poser pour remplir la brique. */
  question: string;
  /** Le premier exemple de la fiche méthode, cité entre guillemets. */
  exemple: string;
  /** Aide à la saisie affichée dans le champ vide. */
  exemplePlaceholder: string;
}

/** Une clé lisible par brique, dans l’ordre A · C · T · I · F. */
const CLES_ACTIF: Record<LettreActif, BriqueRequete["cle"]> = {
  A: "acteur",
  C: "contexte",
  T: "tache",
  I: "intention",
  F: "format",
};

/**
 * Les briques sont dérivées de la méthode : titre, question et premier exemple
 * viennent du diaporama, sans réécriture ; le texte d’attente reprend
 * l’indication de saisie de la fiche méthode.
 */
export const briquesRequete: BriqueRequete[] = METHODE_ACTIF.map((element) => ({
  cle: CLES_ACTIF[element.lettre],
  titre: element.titre,
  question: element.question,
  exemple: `« ${element.exemples[0]} »`,
  exemplePlaceholder: element.indication,
}));

/* ------------------------------------------------------------------ */
/* Requêtes prêtes à l’emploi                                          */
/* ------------------------------------------------------------------ */

/**
 * Dix-neuf requêtes rédigées selon ACTIF, classées par cycle : le cycle est
 * rappelé à la fin de l’usage, pour que chacun trouve la sienne d’un coup
 * d’œil. Celles de la maternelle sont celles du diaporama, reprises au mot
 * près ; les autres les transposent à l’élémentaire et au secondaire.
 *
 * Les crochets marquent ce que l’enseignant remplace par sa situation réelle,
 * en évitant d’envoyer des données sensibles ou identifiantes sur les élèves
 * (réflexe « Protéger », diapositive 16) : écrire « élève A », jamais un nom.
 */
export const bibliothequeRequetes: LigneRequete[] = [
  /* ---------------- Tous cycles ---------------- */
  {
    usage: "Reformuler une consigne · tous cycles",
    requete:
      "« Tu es un professeur qui m’aide à reformuler mes consignes. Je travaille avec des élèves de [niveau] pendant [une séance de 20 minutes] sur [le thème]. Reformule cette consigne en langage plus simple : [consigne actuelle]. Utilise un vocabulaire simple et clair, des phrases courtes. Donne trois reformulations sous forme de puces, de la plus courte à la plus détaillée. »",
    outil: "chatgpt",
  },
  {
    usage: "Différencier une activité · tous cycles",
    requete:
      "« Tu es un assistant pédagogique pour [le cycle concerné]. J’ai préparé l’activité suivante : [activité], sur [le thème], en [niveau]. Décline-la en trois versions : une allégée, une conforme à l’attendu, une approfondie. Utilise un vocabulaire simple et une consigne dicible en une phrase. Présente le résultat dans un tableau : Version | Consigne donnée aux élèves | Ce que je regarde. »",
    outil: "chatgpt",
  },
  {
    usage: "Message aux familles · tous cycles",
    requete:
      "« Tu es mon assistant pédagogique. Je dois informer les familles de ma classe de [niveau] au sujet de [sortie, projet, matériel à apporter] prévu le [date]. Rédige ce message. Adopte un ton bienveillant et rassurant, sans jargon pédagogique. Format : 8 lignes maximum, avec un titre court et une phrase de conclusion. »",
    outil: "chatgpt",
  },
  {
    usage: "Relancer la première réponse · tous cycles",
    requete:
      "À envoyer après la première réponse, une demande à la fois : « Refais plus court. », « Mets le résultat en tableau. », « Adapte à [la Moyenne Section / au CE2 / à la 4e]. », « Propose une version plus simple. », « Ajoute un exemple pour chaque point. »",
    outil: "les-deux",
  },

  /* ---------------- Maternelle — les exemples du diaporama ---------------- */
  {
    usage: "Vocabulaire d’un thème · maternelle",
    requete:
      "« Tu es un assistant pédagogique spécialisé en maternelle. Je prépare une séquence de [Moyenne Section] sur le thème [de la ferme]. Propose 12 mots concrets. Pour chaque mot, écris une phrase-modèle de 5 mots maximum et une devinette en 3 indices. Utilise un ton simple, bienveillant et adapté à des enfants de [4–5] ans. Présente le résultat dans un tableau : Mot | Phrase-modèle | Devinette. »",
    outil: "chatgpt",
  },
  {
    usage: "Idées d’ateliers · maternelle",
    requete:
      "« Tu es mon assistant pédagogique en maternelle. Je veux préparer une activité de 20 minutes pour demain, en [niveau], sur le thème [de la ferme] ; mon objectif est [objectif visé]. Propose des ateliers réalisables avec le matériel de la classe. Utilise un ton simple et concret. Donne 5 idées sous forme de puces ; pour chacune : titre, matériel, déroulé en 3 étapes, ce que j’observe. »",
    outil: "chatgpt",
  },
  {
    usage: "Comptine ou rituel · maternelle",
    requete:
      "« Tu es un expert en langage oral pour les 4–5 ans. Ma classe de [niveau] travaille le thème [thème] et le rituel d’accueil dure [5 minutes]. Écris une comptine de 4 vers courts qui reprend les mots [mot 1], [mot 2] et [mot 3], et propose un geste pour chaque vers. Utilise un ton simple, bienveillant et adapté à des enfants de [4–5] ans. Présente le résultat dans un tableau : Vers | Geste. »",
    outil: "chatgpt",
  },
  {
    usage: "Questions sur un album · maternelle",
    requete:
      "« Tu es un expert en langage oral pour les 4–5 ans. Je viens de lire l’album [titre] à ma classe de [niveau]. Crée 5 questions de compréhension à poser au regroupement. Utilise un vocabulaire simple et clair, une seule idée par question. Présente-les en liste numérotée, de la plus simple à la plus ouverte, avec la réponse attendue. »",
    outil: "chatgpt",
  },

  /* ---------------- Élémentaire ---------------- */
  {
    usage: "Série d’exercices progressifs · élémentaire",
    requete:
      "« Tu es un professeur des écoles qui prépare ses séances. Ma classe de [CE2] travaille [la notion] et plusieurs élèves ont encore besoin de manipuler. Propose 8 exercices progressifs sur cette notion. Utilise des énoncés courts, un vocabulaire courant, un seul obstacle à la fois. Présente le résultat dans un tableau : Exercice | Énoncé | Ce que l’élève doit avoir compris | Corrigé. »",
    outil: "chatgpt",
  },
  {
    usage: "Texte à trous à partir d’une leçon · élémentaire",
    requete:
      "« À partir de [la leçon importée], crée un texte à trous de 10 items pour des élèves de [niveau], portant sur [la notion]. Garde les phrases de la leçon, retire un mot clé par phrase, et donne à part la liste des mots mélangés puis le corrigé avec le passage source de chaque réponse. »",
    outil: "notebooklm",
  },
  {
    usage: "Retour sur une production écrite · élémentaire",
    requete:
      "« Tu es un professeur des écoles bienveillant. Voici la production d’[élève A], en [niveau], sur le sujet [sujet] : [texte recopié sans aucun nom]. Rédige un retour à lui remettre. Adopte un ton encourageant et concret. Format : deux réussites précises, puis deux points à travailler formulés en conseils d’action, 60 mots maximum. »",
    outil: "chatgpt",
  },

  /* ---------------- Collège et lycée ---------------- */
  {
    usage: "Résumé d’un chapitre par niveau · collège et lycée",
    requete:
      "« À partir de [le chapitre importé], résume la partie [X] en 6 points pour des élèves de [niveau]. Pour chaque point, cite le passage du cours correspondant. Utilise un vocabulaire précis mais des phrases courtes. Donne ensuite la même liste en version simplifiée, pour les élèves qui lisent difficilement le français. »",
    outil: "notebooklm",
  },
  {
    usage: "Grille d’évaluation critériée · collège et lycée",
    requete:
      "« Tu es un professeur de [discipline] au [collège / lycée]. J’évalue [la production attendue] en [niveau], sur [la compétence visée]. Construis une grille critériée. Emploie des descripteurs observables, sans jargon. Présente le résultat dans un tableau : Critère | Maîtrise insuffisante | Maîtrise fragile | Maîtrise satisfaisante | Très bonne maîtrise. »",
    outil: "chatgpt",
  },
  {
    usage: "Situation-problème d’introduction · collège et lycée",
    requete:
      "« Tu es un professeur de [discipline]. J’introduis [la notion] en [niveau] et je veux partir d’une situation concrète plutôt que de la définition. Imagine une situation-problème ancrée dans le quotidien de mes élèves. Utilise un ton vivant et des données plausibles. Format : le récit en 6 lignes, puis 3 questions qui guident vers la notion, puis ce que je dois entendre dans leurs réponses. »",
    outil: "chatgpt",
  },
  {
    usage: "Consigne de devoir moins contournable · collège et lycée",
    requete:
      "« Tu es un professeur de [discipline] qui prépare un devoir maison en [niveau]. Voici ma consigne actuelle : [consigne]. Propose 3 reformulations qui rendent l’usage d’une IA peu utile ou visible : ancrage dans ce qui a été fait en classe, étapes intermédiaires à montrer, justification orale. Explique en une phrase, pour chacune, ce qui change. »",
    outil: "chatgpt",
  },

  /* ---------------- NotebookLM, tous cycles ---------------- */
  {
    usage: "Synthèse d’un document · tous cycles",
    requete:
      "« Tu es mon assistant pédagogique. Les sources de ce notebook sont [documents importés] et je dois les présenter [à l’équipe de cycle]. Résume-les en 8 points clés et cite pour chaque point le passage de la source. Utilise un vocabulaire simple et clair. Présente le résultat sous forme de puces, une phrase par point. »",
    outil: "notebooklm",
  },
  {
    usage: "QCM à partir d’un document · tous cycles",
    requete:
      "« À partir de [document importé], génère un QCM sur [le point à vérifier]. Crée 6 questions, 4 choix par question, indique la bonne réponse et cite le passage utilisé. » Puis demander une version plus simple, un vrai/faux ou des cas pratiques.",
    outil: "notebooklm",
  },
  {
    usage: "Guide d’étude · tous cycles",
    requete:
      "« Tu es mon assistant pédagogique. À partir de [document importé], je prépare [ma réunion de rentrée avec les familles]. Crée un guide d’étude : les notions à connaître, les points de vigilance, puis 5 questions pour m’auto-vérifier. Utilise un vocabulaire simple et clair. Présente le résultat en trois parties courtes, avec la citation de la source pour chaque notion. »",
    outil: "notebooklm",
  },
  {
    usage: "Questions avec citations · tous cycles",
    requete:
      "« À partir des sources de ce notebook, réponds à la question suivante : [question précise]. N’indique que ce qui figure dans les sources, cite le passage utilisé et signale ce que les sources ne disent pas. Réponds en 5 lignes maximum. » Ouvrir ensuite la citation et relire le passage avant usage.",
    outil: "les-deux",
  },
];
