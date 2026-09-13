"use client";

/**
 * Tableau de bord de l’animateur — l’écran projeté pendant la séance.
 *
 * La salle répond sur le site, les résultats s’affichent ici, et
 * l’animateur commente en direct. Quatre onglets suivent le déroulé — la
 * séance, le sondage d’entrée (projeté en début de séance), la satisfaction
 * (à la clôture), les restitutions des groupes.
 *
 * Cinq partis pris.
 *
 *  1. Le serveur fait foi. Le composant ne calcule aucun agrégat : il lit
 *     /api/animateur/resultats et affiche. Un compteur qui s’incrémenterait
 *     localement finirait par mentir dès qu’une réponse arriverait d’ailleurs.
 *
 *  2. L’écran ne se vide jamais. Une lecture qui échoue laisse les dernières
 *     données à l’écran et signale « connexion perdue » en petit : en salle,
 *     perdre l’affichage projeté est bien pire que l’afficher avec dix secondes
 *     de retard.
 *
 *  3. On n’interroge le serveur que si quelqu’un regarde. L’intervalle est
 *     arrêté dès que l’onglet passe en arrière-plan, relancé — avec une lecture
 *     immédiate — dès qu’il revient au premier plan.
 *
 *  4. Le mode projection n’est pas un simple zoom : il agrandit les
 *     graphiques (contrat `projection` des composants de visualisation), retire
 *     les onglets, et confie la navigation aux flèches du clavier, la
 *     télécommande de vidéoprojecteur en envoyant justement.
 *
 *  5. Aucune couleur de verdict (vert, ambre, rouge) n’apparaît ici. Une séance
 *     ouverte, une connexion perdue, un envoi réussi : tout s’exprime en accent
 *     ou en gris. Vert, ambre et rouge restent réservés aux verdicts
 *     autorisé / encadré / interdit.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent as EvenementClavier, ReactNode } from "react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import DiagnosticBase from "@/components/DiagnosticBase";
import BoutonCopier from "@/components/ui/BoutonCopier";
import BarresRepartition from "@/components/viz/BarresRepartition";
import TuileStat from "@/components/viz/TuileStat";
import {
  champsRestitution,
  enqueteSatisfaction,
  sondageEntree,
} from "@/content/formations/ia-generative-maternelle/ressources/questionnaires";
import type { Question } from "@/content/types";
import type { Agregat, Restitution, SessionFormation } from "@/lib/db";

/* ------------------------------------------------------------------ */
/* Routes de l’API animateur                                           */
/* ------------------------------------------------------------------ */

/*
  Réunies ici : si un chemin change, c’est le seul endroit à corriger.
    GET  /api/animateur/resultats?formation=…[&session=…]
    POST /api/animateur/session      { action: "creer" | "ouvrir" | "fermer", … }
    POST /api/animateur/deconnexion
*/
const ROUTE_RESULTATS = "/api/animateur/resultats";
const ROUTE_SESSION = "/api/animateur/session";
const ROUTE_DECONNEXION = "/api/animateur/deconnexion";

/** Période d’actualisation, en millisecondes. */
const PERIODE_ACTUALISATION = 10_000;

/* ------------------------------------------------------------------ */
/* Contrat d’entrée                                                    */
/* ------------------------------------------------------------------ */

export interface LienFormulaire {
  cle: "sondage" | "restitution" | "satisfaction";
  /** Intitulé affiché sous le QR code. */
  titre: string;
  /** Moment de la séance, en trois mots : « À l’arrivée ». */
  moment: string;
  /** Chemin relatif, pour la navigation interne. */
  chemin: string;
  /** Adresse complète, celle qu’encode le QR code et qu’on recopie à la main. */
  url: string;
  /** QR code déjà tracé côté serveur, ou `null` si le tracé a échoué. */
  qr: string | null;
}

interface Proprietes {
  /** Slug de la formation, ex. « ia-generative-maternelle ». */
  formation: string;
  titreFormation: string;
  /** Session au sens du catalogue : « Année 2026-2027 ». */
  sessionFormation: string;
  liens: LienFormulaire[];
  /** false quand DATABASE_URL est absente : le tableau reste vide et le dit. */
  collecteConfiguree: boolean;
}

/* ------------------------------------------------------------------ */
/* Charge utile renvoyée par /api/animateur/resultats                  */
/* ------------------------------------------------------------------ */

interface Comptes {
  sondage: number;
  satisfaction: number;
  restitutions: number;
}

interface ChargeAnimateur {
  configuree: boolean;
  /** Explication de l’absence de collecte, quand `configuree` vaut false. */
  message: string | null;
  session: SessionFormation | null;
  sondage: Agregat[];
  satisfaction: Agregat[];
  restitutions: Restitution[];
  compte: Comptes;
  seances: SessionFormation[];
}

/* ------------------------------------------------------------------ */
/* Lecture défensive du JSON                                           */
/* ------------------------------------------------------------------ */

/*
  La réponse traverse un réseau de salle de classe, parfois un portail captif
  qui renvoie sa propre page. On ne fait donc confiance à aucun champ : ce qui
  n’a pas la forme attendue est remplacé par une valeur neutre, jamais par une
  exception qui viderait l’écran projeté.
*/

function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === "object" && valeur !== null && !Array.isArray(valeur);
}

function texte(valeur: unknown): string {
  return typeof valeur === "string" ? valeur : "";
}

function texteOuNull(valeur: unknown): string | null {
  return typeof valeur === "string" && valeur.trim().length > 0 ? valeur : null;
}

function nombre(valeur: unknown): number {
  return typeof valeur === "number" && Number.isFinite(valeur) ? valeur : 0;
}

function versSession(brut: unknown): SessionFormation | null {
  if (!estObjet(brut) || typeof brut.id !== "number") return null;
  return {
    id: brut.id,
    formation: texte(brut.formation),
    libelle: texte(brut.libelle),
    ouverte: brut.ouverte === true,
    creeeLe: texte(brut.creeeLe),
  };
}

function versSeances(brut: unknown): SessionFormation[] {
  if (!Array.isArray(brut)) return [];
  return brut
    .map(versSession)
    .filter((seance): seance is SessionFormation => seance !== null);
}

function versAgregat(brut: unknown): Agregat | null {
  if (!estObjet(brut) || typeof brut.questionId !== "string") return null;

  const repartition = Array.isArray(brut.repartition)
    ? brut.repartition.flatMap((ligne) =>
        estObjet(ligne) && typeof ligne.option === "string"
          ? [
              {
                option: ligne.option,
                nombre: nombre(ligne.nombre),
                part: nombre(ligne.part),
              },
            ]
          : [],
      )
    : [];

  return {
    questionId: brut.questionId,
    libelle: texte(brut.libelle),
    type: texte(brut.type),
    total: nombre(brut.total),
    repartition,
    moyenne: typeof brut.moyenne === "number" ? brut.moyenne : undefined,
    verbatims: Array.isArray(brut.verbatims)
      ? brut.verbatims.filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        )
      : undefined,
  };
}

