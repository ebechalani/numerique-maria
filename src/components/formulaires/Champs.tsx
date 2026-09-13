"use client";

/**
 * Champs de formulaire — un composant par type de question.
 *
 * Trois règles gouvernent ce fichier :
 *  - on s’appuie sur les contrôles natifs (radio, case à cocher, zone de
 *    texte) : le clavier, la synthèse vocale et la saisie mobile fonctionnent
 *    sans code supplémentaire, notamment les flèches entre radios d’un même
 *    groupe ;
 *  - l’état « sélectionné » s’exprime en accent (bordure + fond accent-voile),
 *    jamais en vert / ambre / rouge : le feu tricolore reste réservé aux états
 *    autorisé, encadré, interdit de la charte ;
 *  - une erreur est reliée à son champ par aria-describedby et aria-invalid,
 *    et signalée par un trait d’encre — un état de formulaire n’est pas un
 *    verdict de la charte, il ne prend donc pas la couleur rouge.
 *
 * Chaque composant reçoit `id` : c’est l’identifiant DOM du premier contrôle
 * du champ, celui que le formulaire met au focus quand la validation échoue.
 */

import type { Question } from "@/content/types";

/** Longueur maximale d’une réponse libre. */
const LIMITE_CARACTERES = 2000;

/** Au-delà, le compteur de caractères apparaît. */
const SEUIL_COMPTEUR = 400;

/* ------------------------------------------------------------------ */
/* Icônes                                                              */
/* ------------------------------------------------------------------ */

function IconeAlerte() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0"
    >
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 6.25v4.5" />
      <path d="M10 13.5h.01" />
    </svg>
  );
}

function IconeCoche() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <path d="M4 10.5 8 14.5 16 5.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Mentions et messages partagés                                       */
/* ------------------------------------------------------------------ */

/**
 * Mention « obligatoire » écrite en toutes lettres : un astérisque seul se
 * devine mal à l’écran comme à la synthèse vocale.
 */
export function MentionObligatoire() {
  return (
    <span className="ml-2 inline-block rounded border border-trait bg-voile px-1.5 py-0.5 align-middle text-[0.6875rem] font-medium tracking-wide text-graphite uppercase">
      obligatoire
    </span>
  );
}

/** Message d’erreur d’un champ — référencé par aria-describedby. */
export function MessageErreur({ id, texte }: { id: string; texte: string }) {
  return (
    <p
      id={id}
      className="mt-2 flex items-start gap-2 text-sm font-medium text-encre"
    >
      <IconeAlerte />
      <span>{texte}</span>
    </p>
  );
}

/** Intitulé d’un groupe de contrôles (radios, cases à cocher). */
function Legende({
  libelle,
  obligatoire,
}: {
  libelle: string;
  obligatoire?: boolean;
}) {
  return (
    <legend className="font-serif text-base font-semibold text-encre sm:text-lg">
      {libelle}
      {obligatoire ? <MentionObligatoire /> : null}
    </legend>
  );
}

