"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import BarreProgression from "@/components/BarreProgression";
import { useProgression } from "@/lib/progression";

interface EntreeModule {
  slug: string;
  numero: number;
  titre: string;
  /** Durée en minutes. */
  duree: number;
}

interface EntreeRessource {
  slug: string;
  titre: string;
  /** Nom d’icône libre, interprété ci-dessous. */
  icone: string;
}

interface Props {
  formationSlug: string;
  formationTitre: string;
  /** « Eddy Bachaalany, référent numérique » — affiché sous le titre. */
  formateur?: string;
  modules: EntreeModule[];
  ressources: EntreeRessource[];
  /** Slug du module ou de la ressource affichée. */
  actif?: string;
}

/* ------------------------------------------------------------------ */
/* Icônes des ressources — SVG inline, trait 1.5, currentColor         */
/* ------------------------------------------------------------------ */

function IconeRessource({ nom }: { nom: string }) {
  const commun = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "h-4 w-4 shrink-0",
  };

  switch (nom) {
    case "faq":
    case "question":
    case "aide":
      return (
        <svg {...commun}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.6 9.2a2.5 2.5 0 1 1 3.1 2.4c-.6.2-1 .8-1 1.4v.5" />
          <path d="M11.7 16.8h.01" />
        </svg>
      );
    case "requete":
    case "requetes":
    case "terminal":
      return (
        <svg {...commun}>
          <rect x="3" y="4.5" width="18" height="15" rx="2" />
          <path d="M7.5 10l2.5 2.5-2.5 2.5" />
          <path d="M12.5 15h4" />
        </svg>
      );
    case "checklist":
    case "liste":
    case "memo":
      return (
        <svg {...commun}>
          <path d="M10 6.5h10M10 12h10M10 17.5h10" />
          <path d="M4 6.5l1 1 2-2M4 12l1 1 2-2M4 17.5l1 1 2-2" />
        </svg>
      );
    case "outils":
    case "boite":
      return (
        <svg {...commun}>
          <path d="M3 8.5h18V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5Z" />
          <path d="M3 8.5 5 4.5h14l2 4" />
          <path d="M12 4.5V20" />
        </svg>
      );
    case "charte":
    case "regle":
    case "bouclier":
      return (
        <svg {...commun}>
          <path d="M12 3.5l7 2.6V12c0 4.3-2.9 7.2-7 8.5-4.1-1.3-7-4.2-7-8.5V6.1l7-2.6Z" />
        </svg>
      );
    case "animateur":
    case "deroule":
    case "programme":
    case "horloge":
      return (
        <svg {...commun}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5.3l3.2 1.9" />
        </svg>
      );
    case "livre":
    case "bibliotheque":
      return (
        <svg {...commun}>
          <path d="M4.5 5.5A2 2 0 0 1 6.5 3.5H19v17H6.5a2 2 0 0 1-2-2v-13Z" />
          <path d="M4.5 17h14" />
        </svg>
      );
    case "lien":
    case "externe":
      return (
        <svg {...commun}>
          <path d="M14 4h6v6" />
          <path d="M20 4l-8.5 8.5" />
          <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        </svg>
      );
    default:
      // Document — icône par défaut.
      return (
        <svg {...commun}>
          <path d="M6.5 3.5h7l4.5 4.5V20a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z" />
          <path d="M13.5 3.5V8H18" />
          <path d="M9 12.5h6M9 16h4" />
        </svg>
      );
  }
}

/** Coche discrète des modules terminés. */
function Coche() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0 text-vert"
    >
      <path d="M4 10.5 7.5 14l8-8.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Sommaire                                                            */
/* ------------------------------------------------------------------ */

/**
 * Sommaire latéral d’une formation : progression, modules et ressources.
 * Rendu en deux variantes — un <details> repliable en dessous de lg, un <nav>
 * fixe à partir de lg — car l’ouverture d’un <details> ne se pilote pas en CSS.
 */
export default function NavModules({
  formationSlug,
  formationTitre,
  formateur,
  modules,
  ressources,
  actif,
}: Props) {
  const { estTermine, pret } = useProgression();
  const slugs = modules.map((module) => module.slug);

  const classeEntree = (estActif: boolean) =>
    `flex items-start gap-2.5 border-l-2 py-2 pl-3 pr-2 text-sm transition-colors ${
      estActif
        ? "border-accent bg-accent-voile font-medium text-accent-fort"
        : "border-transparent text-graphite hover:border-trait-fort hover:bg-voile hover:text-encre"
    }`;

  const contenu: ReactNode = (
    <>
      <Link
        href={`/formations/${formationSlug}`}
        className="block font-serif text-base leading-snug text-encre transition-colors hover:text-accent"
      >
        {formationTitre}
      </Link>
      {formateur ? (
        <p className="mt-1 text-xs text-estompe">Animée par {formateur}</p>
      ) : null}

      <div className="mt-3">
        <BarreProgression formationSlug={formationSlug} slugs={slugs} />
      </div>

      <h2 className="mt-5 mb-1 text-xs font-medium tracking-wide text-estompe uppercase">
        Modules
      </h2>
      <ul>
        {modules.map((module) => {
          const estActif = module.slug === actif;
          const termine = pret && estTermine(formationSlug, module.slug);
          return (
            <li key={module.slug}>
              <Link
                href={`/formations/${formationSlug}/${module.slug}`}
                aria-current={estActif ? "page" : undefined}
                className={classeEntree(estActif)}
              >
                <span
                  aria-hidden="true"
                  className={`mt-px w-4 shrink-0 text-right text-xs tabular-nums ${
                    estActif ? "text-accent" : "text-estompe"
                  }`}
                >
                  {module.numero}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block leading-snug">{module.titre}</span>
                  <span className="mt-0.5 block text-xs text-estompe">
                    {module.duree} min
                  </span>
                </span>
                {termine ? (
                  <span className="mt-0.5">
                    <Coche />
                    <span className="sr-only">Module terminé</span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      {ressources.length > 0 ? (
        <>
          <h2 className="mt-5 mb-1 text-xs font-medium tracking-wide text-estompe uppercase">
            Ressources
          </h2>
          <ul>
            {ressources.map((ressource) => {
              const estActif = ressource.slug === actif;
              return (
                <li key={ressource.slug}>
                  <Link
                    href={`/formations/${formationSlug}/ressources/${ressource.slug}`}
                    aria-current={estActif ? "page" : undefined}
                    className={classeEntree(estActif)}
                  >
                    <span
                      className={`mt-0.5 ${
                        estActif ? "text-accent" : "text-estompe"
                      }`}
                    >
                      <IconeRessource nom={ressource.icone} />
                    </span>
                    <span className="min-w-0 flex-1 leading-snug">
                      {ressource.titre}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </>
  );

  return (
    <>
      {/* Sous lg : sommaire repliable */}
      <details className="group sans-impression rounded-lg border border-trait bg-craie lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-encre [&::-webkit-details-marker]:hidden">
          Sommaire de la formation
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-graphite transition-transform group-open:rotate-180"
          >
            <path d="M6 9.5l6 6 6-6" />
          </svg>
        </summary>
        <div className="border-t border-trait px-4 pt-3 pb-4">{contenu}</div>
      </details>

      {/* À partir de lg : sommaire latéral permanent */}
      <nav
        aria-label="Sommaire de la formation"
        className="sans-impression hidden lg:sticky lg:top-20 lg:block lg:rounded-lg lg:border lg:border-trait lg:bg-craie lg:p-4"
      >
        {contenu}
      </nav>
    </>
  );
}
