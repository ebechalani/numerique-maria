/**
 * Contrat de contenu des tutoriels d’outils.
 *
 * Un tutoriel décrit la prise en main d’un outil utilisé en formation. Il est
 * écrit en données, comme le reste du contenu du site : la page, le catalogue
 * et le corpus de l’assistant partent de la même source, et le corps du
 * tutoriel réutilise les blocs déjà rendus par `BlocRenderer`.
 *
 * Un tutoriel se lit seul, sans avoir suivi la formation.
 */

import type { Bloc } from "@/content/types";

/**
 * Un lien de fin de page : documentation officielle, page de connexion, ou
 * page du site. Une adresse commençant par « / » est traitée comme interne et
 * s’ouvre dans le même onglet.
 */
export interface LienTutoriel {
  libelle: string;
  href: string;
  /** Ce qu’on y trouve, en une phrase. */
  description?: string;
}

/** Ce qu’il faut avoir sous la main avant de commencer. */
export interface PrerequisTutoriel {
  titre: string;
  texte: string;
}

/** Renvoi vers le module de formation où l’outil est présenté. */
export interface RenvoiModule {
  formation: string;
  module: string;
  libelle: string;
}

export interface Tutoriel {
  slug: string;
  /** Le nom de l’outil, tel qu’il s’écrit : « NotebookLM ». */
  outil: string;
  /** Qui l’édite : « Google ». */
  editeur: string;
  /** Sous-titre de la page, une ligne. */
  sousTitre: string;
  /** Phrase d’accroche du catalogue et de l’en-tête. */
  accroche: string;
  /** Adresse d’accès à l’outil. */
  adresse: string;
  /** « Gratuit, avec un compte Google ». */
  cout: string;
  /** Temps à prévoir pour venir à bout du tutoriel. */
  duree: string;
  /**
   * Version de l’interface décrite. Les outils en ligne changent vite : cette
   * mention est affichée en tête de page, avec le lien vers l’aide officielle,
   * pour qu’un écran qui ne correspond plus ne laisse personne bloqué.
   */
  interfaceDecrite: string;
  /** Module de la formation où l’outil est présenté, s’il en existe un. */
  renvoiModule?: RenvoiModule;
  prerequis: PrerequisTutoriel[];
  blocs: Bloc[];
  liens: LienTutoriel[];
}
