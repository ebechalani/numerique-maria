"use client";

import type { Bloc } from "@/content/types";
import { useEtatLocal } from "@/lib/progression";

type BlocChecklist = Extract<Bloc, { type: "checklist" }>;

/** Cases cochées, indexées par le rang de l’item. */
type Cochees = Record<string, boolean | undefined>;

/** Référence stable : évite de repasser un nouvel objet au hook à chaque rendu. */
const AUCUNE_COCHE: Cochees = {};

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

export default function Checklist({ bloc }: { bloc: BlocChecklist }) {
  const [cochees, setCochees] = useEtatLocal<Cochees>(
    `checklist:${bloc.id}`,
    AUCUNE_COCHE,
  );

  const total = bloc.items.length;
  const faites = bloc.items.filter(
    (_, rang) => cochees[String(rang)] === true,
  ).length;
  const pourcentage = total > 0 ? Math.round((faites / total) * 100) : 0;
  const texteProgression = `${faites} / ${total}`;

  function basculer(rang: number, valeur: boolean) {
    setCochees({ ...cochees, [String(rang)]: valeur });
  }

  function toutDecocher() {
    setCochees({});
  }

  return (
    <section aria-label="Liste de vérification" className="space-y-4">
      <header className="space-y-3">
        {bloc.consigne ? (
          <p className="text-encre-clair">{bloc.consigne}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex min-w-40 flex-1 items-center gap-3">
            <div
              role="progressbar"
              aria-label="Points vérifiés"
              aria-valuemin={0}
              aria-valuemax={Math.max(total, 1)}
              aria-valuenow={faites}
              aria-valuetext={`${faites} sur ${total}`}
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
              {texteProgression}
            </span>
          </div>

          <button
            type="button"
            onClick={toutDecocher}
            disabled={faites === 0}
            className="sans-impression shrink-0 cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-graphite underline-offset-4 transition-colors duration-150 hover:text-accent hover:underline disabled:cursor-default disabled:text-estompe disabled:no-underline disabled:hover:text-estompe"
          >
            Tout décocher
          </button>
        </div>
      </header>

      <ul className="space-y-2">
        {bloc.items.map((item, rang) => {
          const coche = cochees[String(rang)] === true;

          return (
            <li key={rang}>
              <label
                className={[
                  "flex cursor-pointer items-start gap-3 rounded-lg border bg-craie p-4 transition-colors duration-150",
                  coche
                    ? "border-vert-trait"
                    : "border-trait hover:border-trait-fort",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={coche}
                  onChange={(evenement) =>
                    basculer(rang, evenement.target.checked)
                  }
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={[
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors duration-150",
                    coche
                      ? "border-vert bg-vert text-craie"
                      : "border-trait-fort bg-craie text-craie",
                    "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
                  ].join(" ")}
                >
                  {coche ? <IconeCoche /> : null}
                </span>

                <span
                  className={[
                    "min-w-0 flex-1 transition-colors duration-150",
                    coche ? "text-graphite" : "text-encre",
                  ].join(" ")}
                >
                  <span className="block font-semibold">{item.titre}</span>
                  <span className="mt-1 block text-sm text-graphite">
                    {item.texte}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
