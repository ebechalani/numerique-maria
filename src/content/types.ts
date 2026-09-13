/**
 * Contrat de contenu de la plateforme de formation.
 *
 * Tout le contenu pédagogique est décrit en données (pas en JSX), pour trois raisons :
 *  - le rendu, la recherche et le corpus de l'assistant IA partent de la même source ;
 *  - ajouter une formation ne demande que d'écrire un fichier de contenu ;
 *  - la fidélité au support d'origine reste vérifiable d'un coup d'œil.
 */

/* ------------------------------------------------------------------ */
/* Blocs de contenu                                                    */
/* ------------------------------------------------------------------ */

/** Ton d'un encadré — pilote la couleur et l'icône. */
export type TonEncadre = "info" | "attention" | "regle" | "astuce";

/** Verdict d'un cas pratique : autorisé, encadré ou interdit. */
export type Verdict = "autorise" | "encadre" | "interdit";

export interface Carte {
  /** Pastille facultative affichée avant le titre : « 1 », « 2 »… */
  numero?: string;
  titre: string;
  texte: string;
}

export interface Etape {
  titre: string;
  texte: string;
}

export interface ColonneFeu {
  verdict: Verdict;
  /** Ex. « AUTORISÉ ». */
  titre: string;
  /** Ex. « sans demande préalable ». */
  precision: string;
  items: string[];
  /** Note en pied de colonne, ex. « → usage mentionné dans le travail rendu ». */
  note?: string;
}

export interface ItemQuiz {
  affirmation: string;
  /** true = l'affirmation est vraie. */
  reponse: boolean;
  /** Explication affichée après la réponse. */
  explication: string;
}

export interface CasPratique {
  situation: string;
  verdict: Verdict;
  /** Libellé du verdict si le mot exact du support diffère, ex. « Manquement ». */
  verdictLibelle?: string;
  pourquoi: string;
}

export interface ItemChecklist {
  titre: string;
  texte: string;
}

export interface LigneRequete {
  usage: string;
  requete: string;
  /** Outil conseillé pour cette requête. */
  outil: "notebooklm" | "chatgpt" | "les-deux";
}

/** Une question à choix unique, avec son corrigé. */
export interface QuestionQcm {
  question: string;
  options: string[];
  /** Rang de la bonne option dans `options`. */
  bonne: number;
  /** Explication affichée après la réponse. */
  explication: string;
}

/**
 * Un champ d'exercice guidé : ce que l'enseignant écrit ou choisit après avoir
 * manipulé l'outil. Les réponses restent dans son navigateur.
 */
export type ChampExercice =
  | {
      id: string;
      libelle: string;
      aide?: string;
      type: "texte" | "texte-long";
      /** Hauteur de la zone de texte, en lignes. */
      lignes?: number;
      /** Un champ facultatif ne bloque pas la validation. */
      facultatif?: boolean;
    }
  | {
      id: string;
      libelle: string;
      aide?: string;
      type: "choix";
      options: string[];
      facultatif?: boolean;
    };

/** Retour affiché une fois l'exercice validé : ce qu'on observe en séance. */
export interface RetourExercice {
  /** Ex. « Ce qu'on observe ». */
  titre?: string;
  texte: string;
  points?: string[];
}

export type Bloc =
  | { type: "titre"; texte: string }
  | { type: "paragraphe"; texte: string }
  | { type: "liste"; items: string[]; ordonnee?: boolean }
  | { type: "cartes"; colonnes?: 2 | 3 | 4; cartes: Carte[] }
  | { type: "etapes"; etapes: Etape[] }
  | { type: "encadre"; ton: TonEncadre; titre?: string; texte: string }
  | { type: "citation"; texte: string; source?: string }
  | { type: "tableau"; entetes: string[]; lignes: string[][] }
  | { type: "feu"; colonnes: ColonneFeu[]; regleOr?: string }
  /** Bloc requête avec bouton « copier ». */
  | { type: "requete"; titre?: string; texte: string; commentaire?: string }
  /* --- blocs interactifs (rendus côté client) --- */
  | { type: "quiz"; id: string; consigne: string; items: ItemQuiz[] }
  | { type: "qcm"; id: string; consigne: string; questions: QuestionQcm[] }
  | { type: "casPratiques"; id: string; consigne: string; cas: CasPratique[] }
  /**
   * Exercice guidé : une manipulation à faire dans l'outil, des champs où
   * consigner ce qu'on obtient, un retour révélé à la validation.
   */
  | {
      type: "exercice";
      id: string;
      titre: string;
      consigne: string;
      /** Ex. « 5 min ». */
      duree?: string;
      /** Ce qu'il faut faire dans l'outil, avant de répondre. */
      etapes?: string[];
      champs: ChampExercice[];
      retour: RetourExercice;
      /**
       * Recopie les réponses dans le brouillon de la trame de restitution :
       * les champs de même identifiant y sont pré-remplis.
       */
      alimenteRestitution?: boolean;
      /** Lien proposé une fois l'exercice validé. */
      suite?: { href: string; libelle: string };
    }
  | { type: "checklist"; id: string; consigne?: string; items: ItemChecklist[] }
  | { type: "constructeurRequete" }
  | { type: "bibliothequeRequetes"; consigne?: string; lignes: LigneRequete[] }
  /** Encart réservé à l'animateur — masquable, non compté dans la progression. */
  | { type: "notesAnimateur"; texte: string };

