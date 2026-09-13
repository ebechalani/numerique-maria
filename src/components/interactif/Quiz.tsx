"use client";

import type { Bloc } from "@/content/types";
import { useEtatLocal } from "@/lib/progression";

type BlocQuiz = Extract<Bloc, { type: "quiz" }>;

/** Réponses données par le participant, indexées par le rang de l’affirmation. */
type Reponses = Record<string, boolean | undefined>;

/** Référence stable : évite de repasser un nouvel objet au hook à chaque rendu. */
const AUCUNE_REPONSE: Reponses = {};

/** État visuel d’un bouton une fois la réponse figée. */
type EtatBouton = "neutre" | "bonne" | "mauvaise" | "eteinte";

const CLASSES_BOUTON: Record<EtatBouton, string> = {
  neutre:
    "border-trait-fort bg-craie text-encre hover:border-accent hover:bg-accent-voile hover:text-accent",
  bonne: "border-vert bg-vert-voile text-vert",
  mauvaise: "border-rouge bg-rouge-voile text-rouge",
  eteinte: "border-trait bg-voile text-estompe",
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

function BarreProgression({
  fait,
  total,
  texte,
  libelle,
}: {
  fait: number;
  total: number;
  texte: string;
  libelle: string;
}) {
  const pourcentage = total > 0 ? Math.round((fait / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label={libelle}
        aria-valuemin={0}
        aria-valuemax={Math.max(total, 1)}
        aria-valuenow={fait}
        aria-valuetext={texte}
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
        {texte}
      </span>
    </div>
  );
}

export default function Quiz({ bloc }: { bloc: BlocQuiz }) {
  const [reponses, setReponses] = useEtatLocal<Reponses>(
    `quiz:${bloc.id}`,
    AUCUNE_REPONSE,
  );

  const total = bloc.items.length;
  const repondues = bloc.items.filter(
    (_, rang) => reponses[String(rang)] !== undefined,
  ).length;
  const justes = bloc.items.filter(
    (item, rang) => reponses[String(rang)] === item.reponse,
  ).length;
  const termine = total > 0 && repondues === total;

  function repondre(rang: number, valeur: boolean) {
    // La réponse est figée : un second clic ne change rien.
    if (reponses[String(rang)] !== undefined) return;
    setReponses({ ...reponses, [String(rang)]: valeur });
  }

  function recommencer() {
    setReponses({});
  }

  return (
    <section aria-label="Quiz vrai ou faux" className="space-y-4">
      <header className="space-y-3">
        <p className="text-encre-clair">{bloc.consigne}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="min-w-40 flex-1">
            <BarreProgression
              fait={repondues}
              total={total}
              texte={`${repondues} / ${total} répondues`}
              libelle="Affirmations traitées"
            />
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
        {bloc.items.map((item, rang) => {
          const reponse = reponses[String(rang)];
          const repondu = reponse !== undefined;
          const juste = reponse === item.reponse;

          const etatDe = (valeur: boolean): EtatBouton => {
            if (!repondu) return "neutre";
            if (valeur === item.reponse) return "bonne";
            if (valeur === reponse) return "mauvaise";
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
                  <p className="text-encre">{item.affirmation}</p>

                  <div className="flex flex-wrap gap-2">
                    {[true, false].map((valeur) => {
                      const etat = etatDe(valeur);
                      const choisi = repondu && reponse === valeur;
                      return (
                        <button
                          key={valeur ? "vrai" : "faux"}
                          type="button"
                          onClick={() => repondre(rang, valeur)}
                          aria-pressed={choisi}
                          aria-disabled={repondu}
                          className={[
                            "inline-flex min-w-24 items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors duration-150",
                            CLASSES_BOUTON[etat],
                            choisi ? "font-semibold" : "font-medium",
                            repondu ? "cursor-default" : "cursor-pointer",
                          ].join(" ")}
                        >
                          {valeur ? "Vrai" : "Faux"}
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
                        {juste ? "Bonne réponse" : "Réponse inexacte"}
                        {" — la bonne réponse est « "}
                        {item.reponse ? "Vrai" : "Faux"}
                        {" »."}
                      </p>
                      <p className="mt-1 text-graphite">{item.explication}</p>
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