function versAgregats(brut: unknown): Agregat[] {
  if (!Array.isArray(brut)) return [];
  return brut
    .map(versAgregat)
    .filter((agregat): agregat is Agregat => agregat !== null);
}

function versRestitutions(brut: unknown): Restitution[] {
  if (!Array.isArray(brut)) return [];
  return brut.flatMap((ligne) => {
    if (!estObjet(ligne) || typeof ligne.id !== "number") return [];
    return [
      {
        id: ligne.id,
        section: texte(ligne.section),
        besoin: texteOuNull(ligne.besoin),
        membres: texteOuNull(ligne.membres),
        outil: texte(ligne.outil),
        ressource: texte(ligne.ressource),
        requete: texteOuNull(ligne.requete),
        corrections: texteOuNull(ligne.corrections),
        vigilance: texteOuNull(ligne.vigilance),
        envoyeLe: texte(ligne.envoyeLe),
      },
    ];
  });
}

function versCharge(brut: unknown): ChargeAnimateur | null {
  if (!estObjet(brut)) return null;

  const compte = estObjet(brut.compte) ? brut.compte : {};

  return {
    // Le champ n’est faux que si le serveur le dit explicitement.
    configuree: brut.configuree !== false,
    message: texteOuNull(brut.message),
    session: versSession(brut.session),
    sondage: versAgregats(brut.sondage),
    satisfaction: versAgregats(brut.satisfaction),
    restitutions: versRestitutions(brut.restitutions),
    compte: {
      sondage: nombre(compte.sondage),
      satisfaction: nombre(compte.satisfaction),
      restitutions: nombre(compte.restitutions),
    },
    seances: versSeances(brut.sessions),
  };
}

/* ------------------------------------------------------------------ */
/* Questions du contenu                                                */
/* ------------------------------------------------------------------ */

/*
  Les agrégats portent l’identifiant, le libellé et le type d’une question,
  mais pas ses métadonnées de tracé : l’ordre des options porte-t-il un sens,
  quelles sont les bornes d’une échelle. On les relit dans le contenu, qui fait
  foi — c’est la même source que celle du formulaire et de l’agrégation.
*/

function indexerQuestions(questions: Question[]): Map<string, Question> {
  return new Map(questions.map((question) => [question.id, question]));
}

const QUESTIONS_SONDAGE = indexerQuestions(sondageEntree.questions);
const QUESTIONS_SATISFACTION = indexerQuestions(enqueteSatisfaction.questions);

/**
 * Rampe à employer : ordonnée quand l’ordre des options porte un sens (une
 * échelle, ou un choix unique déclaré `ordonnee` : Jamais → Tous les jours),
 * nominale sinon. Colorer des options sans ordre par leur valeur suggérerait
 * une progression qui n’existe pas.
 */
function echelleDe(agregat: Agregat, question: Question | undefined): "ordonnee" | "nominale" {
  if (agregat.type === "echelle") return "ordonnee";
  if (question && question.type === "choix-unique" && question.ordonnee) {
    return "ordonnee";
  }
  return "nominale";
}

/**
 * Adapte une répartition au contrat du graphique.
 *
 * Deux ajustements. La couche données exprime `part` en pourcentage de 0 à 100,
 * le graphique attend une fraction de 0 à 1 : on la recalcule depuis les
 * effectifs, exacts par construction. Et les bornes d’une échelle reçoivent
 * leur libellé — « 1 · Pas du tout » se lit de loin, « 1 » ne dit rien.
 */
function donneesDeBarres(agregat: Agregat, question: Question | undefined) {
  const echelle = question && question.type === "echelle" ? question : null;

  return agregat.repartition.map((ligne) => {
    let option = ligne.option;
    if (echelle) {
      if (ligne.option === String(echelle.min)) {
        option = `${ligne.option} · ${echelle.libelleMin}`;
      } else if (ligne.option === String(echelle.max)) {
        option = `${ligne.option} · ${echelle.libelleMax}`;
      }
    }

    return {
      option,
      nombre: ligne.nombre,
      part: agregat.total > 0 ? ligne.nombre / agregat.total : 0,
    };
  });
}

/** Phrase de contexte sous le titre d’un graphique, quand elle est utile. */
function sousTitreDe(agregat: Agregat): string | undefined {
  if (agregat.type === "choix-multiple") {
    return "Plusieurs réponses possibles : les parts se cumulent au-delà de 100 %.";
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Mise en forme                                                       */
/* ------------------------------------------------------------------ */

/** « 4,2 » — une décimale, séparateur français. */
function formaterMoyenne(valeur: number): string {
  return valeur.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** « 3 septembre 2026, 09:14 », au fuseau de l’établissement. */
function formaterDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Asia/Beirut",
    }).format(date);
  } catch {
    return date.toLocaleString("fr-FR");
  }
}

function formaterReponses(total: number): string {
  if (total <= 0) return "aucune réponse";
  return `${total} réponse${total > 1 ? "s" : ""}`;
}

function formaterDelai(secondes: number): string {
  if (secondes < 5) return "actualisé à l’instant";
  if (secondes < 60) return `actualisé il y a ${secondes} s`;
  const minutes = Math.round(secondes / 60);
  if (minutes < 60) return `actualisé il y a ${minutes} min`;
  return "actualisé il y a plus d’une heure";
}

