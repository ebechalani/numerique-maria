"use client";

/**
 * Persistance locale de l’état de lecture.
 *
 * Trois contraintes gouvernent ce fichier :
 *  - le rendu serveur et le premier rendu client doivent être identiques,
 *    donc aucune lecture de localStorage pendant l’hydratation ;
 *  - localStorage peut lever (navigation privée, quota atteint, contexte non
 *    sécurisé, stockage bloqué par l’utilisateur) : tout accès est protégé et
 *    une copie en mémoire prend le relais, la session restant utilisable ;
 *  - le stockage est une source extérieure à React : on s’y abonne avec
 *    useSyncExternalStore plutôt que de recopier sa valeur dans un état, ce
 *    qui éviterait mal les rendus en cascade.
 */

import { useCallback, useSyncExternalStore } from "react";

/** Toutes les clés sont préfixées pour ne pas heurter un autre site du domaine. */
const PREFIXE = "lm-numerique:";

/** Clé unique où vit la progression de toutes les formations. */
const CLE_PROGRESSION = "progression";

/** Signature du définisseur renvoyé — compatible avec celui de useState. */
export type Definisseur<T> = (valeur: T | ((precedente: T) => T)) => void;

/* ------------------------------------------------------------------ */
/* Le stockage vu comme une source extérieure                          */
/* ------------------------------------------------------------------ */

/**
 * Copie en mémoire des valeurs déjà lues ou écrites.
 *
 * Elle remplit deux rôles : donner à useSyncExternalStore un instantané
 * dont l’identité ne change pas tant que rien n’a été écrit (sans quoi React
 * boucle), et servir de repli quand le stockage du navigateur est indisponible.
 */
const memoire = new Map<string, unknown>();

/** Composants à réveiller après une écriture. */
const abonnes = new Set<() => void>();

function sabonner(rappel: () => void): () => void {
  abonnes.add(rappel);
  return () => {
    abonnes.delete(rappel);
  };
}

function prevenirAbonnes(): void {
  for (const rappel of abonnes) rappel();
}

/** Conversion sans transformation, pour les valeurs déjà au bon format. */
function telQuel<T>(valeur: unknown): T {
  return valeur as T;
}

/**
 * Instantané d’une clé : la copie en mémoire si elle existe, sinon la valeur
 * stockée, sinon `defaut`. Le résultat est mémorisé, donc stable d’un rendu à
 * l’autre tant qu’aucune écriture n’a eu lieu.
 */
function lireInstantane<T>(
  cle: string,
  defaut: T,
  convertir: (brut: unknown) => T,
): T {
  if (typeof window === "undefined") return defaut;
  if (memoire.has(cle)) return memoire.get(cle) as T;

  let valeur = defaut;
  try {
    const brut = window.localStorage.getItem(PREFIXE + cle);
    if (brut !== null) valeur = convertir(JSON.parse(brut));
  } catch {
    // Stockage indisponible ou valeur corrompue : on repart de l’état initial.
    valeur = defaut;
  }

  memoire.set(cle, valeur);
  return valeur;
}

/** Écrit la valeur, puis réveille les composants abonnés. */
function ecrireInstantane<T>(cle: string, valeur: T): void {
  memoire.set(cle, valeur);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
    } catch {
      // Écriture impossible : la session reste utilisable, simplement non persistée.
    }
  }
  prevenirAbonnes();
}

/**
 * Lecture sans mémorisation : la copie en mémoire si elle existe, sinon le
 * stockage brut, sinon `undefined`. Ne pose rien dans `memoire`, pour ne pas
 * imposer un défaut à un composant qui lira la même clé avec le sien.
 */
function lireBrut(cle: string): unknown {
  if (typeof window === "undefined") return undefined;
  if (memoire.has(cle)) return memoire.get(cle);
  try {
    const brut = window.localStorage.getItem(PREFIXE + cle);
    return brut === null ? undefined : JSON.parse(brut);
  } catch {
    return undefined;
  }
}

/* ------------------------------------------------------------------ */
/* Hydratation                                                         */
/* ------------------------------------------------------------------ */

/**
 * Faux pendant le rendu serveur et le rendu d’hydratation, vrai ensuite.
 * Les composants s’en servent pour ne pas afficher, avant l’hydratation, un
 * compteur ou une coche qui divergerait du HTML envoyé par le serveur.
 */
const vrai = () => true;
const faux = () => false;

export function useHydrate(): boolean {
  return useSyncExternalStore(sabonner, vrai, faux);
}

/* ------------------------------------------------------------------ */
/* useEtatLocal                                                        */
/* ------------------------------------------------------------------ */

/**
 * État sauvegardé dans localStorage, sûr vis-à-vis de l’hydratation.
 *
 * Le rendu serveur et le rendu d’hydratation renvoient toujours
 * `valeurInitiale` ; la valeur mémorisée apparaît juste après. Toute écriture
 * part directement au stockage, qui reste l’unique source de vérité.
 *
 * @param cle            clé de stockage, sans préfixe (« quiz:… », « checklist:… »…)
 * @param valeurInitiale valeur utilisée avant hydratation et si rien n’est stocké
 */
