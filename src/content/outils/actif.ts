/**
 * Méthode ACTIF — cinq réflexes avant d’envoyer un prompt.
 *
 * Textes repris du diaporama « IA générative au service de la maternelle »
 * (formation enseignants, Eddy Bachaalany, 2026-2027), diapositives 4 à 14 :
 * définitions, questions à se poser, exemples, check-list finale et
 * relances proposées dans les notes de l’animateur.
 */

export type LettreActif = "A" | "C" | "T" | "I" | "F";

export interface ElementActif {
  lettre: LettreActif;
  /** « Acteur / Identité » */
  titre: string;
  /** Mot-clé court : « rôle », « situation »… */
  motCle: string;
  /** La question de la diapositive : « Quel rôle doit jouer l’IA ? » */
  question: string;
  /** « Ce que ça signifie » */
  signification: string;
  /** « Questions à se poser » */
  questions: string[];
  /** Exemples de la diapositive, insérables tels quels. */
  exemples: string[];
  /** Question de la check-list finale (diapositive 14). */
  verification: string;
  /** Texte d’attente du champ de saisie. */
  indication: string;
}

export const METHODE_ACTIF: ElementActif[] = [
  {
    lettre: "A",
    titre: "Acteur / Identité",
    motCle: "rôle",
    question: "Quel rôle doit jouer l’IA ?",
    signification:
      "Définir le rôle ou l’expertise que l’IA doit adopter pour cadrer sa réponse.",
    questions: [
      "Quel rôle voulez-vous lui donner ?",
      "Quelle expertise est utile ici ?",
    ],
    exemples: [
      "Tu es mon assistant pédagogique en maternelle.",
      "Tu es un expert en langage oral pour les 4–5 ans.",
      "Tu es un professeur qui m’aide à reformuler mes consignes.",
    ],
    verification: "Ai-je précisé le rôle ou l’identité de l’IA ?",
    indication: "Tu es…",
  },
  {
    lettre: "C",
    titre: "Contexte",
    motCle: "situation",
    question: "Dans quelle situation ?",
    signification:
      "Donner les informations qui expliquent la situation, le niveau, le thème et l’objectif.",
    questions: [
      "À qui s’adresse la réponse ?",
      "Quel niveau / thème / objectif ?",
    ],
    exemples: [
      "Je prépare une séquence de Moyenne Section.",
      "Le thème est la ferme.",
      "Je veux préparer une activité de 20 minutes pour demain.",
    ],
    verification: "Ai-je expliqué dans quel contexte j’utilise la réponse ?",
    indication: "Je prépare… pour… sur le thème…",
  },
  {
    lettre: "T",
    titre: "Tâche / Action",
    motCle: "action",
    question: "Que doit faire l’IA ?",
    signification:
      "Dire précisément ce que vous attendez : produire, expliquer, reformuler, comparer, corriger…",
    questions: [
      "Quelle action concrète ?",
      "Quel résultat doit être obtenu ?",
    ],
    exemples: [
      "Propose 12 mots concrets sur la ferme.",
      "Crée 5 questions de compréhension.",
      "Reformule cette consigne en langage plus simple.",
    ],
    verification: "Ai-je dit exactement ce que j’attends ?",
    indication: "Propose… / Crée… / Reformule…",
  },
  {
    lettre: "I",
    titre: "Intention / Tonalité",
    motCle: "ton",
    question: "Quel style de réponse ?",
    signification:
      "Préciser le niveau de langage, le ton et l’intention : simple, rassurant, dynamique, professionnel…",
    questions: ["Pour quel public ?", "Quel ton doit-on entendre ?"],
    exemples: [
      "Utilise un vocabulaire simple et clair.",
      "Adopte un ton bienveillant et rassurant.",
      "Explique comme à un enfant de 5 ans.",
    ],
    verification: "Ai-je précisé le style ou le niveau de langage ?",
    indication: "Utilise un ton… / Adopte…",
  },
  {
    lettre: "F",
    titre: "Format",
    motCle: "forme",
    question: "Sous quelle forme ?",
    signification:
      "Indiquer la forme attendue afin que la réponse soit directement exploitable.",
    questions: [
      "Liste, tableau ou paragraphes ?",
      "Quelle longueur / structure ?",
    ],
    exemples: [
      "Présente le résultat dans un tableau.",
      "Donne 5 idées sous forme de puces.",
      "Pour chaque mot : phrase-modèle + devinette.",
    ],
    verification: "Ai-je demandé une forme claire et exploitable ?",
    indication: "Présente le résultat sous forme de…",
  },
];

/** L’exemple complet de la diapositive 11 — Moyenne Section, thème de la ferme. */
export const EXEMPLE_COMPLET: Record<LettreActif, string> = {
  A: "Tu es un assistant pédagogique spécialisé en maternelle.",
  C: "Je prépare une séquence de Moyenne Section sur le thème de la ferme.",
  T: "Propose 12 mots concrets. Pour chaque mot, écris une phrase-modèle de 5 mots maximum et une devinette en 3 indices.",
  I: "Utilise un ton simple, bienveillant et adapté à des enfants de 4–5 ans.",
  F: "Présente le résultat dans un tableau : Mot | Phrase-modèle | Devinette.",
};

/**
 * Relances à envoyer après la première réponse — « Itérer », diapositive 16,
 * et notes de la diapositive 14.
 */
export const RELANCES: string[] = [
  "Refais plus court.",
  "Mets le résultat en tableau.",
  "Adapte à la Moyenne Section.",
  "Propose une version plus simple.",
  "Ajoute un exemple pour chaque point.",
  "Reformule pour des enfants de 4–5 ans.",
];

/** Phrases-clés de la méthode, citées sur la page. */
export const CITATIONS_ACTIF = {
  definition:
    "Un prompt est la demande que vous adressez à une IA pour lui indiquer ce que vous voulez obtenir. Plus la consigne est précise, plus la réponse a de chances d’être adaptée à votre contexte.",
  principe:
    "ACTIF ne rallonge pas forcément le prompt : il enlève surtout les zones floues.",
  lettres:
    "Il n’est pas nécessaire d’utiliser les lettres dans le prompt : elles servent seulement à structurer votre pensée.",
  reflexes:
    "L’enseignant garde la décision pédagogique. L’IA accélère la préparation ; elle ne remplace pas votre jugement.",
};