/** Intitulé d’un champ unique (zone de texte, ligne de saisie). */
export function EtiquetteChamp({
  htmlFor,
  libelle,
  obligatoire,
}: {
  htmlFor: string;
  libelle: string;
  obligatoire?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-serif text-base font-semibold text-encre sm:text-lg"
    >
      {libelle}
      {obligatoire ? <MentionObligatoire /> : null}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Option cliquable                                                    */
/* ------------------------------------------------------------------ */

export interface ProprietesOption {
  type: "radio" | "checkbox";
  /** Nom du groupe : c’est lui qui relie les radios entre elles. */
  nom: string;
  libelle: string;
  coche: boolean;
  onChange: () => void;
  /** Posé sur la première option seulement, pour la mise au focus. */
  id?: string;
  decritPar?: string;
  invalide?: boolean;
}

/**
 * Une option présentée en zone cliquable : toute la ligne est un <label>, donc
 * la cible tactile fait la largeur de la carte. Le contrôle natif est masqué
 * visuellement mais reste dans l’ordre de tabulation ; le <label> est en
 * position relative pour que le contrôle masqué reste ancré sur la ligne, ce
 * dont dépend le défilement lors d’une mise au focus.
 */
export function OptionCliquable({
  type,
  nom,
  libelle,
  coche,
  onChange,
  id,
  decritPar,
  invalide,
}: ProprietesOption) {
  return (
    <label
      className={[
        "relative flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors duration-150 sm:p-3.5",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
        coche
          ? "border-accent bg-accent-voile"
          : "border-trait bg-papier hover:border-trait-fort",
      ].join(" ")}
    >
      <input
        id={id}
        type={type}
        name={nom}
        checked={coche}
        onChange={onChange}
        aria-describedby={decritPar}
        // aria-invalid vaut pour une case à cocher, pas pour un bouton radio :
        // là, c’est le groupe entier qui porte l’état (role="radiogroup").
        aria-invalid={invalide && type === "checkbox" ? true : undefined}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={[
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors duration-150",
          type === "radio" ? "rounded-full" : "rounded",
          coche
            ? type === "radio"
              ? "border-accent bg-craie"
              : "border-accent bg-accent text-craie"
            : "border-trait-fort bg-craie",
        ].join(" ")}
      >
        {coche ? (
          type === "radio" ? (
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          ) : (
            <IconeCoche />
          )
        ) : null}
      </span>

      <span
        className={[
          "min-w-0 flex-1 text-encre",
          coche ? "font-medium" : "",
        ].join(" ")}
      >
        {libelle}
      </span>
    </label>
  );
}

/** Trait d’encre porté par le groupe fautif — sobre, hors feu tricolore. */
function classesGroupe(erreur?: string): string {
  return erreur ? "mt-3 space-y-2 border-l-2 border-encre-clair pl-3" : "mt-3 space-y-2";
}

/* ------------------------------------------------------------------ */
/* Choix unique                                                        */
/* ------------------------------------------------------------------ */

export interface ProprietesChampChoixUnique {
  question: Extract<Question, { type: "choix-unique" }>;
  valeur: string;
  onChange: (valeur: string) => void;
  erreur?: string;
  id: string;
}

export function ChampChoixUnique({
  question,
  valeur,
  onChange,
  erreur,
  id,
}: ProprietesChampChoixUnique) {
  const idErreur = `${id}-erreur`;

  return (
    <fieldset
      role="radiogroup"
      aria-describedby={erreur ? idErreur : undefined}
      aria-invalid={erreur ? true : undefined}
    >
      <Legende libelle={question.libelle} obligatoire={question.obligatoire} />

      <div className={classesGroupe(erreur)}>
        {question.options.map((option, rang) => (
          <OptionCliquable
            key={rang}
            type="radio"
            nom={`${id}-choix`}
            libelle={option}
            coche={valeur === option}
            onChange={() => onChange(option)}
            id={rang === 0 ? id : undefined}
            decritPar={erreur ? idErreur : undefined}
            invalide={Boolean(erreur)}
          />
        ))}
      </div>

      {erreur ? <MessageErreur id={idErreur} texte={erreur} /> : null}
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* Choix multiple                                                      */
/* ------------------------------------------------------------------ */

export interface ProprietesChampChoixMultiple {
  question: Extract<Question, { type: "choix-multiple" }>;
  valeur: string[];
  onChange: (valeur: string[]) => void;
  erreur?: string;
  id: string;
}

export function ChampChoixMultiple({
  question,
  valeur,
  onChange,
  erreur,
  id,
}: ProprietesChampChoixMultiple) {
  const idErreur = `${id}-erreur`;
  const idAide = `${id}-aide`;
  const decritPar = [erreur ? idErreur : null, idAide]
    .filter((valeur): valeur is string => valeur !== null)
    .join(" ");

  /**
   * La sélection est reconstruite à partir de l’ordre des options : la réponse
   * envoyée suit l’ordre du questionnaire, pas l’ordre des clics.
   */
  function basculer(option: string) {
    const deja = valeur.includes(option);
    onChange(
      question.options.filter((autre) =>
        autre === option ? !deja : valeur.includes(autre),
      ),
    );
  }

  return (
    <fieldset aria-describedby={erreur ? idErreur : undefined}>
      <Legende libelle={question.libelle} obligatoire={question.obligatoire} />
      <p id={idAide} className="mt-1 text-sm text-graphite">
        Plusieurs réponses possibles.
      </p>

      <div className={classesGroupe(erreur)}>
        {question.options.map((option, rang) => (
          <OptionCliquable
            key={rang}
            type="checkbox"
            nom={`${id}-choix`}
            libelle={option}
            coche={valeur.includes(option)}
            onChange={() => basculer(option)}
            id={rang === 0 ? id : undefined}
            decritPar={decritPar}
            invalide={Boolean(erreur)}
          />
        ))}
      </div>

      {erreur ? <MessageErreur id={idErreur} texte={erreur} /> : null}
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* Échelle                                                             */
/* ------------------------------------------------------------------ */

export interface ProprietesChampEchelle {
  question: Extract<Question, { type: "echelle" }>;
  valeur: number | null;
  onChange: (valeur: number) => void;
  erreur?: string;
  id: string;
}

export function ChampEchelle({
  question,
  valeur,
  onChange,
  erreur,
  id,
}: ProprietesChampEchelle) {
  const idErreur = `${id}-erreur`;

  const crans: number[] = [];
  for (let cran = question.min; cran <= question.max; cran += 1) {
    crans.push(cran);
  }

  return (
    <fieldset
      role="radiogroup"
      aria-describedby={erreur ? idErreur : undefined}
      aria-invalid={erreur ? true : undefined}
    >
      <Legende libelle={question.libelle} obligatoire={question.obligatoire} />

      <div
        className={
          erreur ? "mt-3 border-l-2 border-encre-clair pl-3" : "mt-3"
        }
      >
        <div className="flex gap-1.5 sm:gap-2">
          {crans.map((cran, rang) => {
            const choisi = valeur === cran;
            return (
              <label
                key={cran}
                className={[
                  "relative flex h-11 flex-1 cursor-pointer items-center justify-center rounded-md border font-mono text-sm tabular-nums transition-colors duration-150",
                  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                  choisi
                    ? "border-accent bg-accent-voile font-semibold text-accent"
                    : "border-trait-fort bg-craie text-encre hover:border-accent hover:bg-accent-voile",
                ].join(" ")}
              >
                <input
                  id={rang === 0 ? id : undefined}
                  type="radio"
                  name={`${id}-echelle`}
                  checked={choisi}
                  onChange={() => onChange(cran)}
                  aria-label={`${cran} sur ${question.max}`}
                  aria-describedby={erreur ? idErreur : undefined}
                  className="sr-only"
                />
                <span aria-hidden="true">{cran}</span>
              </label>
            );
          })}
        </div>

        <div className="mt-2 flex items-start justify-between gap-4 text-xs text-graphite">
          <span>{question.libelleMin}</span>
          <span className="text-right">{question.libelleMax}</span>
        </div>
      </div>

      {erreur ? <MessageErreur id={idErreur} texte={erreur} /> : null}
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* Texte libre                                                         */
/* ------------------------------------------------------------------ */

export interface ProprietesChampTexteLibre {
  question: Extract<Question, { type: "texte-libre" }>;
  valeur: string;
  onChange: (valeur: string) => void;
  erreur?: string;
  id: string;
}

export function ChampTexteLibre({
  question,
  valeur,
  onChange,
  erreur,
  id,
}: ProprietesChampTexteLibre) {
  const idAide = `${id}-aide`;
  const idCompteur = `${id}-compteur`;
  const idErreur = `${id}-erreur`;

  const longueur = valeur.length;
  const compteurVisible = longueur > SEUIL_COMPTEUR;

  const decritPar =
    [
      question.aide ? idAide : null,
      compteurVisible ? idCompteur : null,
      erreur ? idErreur : null,
    ]
      .filter((partie): partie is string => partie !== null)
      .join(" ") || undefined;

  return (
    <div>
      <EtiquetteChamp
        htmlFor={id}
        libelle={question.libelle}
        obligatoire={question.obligatoire}
      />

      {question.aide ? (
        <p id={idAide} className="mt-1 text-sm text-graphite">
          {question.aide}
        </p>
      ) : null}

      <textarea
        id={id}
        rows={question.lignes ?? 3}
        value={valeur}
        maxLength={LIMITE_CARACTERES}
        onChange={(evenement) => onChange(evenement.target.value)}
        aria-describedby={decritPar}
        aria-invalid={erreur ? true : undefined}
        className={[
          "mt-3 block w-full resize-y rounded-md border bg-papier px-3 py-2 leading-relaxed text-encre placeholder:text-estompe focus:outline-none",
          erreur
            ? "border-encre-clair"
            : "border-trait focus:border-accent",
        ].join(" ")}
      />

      {compteurVisible ? (
        <p
          id={idCompteur}
          className="mt-1 text-right font-mono text-xs tabular-nums text-estompe"
        >
          {longueur} / {LIMITE_CARACTERES} caractères
        </p>
      ) : null}

      {erreur ? <MessageErreur id={idErreur} texte={erreur} /> : null}
    </div>
  );
}
