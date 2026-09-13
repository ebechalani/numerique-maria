"use client";

import type { Bloc } from "@/content/types";
import { useEtatLocal } from "@/lib/progression";

type BlocQcm = Extract<Bloc, { type: "qcm" }>;

/** Rang de l’option choisie, indexé par le rang de la question. */
type Reponses = Record<string, number | undefined>;

/** Référence stable : évite de repasser un nouvel objet au hook à chaque rendu. */
const AUCUNE_REPONSE: Reponses = {};

const LETTRES = "ABCDEFGH";

/** État visuel d’une option une fois la réponse figée. */
type EtatOption = "neutre" | "bonne" | "mauvaise" | "eteinte";

const CLASSES_OPTION: Record<EtatOption, string> = {
  neutre:
    "border-trait-fort bg-papier text-encre hover:border-accent hover:bg-accent-voile",
  bonne: "border-vert bg-vert-voile text-vert",
  mauvaise: "border-rouge bg-rouge-voile text-rouge",
  eteinte: "border-trait bg-voile text-estompe",
};

const CLASSES_LETTRE: Record<EtatOption, string> = {
  neutre: "border-trait-fort bg-craie text-graphite",
  bonne: "border-vert bg-vert text-craie",
  mauvaise: "border-rouge bg-rouge text-craie",
  eteinte: "border-trait bg-craie text-estompe",
};

function IconeJuste() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <path d="M4 10.5 8 14.5 16 5.5" />
    </svg>
  );
}

function IconeFausse() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <path d="M5.5 5.5 14.5 14.5" />
      <path d="M14.5 5.5 5.5 14.5" />
    </svg>
  );
}

/** Le stockage peut contenir n’importe quoi : on ne lit que des entiers. */
function rangChoisi(reponses: Reponses, rang: number): number | undefined {
  const valeur = reponses?.[String(rang)];
  return typeof valeur === "number" && Number.isInteger(valeur)
    ? valeur
    : undefined;
}

/**
 * Questionnaire à choix unique. La réponse est figée au premier clic, le
 * corrigé apparaît aussitôt, le bilan une fois toutes les questions traitées.
 */
export default function Qcm({ bloc }: { bloc: BlocQcm }) {
  const [reponses, setReponses] = useEtatLocal<Reponses>(
    `qcm:${bloc.id}`,
    AUCUNE_REPONSE,
  );

  const total = bloc.questions.length;
  const repondues = bloc.questions.filter(
    (_, rang) => rangChoisi(reponses, rang) !== undefined,
  ).length;
  const justes = bloc.questions.filter(
    (question, rang) => rangChoisi(reponses, rang) === question.bonne,
  ).length;
  const termine = total > 0 && repondues === total;
  const pourcentage = total > 0 ? Math.round((repondues / total) * 100) : 0;

  function repondre(rang: number, option: number) {
    if (rangChoisi(reponses, rang) !== undefined) return;
    setReponses({ ...reponses, [String(rang)]: option });
  }

  function recommencer() {
    setReponses({});
  }

  return (
    <section aria-label="Questionnaire à choix unique" className="space-y-4">
      <header className="space-y-3">
        <p className="text-encre-clair">{bloc.consigne}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex min-w-40 flex-1 items-center gap-3">
            <div
              role="progressbar"
              aria-label="Questions traitées"
              aria-valuemin={0}
              aria-valuemax={Math.max(total, 1)}
              aria-valuenow={repondues}
              aria-valuetext={`${repondues} sur ${total}`}
              className="h-1 min-w-16 flex-1 overflow-hidden rounded-full bg-voile"
            >
              <div
                className="h-full rounded-full bg-accent transition-all duration-150"
                style={{ width: `${pourcentage}%` }}
              />
            </div>
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-xs tabular-nums text-graphite"
            >
              {repondues} / {total} répondues
            </span>
          </div>
          {repondues > 0 && !termine ? (
            <button
              type="button"
              onClick={recommencer}
              className="sans-impression shrink-0 rounded-md px-2 py-1 text-xs font-medium text-graphite underline-offset-4 transition-colors duration-150 hover:text-accent hover:underline"
            >
              Recommencer
            </button>
          ) : null}
        </div>
      </header>

      <ol className="space-y-3">
        {bloc.questions.map((question, rang) => {
          const choisi = rangChoisi(reponses, rang);
          const repondu = choisi !== undefined;
          const juste = choisi === question.bonne;

          const etatDe = (option: number): EtatOption => {
            if (!repondu) return "neutre";
            if (option === question.bonne) return "bonne";
            if (option === choisi) return "mauvaise";
            return "eteinte";
          };

          return (
            <li
              key={rang}
              className="rounded-lg border border-trait bg-craie p-4 sm:p-5"
            >
              <div className="flex gap-3 sm:gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-trait bg-voile font-mono text-xs text-graphite"
                >
                  {rang + 1}
                </span>

                <div className="min-w-0 flex-1 space-y-3">
                  <p className="text-encre">{question.question}</p>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {question.options.map((option, rangOption) => {
                      const etat = etatDe(rangOption);
                      const estChoisi = repondu && choisi === rangOption;
                      return (
                        <button
                          key={rangOption}
                          type="button"
                          onClick={() => repondre(rang, rangOption)}
                          aria-pressed={estChoisi}
                          aria-disabled={repondu}
                          className={[
                            "flex items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors duration-150",
                            CLASSES_OPTION[etat],
                            estChoisi ? "font-semibold" : "font-medium",
                            repondu ? "cursor-default" : "cursor-pointer",
                          ].join(" ")}
                        >
                          <span
                            aria-hidden="true"
                            className={[
                              "mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[0.7rem]",
                              CLASSES_LETTRE[etat],
                            ].join(" ")}
                          >
                            {LETTRES[rangOption] ?? rangOption + 1}
                          </span>
                          <span className="min-w-0 flex-1 leading-snug">
                            {option}
                          </span>
                          {etat === "bonne" ? <IconeJuste /> : null}
                          {etat === "mauvaise" ? <IconeFausse /> : null}
                        </button>
                      );
                    })}
                  </div>

                  {repondu ? (
                    <div
                      role="status"
                      className={[
                        "rounded-md border p-3 text-sm",
                        juste
                          ? "border-vert-trait bg-vert-voile"
                          : "border-rouge-trait bg-rouge-voile",
                      ].join(" ")}
                    >
                      <p
                        className={
                          juste
                            ? "font-semibold text-vert"
                            : "font-semibold text-rouge"
                        }
                      >
                        {juste
                          ? "Bonne réponse."
                          : `Réponse inexacte — la bonne réponse est « ${question.options[question.bonne]} ».`}
                      </p>
                      <p className="mt-1 text-graphite">{question.explication}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {termine ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent bg-accent-voile p-4"
        >
          <p className="font-serif text-base text-encre">
            {justes} bonne{justes > 1 ? "s" : ""} réponse
            {justes > 1 ? "s" : ""} sur {total}.
          </p>
          <button
            type="button"
            onClick={recommencer}
            className="sans-impression shrink-0 cursor-pointer rounded-md border border-trait-fort bg-craie px-3 py-1.5 text-sm font-medium text-encre transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            Recommencer
          </button>
        </div>
      ) : null}
    </section>
  );
}
