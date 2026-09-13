/**
 * Catalogue des tutoriels d’outils.
 *
 * Une carte par outil présenté en formation. Le catalogue se construit à partir
 * du registre : publier un tutoriel suffit à le faire apparaître ici.
 */

import type { Metadata } from "next";
import Link from "next/link";

import { tutoriels, tutorielsAVenir } from "@/lib/tutoriels";

export const metadata: Metadata = {
  title: "Tutoriels",
  description:
    "La prise en main des outils utilisés en formation, pas à pas : créer, importer, interroger, vérifier, partager.",
};

/** Point médian de séparation, purement décoratif. */
function Point() {
  return (
    <span aria-hidden="true" className="text-trait-fort">
      ·
    </span>
  );
}

/** Flèche des cartes-liens. */
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

export default function PageTutoriels() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
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
          <li aria-current="page" className="text-encre">
            Tutoriels
          </li>
        </ol>
      </nav>

      <header className="mt-5 max-w-3xl">
        <h1 className="font-serif text-4xl leading-tight text-encre sm:text-5xl">
          Tutoriels
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-graphite">
          La prise en main des outils utilisés en formation, pas à pas. Chaque
          tutoriel se lit seul, sans avoir suivi la séance, et se termine par une
          check-list à cocher pendant qu’on manipule.
        </p>
      </header>

      <ul className="mt-10 space-y-6">
        {tutoriels.map((tutoriel) => (
          <li key={tutoriel.slug}>
            <Link
              href={`/tutoriels/${tutoriel.slug}`}
              className="group block rounded-lg border border-trait bg-craie p-6 transition-colors hover:border-accent hover:bg-accent-voile sm:p-8"
            >
              <p className="text-sm text-accent">{tutoriel.editeur}</p>
              <h2 className="mt-1 font-serif text-2xl leading-tight text-encre sm:text-3xl">
                {tutoriel.outil}
              </h2>
              <p className="mt-1 text-graphite">{tutoriel.sousTitre}</p>
              <p className="mt-3 max-w-3xl leading-relaxed text-graphite">
                {tutoriel.accroche}
              </p>

              <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-graphite">
                <span>{tutoriel.cout}</span>
                <Point />
                <span>{tutoriel.duree}</span>
              </p>

              <p className="mt-5 flex items-center gap-2 text-sm font-medium text-accent">
                Ouvrir le tutoriel
                <Fleche className="transition-transform group-hover:translate-x-0.5" />
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {tutorielsAVenir.length > 0 ? (
        <section
          aria-labelledby="titre-a-venir"
          className="mt-10 rounded-lg border border-trait bg-voile p-6"
        >
          <h2 id="titre-a-venir" className="font-serif text-lg text-encre-clair">
            À venir
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-graphite">
            Le tutoriel de {tutorielsAVenir.join(", ")} reste à écrire. En
            attendant, l’outil est présenté dans la formation.
          </p>
        </section>
      ) : null}
    </div>
  );
}
