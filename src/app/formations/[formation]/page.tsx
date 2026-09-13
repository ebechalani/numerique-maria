import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BarreProgression from "@/components/BarreProgression";
import { exercicesDuModule } from "@/lib/exercices";
import { formations, getFormation } from "@/lib/formations";

interface Props {
  params: Promise<{ formation: string }>;
}

export function generateStaticParams() {
  return formations.map((formation) => ({ formation: formation.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { formation: slug } = await params;
  const formation = getFormation(slug);

  if (!formation) return { title: "Formation introuvable" };

  return {
    title: formation.titre,
    description: formation.accroche,
  };
}

/* ------------------------------------------------------------------ */
/* Éléments graphiques                                                 */
/* ------------------------------------------------------------------ */

/** Point médian de séparation, purement décoratif. */
function Point() {
  return (
    <span aria-hidden="true" className="text-trait-fort">
      ·
    </span>
  );
}

function Fleche({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`h-5 w-5 shrink-0 ${className}`}
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/** Case à cocher dessinée — décor de la check-list de préparation. */
function Case() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 h-5 w-5 shrink-0 text-trait-fort"
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
    </svg>
  );
}

/** Coche pleine — décor de la liste « ce que vous emportez ». */
function Coche() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 h-5 w-5 shrink-0 text-accent"
    >
      <path d="M5 12.5 9.5 17 19 7" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function PageFormation({ params }: Props) {
  const { formation: slug } = await params;
  const formation = getFormation(slug);

  if (!formation) notFound();

  const slugsModules = formation.modules.map((module) => module.slug);
  const premierModule = formation.modules[0];
  const lienPremierModule = premierModule
    ? `/formations/${formation.slug}/${premierModule.slug}`
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      {/* ---------------------------------------------------------- */}
      {/* En-tête                                                     */}
      {/* ---------------------------------------------------------- */}
      <header>
        <p className="text-sm text-accent">{formation.sousTitre}</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight text-encre sm:text-5xl">
          {formation.titre}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-graphite">
          {formation.accroche}
        </p>

        <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-graphite">
          <span>{formation.etablissement}</span>
          <Point />
          <span>{formation.public}</span>
          <Point />
          <span>{formation.duree}</span>
          <Point />
          <span>{formation.session}</span>
        </p>

        <p className="mt-3 text-sm text-graphite">
          Animée par {formation.formateur.nom}, {formation.formateur.role}
          <span aria-hidden="true" className="mx-1.5 text-trait-fort">
            ·
          </span>
          <a
            href={`mailto:${formation.formateur.email}`}
            className="break-words text-accent underline decoration-trait-fort underline-offset-2 transition-colors hover:text-accent-fort"
          >
            {formation.formateur.email}
          </a>
        </p>

        {lienPremierModule ? (
          <p className="mt-8">
            <Link
              href={lienPremierModule}
              className="group inline-flex items-center gap-2.5 rounded-lg bg-accent px-6 py-3.5 text-base font-medium text-craie transition-colors hover:bg-accent-fort"
            >
              Commencer la formation
              <Fleche className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </p>
        ) : null}
      </header>

      {/* ---------------------------------------------------------- */}
      {/* Objectifs                                                   */}
      {/* ---------------------------------------------------------- */}
      <section aria-labelledby="titre-objectifs" className="mt-14 sm:mt-16">
        <h2
          id="titre-objectifs"
          className="font-serif text-2xl text-encre sm:text-3xl"
        >
          À la fin de la session, vous saurez…
        </h2>

        <ul className="mt-6 grid gap-5 sm:grid-cols-2">
          {formation.objectifs.map((objectif) => (
            <li
              key={objectif.numero}
              className="rounded-lg border border-trait bg-craie p-5"
            >
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent text-sm tabular-nums text-accent"
              >
                {objectif.numero}
              </span>
              <h3 className="mt-3 font-serif text-lg leading-snug text-encre">
                {objectif.titre}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-graphite">
                {objectif.texte}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Ce que vous emportez · Avant de commencer                   */}
      {/* ---------------------------------------------------------- */}
      <div className="mt-14 grid gap-10 sm:mt-16 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="titre-emporte">
          <h2
            id="titre-emporte"
            className="font-serif text-2xl text-encre sm:text-3xl"
          >
            Ce que vous emportez
          </h2>
          <ul className="mt-5 space-y-3">
            {formation.emporte.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Coche />
                <span className="leading-relaxed text-graphite">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titre-prerequis">
          <h2
            id="titre-prerequis"
            className="font-serif text-2xl text-encre sm:text-3xl"
          >
            Avant de commencer
          </h2>
          <p className="mt-2 text-sm text-graphite">
            À préparer avant d’arriver en salle.
          </p>
          <ul className="mt-5 divide-y divide-trait rounded-lg border border-trait bg-craie">
            {formation.prerequis.map((prerequis) => (
              <li key={prerequis.titre} className="flex items-start gap-3 p-4">
                <Case />
                <span className="min-w-0">
                  <span className="block font-medium text-encre">
                    {prerequis.titre}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-graphite">
                    {prerequis.texte}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Programme                                                   */}
      {/* ---------------------------------------------------------- */}
      <section aria-labelledby="titre-programme" className="mt-14 sm:mt-16">
        <h2
          id="titre-programme"
          className="font-serif text-2xl text-encre sm:text-3xl"
        >
          Le programme
        </h2>

        <div className="mt-5 overflow-x-auto rounded-lg border border-trait bg-craie">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Déroulé horaire de la formation {formation.titre}
            </caption>
            <thead>
              <tr className="border-b border-trait bg-voile">
                <th
                  scope="col"
                  className="px-4 py-3 font-medium tracking-wide text-estompe uppercase"
                >
                  Horaire
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-medium tracking-wide text-estompe uppercase"
                >
                  Séquence
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-medium tracking-wide text-estompe uppercase"
                >
                  Durée
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-trait">
              {formation.programme.map((ligne) => (
                <tr key={`${ligne.horaire}-${ligne.titre}`}>
                  <td className="px-4 py-3 font-mono text-xs tabular-nums whitespace-nowrap text-graphite">
                    {ligne.horaire}
                  </td>
                  <td className="px-4 py-3">
                    {ligne.moduleSlug ? (
                      <Link
                        href={`/formations/${formation.slug}/${ligne.moduleSlug}`}
                        className="font-medium text-encre underline decoration-trait-fort underline-offset-2 transition-colors hover:text-accent"
                      >
                        {ligne.titre}
                      </Link>
                    ) : (
                      <span className="text-estompe">{ligne.titre}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-graphite tabular-nums">
                    {ligne.duree}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Modules                                                     */}
      {/* ---------------------------------------------------------- */}
      <section aria-labelledby="titre-modules" className="mt-14 sm:mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2
            id="titre-modules"
            className="font-serif text-2xl text-encre sm:text-3xl"
          >
            Les modules
          </h2>
          <div className="w-full max-w-xs sans-impression">
            <BarreProgression
              formationSlug={formation.slug}
              slugs={slugsModules}
            />
          </div>
        </div>

        <ul className="mt-6 space-y-4">
          {formation.modules.map((module) => {
            const nbExercices = exercicesDuModule(module.blocs).length;
            return (
            <li key={module.slug}>
              <Link
                href={`/formations/${formation.slug}/${module.slug}`}
                className="group flex items-start gap-4 rounded-lg border border-trait bg-craie p-5 transition-colors hover:border-accent hover:bg-accent-voile sm:gap-5"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-trait-fort font-mono text-sm tabular-nums text-graphite transition-colors group-hover:border-accent group-hover:text-accent"
                >
                  {module.numero}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-serif text-xl leading-snug text-encre">
                      {module.titre}
                    </span>
                    <span className="text-xs whitespace-nowrap text-estompe tabular-nums">
                      {module.duree} min
                    </span>
                    {nbExercices > 0 ? (
                      <span className="text-xs whitespace-nowrap text-estompe tabular-nums">
                        · {nbExercices} exercice{nbExercices > 1 ? "s" : ""}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-sm text-accent">
                    {module.sousTitre}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-graphite">
                    {module.objectif}
                  </span>
                </span>

                <Fleche className="mt-2 text-estompe transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
              </Link>
            </li>
            );
          })}
        </ul>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Ressources                                                  */}
      {/* ---------------------------------------------------------- */}
      <section aria-labelledby="titre-ressources" className="mt-14 sm:mt-16">
        <h2
          id="titre-ressources"
          className="font-serif text-2xl text-encre sm:text-3xl"
        >
          Les ressources
        </h2>

        <ul className="mt-6 grid gap-5 sm:grid-cols-2">
          {formation.ressources.map((ressource) => (
            <li key={ressource.slug}>
              <Link
                href={`/formations/${formation.slug}/ressources/${ressource.slug}`}
                className="group flex h-full flex-col rounded-lg border border-trait bg-craie p-5 transition-colors hover:border-accent hover:bg-accent-voile"
              >
                <span className="font-serif text-lg leading-snug text-encre">
                  {ressource.titre}
                </span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-graphite">
                  {ressource.description}
                </span>
                <span className="mt-4 flex items-center gap-2 text-sm font-medium text-accent">
                  Ouvrir
                  <Fleche className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Appel à l’action de fin de page                             */}
      {/* ---------------------------------------------------------- */}
      {lienPremierModule && premierModule ? (
        <section className="sans-impression mt-14 rounded-lg border border-trait bg-voile p-6 sm:mt-16 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <p className="text-graphite">
              Premier module
              <span aria-hidden="true" className="mx-1.5 text-trait-fort">
                ·
              </span>
              <span className="font-serif text-lg text-encre">
                {premierModule.titre}
              </span>
            </p>
            <Link
              href={lienPremierModule}
              className="group inline-flex items-center gap-2.5 rounded-lg bg-accent px-6 py-3.5 text-base font-medium text-craie transition-colors hover:bg-accent-fort"
            >
              Commencer la formation
              <Fleche className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