/** Adresse sans son protocole : c’est ce qu’on recopie à la main. */
function urlLisible(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

/* ------------------------------------------------------------------ */
/* Icônes                                                              */
/* ------------------------------------------------------------------ */

const TRAIT_COMMUN = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function IconeProjection({ actif }: { actif: boolean }) {
  return (
    <svg {...TRAIT_COMMUN} className="h-4 w-4 shrink-0">
      {actif ? (
        <>
          <path d="M9 4.5H5.5a1 1 0 0 0-1 1V9" />
          <path d="M15 4.5h3.5a1 1 0 0 1 1 1V9" />
          <path d="M9 19.5H5.5a1 1 0 0 1-1-1V15" />
          <path d="M15 19.5h3.5a1 1 0 0 0 1-1V15" />
        </>
      ) : (
        <>
          <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
          <path d="M12 16.5V20" />
          <path d="M8.5 20h7" />
        </>
      )}
    </svg>
  );
}

function IconeActualiser() {
  return (
    <svg {...TRAIT_COMMUN} className="h-4 w-4 shrink-0">
      <path d="M20 11.5a8 8 0 1 1-2.6-5.4" />
      <path d="M20 4v4.5h-4.5" />
    </svg>
  );
}

function IconeQr() {
  return (
    <svg {...TRAIT_COMMUN} className="h-4 w-4 shrink-0">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v6h-3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Indicateur d’actualisation                                          */
/* ------------------------------------------------------------------ */

/**
 * « actualisé il y a 7 s ».
 *
 * Isolé dans son propre composant : il se redessine chaque seconde, et rien
 * d’autre ne doit se redessiner avec lui — surtout pas les graphiques projetés.
 */
function DepuisQuand({ instant }: { instant: number | null }) {
  /*
    L’état part de zéro, jamais de `Date.now()` : une horloge lue pendant le
    rendu donnerait au serveur et au navigateur deux valeurs différentes. Elle
    n’est lue que dans l’effet, donc côté navigateur uniquement.
  */
  const [maintenant, setMaintenant] = useState(0);

  /*
    L’horloge repart à chaque nouvelle lecture. Rien n’est écrit dans l’état au
    montage : le premier tour arrive dans la seconde, et d’ici là l’écart
    calculé est négatif, donc ramené à zéro par le `Math.max` ci-dessous — soit
    « actualisé à l’instant », qui est exactement le cas.
  */
  useEffect(() => {
    if (instant === null) return;
    const minuterie = setInterval(() => setMaintenant(Date.now()), 1000);
    return () => clearInterval(minuterie);
  }, [instant]);

  if (instant === null) return null;

  const secondes = Math.max(0, Math.round((maintenant - instant) / 1000));
  return <span className="tabular-nums">{formaterDelai(secondes)}</span>;
}

/* ------------------------------------------------------------------ */
/* Briques d’affichage                                                 */
/* ------------------------------------------------------------------ */

function Encadre({
  titre,
  children,
}: {
  titre: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[--radius-carte] border border-trait bg-voile p-5 sm:p-6">
      <h3 className="font-serif text-lg leading-snug text-encre">{titre}</h3>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-graphite">
        {children}
      </div>
    </div>
  );
}

function EtatVide({ texte: message }: { texte: string }) {
  return (
    <p className="rounded-[--radius-carte] border border-dashed border-trait-fort bg-craie px-5 py-8 text-center leading-relaxed text-graphite">
      {message}
    </p>
  );
}

/** Réponses libres, telles qu’elles ont été écrites — jamais reformulées. */
function Verbatims({
  agregat,
  projection,
}: {
  agregat: Agregat;
  projection: boolean;
}) {
  const verbatims = agregat.verbatims ?? [];

  return (
    <section
      className={[
        "rounded-[--radius-carte] border border-trait bg-craie",
        projection ? "p-8" : "p-5",
      ].join(" ")}
    >
      <h3
        className={[
          "font-serif font-semibold leading-snug text-encre",
          projection ? "text-[2rem]" : "text-lg",
        ].join(" ")}
      >
        {agregat.libelle}
      </h3>

      <p
        className={[
          "mt-1.5 text-estompe",
          projection ? "text-base" : "text-xs",
        ].join(" ")}
      >
        {verbatims.length > 0
          ? formaterReponses(verbatims.length)
          : "Aucune réponse pour l’instant"}
      </p>

      {verbatims.length > 0 ? (
        <ul className={projection ? "mt-6 space-y-4" : "mt-4 space-y-3"}>
          {verbatims.map((verbatim, rang) => (
            <li
              key={`${rang}-${verbatim.slice(0, 24)}`}
              /* `break-words` : une réponse libre peut contenir un lien collé,
                 sans espace — sur un écran de 375 px, il déborderait sinon. */
              className={[
                "border-l-2 border-trait-fort leading-relaxed break-words text-encre",
                projection ? "pl-5 text-xl" : "pl-4 text-[0.9375rem]",
              ].join(" ")}
            >
              {verbatim}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** Un agrégat : barres s’il porte des options, verbatims s’il est ouvert. */
function VueAgregat({
  agregat,
  question,
  projection,
}: {
  agregat: Agregat;
  question: Question | undefined;
  projection: boolean;
}) {
  if (agregat.type === "texte-libre") {
    return <Verbatims agregat={agregat} projection={projection} />;
  }

  return (
    <BarresRepartition
      titre={agregat.libelle}
      sousTitre={sousTitreDe(agregat)}
      total={agregat.total}
      donnees={donneesDeBarres(agregat, question)}
      echelle={echelleDe(agregat, question)}
      projection={projection}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Bandeau des QR codes                                                */
/* ------------------------------------------------------------------ */

function CarteQr({
  lien,
  projection,
}: {
  lien: LienFormulaire;
  projection: boolean;
}) {
  return (
    <li className="flex min-w-0 flex-col items-center rounded-[--radius-carte] border border-trait bg-craie p-4">
      <p
        className={[
          "text-center font-serif leading-snug text-encre",
          projection ? "text-2xl" : "text-base",
        ].join(" ")}
      >
        {lien.titre}
      </p>
      <p
        className={[
          "mt-0.5 text-center text-estompe",
          projection ? "text-base" : "text-xs",
        ].join(" ")}
      >
        {lien.moment}
      </p>

      {lien.qr ? (
        <div
          aria-hidden="true"
          className={[
            "mt-3 w-full rounded-md border border-trait bg-white p-2",
            "[&>svg]:block [&>svg]:h-auto [&>svg]:w-full",
            projection ? "max-w-[15rem]" : "max-w-[9.5rem]",
          ].join(" ")}
          dangerouslySetInnerHTML={{ __html: lien.qr }}
        />
      ) : (
        <p className="mt-3 text-center text-xs leading-snug text-graphite">
          QR code indisponible — recopiez l’adresse ci-dessous.
        </p>
      )}

      <a
        href={lien.url}
        className={[
          "mt-3 block w-full break-all text-center font-mono leading-snug",
          "text-accent underline decoration-trait-fort underline-offset-2",
          "transition-colors hover:text-accent-fort",
          projection ? "text-lg" : "text-xs",
        ].join(" ")}
      >
        {urlLisible(lien.url)}
      </a>

      {projection ? null : (
        <div className="mt-3">
          <BoutonCopier texte={lien.url} libelle="Copier le lien" />
        </div>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Onglets                                                             */
/* ------------------------------------------------------------------ */

const ONGLETS = [
  { id: "seance", libelle: "Séance" },
  { id: "sondage", libelle: "Sondage d’entrée" },
  { id: "satisfaction", libelle: "Satisfaction" },
  { id: "restitutions", libelle: "Restitutions" },
] as const;

type Onglet = (typeof ONGLETS)[number]["id"];

/* ------------------------------------------------------------------ */
/* Restitutions : texte d’archivage                                    */
/* ------------------------------------------------------------------ */

/** Champs de la trame, hors section qui sert déjà de titre de groupe. */
const CHAMPS_AFFICHES = champsRestitution.filter(
  (champ) => champ.id !== "section",
);

/**
 * Lit un champ de restitution par son identifiant de trame.
 *
 * Les clés de `Restitution` sont exactement les identifiants des champs de
 * `champsRestitution` : passer par le contenu garde les libellés et l’ordre
 * d’affichage en un seul endroit, celui du formulaire.
 */
function valeurChamp(restitution: Restitution, id: string): string {
  const brut = (restitution as unknown as Record<string, unknown>)[id];
  return typeof brut === "string" ? brut.trim() : "";
}

/** Le mur des contributions en texte brut, prêt à coller dans un compte rendu. */
function texteDesRestitutions(
  titreFormation: string,
  seance: SessionFormation | null,
  restitutions: Restitution[],
): string {
  const lignes: string[] = [`Restitutions — ${titreFormation}`];

  if (seance) {
    const date = formaterDate(seance.creeeLe);
    lignes.push(`Séance : ${seance.libelle}${date ? ` (${date})` : ""}`);
  }
  lignes.push(
    `${restitutions.length} contribution${restitutions.length > 1 ? "s" : ""}`,
  );

  let sectionPrecedente: string | null = null;

  for (const restitution of restitutions) {
    const section = restitution.section.trim() || "Section non précisée";
    if (section !== sectionPrecedente) {
      lignes.push("", `── ${section.toUpperCase()} ──`);
      sectionPrecedente = section;
    }

    lignes.push("");
    for (const champ of CHAMPS_AFFICHES) {
      const valeur = valeurChamp(restitution, champ.id);
      if (!valeur) continue;
      lignes.push(
        valeur.includes("\n")
          ? `${champ.libelle} :\n${valeur}`
          : `${champ.libelle} : ${valeur}`,
      );
    }

    const depot = formaterDate(restitution.envoyeLe);
    if (depot) lignes.push(`Déposée le : ${depot}`);
  }

  return lignes.join("\n");
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

/** État de la dernière lecture du serveur. */
type EtatReseau = "attente" | "ok" | "perdu" | "expire";

export default function TableauDeBordAnimateur({
  formation,
  titreFormation,
  sessionFormation,
  liens,
  collecteConfiguree,
}: Proprietes) {
  const router = useRouter();
  const base = useId();
  const idOnglet = (onglet: Onglet) => `${base}-onglet-${onglet}`;
  const idPanneau = (onglet: Onglet) => `${base}-panneau-${onglet}`;
  const idLibelleSeance = `${base}-libelle-seance`;

  const [onglet, setOnglet] = useState<Onglet>("seance");
  const [projection, setProjection] = useState(false);
  const [qrVisibles, setQrVisibles] = useState(true);

  const [donnees, setDonnees] = useState<ChargeAnimateur | null>(null);
  const [reseau, setReseau] = useState<EtatReseau>("attente");
  const [instantLecture, setInstantLecture] = useState<number | null>(null);

  /** Séance consultée. `null` : la séance ouverte, cas courant en salle. */
  const [seanceChoisie, setSeanceChoisie] = useState<number | null>(null);

  /**
   * Effectifs des séances déjà consultées.
   *
   * La route ne renvoie les compteurs que de la séance chargée : interroger le
   * serveur pour chacune des séances passées, toutes les dix secondes, coûterait
   * bien plus que ce que l’information vaut. On retient donc ce qu’on a vu.
   */
  const [effectifs, setEffectifs] = useState<Record<number, Comptes>>({});

  const [libelleNouvelle, setLibelleNouvelle] = useState("");
  const [actionEnCours, setActionEnCours] = useState(false);
  const [messageAction, setMessageAction] = useState<string | null>(null);

  /** Une lecture est en vol : le tour d’horloge suivant la laisse finir. */
  const lectureEnVol = useRef(false);
  /** Jeton de la dernière lecture lancée : une réponse en retard est ignorée. */
  const jetonLecture = useRef(0);
  /**
   * L’accès est-il périmé ? Un drapeau plutôt qu’un état : il coupe la boucle
   * d’interrogation sans en changer les dépendances, donc sans la relancer. Une
   * fois le cookie expiré, insister toutes les dix secondes ne rapporte que des
   * 401 jusqu’à la fin de la journée.
   */
  const accesPerime = useRef(false);

  const refsOnglets = useRef<Array<HTMLButtonElement | null>>([]);

  /* ---------------------------------------------------------------- */
  /* Lecture des résultats                                             */
  /* ---------------------------------------------------------------- */

  const rafraichir = useCallback(
    async (forcer = false) => {
      if (!collecteConfiguree) return;

      // Une demande explicite retente toujours : l’animateur a pu se
      // reconnecter dans un autre onglet. La boucle, elle, reste muette.
      if (forcer) accesPerime.current = false;
      else if (accesPerime.current || lectureEnVol.current) return;

      lectureEnVol.current = true;
      jetonLecture.current += 1;
      const jeton = jetonLecture.current;

      try {
        const parametres = new URLSearchParams({ formation });
        if (seanceChoisie !== null) {
          parametres.set("session", String(seanceChoisie));
        }

        const reponse = await fetch(`${ROUTE_RESULTATS}?${parametres}`, {
          cache: "no-store",
        });

        // Une réponse dépassée par une lecture plus récente n’a rien à écrire.
        if (jeton !== jetonLecture.current) return;

        if (reponse.status === 401) {
          accesPerime.current = true;
          setReseau("expire");
          return;
        }
        if (!reponse.ok) {
          setReseau("perdu");
          return;
        }

        const charge = versCharge(await reponse.json());
        if (jeton !== jetonLecture.current) return;
        if (!charge) {
          setReseau("perdu");
          return;
        }

        setDonnees(charge);
        setReseau("ok");
        setInstantLecture(Date.now());

        const seance = charge.session;
        if (seance) {
          setEffectifs((precedents) => ({
            ...precedents,
            [seance.id]: charge.compte,
          }));
        }
      } catch {
        // Réseau coupé, portail captif, serveur redémarré : on garde l’écran.
        if (jeton === jetonLecture.current) setReseau("perdu");
      } finally {
        if (jeton === jetonLecture.current) lectureEnVol.current = false;
      }
    },
    [collecteConfiguree, formation, seanceChoisie],
  );

  /*
    Actualisation périodique, suspendue quand personne ne regarde : l’intervalle
    est arrêté dès que l’onglet passe en arrière-plan, et une lecture immédiate
    remet l’écran à jour dès qu’il revient au premier plan.
  */
  useEffect(() => {
    if (!collecteConfiguree) return;

    let minuterie: ReturnType<typeof setInterval> | null = null;

    const demarrer = () => {
      if (minuterie === null) {
        minuterie = setInterval(() => {
          void rafraichir();
        }, PERIODE_ACTUALISATION);
      }
    };

    const arreter = () => {
      if (minuterie !== null) {
        clearInterval(minuterie);
        minuterie = null;
      }
    };

    const surVisibilite = () => {
      if (document.visibilityState === "visible") {
        void rafraichir(true);
        demarrer();
      } else {
        arreter();
      }
    };

    /*
      Première lecture différée d’un tour de boucle : lancée dans le corps de
      l’effet, elle écrirait dans l’état au moment même où React vient de
      rendre. Le délai est imperceptible, et la lecture s’annule proprement si
      le composant est démonté entre-temps.
    */
    const premiereLecture = setTimeout(() => {
      void rafraichir(true);
    }, 0);

    if (document.visibilityState === "visible") demarrer();
    document.addEventListener("visibilitychange", surVisibilite);

    return () => {
      clearTimeout(premiereLecture);
      arreter();
      document.removeEventListener("visibilitychange", surVisibilite);
    };
  }, [collecteConfiguree, rafraichir]);

  /* ---------------------------------------------------------------- */
  /* Navigation                                                        */
  /* ---------------------------------------------------------------- */

  const deplacerOnglet = useCallback((pas: number) => {
    setOnglet((courant) => {
      const index = ONGLETS.findIndex((candidat) => candidat.id === courant);
      const suivant = (index + pas + ONGLETS.length) % ONGLETS.length;
      return ONGLETS[suivant].id;
    });
  }, []);

  /*
    En projection, les onglets disparaissent : la navigation passe aux flèches,
    que la plupart des télécommandes de vidéoprojecteur savent envoyer. Échap
    ramène à l’écran de travail.
  */
  useEffect(() => {
    if (!projection) return;

    const surTouche = (evenement: KeyboardEvent) => {
      const cible = evenement.target as HTMLElement | null;
      if (
        cible &&
        (cible.tagName === "INPUT" ||
          cible.tagName === "TEXTAREA" ||
          cible.isContentEditable)
      ) {
        return;
      }

      if (evenement.key === "ArrowRight") {
        evenement.preventDefault();
        deplacerOnglet(1);
      } else if (evenement.key === "ArrowLeft") {
        evenement.preventDefault();
        deplacerOnglet(-1);
      } else if (evenement.key === "Escape") {
        setProjection(false);
      }
    };

    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [projection, deplacerOnglet]);

  /** Flèches, Origine et Fin sur la barre d’onglets, comme l’attend un lecteur d’écran. */
  const surToucheOnglets = (evenement: EvenementClavier<HTMLDivElement>) => {
    const index = ONGLETS.findIndex((candidat) => candidat.id === onglet);
    let cible = index;

    if (evenement.key === "ArrowRight") cible = (index + 1) % ONGLETS.length;
    else if (evenement.key === "ArrowLeft")
      cible = (index - 1 + ONGLETS.length) % ONGLETS.length;
    else if (evenement.key === "Home") cible = 0;
    else if (evenement.key === "End") cible = ONGLETS.length - 1;
    else return;

    evenement.preventDefault();
    setOnglet(ONGLETS[cible].id);
    refsOnglets.current[cible]?.focus();
  };

  /* ---------------------------------------------------------------- */
  /* Actions sur les séances                                           */
  /* ---------------------------------------------------------------- */

  const agirSurSeance = useCallback(
    async (corps: Record<string, unknown>) => {
      setActionEnCours(true);
      setMessageAction(null);

      try {
        const reponse = await fetch(ROUTE_SESSION, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formation, ...corps }),
        });

        const charge: unknown = await reponse.json().catch(() => null);

        if (!reponse.ok) {
          const message = estObjet(charge) ? texteOuNull(charge.message) : null;
          setMessageAction(
            message ??
              (reponse.status === 401
                ? "Votre accès animateur a expiré. Rechargez la page."
                : "L’opération sur la séance n’a pas abouti."),
          );
          return;
        }

        setLibelleNouvelle("");
        // Revenir à la séance ouverte : c’est celle qu’on vient de manipuler.
        setSeanceChoisie(null);
        await rafraichir(true);
      } catch {
        setMessageAction(
          "L’opération n’a pas abouti. Vérifiez votre connexion, puis réessayez.",
        );
      } finally {
        setActionEnCours(false);
      }
    },
    [formation, rafraichir],
  );

  const quitter = useCallback(async () => {
    try {
      await fetch(ROUTE_DECONNEXION, { method: "POST" });
    } catch {
      // Sans réseau, le cookie expirera de lui-même : rien à signaler ici.
    }
    router.refresh();
  }, [router]);

  /* ---------------------------------------------------------------- */
  /* Données dérivées                                                  */
  /* ---------------------------------------------------------------- */

  const seance = donnees?.session ?? null;
  const seances = useMemo(() => donnees?.seances ?? [], [donnees]);
  const compte = donnees?.compte ?? {
    sondage: 0,
    satisfaction: 0,
    restitutions: 0,
  };
  const restitutions = useMemo(
    () => donnees?.restitutions ?? [],
    [donnees],
  );

  const collecteActive = collecteConfiguree && donnees?.configuree !== false;

  const messageCollecte =
    donnees?.message ??
    "Collecte non configurée : la variable d’environnement DATABASE_URL est " +
      "absente. Les questionnaires ne sont pas enregistrés et le tableau de " +
      "bord reste vide. Renseignez la variable et redéployez : les tables " +
      "sont créées automatiquement.";

  const restitutionsParSection = useMemo(() => {
    const groupes = new Map<string, Restitution[]>();
    for (const restitution of restitutions) {
      const cle = restitution.section.trim() || "Section non précisée";
      const liste = groupes.get(cle);
      if (liste) liste.push(restitution);
      else groupes.set(cle, [restitution]);
    }
    return [...groupes.entries()].sort((gauche, droite) =>
      gauche[0].localeCompare(droite[0], "fr"),
    );
  }, [restitutions]);

  const texteArchivage = useMemo(
    () => texteDesRestitutions(titreFormation, seance, restitutions),
    [titreFormation, seance, restitutions],
  );

  const comptesDOnglet: Record<Onglet, number | null> = {
    seance: null,
    sondage: compte.sondage,
    satisfaction: compte.satisfaction,
    restitutions: compte.restitutions,
  };

  const libelleOngletCourant =
    ONGLETS.find((candidat) => candidat.id === onglet)?.libelle ?? "";

  /* ---------------------------------------------------------------- */
  /* Rendu                                                             */
  /* ---------------------------------------------------------------- */

  return (
    <div
      className={[
        "mx-auto w-full",
        projection
          ? "max-w-[100rem] px-4 py-6 sm:px-8"
          : "max-w-6xl px-4 py-8 sm:px-6 sm:py-10",
      ].join(" ")}
    >
      {/* ------------------------------------------------------------ */}
      {/* En-tête                                                       */}
      {/* ------------------------------------------------------------ */}
      <header>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <p
              className={[
                "text-accent",
                projection ? "text-lg" : "text-sm",
              ].join(" ")}
            >
              Tableau de bord animateur
            </p>
            <h1
              className={[
                "mt-1 font-serif leading-tight text-encre",
                projection ? "text-4xl" : "text-3xl sm:text-4xl",
              ].join(" ")}
            >
              {titreFormation}
            </h1>
            <p
              className={[
                "mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-graphite",
                projection ? "text-base" : "text-sm",
              ].join(" ")}
            >
              <span>{sessionFormation}</span>
              <span aria-hidden="true" className="text-trait-fort">
                ·
              </span>
              <span className="min-w-0 break-words">
                {seance
                  ? `${seance.libelle} — ${seance.ouverte ? "collecte ouverte" : "collecte fermée"}`
                  : "aucune séance ouverte"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setProjection((actif) => !actif)}
              aria-pressed={projection}
              className={[
                "inline-flex items-center gap-2 rounded-lg border px-3.5 py-2",
                "text-sm font-medium transition-colors",
                projection
                  ? "border-accent bg-accent-voile text-accent-fort"
                  : "border-trait bg-craie text-graphite hover:border-trait-fort hover:text-encre",
              ].join(" ")}
            >
              <IconeProjection actif={projection} />
              {projection ? "Quitter la projection" : "Mode projection"}
            </button>

            <button
              type="button"
              onClick={() => setQrVisibles((visible) => !visible)}
              aria-expanded={qrVisibles}
              className="inline-flex items-center gap-2 rounded-lg border border-trait bg-craie px-3.5 py-2 text-sm font-medium text-graphite transition-colors hover:border-trait-fort hover:text-encre"
            >
              <IconeQr />
              {qrVisibles ? "Masquer les QR codes" : "Afficher les QR codes"}
            </button>

            <button
              type="button"
              onClick={() => {
                void rafraichir(true);
              }}
              disabled={!collecteConfiguree}
              className="inline-flex items-center gap-2 rounded-lg border border-trait bg-craie px-3.5 py-2 text-sm font-medium text-graphite transition-colors hover:border-trait-fort hover:text-encre disabled:opacity-50"
            >
              <IconeActualiser />
              Actualiser
            </button>
          </div>
        </div>

        {/* État de la liaison — discret, jamais alarmant, jamais coloré. */}
        <p
          aria-live="polite"
          className={[
            "mt-3 flex flex-wrap items-center gap-x-2 gap-y-1",
            projection ? "text-base" : "text-xs",
            reseau === "ok" ? "text-estompe" : "text-graphite",
          ].join(" ")}
        >
          {!collecteConfiguree ? (
            <span>Collecte non configurée — aucune réponse n’est enregistrée.</span>
          ) : reseau === "expire" ? (
            <span>
              Votre accès animateur a expiré. Rechargez la page pour saisir à
              nouveau le code.
            </span>
          ) : (
            <>
              {reseau === "perdu" ? (
                <span>
                  Connexion perdue — les chiffres affichés sont les derniers
                  reçus.
                </span>
              ) : (
                <span>
                  Actualisation automatique toutes les{" "}
                  {PERIODE_ACTUALISATION / 1000} secondes.
                </span>
              )}
              <span aria-hidden="true" className="text-trait-fort">
                ·
              </span>
              <DepuisQuand instant={instantLecture} />
            </>
          )}
        </p>
      </header>

      {/* ------------------------------------------------------------ */}
      {/* Bandeau des QR codes                                          */}
      {/* ------------------------------------------------------------ */}
      <section
        aria-label="Adresses des formulaires"
        hidden={!qrVisibles}
        className={projection ? "mt-6" : "mt-8"}
      >
        <ul className="grid gap-4 sm:grid-cols-3">
          {liens.map((lien) => (
            <CarteQr key={lien.cle} lien={lien} projection={projection} />
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Onglets                                                       */}
      {/* ------------------------------------------------------------ */}
      {projection ? (
        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-trait pb-3">
          <h2 className="font-serif text-2xl text-encre">
            {libelleOngletCourant}
          </h2>
          <p className="text-base text-estompe">
            Flèches <span aria-hidden="true">←</span>{" "}
            <span aria-hidden="true">→</span> pour changer d’écran · Échap pour
            quitter la projection
          </p>
        </div>
      ) : (
        <div
          role="tablist"
          aria-label="Sections du tableau de bord"
          onKeyDown={surToucheOnglets}
          className="mt-8 flex flex-wrap gap-x-1 gap-y-1 border-b border-trait"
        >
          {ONGLETS.map((candidat, rang) => {
            const actif = candidat.id === onglet;
            const effectif = comptesDOnglet[candidat.id];

            return (
              <button
                key={candidat.id}
                ref={(element) => {
                  refsOnglets.current[rang] = element;
                }}
                type="button"
                role="tab"
                id={idOnglet(candidat.id)}
                aria-selected={actif}
                aria-controls={idPanneau(candidat.id)}
                tabIndex={actif ? 0 : -1}
                onClick={() => setOnglet(candidat.id)}
                className={[
                  "-mb-px inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5",
                  "text-sm font-medium transition-colors",
                  actif
                    ? "border-accent text-encre"
                    : "border-transparent text-graphite hover:text-encre",
                ].join(" ")}
              >
                {candidat.libelle}
                {effectif !== null && effectif > 0 ? (
                  <span className="rounded-full bg-voile px-2 py-0.5 text-xs tabular-nums text-graphite">
                    {effectif}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* Avertissements transverses                                    */}
      {/* ------------------------------------------------------------ */}
      {!collecteActive ? (
        <div className="mt-6">
          <Encadre titre="Collecte non configurée">
            <p>{messageCollecte}</p>
            <p>
              Les pages de réponse affichent le même message : rien n’est perdu,
              rien n’est enregistré non plus.
            </p>
          </Encadre>
        </div>
      ) : seanceChoisie !== null ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[--radius-carte] border border-trait bg-voile px-5 py-3">
          <p className="min-w-0 text-sm leading-relaxed break-words text-graphite">
            Vous consultez une séance passée
            {seance ? ` : ${seance.libelle}` : ""}. Les chiffres n’évoluent plus.
          </p>
          <button
            type="button"
            onClick={() => setSeanceChoisie(null)}
            className="text-sm font-medium text-accent underline decoration-trait-fort underline-offset-2 transition-colors hover:text-accent-fort"
          >
            Revenir à la séance ouverte
          </button>
        </div>
      ) : null}

      {/* ------------------------------------------------------------ */}
      {/* Panneau : séance                                              */}
      {/* ------------------------------------------------------------ */}
      <section
        role="tabpanel"
        id={idPanneau("seance")}
        aria-labelledby={projection ? undefined : idOnglet("seance")}
        aria-label={projection ? "Séance" : undefined}
        hidden={onglet !== "seance"}
        tabIndex={0}
        className="mt-8"
      >
        <h2 className="sr-only">Séance</h2>

        <p
          className={[
            "max-w-3xl leading-relaxed text-graphite",
            projection ? "text-xl" : "text-sm",
          ].join(" ")}
        >
          Une seule séance est ouverte à la fois : ouvrir une nouvelle séance
          ferme la précédente, et les réponses vont toujours à la séance ouverte.
          Fermer la collecte empêche l’enregistrement de nouvelles réponses ; les
          résultats déjà reçus, eux, restent consultables.
        </p>

        {projection ? null : (
          <p className="mt-3 text-sm text-graphite">
            <Link
              href={`/formations/${formation}/animateur/code`}
              className="text-accent underline underline-offset-4 transition-colors hover:text-accent-fort"
            >
              Changer le code d’accès animateur
            </Link>
            <span className="text-estompe"> · à faire à chaque séance</span>
          </p>
        )}

        {seance ? (
          <div className="mt-6 rounded-[--radius-carte] border border-trait bg-craie p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-accent">
                  {seance.ouverte ? "Séance ouverte" : "Séance fermée"}
                </p>
                <h3 className="mt-1 font-serif text-xl leading-snug break-words text-encre">
                  {seance.libelle}
                </h3>
                <p className="mt-1 text-sm text-graphite">
                  Ouverte le {formaterDate(seance.creeeLe)}
                </p>
              </div>

              <button
                type="button"
                disabled={actionEnCours || !collecteActive}
                onClick={() => {
                  void agirSurSeance({
                    action: seance.ouverte ? "fermer" : "ouvrir",
                    id: seance.id,
                  });
                }}
                className={[
                  "inline-flex items-center rounded-lg border px-4 py-2.5",
                  "text-sm font-medium transition-colors disabled:opacity-50",
                  seance.ouverte
                    ? "border-trait bg-craie text-graphite hover:border-trait-fort hover:text-encre"
                    : "border-accent bg-accent text-craie hover:bg-accent-fort",
                ].join(" ")}
              >
                {seance.ouverte ? "Fermer la collecte" : "Ouvrir la collecte"}
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <TuileStat
                libelle="Sondage d’entrée"
                valeur={String(compte.sondage)}
                precision={formaterReponses(compte.sondage)}
              />
              <TuileStat
                libelle="Enquête de satisfaction"
                valeur={String(compte.satisfaction)}
                precision={formaterReponses(compte.satisfaction)}
              />
              <TuileStat
                libelle="Restitutions de groupe"
                valeur={String(compte.restitutions)}
                precision={`${compte.restitutions} contribution${compte.restitutions > 1 ? "s" : ""}`}
              />
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <EtatVide
              texte={
                collecteActive
                  ? "Aucune séance n’est ouverte. Ouvrez-en une pour que la salle puisse répondre."
                  : "Aucune séance ne peut être ouverte tant que la collecte n’est pas configurée."
              }
            />
          </div>
        )}

        {/* Nouvelle séance */}
        <div className="mt-6 rounded-[--radius-carte] border border-trait bg-craie p-5 sm:p-6">
          <h3 className="font-serif text-lg text-encre">Nouvelle séance</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-graphite">
            À ouvrir au début de chaque formation : les réponses d’un groupe ne
            se mélangent jamais à celles d’un autre.
          </p>

          {!collecteActive ? (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-ambre-trait bg-ambre-voile p-4 text-sm leading-relaxed text-encre"
            >
              <p className="font-semibold">
                Impossible d’ouvrir une séance : le site n’est pas relié à sa
                base de données.
              </p>
              <p className="mt-1.5 text-encre-clair">
                Les séances et les réponses y sont conservées. Sur Vercel :
                onglet <span className="font-medium">Storage</span>, créer ou
                relier une base Postgres au projet, puis{" "}
                <span className="font-medium">Deployments → Redeploy</span>.
                Revenez ensuite ici : les tables se créent toutes seules.
              </p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1 basis-64">
              <label
                htmlFor={idLibelleSeance}
                className="block text-sm font-medium text-encre"
              >
                Libellé de la séance
              </label>
              <input
                id={idLibelleSeance}
                type="text"
                value={libelleNouvelle}
                maxLength={120}
                disabled={actionEnCours || !collecteActive}
                onChange={(evenement) =>
                  setLibelleNouvelle(evenement.target.value)
                }
                placeholder="Laissé vide : la date du jour"
                className="mt-2 block w-full rounded-lg border border-trait bg-craie px-3.5 py-2.5 text-base text-encre transition-colors placeholder:text-estompe hover:border-trait-fort disabled:opacity-60"
              />
            </div>

            <button
              type="button"
              disabled={actionEnCours || !collecteActive}
              onClick={() => {
                void agirSurSeance({
                  action: "creer",
                  libelle: libelleNouvelle.trim(),
                });
              }}
              className="inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-craie transition-colors hover:bg-accent-fort disabled:opacity-50"
            >
              {actionEnCours ? "Enregistrement…" : "Ouvrir une séance"}
            </button>
          </div>

          {messageAction ? (
            <p role="alert" className="mt-3 text-sm leading-relaxed text-encre">
              {messageAction}
            </p>
          ) : null}

          <DiagnosticBase ouvert={!collecteActive} />
        </div>

        {/* Séances passées */}
        <div className="mt-6">
          <h3 className="font-serif text-lg text-encre">Séances passées</h3>

          {seances.length === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-graphite">
              Aucune séance enregistrée pour cette formation.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-trait rounded-[--radius-carte] border border-trait bg-craie">
              {seances.map((passee) => {
                const chiffres = effectifs[passee.id];
                const consultee = seance?.id === passee.id;

                return (
                  <li
                    key={passee.id}
                    className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="font-medium break-words text-encre">
                        {passee.libelle}
                        {passee.ouverte ? (
                          <span className="ml-2 rounded-full border border-accent px-2 py-0.5 text-xs font-normal text-accent">
                            ouverte
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-sm text-graphite">
                        {formaterDate(passee.creeeLe)}
                        {chiffres ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="mx-1.5 text-trait-fort"
                            >
                              ·
                            </span>
                            <span className="tabular-nums">
                              {chiffres.sondage} sondage
                              {chiffres.sondage > 1 ? "s" : ""} ·{" "}
                              {chiffres.satisfaction} satisfaction ·{" "}
                              {chiffres.restitutions} restitution
                              {chiffres.restitutions > 1 ? "s" : ""}
                            </span>
                          </>
                        ) : null}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={consultee || !collecteActive}
                      onClick={() => setSeanceChoisie(passee.id)}
                      className="shrink-0 rounded-lg border border-trait bg-craie px-3.5 py-2 text-sm font-medium text-graphite transition-colors hover:border-trait-fort hover:text-encre disabled:opacity-50"
                    >
                      {consultee ? "Affichée" : "Afficher les résultats"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="mt-3 text-xs leading-relaxed text-estompe">
            Les effectifs s’affichent pour les séances déjà consultées : les
            charger toutes à chaque actualisation coûterait plus que ce que
            l’information vaut.
          </p>
        </div>

        <div className="mt-10 border-t border-trait pt-5">
          <button
            type="button"
            onClick={() => {
              void quitter();
            }}
            className="text-sm text-graphite underline decoration-trait-fort underline-offset-2 transition-colors hover:text-encre"
          >
            Fermer l’accès animateur sur ce poste
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Panneau : sondage d’entrée                                    */}
      {/* ------------------------------------------------------------ */}
      <section
        role="tabpanel"
        id={idPanneau("sondage")}
        aria-labelledby={projection ? undefined : idOnglet("sondage")}
        aria-label={projection ? "Sondage d’entrée" : undefined}
        hidden={onglet !== "sondage"}
        tabIndex={0}
        className={projection ? "mt-6" : "mt-8"}
      >
        <h2 className="sr-only">Sondage d’entrée</h2>

        {donnees && donnees.sondage.length > 0 ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <TuileStat
                libelle="Réponses au sondage"
                valeur={String(compte.sondage)}
                precision={
                  seance ? seance.libelle : "aucune séance ouverte"
                }
                projection={projection}
              />
            </div>

            {donnees.sondage.map((agregat) => (
              <VueAgregat
                key={agregat.questionId}
                agregat={agregat}
                question={QUESTIONS_SONDAGE.get(agregat.questionId)}
                projection={projection}
              />
            ))}
          </div>
        ) : (
          <EtatVide
            texte={
              collecteActive
                ? "Aucune réponse au sondage pour l’instant. Projetez le QR code : les barres se remplissent d’elles-mêmes."
                : "Le sondage n’est pas collecté : la base de données n’est pas configurée."
            }
          />
        )}
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Panneau : satisfaction                                        */}
      {/* ------------------------------------------------------------ */}
      <section
        role="tabpanel"
        id={idPanneau("satisfaction")}
        aria-labelledby={projection ? undefined : idOnglet("satisfaction")}
        aria-label={projection ? "Satisfaction" : undefined}
        hidden={onglet !== "satisfaction"}
        tabIndex={0}
        className={projection ? "mt-6" : "mt-8"}
      >
        <h2 className="sr-only">Enquête de satisfaction</h2>

        {donnees && donnees.satisfaction.length > 0 ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <TuileStat
                libelle="Réponses à l’enquête"
                valeur={String(compte.satisfaction)}
                precision={seance ? seance.libelle : "aucune séance ouverte"}
                projection={projection}
              />
            </div>

            {donnees.satisfaction.map((agregat) => {
              const question = QUESTIONS_SATISFACTION.get(agregat.questionId);

              if (agregat.type !== "echelle") {
                return (
                  <VueAgregat
                    key={agregat.questionId}
                    agregat={agregat}
                    question={question}
                    projection={projection}
                  />
                );
              }

              const borneHaute =
                question && question.type === "echelle" ? question.max : 5;

              return (
                <div
                  key={agregat.questionId}
                  className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-start"
                >
                  {/* La moyenne d’abord : c’est le chiffre qu’on regarde. */}
                  <TuileStat
                    libelle="Moyenne"
                    valeur={formaterMoyenne(agregat.moyenne ?? 0)}
                    precision={`sur ${borneHaute} · ${formaterReponses(agregat.total)}`}
                    projection={projection}
                  />

                  <BarresRepartition
                    titre={agregat.libelle}
                    total={agregat.total}
                    donnees={donneesDeBarres(agregat, question)}
                    echelle="ordonnee"
                    projection={projection}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <EtatVide
            texte={
              collecteActive
                ? "Aucune réponse à l’enquête pour l’instant. Elle se remplit à la clôture, avant que la salle ne se vide."
                : "L’enquête n’est pas collectée : la base de données n’est pas configurée."
            }
          />
        )}
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Panneau : restitutions                                        */}
      {/* ------------------------------------------------------------ */}
      <section
        role="tabpanel"
        id={idPanneau("restitutions")}
        aria-labelledby={projection ? undefined : idOnglet("restitutions")}
        aria-label={projection ? "Restitutions" : undefined}
        hidden={onglet !== "restitutions"}
        tabIndex={0}
        className={projection ? "mt-6" : "mt-8"}
      >
        <h2 className="sr-only">Restitutions des groupes</h2>

        {restitutions.length > 0 ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p
                className={[
                  "leading-relaxed text-graphite",
                  projection ? "text-xl" : "text-sm",
                ].join(" ")}
              >
                {restitutions.length} contribution
                {restitutions.length > 1 ? "s" : ""} déposée
                {restitutions.length > 1 ? "s" : ""}, groupée
                {restitutions.length > 1 ? "s" : ""} par section.
              </p>

              {projection ? null : (
                <BoutonCopier texte={texteArchivage} libelle="Copier tout" />
              )}
            </div>

            <div className={projection ? "mt-6 space-y-10" : "mt-6 space-y-8"}>
              {restitutionsParSection.map(([section, groupe]) => (
                <section key={section}>
                  <h3
                    className={[
                      "border-b border-trait pb-2 font-serif leading-snug break-words text-encre",
                      projection ? "text-3xl" : "text-xl",
                    ].join(" ")}
                  >
                    {section}
                    <span
                      className={[
                        "ml-3 font-sans text-estompe",
                        projection ? "text-lg" : "text-sm",
                      ].join(" ")}
                    >
                      {groupe.length} contribution{groupe.length > 1 ? "s" : ""}
                    </span>
                  </h3>

                  <ul className={projection ? "mt-5 space-y-5" : "mt-4 space-y-4"}>
                    {groupe.map((restitution) => (
                      <li
                        key={restitution.id}
                        className={[
                          "rounded-[--radius-carte] border border-trait bg-craie",
                          projection ? "p-6" : "p-5",
                        ].join(" ")}
                      >
                        <dl className="space-y-3">
                          {CHAMPS_AFFICHES.map((champ) => {
                            const valeur = valeurChamp(restitution, champ.id);
                            if (!valeur) return null;

                            return (
                              <div
                                key={champ.id}
                                className="sm:grid sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:gap-4"
                              >
                                <dt
                                  className={[
                                    "text-graphite",
                                    projection ? "text-lg" : "text-sm",
                                  ].join(" ")}
                                >
                                  {champ.libelle}
                                </dt>
                                {/* `break-words` : une requête est collée telle
                                    quelle, souvent longue et sans espace. */}
                                <dd
                                  className={[
                                    "mt-0.5 leading-relaxed break-words whitespace-pre-line text-encre sm:mt-0",
                                    projection ? "text-xl" : "text-[0.9375rem]",
                                  ].join(" ")}
                                >
                                  {valeur}
                                </dd>
                              </div>
                            );
                          })}
                        </dl>

                        <p
                          className={[
                            "mt-4 border-t border-trait pt-3 text-estompe",
                            projection ? "text-base" : "text-xs",
                          ].join(" ")}
                        >
                          Déposée le {formaterDate(restitution.envoyeLe)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        ) : (
          <EtatVide
            texte={
              collecteActive
                ? "Aucune restitution déposée pour l’instant. Les groupes remplissent la trame à la fin de l’atelier ACTIF."
                : "Les restitutions ne sont pas collectées : la base de données n’est pas configurée."
            }
          />
        )}
      </section>
    </div>
  );
}
