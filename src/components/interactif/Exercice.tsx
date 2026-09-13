"use client";

/**
 * Exercice guidé.
 *
 * L’enseignant manipule l’outil (ChatGPT, NotebookLM), puis consigne ici ce
 * qu’il obtient : quelques champs de texte ou de choix. À la validation, le
 * retour de la formation — « ce qu’on observe en séance » — apparaît sous ses
 * propres réponses, pour comparer.
 *
 * Tout reste dans le navigateur. Seul l’exercice de l’atelier ACTIF
 * recopie ses réponses dans un brouillon, que la trame de restitution reprend.
 */

import Link from "next/link";
import { useId } from "react";

import { OptionCliquable } from "@/components/formulaires/Champs";
import BoutonCopier from "@/components/ui/BoutonCopier";
import type { Bloc, ChampExercice } from "@/content/types";
import { useEtatLocal } from "@/lib/progression";

type BlocExercice = Extract<Bloc, { type: "exercice" }>;

interface EtatExercice {
  valeurs: Record<string, string>;
  valide: boolean;
}

const ETAT_INITIAL: EtatExercice = { valeurs: {}, valide: false };

/** Clé du brouillon repris par la trame de restitution (champs de même id). */
export const CLE_BROUILLON_RESTITUTION = "brouillon-restitution";
const AUCUN_BROUILLON: Record<string, string> = {};

const LIMITE_COURTE = 200;
const LIMITE_LONGUE = 2000;

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

function IconeFleche() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/** Le stockage peut contenir n’importe quoi : on n’en garde que des chaînes. */
function valeursSures(etat: unknown): Record<string, string> {
  const brut = (etat as { valeurs?: unknown } | null)?.valeurs;
  if (typeof brut !== "object" || brut === null) return {};
  const propres: Record<string, string> = {};
  for (const [cle, valeur] of Object.entries(brut as Record<string, unknown>)) {
    if (typeof valeur === "string") propres[cle] = valeur;
  }
  return propres;
}

/* ------------------------------------------------------------------ */
/* Un champ                                                            */
/* ------------------------------------------------------------------ */

interface ProprietesChamp {
  champ: ChampExercice;
  valeur: string;
  onChange: (valeur: string) => void;
  id: string;
}

