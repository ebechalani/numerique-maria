/**
 * Page d’un tutoriel d’outil.
 *
 * Gabarit en une colonne, comme la page du rédacteur de prompt : un tutoriel se
 * lit d’un bout à l’autre, il n’a pas besoin d’un sommaire latéral.
 *
 * Le corps est rendu par le même composant que les modules et les ressources :
 * le contenu est décrit en blocs, il n’y a pas de mise en forme propre ici.
 *
 * Impression : le fil d’Ariane et les liens sortants portent la classe
 * `sans-impression`, pour que Ctrl+P produise une fiche propre.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Blocs } from "@/components/BlocRenderer";
import { getTutoriel, tutoriels } from "@/lib/tutoriels";

interface Props {
  params: Promise<{ tutoriel: string }>;
}

/* ------------------------------------------------------------------ */
/* Pré-rendu et métadonnées                                            */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return tutoriels.map((tutoriel) => ({ tutoriel: tutoriel.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tutoriel: slug } = await params;
  const tutoriel = getTutoriel(slug);

  if (!tutoriel) return { title: "Tutoriel introuvable" };

  return {
    title: `${tutoriel.outil} — tutoriel`,
    description: tutoriel.accroche,
  };
}

/* ------------------------------------------------------------------ */
/* Éléments de page                                                    */
/* ------------------------------------------------------------------ */

/** Vrai pour une adresse du site, fausse pour un lien externe. */
function estInterne(href: string): boolean {
  return href.startsWith("/");
}

/** Flèche des liens internes — même famille que les cartes du catalogue. */
function FlecheInterne() {
  return (
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
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function FlecheSortante() {
  return (
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
      <path d="M14 4h6v6" />
      <path d="M20 4l-8.5 8.5" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function PageTutoriel({ params }: Props) {
  const { tutoriel: slug } = await params;
  const tutoriel = getTutoriel(slug);

  if (!tutoriel) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Fil d’Ariane" className="sans-impression">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-graphite">
          <li>
            <Link href="/" className="transition-colors hover:text-accent">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true" className="text-trait-fort">
            /
          </li>
          <li>
            <Link
              href="/tutoriels"
              className="transition-colors hover:text-accent"
            >
              Tutoriels
            </Link>
          </li>
          <li aria-hidden="true" className="text-trait-fort">
            /
          </li>
          <li aria-current="page" className="text-encre">
            {tutoriel.outil}
          </li>
        </ol>
      </nav>

      <header className="mt-5">
        {/* L’éditeur n’est rappelé que s’il ne porte pas le nom de l’outil. */}
        {tutoriel.editeur !== tutoriel.outil ? (
          <p className="text-sm text-accent">{tutoriel.editeur}</p>
        ) : null}
        <h1 className="mt-2 font-serif text-4xl leading-tight text-encre sm:text-5xl">
          {tutoriel.outil}
        </h1>
        <p className="mt-2 text-lg text-encre-clair">{tutoriel.sousTitre}</p>
        <p className="mt-4 leading-relaxed text-graphite">{tutoriel.accroche}</p>

        <dl className="mt-6 grid gap-x-6 gap-y-3 border-y border-trait py-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs tracking-wide text-estompe uppercase">
              Accès
            </dt>
            <dd className="mt-0.5 text-encre">{tutoriel.cout}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-estompe uppercase">
              À prévoir
            </dt>
            <dd className="mt-0.5 text-encre">{tutoriel.duree}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-estompe uppercase">
              Adresse
            </dt>
            <dd className="mt-0.5">
              <a
                href={tutoriel.adresse}
                target="_blank"
                rel="noreferrer noopener"
                className="break-all text-accent underline decoration-trait-fort underline-offset-2 transition-colors hover:text-accent-fort"
              >
                {tutoriel.adresse.replace(/^https?:\/\//, "")}
              </a>
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-sm leading-relaxed text-estompe">
          {tutoriel.interfaceDecrite}. Les outils en ligne changent souvent
          d’apparence : si un écran ne correspond plus à ce qui est décrit, la
          documentation officielle, liée en bas de page, fait foi.
        </p>
      </header>

      {/* Prérequis */}
      <section
        aria-labelledby="titre-prerequis"
        className="mt-10 rounded-[--radius-carte] border border-trait bg-voile px-4 py-5 sm:px-6"
      >
        <h2
          id="titre-prerequis"
          className="font-serif text-lg font-semibold text-encre"
        >
          Avant de commencer
        </h2>
        <dl className="mt-4 space-y-3">
          {tutoriel.prerequis.map((prerequis) => (
            <div key={prerequis.titre}>
              <dt className="font-medium text-encre">{prerequis.titre}</dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-graphite">
                {prerequis.texte}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Corps du tutoriel */}
      <div className="prose-formation mt-10">
        <Blocs blocs={tutoriel.blocs} />
      </div>

      {/* Liens et renvoi vers la formation */}
      <footer className="mt-12 border-t border-trait pt-6">
        <h2 className="font-serif text-lg font-semibold text-encre">
          Pour aller plus loin
        </h2>
        <ul className="sans-impression mt-3 space-y-2">
          {tutoriel.liens.map((lien) => {
            const interne = estInterne(lien.href);
            const classe =
              "inline-flex items-start gap-2 text-accent transition-colors hover:text-accent-fort";
            const corps = (
              <>
                <span className="mt-0.5">
                  {interne ? <FlecheInterne /> : <FlecheSortante />}
                </span>
                <span>
                  <span className="underline decoration-trait-fort underline-offset-2">
                    {lien.libelle}
                  </span>
                  {lien.description ? (
                    <span className="block text-sm text-graphite">
                      {lien.description}
                    </span>
                  ) : null}
                </span>
              </>
            );

            return (
              <li key={lien.href}>
                {interne ? (
                  <Link href={lien.href} className={classe}>
                    {corps}
                  </Link>
                ) : (
                  <a
                    href={lien.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={classe}
                  >
                    {corps}
                  </a>
                )}
              </li>
            );
          })}
        </ul>

        {tutoriel.renvoiModule ? (
          <p className="mt-6 text-sm leading-relaxed text-graphite">
            Cet outil est présenté en séance dans le{" "}
            <Link
              href={`/formations/${tutoriel.renvoiModule.formation}/${tutoriel.renvoiModule.module}`}
              className="text-accent underline decoration-trait-fort underline-offset-2 transition-colors hover:text-accent-fort"
            >
              {tutoriel.renvoiModule.libelle}
            </Link>
            .
          </p>
        ) : null}
      </footer>
    </div>
  );
}