export function useEtatLocal<T>(
  cle: string,
  valeurInitiale: T,
): [T, Definisseur<T>] {
  const lire = useCallback(
    () => lireInstantane<T>(cle, valeurInitiale, telQuel),
    [cle, valeurInitiale],
  );
  const lireAvantHydratation = useCallback(() => valeurInitiale, [
    valeurInitiale,
  ]);

  const valeur = useSyncExternalStore(sabonner, lire, lireAvantHydratation);

  const definir = useCallback<Definisseur<T>>(
    (suivante) => {
      const calculee =
        typeof suivante === "function"
          ? (suivante as (precedente: T) => T)(
              lireInstantane<T>(cle, valeurInitiale, telQuel),
            )
          : suivante;
      ecrireInstantane(cle, calculee);
    },
    [cle, valeurInitiale],
  );

  return [valeur, definir];
}

/* ------------------------------------------------------------------ */
/* useInstantaneDerive                                                 */
/* ------------------------------------------------------------------ */

/**
 * Valeur dérivée de plusieurs clés à la fois — un bilan, un compteur.
 *
 * Le dérivé doit être une valeur primitive : useSyncExternalStore compare les
 * instantanés par identité, et seule une primitive reste égale à elle-même
 * d’un calcul à l’autre. Avant hydratation, le dérivé est calculé sur des
 * valeurs absentes, comme sur le serveur.
 */
export function useInstantaneDerive<T extends string | number | boolean>(
  cles: string[],
  deriver: (valeurs: unknown[]) => T,
): T {
  const lire = useCallback(
    () => deriver(cles.map((cle) => lireBrut(cle))),
    [cles, deriver],
  );
  const lireAvantHydratation = useCallback(
    () => deriver(cles.map(() => undefined)),
    [cles, deriver],
  );
  return useSyncExternalStore(sabonner, lire, lireAvantHydratation);
}

/* ------------------------------------------------------------------ */
/* useProgression                                                      */
/* ------------------------------------------------------------------ */

/** Slug de formation → slugs des modules marqués comme terminés. */
type EtatProgression = Record<string, string[]>;

/** Aucune progression — référence unique, exigée par useSyncExternalStore. */
const AUCUNE_PROGRESSION: EtatProgression = {};

/** Filtre défensif : le stockage peut contenir n’importe quoi. */
function assainir(valeur: unknown): EtatProgression {
  if (typeof valeur !== "object" || valeur === null || Array.isArray(valeur)) {
    return AUCUNE_PROGRESSION;
  }
  const propre: EtatProgression = {};
  for (const [formationSlug, modules] of Object.entries(
    valeur as Record<string, unknown>,
  )) {
    if (!Array.isArray(modules)) continue;
    propre[formationSlug] = modules.filter(
      (item): item is string => typeof item === "string",
    );
  }
  return propre;
}

function lireProgression(): EtatProgression {
  return lireInstantane(CLE_PROGRESSION, AUCUNE_PROGRESSION, assainir);
}

function lireProgressionAvantHydratation(): EtatProgression {
  return AUCUNE_PROGRESSION;
}

export interface Progression {
  /** Le module est-il marqué comme terminé ? */
  estTermine: (formationSlug: string, moduleSlug: string) => boolean;
  /** Marque ou démarque un module. */
  basculer: (formationSlug: string, moduleSlug: string) => void;
  /** Nombre de modules terminés parmi ceux passés en argument. */
  nombreTermines: (formationSlug: string, slugs: string[]) => number;
  /** Efface la progression d’une formation, ou de toutes si l’argument est omis. */
  reinitialiser: (formationSlug?: string) => void;
  /** Faux au premier rendu, vrai une fois le stockage lu. */
  pret: boolean;
}

/**
 * Progression de lecture, partagée par toutes les formations.
 *
 * Les composants attendent `pret` avant d’afficher un compteur ou une coche :
 * avant l’hydratation, l’état est vide et afficherait un résultat divergent.
 */
export function useProgression(): Progression {
  const progression = useSyncExternalStore(
    sabonner,
    lireProgression,
    lireProgressionAvantHydratation,
  );
  const pret = useHydrate();

  const estTermine = useCallback(
    (formationSlug: string, moduleSlug: string): boolean =>
      (progression[formationSlug] ?? []).includes(moduleSlug),
    [progression],
  );

  const basculer = useCallback((formationSlug: string, moduleSlug: string) => {
    const precedente = lireProgression();
    const termines = precedente[formationSlug] ?? [];
    const suivants = termines.includes(moduleSlug)
      ? termines.filter((slug) => slug !== moduleSlug)
      : [...termines, moduleSlug];
    ecrireInstantane(CLE_PROGRESSION, {
      ...precedente,
      [formationSlug]: suivants,
    });
  }, []);

  const nombreTermines = useCallback(
    (formationSlug: string, slugs: string[]): number => {
      const termines = progression[formationSlug] ?? [];
      // On ne compte que les modules existants : un module retiré du contenu
      // ne doit pas gonfler le total.
      return slugs.filter((slug) => termines.includes(slug)).length;
    },
    [progression],
  );

  const reinitialiser = useCallback((formationSlug?: string) => {
    if (formationSlug === undefined) {
      ecrireInstantane(CLE_PROGRESSION, {});
      return;
    }
    const suivante = { ...lireProgression() };
    delete suivante[formationSlug];
    ecrireInstantane(CLE_PROGRESSION, suivante);
  }, []);

  return { estTermine, basculer, nombreTermines, reinitialiser, pret };
}
