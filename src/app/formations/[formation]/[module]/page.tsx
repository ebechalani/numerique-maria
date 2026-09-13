/**
 * Page d’un module de formation.
 *
 * Gabarit à deux colonnes : le sommaire de la formation à gauche (collant à
 * partir de lg, replié au-dessus du contenu en dessous), le module à droite sur
 * une largeur de lecture confortable. Les notes de l’animateur ne sont jamais
 * affichées ici : elles ont leur page dédiée dans les ressources.
 *
 * Composant serveur — aucun hook, tout l’interactif est délégué aux composants
 * client déjà écrits (sommaire, progression, blocs interactifs).
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BilanExercices from "@/components/BilanExercices";
import { Blocs } from "@/components/BlocRenderer";
import BoutonModuleTermine from "@/components/BoutonModuleTermine";
import NavModules from "@/components/NavModules";
import { exercicesDuModule } from "@/lib/exercices";
import { formations, getModule } from "@/lib/formations";

interface Props {
  params: Promise<{ formation: string; module: string }>;
}

/* ------------------------------------------------------------------ */
/* Pré-rendu et métadonnées                                            */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return formations.flatMap((formation) =>
    formation.modules.map((module) => ({
      formation: formation.slug,
      module: module.slug,
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { formation: formationSlug, module: moduleSlug } = await params;
  const situe = getModule(formationSlug, moduleSlug);

  if (!situe) {
    return { title: "Module introuvable" };
  }

  return {
    title: `${situe.module.numero}. ${situe.module.titre}`,
    description: situe.module.objectif,
  };
}

/* ------------------------------------------------------------------ */
/* Icônes de navigation                                                */
/* ------------------------------------------------------------------ */

function Fleche({ vers }: { vers: "gauche" | "droite" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
    >
      {vers === "gauche" ? (
        <path d="M14 6l-6 6 6 6" />
      ) : (
        <path d="M10 6l6 6-6 6" />
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function PageModule({ params }: Props) {
  const { formation: formationSlug, module: moduleSlug } = await params;
  const situe = getModule(formationSlug, moduleSlug);

  if (!situe) notFound();

  const { formation, module, precedent, suivant } = situe;
  const exercices = exercicesDuModule(module.blocs);

  /* En fin de formation, le « suivant » ramène à la page de la formation. */
  const lienSuivant = suivant
    ? `/formations/${formation.slug}/${suivant.slug}`
    : `/formations/${formation.slug}`;
  const libelleSuivant = suivant ? "Module suivant" : "Fin de la formation";
  const titreSuivant = suivant ? suivant.titre : "Retour à la formation";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 xl:gap-14">
        {/* Colonne de gauche — sommaire */}
        <aside className="sans-impression mb-8 lg:sticky lg:top-20 lg:mb-0 lg:max-h-[calc(100vh_-_6rem)] lg:self-start lg:overflow-y-auto lg:pb-4">
          <NavModules
            formationSlug={formation.slug}
            formationTitre={formation.titre}
            formateur={`${formation.formateur.nom}, ${formation.formateur.role.toLowerCase()}`}
            modules={formation.modules}
            ressources={formation.ressources}
            actif={module.slug}
          />
        </aside>

        {/* Colonne de droite — le module */}
        <div className="min-w-0">
          <article className="max-w-3xl">
            {/* Fil d’Ariane */}
            <nav aria-label="Fil d’Ariane" className="sans-impression">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-graphite">
                <li>
                  <Link
                    href="/"
                    className="transition-colors hover:text-accent"
                  >
                    Formations
                  </Link>
                </li>
                <li aria-hidden="true" className="text-trait-fort">
                  /
                </li>
                <li>
                  <Link
                    href={`/formations/${formation.slug}`}
                    className="transition-colors hover:text-accent"
                  >
                    {formation.titre}
                  </Link>
                </li>
                <li aria-hidden="true" className="text-trait-fort">
                  /
                </li>
                <li aria-current="page" className="text-encre">
                  {module.titre}
                </li>
              </ol>
            </nav>

            {/* En-tête du module */}
            <header className="mt-5 border-b border-trait pb-8">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="inline-flex items-center rounded-full bg-accent-voile px-3 py-1 text-xs font-medium tracking-wide text-accent-fort uppercase">
                  Module {module.numero}
                </span>
                <span className="text-sm text-graphite">
                  {module.horaire ? (
                    <>
                      Repère {module.horaire}
                      <span aria-hidden="true" className="mx-1.5 text-trait-fort">
                        ·
                      </span>
                    </>
                  ) : null}
                  {module.duree} min
                </span>
              </div>

              <h1 className="mt-4 font-serif text-3xl leading-tight font-semibold tracking-tight text-encre sm:text-4xl">
                {module.titre}
              </h1>
              <p className="mt-2 text-lg leading-snug text-graphite">
                {module.sousTitre}
              </p>

              {/* Encadré d’intention */}
              <div className="mt-6 rounded-lg border border-trait border-l-2 border-l-accent bg-craie px-5 py-4">
                <p className="text-xs font-medium tracking-wide text-estompe uppercase">
                  Objectif du module
                </p>
                <p className="mt-1.5 text-[1.0625rem] leading-relaxed text-encre-clair">
                  {module.objectif}
                </p>
              </div>
            </header>

            {/* Ce qu’il y a à faire, et où on en est */}
            {exercices.length > 0 ? (
              <div className="sans-impression mt-8">
                <BilanExercices items={exercices} />
              </div>
            ) : null}

            {/* Corps du module */}
            <div className="prose-formation mt-10">
              <Blocs blocs={module.blocs} />
            </div>

            <BoutonModuleTermine
              formationSlug={formation.slug}
              moduleSlug={module.slug}
            />

            {/* Navigation précédent / suivant */}
            <nav
              aria-label="Navigation entre les modules"
              className="sans-impression mt-6 grid gap-3 sm:grid-cols-2"
            >
              {precedent ? (
                <Link
                  href={`/formations/${formation.slug}/${precedent.slug}`}
                  className="group flex flex-col gap-1.5 rounded-lg border border-trait bg-craie px-5 py-4 transition-colors hover:border-accent hover:bg-accent-voile"
                >
                  <span className="flex items-center gap-1.5 text-xs tracking-wide text-estompe uppercase">
                    <Fleche vers="gauche" />
                    Module précédent
                  </span>
                  <span className="font-serif text-base leading-snug text-encre transition-colors group-hover:text-accent-fort">
                    {precedent.titre}
                  </span>
                </Link>
              ) : null}

              <Link
                href={lienSuivant}
                className="group flex flex-col items-end gap-1.5 rounded-lg border border-trait bg-craie px-5 py-4 text-right transition-colors hover:border-accent hover:bg-accent-voile sm:col-start-2"
              >
                <span className="flex items-center gap-1.5 text-xs tracking-wide text-estompe uppercase">
                  {libelleSuivant}
                  <Fleche vers="droite" />
                </span>
                <span className="font-serif text-base leading-snug text-encre transition-colors group-hover:text-accent-fort">
                  {titreSuivant}
                </span>
              </Link>
            </nav>
          </article>
        </div>
      </div>
    </div>
  );
}
