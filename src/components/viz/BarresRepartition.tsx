"use client";

import { useId, useState } from "react";

import TableauDonnees from "./TableauDonnees";

/* ------------------------------------------------------------------ */
/* Palette de visualisation — validée, à ne pas improviser             */
/* ------------------------------------------------------------------ */

/*
  Ces valeurs sortent du validateur de palette (lightness monotone, écart
  ΔL ≥ 0.06 entre paliers, contraste de l’extrémité claire, teinte unique).
  Les modifier casse la lisibilité en projection et en daltonisme : on ne les
  remplace pas, on ne les « ajuste » pas à l’œil.
*/

/** Rampe ordonnée à 4 paliers : Jamais → Tous les jours ; Non → Oui souvent. */
const RAMPE_4 = ["#55AFC6", "#2892B0", "#0E7490", "#0A4E63"] as const;

/** Rampe ordonnée à 5 paliers : échelles de satisfaction 1 → 5. */
const RAMPE_5 = ["#6BBDD2", "#3FA2BD", "#158AA6", "#0C6478", "#08404F"] as const;

/**
 * Teinte unique des barres nominales.
 *
 * Un choix multiple (« Pour quoi faire ? ») n’a pas d’ordre : la longueur de
 * la barre encode déjà la grandeur, teinter en plus gaspillerait le canal
 * identité et suggérerait une progression qui n’existe pas.
 */
const TEINTE_NOMINALE = "#0E7490";

/** Gris de contexte : ligne de base et filets. */
const GRIS_CONTEXTE = "#8B93A0";

/** Espace fine insécable, avant le signe pour-cent. */
const ESPACE_FINE = " ";

/* ------------------------------------------------------------------ */
/* Fabrique de rampe                                                   */
/* ------------------------------------------------------------------ */

function canaux(hex: string): [number, number, number] {
  const entier = Number.parseInt(hex.slice(1), 16);
  return [(entier >> 16) & 255, (entier >> 8) & 255, entier & 255];
}

function versDeuxChiffres(canal: number): string {
  return Math.round(canal).toString(16).padStart(2, "0");
}

/** Mélange deux couleurs de la rampe, `t` allant de 0 (départ) à 1 (arrivée). */
function melanger(depart: string, arrivee: string, t: number): string {
  const a = canaux(depart);
  const b = canaux(arrivee);
  return `#${a.map((canal, i) => versDeuxChiffres(canal + (b[i] - canal) * t)).join("")}`;
}

/**
 * Rampe ordonnée pour `nombreOptions` paliers.
 *
 * Quatre et cinq options tombent sur les rampes validées telles quelles. Toute
 * autre longueur est interpolée le long de la rampe à 5 paliers, en partant de
 * ses extrémités : deux options reprennent les paliers 1 et 5, trois options
 * les paliers 1, 3 et 5 — donc des couleurs validées, jamais inventées.
 */
function rampeOrdonnee(nombreOptions: number): string[] {
  if (nombreOptions <= 0) return [];
  if (nombreOptions === 4) return [...RAMPE_4];
  if (nombreOptions === 5) return [...RAMPE_5];
  // Une seule option : on prend le palier médian, ni le plus clair ni le plus sombre.
  if (nombreOptions === 1) return [RAMPE_5[2]];

  const dernier = RAMPE_5.length - 1;
  return Array.from({ length: nombreOptions }, (_, rang) => {
    const position = (rang / (nombreOptions - 1)) * dernier;
    const bas = Math.floor(position);
    const haut = Math.min(bas + 1, dernier);
    return melanger(RAMPE_5[bas], RAMPE_5[haut], position - bas);
  });
}

function couleursDesBarres(
  echelle: "ordonnee" | "nominale",
  nombreOptions: number,
): string[] {
  if (echelle === "nominale") {
    return Array.from({ length: nombreOptions }, () => TEINTE_NOMINALE);
  }
  return rampeOrdonnee(nombreOptions);
}

/* ------------------------------------------------------------------ */
/* Mise en forme                                                       */
/* ------------------------------------------------------------------ */

function borner(valeur: number): number {
  if (!Number.isFinite(valeur)) return 0;
  return Math.min(Math.max(valeur, 0), 1);
}

