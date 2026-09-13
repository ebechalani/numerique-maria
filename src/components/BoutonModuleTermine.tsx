"use client";

import { useProgression } from "@/lib/progression";

interface Props {
  formationSlug: string;
  moduleSlug: string;
}

/**
 * Bouton de fin de module : marque le module comme terminé, et permet de
 * revenir en arrière. Tant que la progression n’est pas hydratée, le bouton
 * est rendu dans son état non coché et sans interactivité, pour éviter le
 * clignotement.
 */
export default function BoutonModuleTermine({
  formationSlug,
  moduleSlug,
}: Props) {
  const { estTermine, basculer, pret } = useProgression();
  const termine = pret && estTermine(formationSlug, moduleSlug);

  return (
    <div className="sans-impression mt-10 border-t border-trait pt-6">
      <button
        type="button"
        disabled={!pret}
        aria-pressed={termine}
        onClick={() => basculer(formationSlug, moduleSlug)}
        className={`flex w-full items-center justify-center gap-3 rounded-lg border px-5 py-4 text-base font-medium transition-colors disabled:cursor-default ${
          termine
            ? "border-vert-trait bg-vert-voile text-vert hover:bg-craie"
            : "border-trait-fort bg-craie text-encre hover:border-accent hover:bg-accent-voile hover:text-accent-fort"
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
            termine ? "border-vert bg-vert text-craie" : "border-trait-fort"
          }`}
        >
          {termine ? (
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
            >
              <path d="M4.5 10.5 8 14l7.5-8" />
            </svg>
          ) : null}
        </span>
        {termine ? "Module terminé" : "Marquer ce module comme terminé"}
      </button>

      <p className="mt-2 text-center text-xs text-estompe">
        {termine
          ? "Cliquez de nouveau pour retirer la coche."
          : "Votre progression est enregistrée dans ce navigateur uniquement."}
      </p>
    </div>
  );
}
