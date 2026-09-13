import { METHODE_ACTIF, type LettreActif } from "@/content/outils/actif";
import type { LigneRequete } from "@/content/types";

/**
 * Ressource « requêtes » de la formation « IA générative au service de la
 * maternelle » (Eddy Bachaalany, 2026-2027).
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
 * Douze requêtes rédigées selon ACTIF, pour la maternelle. Les crochets
 * marquent ce que l’enseignante remplace par sa situation réelle, en évitant
 * d’envoyer des données sensibles ou identifiantes sur les élèves
 * (réflexe « Protéger », diapositive 16).
 */
export const bibliothequeRequetes: LigneRequete[] = [
  {
    usage: "Vocabulaire d’un thème",
    requete:
      "« Tu es un assistant pédagogique spécialisé en maternelle. Je prépare une séquence de [Moyenne Section] sur le thème [de la ferme]. Propose 12 mots concrets. Pour chaque mot, écris une phrase-modèle de 5 mots maximum et une devinette en 3 indices. Utilise un ton simple, bienveillant et adapté à des enfants de [4–5] ans. Présente le résultat dans un tableau : Mot | Phrase-modèle | Devinette. »",
    outil: "chatgpt",
  },
  {
    usage: "Reformuler une consigne",
    requete:
      "« Tu es un professeur qui m’aide à reformuler mes consignes. Je travaille avec des enfants de [niveau] pendant [un atelier de motricité de 20 minutes]. Reformule cette consigne en langage plus simple : [consigne actuelle]. Utilise un vocabulaire simple et clair, des phrases courtes. Donne trois reformulations sous forme de puces, de la plus courte à la plus détaillée. »",
    outil: "chatgpt",
  },
  {
    usage: "Questions de compréhension",
    requete:
      "« Tu es un expert en langage oral pour les 4–5 ans. Je viens de lire l’album [titre] à ma classe de [niveau]. Crée 5 questions de compréhension à poser au regroupement. Utilise un vocabulaire simple et clair, une seule idée par question. Présente-les en liste numérotée, de la plus simple à la plus ouverte, avec la réponse attendue. »",
    outil: "chatgpt",
  },
  {
    usage: "Idées d’ateliers",
    requete:
      "« Tu es mon assistant pédagogique en maternelle. Je veux préparer une activité de 20 minutes pour demain, en [niveau], sur le thème [de la ferme] ; mon objectif est [objectif visé]. Propose des ateliers réalisables avec le matériel de la classe. Utilise un ton simple et concret. Donne 5 idées sous forme de puces ; pour chacune : titre, matériel, déroulé en 3 étapes, ce que j’observe. »",
    outil: "chatgpt",
  },
  {
    usage: "Comptine ou rituel",
    requete:
      "« Tu es un expert en langage oral pour les 4–5 ans. Ma classe de [niveau] travaille le thème [thème] et le rituel d’accueil dure [5 minutes]. Écris une comptine de 4 vers courts qui reprend les mots [mot 1], [mot 2] et [mot 3], et propose un geste pour chaque vers. Utilise un ton simple, bienveillant et adapté à des enfants de [4–5] ans. Présente le résultat dans un tableau : Vers | Geste. »",
    outil: "chatgpt",
  },
  {
    usage: "Message aux familles",
    requete:
      "« Tu es mon assistant pédagogique en maternelle. Je dois informer les familles de ma classe de [niveau] au sujet de [sortie, projet, matériel à apporter] prévu le [date]. Rédige ce message. Adopte un ton bienveillant et rassurant, sans jargon pédagogique. Format : 8 lignes maximum, avec un titre court et une phrase de conclusion. »",
    outil: "chatgpt",
  },
  {
    usage: "Différenciation PS / MS / GS",
    requete:
      "« Tu es un assistant pédagogique spécialisé en maternelle. J’ai préparé l’activité suivante : [activité], sur le thème [thème]. Décline-la en trois versions, pour la Petite, la Moyenne et la Grande Section. Utilise un vocabulaire simple et clair, et une consigne dicible en une phrase. Présente le résultat dans un tableau : Section | Consigne donnée aux enfants | Ce que je regarde. »",
    outil: "chatgpt",
  },
  {
    usage: "Relancer la première réponse",
    requete:
      "À envoyer après la première réponse, une demande à la fois : « Refais plus court. », « Mets le résultat en tableau. », « Adapte à la Moyenne Section. », « Reformule pour des enfants de 4–5 ans. »",
    outil: "les-deux",
  },
  {
    usage: "Synthèse d’un document",
    requete:
      "« Tu es mon assistant pédagogique en maternelle. Les sources de ce notebook sont [documents importés] et je dois les présenter [à l’équipe de cycle]. Résume-les en 8 points clés et cite pour chaque point le passage de la source. Utilise un vocabulaire simple et clair. Présente le résultat sous forme de puces, une phrase par point. »",
    outil: "notebooklm",
  },
  {
    usage: "QCM à partir d’un document",
    requete:
      "« À partir de [document importé], génère un QCM sur [le point à vérifier]. Crée 6 questions, 4 choix par question, indique la bonne réponse et cite le passage utilisé. » Puis demander une version plus simple, un vrai/faux ou des cas pratiques.",
    outil: "notebooklm",
  },
  {
    usage: "Guide d’étude",
    requete:
      "« Tu es mon assistant pédagogique en maternelle. À partir de [document importé], je prépare [ma réunion de rentrée avec les familles]. Crée un guide d’étude : les notions à connaître, les points de vigilance, puis 5 questions pour m’auto-vérifier. Utilise un vocabulaire simple et clair. Présente le résultat en trois parties courtes, avec la citation de la source pour chaque notion. »",
    outil: "notebooklm",
  },
  {
    usage: "Questions avec citations",
    requete:
      "« À partir des sources de ce notebook, réponds à la question suivante : [question précise]. N’indique que ce qui figure dans les sources, cite le passage utilisé et signale ce que les sources ne disent pas. Réponds en 5 lignes maximum. » Ouvrir ensuite la citation et relire le passage avant usage.",
    outil: "notebooklm",
  },
];