function Champ({ champ, valeur, onChange, id }: ProprietesChamp) {
  const idAide = `${id}-aide`;

  const etiquette = (
    <>
      {champ.libelle}
      {champ.facultatif ? (
        <span className="ml-2 text-xs font-normal text-estompe">
          facultatif
        </span>
      ) : null}
    </>
  );

  if (champ.type === "choix") {
    return (
      <fieldset
        role="radiogroup"
        aria-describedby={champ.aide ? idAide : undefined}
      >
        <legend className="font-semibold text-encre">{etiquette}</legend>
        {champ.aide ? (
          <p id={idAide} className="mt-1 text-sm text-graphite">
            {champ.aide}
          </p>
        ) : null}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {champ.options.map((option, rang) => (
            <OptionCliquable
              key={rang}
              type="radio"
              nom={`${id}-choix`}
              libelle={option}
              coche={valeur === option}
              onChange={() => onChange(option)}
              id={rang === 0 ? id : undefined}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  const classesSaisie =
    "mt-3 block w-full rounded-md border border-trait bg-papier px-3 py-2 leading-relaxed text-encre placeholder:text-estompe focus:border-accent focus:outline-none";

  return (
    <div>
      <label htmlFor={id} className="block font-semibold text-encre">
        {etiquette}
      </label>
      {champ.aide ? (
        <p id={idAide} className="mt-1 text-sm text-graphite">
          {champ.aide}
        </p>
      ) : null}
      {champ.type === "texte-long" ? (
        <textarea
          id={id}
          rows={champ.lignes ?? 3}
          value={valeur}
          maxLength={LIMITE_LONGUE}
          onChange={(evenement) => onChange(evenement.target.value)}
          aria-describedby={champ.aide ? idAide : undefined}
          className={`${classesSaisie} resize-y`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={valeur}
          maxLength={LIMITE_COURTE}
          onChange={(evenement) => onChange(evenement.target.value)}
          aria-describedby={champ.aide ? idAide : undefined}
          className={classesSaisie}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* L’exercice                                                          */
/* ------------------------------------------------------------------ */

export default function Exercice({ bloc }: { bloc: BlocExercice }) {
  const base = useId();
  const idTitre = `${base}-titre`;

  const [etat, setEtat] = useEtatLocal<EtatExercice>(
    `exercice:${bloc.id}`,
    ETAT_INITIAL,
  );
  const [, setBrouillon] = useEtatLocal<Record<string, string>>(
    CLE_BROUILLON_RESTITUTION,
    AUCUN_BROUILLON,
  );

  const valeurs = valeursSures(etat);
  const valide = Boolean((etat as { valide?: unknown } | null)?.valide);

  const requis = bloc.champs.filter((champ) => !champ.facultatif);
  const renseignes = requis.filter(
    (champ) => (valeurs[champ.id] ?? "").trim().length > 0,
  ).length;
  const pret = renseignes === requis.length;

  function enregistrer(suivant: EtatExercice) {
    setEtat(suivant);
    if (bloc.alimenteRestitution) setBrouillon(suivant.valeurs);
  }

  function modifier(id: string, valeur: string) {
    enregistrer({ valeurs: { ...valeurs, [id]: valeur }, valide });
  }

  function valider() {
    if (!pret) return;
    enregistrer({ valeurs, valide: true });
  }

  function recommencer() {
    enregistrer(ETAT_INITIAL);
  }

  const texteCopie = bloc.champs
    .map((champ) => `${champ.libelle} : ${(valeurs[champ.id] ?? "").trim()}`)
    .join("\n");

  return (
    <section
      aria-labelledby={idTitre}
      className={[
        "rounded-lg border bg-craie p-5 sm:p-6",
        valide ? "border-vert-trait" : "border-trait",
      ].join(" ")}
    >
      {/* En-tête */}
      <header>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center rounded-full bg-accent-voile px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide text-accent-fort uppercase">
              Exercice
            </span>
            {bloc.duree ? (
              <span className="text-xs text-graphite tabular-nums">
                {bloc.duree}
              </span>
            ) : null}
          </div>
          {valide ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-vert-trait bg-vert-voile px-2.5 py-0.5 text-xs font-medium text-vert">
              <IconeCoche />
              Fait
            </span>
          ) : (
            <span className="text-xs text-estompe tabular-nums">
              {renseignes} / {requis.length} champ{requis.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <h3
          id={idTitre}
          className="mt-3 font-serif text-xl font-semibold text-encre"
        >
          {bloc.titre}
        </h3>
        <p className="mt-2 leading-relaxed text-encre-clair">{bloc.consigne}</p>

        {bloc.etapes && bloc.etapes.length > 0 ? (
          <ol className="mt-4 space-y-2">
            {bloc.etapes.map((etape, rang) => (
              <li key={rang} className="flex gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-voile font-mono text-[0.7rem] text-graphite"
                >
                  {rang + 1}
                </span>
                <span className="leading-relaxed text-encre-clair">{etape}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </header>

      {/* Champs */}
      <div className="mt-6 space-y-6 border-t border-trait pt-6">
        {bloc.champs.map((champ) => (
          <Champ
            key={champ.id}
            champ={champ}
            valeur={valeurs[champ.id] ?? ""}
            onChange={(valeur) => modifier(champ.id, valeur)}
            id={`${base}-${champ.id}`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="sans-impression mt-6 flex flex-wrap items-center gap-3">
        {valide ? (
          <>
            <BoutonCopier texte={texteCopie} libelle="Copier mes réponses" />
            <button
              type="button"
              onClick={recommencer}
              className="rounded-md px-2 py-1 text-xs font-medium text-graphite underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              Recommencer
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={valider}
            disabled={!pret}
            className="rounded-md bg-encre px-4 py-2 text-sm font-medium text-papier transition-colors hover:bg-encre-clair disabled:cursor-not-allowed disabled:opacity-40"
          >
            Valider mes réponses
          </button>
        )}
        {!valide && !pret ? (
          <span className="text-xs text-estompe">
            Renseignez les champs pour afficher le retour de la formation.
          </span>
        ) : null}
      </div>

      {/* Retour de la formation */}
      {valide ? (
        <div
          role="status"
          className="mt-5 rounded-md border border-accent bg-accent-voile p-4"
        >
          <p className="text-[0.7rem] font-semibold tracking-wide text-accent-fort uppercase">
            {bloc.retour.titre ?? "Retour de la formation"}
          </p>
          <p className="mt-1.5 leading-relaxed text-encre">{bloc.retour.texte}</p>
          {bloc.retour.points && bloc.retour.points.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {bloc.retour.points.map((point, rang) => (
                <li key={rang} className="flex gap-2.5 text-sm text-encre-clair">
                  <span
                    aria-hidden="true"
                    className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {bloc.suite ? (
            <Link
              href={bloc.suite.href}
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-accent bg-craie px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-craie"
            >
              {bloc.suite.libelle}
              <IconeFleche />
            </Link>
          ) : null}
        </div>
      ) : null}

      <p className="mt-4 text-xs text-estompe">
        Vos réponses restent dans ce navigateur : rien n’est transmis.
      </p>
    </section>
  );
}
