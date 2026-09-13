/**
 * Page d’une ressource de formation (fiche méthode, requêtes, questions,
 * déroulé animateur).
 *
 * Même gabarit à deux colonnes que les modules. Le contenu est déjà aplati en
 * blocs par getRessource : la page n’a qu’à le rendre.
 *
 * Impression : le sommaire latéral et le fil d’Ariane portent la classe
 * `sans-impression`, pour que Ctrl+P produise un document propre — sans bouton
 * ni script dédiés.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Blocs } from "@/components/BlocRenderer";
import NavModules from "@/components/NavModules";
import { formations, getRessource } from "@/lib/formations";

interface Props {
  params: Promise<{ formation: string; ressource: string }>;
}

/** Ressource réservée à l’animateur : notes affichées, avertissement en tête. */
const SLUG_ANIMATEUR = "animateur";

/* ------------------------------------------------------------------ */
/* Pré-rendu et métadonnées                                            */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return formations.flatMap((formation) =>
    formation.ressources.map((ressource) => ({
      formation: formation.slug,
      ressource: ressource.slug,
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { formation: formationSlug, ressource: ressourceSlug } = await params;
  const rendue = getRessource(formationSlug, ressourceSlug);

  if (!rendue) {
    return { title: "Ressource introuvable" };
  }

  return {
    title: rendue.ressource.titre,
    description: rendue.ressource.description,
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function PageRessource({ params }: Props) {
  const { formation: formationSlug, ressource: ressourceSlug } = await params;
  const rendue = getRessource(formationSlug, ressourceSlug);

  if (!rendue) notFound();

  const { formation, ressource, blocs } = rendue;
  const pourAnimateur = ressource.slug === SLUG_ANIMATEUR;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 xl:gap-14">
        {/* Colonne de gauche — sommaire, masqué à l’impression */}
        <aside className="sans-impression mb-8 lg:sticky lg:top-20 lg:mb-0 lg:max-h-[calc(100vh_-_6rem)] lg:self-start lg:overflow-y-auto lg:pb-4">
          <NavModules
            formationSlug={formation.slug}
            formationTitre={formation.titre}
            formateur={`${formation.formateur.nom}, ${formation.formateur.role.toLowerCase()}`}
            modules={formation.modules}
            ressources={formation.ressources}
            actif={ressource.slug}
          />
        </aside>

        {/* Colonne de droite — la ressource */}
        <div className="min-w-0">
          <article className="max-w-3xl">
            {/* Fil d’Ariane */}
            <nav aria-label="Fil d’Ariane" className="sans-impression">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-graphite">
                <li>
                  <Link href="/" className="transition-colors hover:text-accent">
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
                  {ressource.titre}
                </li>
              </ol>
            </nav>

            {/* En-tête de la ressource */}
            <header className="mt-5 border-b border-trait pb-8">
              <p className="text-xs font-medium tracking-wide text-estompe uppercase">
                Ressource
                <span aria-hidden="true" className="mx-1.5 text-trait-fort">
                  ·
                </span>
                {formation.titre}
              </p>

              <h1 className="mt-3 font-serif text-3xl leading-tight font-semibold tracking-tight text-encre sm:text-4xl">
                {ressource.titre}
              </h1>
              <p className="mt-3 max-w-[70ch] text-[1.0625rem] leading-relaxed text-graphite">
                {ressource.description}
              </p>

              {pourAnimateur ? (
                <div
                  role="note"
                  className="mt-6 rounded-lg border border-ambre-trait bg-ambre-voile px-5 py-4"
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-ambre">
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
                      <path d="M12 4.5 21 19.5H3L12 4.5Z" />
                      <path d="M12 10v4" />
                      <path d="M12 17h.01" />
                    </svg>
                    Page destinée à l’animateur de la séance
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-encre-clair">
                    Elle réunit l’intention, la préparation, le minutage, les
                    notes des diapositives et les variantes. Les participantes
                    n’en ont pas besoin pour suivre la formation : les modules
                    et la fiche méthode suffisent.
                  </p>
                </div>
              ) : null}
            </header>

            {/* Corps de la ressource */}
            <div className="prose-formation mt-10">
              <Blocs blocs={blocs} montrerNotesAnimateur={pourAnimateur} />
            </div>

            {/* Retour à la formation */}
            <nav
              aria-label="Retour à la formation"
              className="sans-impression mt-12 border-t border-trait pt-6"
            >
              <Link
                href={`/formations/${formation.slug}`}
                className="group inline-flex items-center gap-2 text-sm text-accent transition-colors hover:text-accent-fort"
              >
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
                  <path d="M14 6l-6 6 6 6" />
                </svg>
                Retour à la formation
              </Link>
            </nav>
          </article>
        </div>
      </div>
    </div>
  );
}
