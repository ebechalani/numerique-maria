"use client";

/**
 * Bilan des exercices d’un module, affiché sous l’en-tête : ce qu’il y a à
 * faire, ce qui est déjà fait, avec un lien vers chaque exercice.
 *
 * L’état est lu dans le même stockage que les composants interactifs : cocher
 * une case ou valider un exercice met le bilan à jour immédiatement.
 */

import { useId } from "react";

import { estFait, type ItemBilan } from "@/lib/exercices";
import { useHydrate, useInstantaneDerive } from "@/lib/progression";

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
      className="h-3 w-3"
    >
      <path d="M4 10.5 8 14.5 16 5.5" />
    </svg>
  );
}

export default function BilanExercices({ items }: { items: ItemBilan[] }) {
  const idTitre = useId();
  const pret = useHydrate();

  /*
   * Un seul abonnement pour toutes les clés : le dérivé est une chaîne de
   * « 0 » et « 1 », stable par valeur, ce qu’exige useSyncExternalStore.
   */
  const drapeaux = useInstantaneDerive(
    items.map((item) => item.cle),
    (valeurs) =>
      valeurs.map((valeur, rang) => (estFait(items[rang], valeur) ? "1" : "0")).join(""),
  );

  const total = items.length;
  const faits = pret ? drapeaux.split("").filter((d) => d === "1").length : 0;
  const tousFaits = pret && total > 0 && faits === total;

  return (
    <section
      aria-labelledby={idTitre}
      className={[
        "rounded-lg border p-5",
        tousFaits ? "border-vert-trait bg-vert-voile" : "border-trait bg-voile",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          id={idTitre}
          className="text-xs font-medium tracking-wide text-estompe uppercase"
        >
          À faire dans ce module
        </h2>
        <p
          aria-live="polite"
          className="font-mono text-xs text-graphite tabular-nums"
        >
          {pret ? `${faits} / ${total}` : `${total}`}{" "}
          {total > 1 ? "exercices" : "exercice"}
          {pret && tousFaits ? " — tout est fait" : ""}
        </p>
      </div>

      <ol className="mt-3 space-y-1.5">
        {items.map((item, rang) => {
          const fait = pret && drapeaux[rang] === "1";
          return (
            <li key={item.cle}>
              <a
                href={`#${item.ancre}`}
                className="group flex items-start gap-3 rounded-md px-2 py-1.5 -mx-2 transition-colors hover:bg-craie"
              >
                <span
                  aria-hidden="true"
                  className={[
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    fait
                      ? "border-vert bg-vert text-craie"
                      : "border-trait-fort bg-craie",
                  ].join(" ")}
                >
                  {fait ? <IconeCoche /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={[
                      "block text-sm leading-snug transition-colors group-hover:text-accent",
                      fait ? "text-graphite" : "text-encre",
                    ].join(" ")}
                  >
                    {item.libelle}
                  </span>
                  <span className="mt-0.5 block text-xs text-estompe">
                    {item.nature}
                    {fait ? " · fait" : ""}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