function formaterPart(part: number): string {
  return `${Math.round(borner(part) * 100)}${ESPACE_FINE}%`;
}

function formaterReponses(nombre: number): string {
  if (nombre <= 0) return "aucune réponse";
  return `${nombre} réponse${nombre > 1 ? "s" : ""}`;
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

interface Repartition {
  /** Intitulé de l’option, tel qu’il figure dans le questionnaire. */
  option: string;
  /** Effectif brut de l’option. */
  nombre: number;
  /** Part de l’option, de 0 à 1. */
  part: number;
}

interface ProprietesBarresRepartition {
  titre: string;
  sousTitre?: string;
  /** Effectif total de répondants à la question. */
  total: number;
  donnees: Repartition[];
  /** `ordonnee` si l’ordre des options porte un sens, sinon `nominale`. */
  echelle: "ordonnee" | "nominale";
  /** Typographie et barres agrandies pour la lecture au vidéoprojecteur. */
  projection?: boolean;
}

/**
 * Répartition des réponses à une question fermée, en barres horizontales.
 *
 * Aucune librairie de graphiques : des div et du CSS suffisent pour des barres
 * horizontales, et le rendu reste net à toute échelle de projection, là où un
 * canevas se pixelliserait.
 *
 * Trois règles de tracé structurent le composant :
 * — les barres partent toutes d’une même ligne de base, à gauche ;
 * — deux barres voisines sont séparées par 2 px de couleur de surface, jamais
 *   par un contour : c’est l’écart qui sépare ;
 * — le texte ne porte jamais la couleur de la donnée ; l’identité d’une ligne
 *   vient de la barre posée à côté du libellé, pas de la teinte des lettres.
 */
export default function BarresRepartition({
  titre,
  sousTitre,
  total,
  donnees,
  echelle,
  projection = false,
}: ProprietesBarresRepartition) {
  const [tableauDeplie, setTableauDeplie] = useState(false);
  const idTableau = useId();

  const couleurs = couleursDesBarres(echelle, donnees.length);

  /*
    Largeur de la colonne des libellés et gouttière réservée à la valeur.
    Les classes sont écrites en toutes lettres, jamais composées à la volée :
    Tailwind lit le source tel quel pour générer la feuille de styles.
  */
  const grilleLigne = projection
    ? "@lg:grid @lg:grid-cols-[17rem_minmax(0,1fr)] @lg:items-center @lg:gap-x-5"
    : "@lg:grid @lg:grid-cols-[13rem_minmax(0,1fr)] @lg:items-center @lg:gap-x-4";

  // Doit valoir la largeur de la colonne des libellés plus la gouttière de grille.
  const positionLigneDeBase = projection
    ? "calc(17rem + 1.25rem)"
    : "calc(13rem + 1rem)";

  /*
    La zone proportionnelle vaut « 100 % moins la gouttière » : les barres
    restent donc exactement proportionnelles entre elles, et la valeur placée
    au bout de la barre trouve toujours sa place, même à 100 %.
  */
  const gouttiereValeur = projection ? "10rem" : "6.5rem";

  const hauteurBarre = projection ? "28px" : "22px";

  return (
    <figure
      className={[
        "@container rounded-[--radius-carte] border border-trait bg-craie",
        projection ? "p-8" : "p-5",
      ].join(" ")}
    >
      <figcaption className={projection ? "mb-7" : "mb-5"}>
        <h3
          className={[
            "font-serif font-semibold text-encre",
            projection ? "text-[2rem] leading-tight" : "text-lg leading-snug",
          ].join(" ")}
        >
          {titre}
        </h3>

        {sousTitre ? (
          <p
            className={[
              "mt-1 leading-snug text-graphite",
              projection ? "text-lg" : "text-sm",
            ].join(" ")}
          >
            {sousTitre}
          </p>
        ) : null}

        <p
          className={[
            "mt-1.5 text-estompe",
            projection ? "text-base" : "text-xs",
          ].join(" ")}
        >
          {total > 0
            ? formaterReponses(total)
            : "Aucune réponse pour l’instant"}
        </p>
      </figcaption>

      {/* Les barres. L’écart vertical vaut 2 px dès que les libellés passent à gauche. */}
      <div className="relative space-y-3 @lg:space-y-0.5">
        {/* Ligne de base : filet plein d’un pixel, gris de contexte, discret. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 hidden w-px @lg:block"
          style={{
            left: positionLigneDeBase,
            backgroundColor: GRIS_CONTEXTE,
          }}
        />

        {donnees.map((donnee, rang) => {
          const part = borner(donnee.part);
          const pourcentage = formaterPart(part);
          const infoBulle =
            total > 0
              ? `${donnee.option} — ${formaterReponses(donnee.nombre)} sur ${total} (${pourcentage})`
              : `${donnee.option} — ${formaterReponses(donnee.nombre)}`;

          return (
            <div
              key={`${donnee.option}-${rang}`}
              className={`group relative ${grilleLigne}`}
            >
              {/*
                Le libellé passe au-dessus de la barre tant que le conteneur est
                étroit, et à gauche dès qu’il y a la place. Il n’est jamais
                rogné : il s’enroule sur deux lignes plutôt que d’être coupé.
              */}
              <div
                className={[
                  "leading-snug text-encre @lg:mb-0 @lg:text-right",
                  projection ? "mb-1.5 text-xl" : "mb-1 text-sm",
                ].join(" ")}
              >
                {donnee.option}
              </div>

              <div className="flex items-center" style={{ height: hauteurBarre }}>
                <div
                  className="h-full shrink-0 rounded-r-[4px]"
                  style={{
                    // Extrémité carrée à la ligne de base, arrondie côté donnée.
                    width: `calc(${part} * (100% - ${gouttiereValeur}))`,
                    // Une option jamais choisie doit rester visible.
                    minWidth: "3px",
                    backgroundColor: couleurs[rang] ?? TEINTE_NOMINALE,
                  }}
                />

                <div
                  className={[
                    "shrink-0 whitespace-nowrap pl-2 tabular-nums",
                    projection ? "text-xl" : "text-[0.8125rem]",
                  ].join(" ")}
                  style={{ width: gouttiereValeur }}
                >
                  <span className="font-medium text-encre">{donnee.nombre}</span>
                  <span className="text-graphite"> · {pourcentage}</span>
                </div>
              </div>

              {/*
                Info-bulle de survol : elle ajoute le dénominateur, que la ligne
                ne montre pas. Inutile en projection, où personne ne survole, et
                purement redondante pour les lecteurs d’écran — le libellé et la
                valeur sont déjà dans le texte de la ligne.
              */}
              {projection ? null : (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden w-max max-w-full rounded-md border border-trait-fort bg-craie px-2.5 py-1.5 text-xs leading-snug text-encre group-hover:block"
                >
                  {infoBulle}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/*
        La vue tableau rend l’information accessible sans la couleur ni la
        longueur des barres. Elle reste repliée à l’ouverture, y compris en
        projection.
      */}
      <div className={projection ? "mt-7" : "mt-5"}>
        <button
          type="button"
          onClick={() => setTableauDeplie((deplie) => !deplie)}
          aria-expanded={tableauDeplie}
          aria-controls={idTableau}
          className={[
            "sans-impression inline-flex items-center gap-1.5 rounded-md border border-trait",
            "bg-craie px-2.5 py-1 font-medium text-graphite transition-colors",
            "hover:border-trait-fort hover:text-encre",
            projection ? "text-base" : "text-xs",
          ].join(" ")}
        >
          <svg
            width={projection ? "18" : "14"}
            height={projection ? "18" : "14"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`transition-transform duration-150 ${
              tableauDeplie ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
          {tableauDeplie ? "Masquer les données" : "Voir les données"}
        </button>

        <div id={idTableau} hidden={!tableauDeplie} className="mt-4">
          <TableauDonnees
            entetes={["Option", "Réponses", "Part"]}
            lignes={donnees.map((donnee) => [
              donnee.option,
              donnee.nombre,
              formaterPart(donnee.part),
            ])}
            legende={`${titre} — ${formaterReponses(total)} au total.`}
          />
        </div>
      </div>
    </figure>
  );
}