/* ------------------------------------------------------------------ */
/* Structure d'une formation                                           */
/* ------------------------------------------------------------------ */

export interface Module {
  slug: string;
  /** Numéro affiché (0 pour l'introduction). */
  numero: number;
  titre: string;
  sousTitre: string;
  /** Durée en minutes, telle que prévue au déroulé. */
  duree: number;
  /** Repère horaire dans la séance, ex. « 0:15 ». */
  horaire?: string;
  /** Une phrase : ce que le participant sait faire à la fin du module. */
  objectif: string;
  blocs: Bloc[];
}

export interface Objectif {
  numero: string;
  titre: string;
  texte: string;
}

export interface LigneProgramme {
  horaire: string;
  titre: string;
  duree: string;
  /** Slug du module correspondant, s'il existe. */
  moduleSlug?: string;
}

export interface Prerequis {
  titre: string;
  texte: string;
}

export interface Formateur {
  nom: string;
  role: string;
  email: string;
}

export interface Ressource {
  slug: string;
  titre: string;
  description: string;
  /** Nom d'icône libre, interprété par le composant de navigation. */
  icone: string;
}

export interface Formation {
  slug: string;
  titre: string;
  sousTitre: string;
  /** Phrase d'accroche affichée sur le catalogue et en tête de formation. */
  accroche: string;
  etablissement: string;
  public: string;
  duree: string;
  /** Ex. « Année 2026-2027 ». */
  session: string;
  formateur: Formateur;
  objectifs: Objectif[];
  /** « Ce que vous emportez ». */
  emporte: string[];
  prerequis: Prerequis[];
  programme: LigneProgramme[];
  modules: Module[];
  ressources: Ressource[];
}

/* ------------------------------------------------------------------ */
/* Ressources transverses                                              */
/* ------------------------------------------------------------------ */

export interface SectionFiche {
  slug: string;
  numero: number;
  titre: string;
  blocs: Bloc[];
}

export interface QuestionFrequente {
  question: string;
  reponse: string;
}

export interface SectionDeroule {
  slug: string;
  titre: string;
  blocs: Bloc[];
}

/* ------------------------------------------------------------------ */
/* Questionnaires — remplis et collectés sur le site                   */
/* ------------------------------------------------------------------ */

/**
 * Les questionnaires sont décrits en données comme le reste du contenu : les
 * mêmes définitions servent au formulaire rempli par l'enseignant, à
 * l'agrégation des résultats et au corpus de l'assistant.
 *
 * Aucun champ nominatif : les réponses sont anonymes, comme l'étaient les
 * questionnaires de la séance. La seule exception est la
 * restitution par groupe, où les membres s'inscrivent volontairement.
 */
export type Question =
  | {
      id: string;
      type: "choix-unique";
      libelle: string;
      options: string[];
      /** L'ordre des options porte un sens (Jamais → Tous les jours). */
      ordonnee?: boolean;
      obligatoire?: boolean;
    }
  | {
      id: string;
      type: "choix-multiple";
      libelle: string;
      options: string[];
      obligatoire?: boolean;
    }
  | {
      id: string;
      type: "echelle";
      libelle: string;
      min: number;
      max: number;
      libelleMin: string;
      libelleMax: string;
      obligatoire?: boolean;
    }
  | {
      id: string;
      type: "texte-libre";
      libelle: string;
      aide?: string;
      lignes?: number;
      obligatoire?: boolean;
    };

export interface Questionnaire {
  /** "sondage" (à l'arrivée) ou "satisfaction" (à la clôture). */
  slug: string;
  titre: string;
  /** Phrase d'introduction affichée au-dessus du formulaire. */
  intro: string;
  /** Message affiché après l'envoi. */
  remerciement: string;
  /** Moment de la séance où il est proposé, pour le déroulé animateur. */
  moment: string;
  questions: Question[];
}

/** Une réponse envoyée : identifiant de question → valeur. */
export type ReponsesQuestionnaire = Record<string, string | string[] | number>;

/** Un champ de la trame de restitution de l'atelier. */
export interface ChampRestitution {
  id: string;
  libelle: string;
  aide?: string;
  type: "texte" | "texte-long" | "choix";
  options?: string[];
  obligatoire?: boolean;
}
