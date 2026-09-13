/**
 * Registre des formations et accès au contenu.
 *
 * Point d’entrée unique des pages : elles ne touchent jamais aux fichiers de
 * contenu directement. Les ressources transverses (fiche méthode, questions,
 * requêtes, déroulé) sont converties ici en une liste de blocs prête à rendre,
 * pour que le composant de rendu n’ait qu’un seul format à connaître.
 *
 * Module serveur : aucune directive « use client », aucun accès au navigateur.
 */

import type {
  Bloc,
  Formation,
  Module,
  QuestionFrequente,
  Ressource,
  SectionDeroule,
  SectionFiche,
} from "@/content/types";

import { iaGenerativeEnClasse } from "@/content/formations/ia-generative-en-classe";
import { ficheActif } from "@/content/formations/ia-generative-en-classe/ressources/fiche-actif";
import { questionsFrequentes } from "@/content/formations/ia-generative-en-classe/ressources/questions";
import {
  bibliothequeRequetes,
  briquesRequete,
} from "@/content/formations/ia-generative-en-classe/ressources/requetes";
import { deroule } from "@/content/formations/ia-generative-en-classe/ressources/deroule";

/* Réexports : certaines pages ont besoin des données brutes, pas des blocs. */
export { briquesRequete, questionsFrequentes };

/* ------------------------------------------------------------------ */
/* Registre                                                            */
/* ------------------------------------------------------------------ */

/** Toutes les formations publiées, dans l’ordre d’affichage du catalogue. */
export const formations: Formation[] = [iaGenerativeEnClasse];

export function getFormation(slug: string): Formation | undefined {
  return formations.find((formation) => formation.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Modules                                                             */
/* ------------------------------------------------------------------ */

export interface ModuleSitue {
  formation: Formation;
  module: Module;
  /** Module précédent dans le déroulé, ou null en tête de formation. */
  precedent: Module | null;
  /** Module suivant, ou null en fin de formation. */
  suivant: Module | null;
}

/**
 * Récupère un module avec ses voisins immédiats, pour la navigation de bas de
 * page. Renvoie `undefined` si la formation ou le module n’existe pas — la page
 * appelante doit alors déclencher un notFound().
 */
export function getModule(
  formationSlug: string,
  moduleSlug: string,
): ModuleSitue | undefined {
  const formation = getFormation(formationSlug);
  if (!formation) return undefined;

  const index = formation.modules.findIndex(
    (module) => module.slug === moduleSlug,
  );
  if (index === -1) return undefined;

  return {
    formation,
    module: formation.modules[index],
    precedent: index > 0 ? formation.modules[index - 1] : null,
    suivant:
      index < formation.modules.length - 1
        ? formation.modules[index + 1]
        : null,
  };
}

/* ------------------------------------------------------------------ */
/* Ressources                                                          */
/* ------------------------------------------------------------------ */

export interface RessourceRendue {
  formation: Formation;
  ressource: Ressource;
  /** Contenu aplati, prêt à être passé au rendu de blocs. */
  blocs: Bloc[];
}

/**
 * Titre d’une section de la fiche méthode : « 1. Un prompt, c’est une consigne ».
 * Le numéro n’est ajouté que s’il ne figure pas déjà dans le titre.
 */
function titreSectionFiche(section: SectionFiche): string {
  const prefixe = `${section.numero}.`;
  return section.titre.startsWith(prefixe)
    ? section.titre
    : `${prefixe} ${section.titre}`;
}

/** Aplatit des sections en une seule liste : un titre, puis ses blocs. */
function aplatirSections(
  sections: Array<{ titre: string; blocs: Bloc[] }>,
  titreDe?: (index: number) => string,
): Bloc[] {
  return sections.flatMap((section, index): Bloc[] => [
    { type: "titre", texte: titreDe ? titreDe(index) : section.titre },
    ...section.blocs,
  ]);
}

function blocsFicheActif(sections: SectionFiche[]): Bloc[] {
  return aplatirSections(sections, (index) =>
    titreSectionFiche(sections[index]),
  );
}

function blocsDeroule(sections: SectionDeroule[]): Bloc[] {
  return aplatirSections(sections);
}

function blocsRequetes(): Bloc[] {
  return [
    { type: "constructeurRequete" },
    {
      type: "bibliothequeRequetes",
      consigne:
        "Remplacer les crochets. Ne jamais coller de données personnelles : utiliser « élève A », « élève B ».",
      lignes: bibliothequeRequetes,
    },
  ];
}

function blocsQuestions(questions: QuestionFrequente[]): Bloc[] {
  return questions.flatMap((question): Bloc[] => [
    { type: "titre", texte: question.question },
    { type: "paragraphe", texte: question.reponse },
  ]);
}

/** Construit les blocs d’une ressource à partir de son slug. */
function construireBlocs(ressourceSlug: string): Bloc[] | undefined {
  switch (ressourceSlug) {
    case "fiche-actif":
      return blocsFicheActif(ficheActif);
    case "requetes":
      return blocsRequetes();
    case "questions":
      return blocsQuestions(questionsFrequentes);
    case "animateur":
      return blocsDeroule(deroule);
    default:
      return undefined;
  }
}

/**
 * Récupère une ressource et son contenu déjà aplati.
 * Renvoie `undefined` si la formation, la ressource déclarée ou son contenu
 * sont introuvables.
 */
export function getRessource(
  formationSlug: string,
  ressourceSlug: string,
): RessourceRendue | undefined {
  const formation = getFormation(formationSlug);
  if (!formation) return undefined;

  const ressource = formation.ressources.find(
    (candidate) => candidate.slug === ressourceSlug,
  );
  if (!ressource) return undefined;

  const blocs = construireBlocs(ressourceSlug);
  if (!blocs) return undefined;

  return { formation, ressource, blocs };
}
