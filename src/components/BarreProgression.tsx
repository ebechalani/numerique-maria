"use client";

import { useProgression } from "@/lib/progression";

interface Props {
  formationSlug: string;
  /** Slugs des modules comptés dans la progression. */
  slugs: string[];
  /** Version réduite : la barre et « 3/7 », sans libellé complet. */
  compact?: boolean;
}

/**
 * Barre de progression d’une formation.
 * Tant que la progression n’est pas hydratée (`pret` faux), la barre est rendue
 * vide et sans valeur annoncée : même gabarit, aucun écart serveur/client.
 */
export default function BarreProgression({
  formationSlug,
  slugs,
  compact = false,
}: Props) {
  const { nombreTermines, pret } = useProgression();

  const total = slugs.length;
  const termines = pret ? nombreTermines(formationSlug, slugs) : 0;
  const pourcentage = total > 0 ? (termines / total) * 100 : 0;
  const pluriel = total > 1 ? "s" : "";

  const libelle = `${termines} / ${total} module${pluriel} terminé${pluriel}`;

  const barre = (
    <div
      role="progressbar"
      aria-label={`Progression de la formation : ${libelle}`}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={pret ? termines : undefined}
      aria-valuetext={pret ? libelle : undefined}
      aria-busy={pret ? undefined : true}
      className={`h-1.5 w-full overflow-hidden rounded-full bg-trait ${
        compact ? "min-w-16 flex-1" : ""
      }`}
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-300"
        style={{ width: `${pourcentage}%` }}
      />
    </div>
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {barre}
        <span className="shrink-0 text-xs tabular-nums text-graphite">
          {pret ? `${termines}/${total}` : `—/${total}`}
        </span>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-1.5 text-xs text-graphite">
        {pret ? (
          libelle
        ) : (
          <span className="text-estompe">
            — / {total} module{pluriel} terminé{pluriel}
          </span>
        )}
      </p>
      {barre}
    </div>
  );
}
