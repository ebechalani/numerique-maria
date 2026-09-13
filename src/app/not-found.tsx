/**
 * Page 404 du site.
 * Rendue à l’intérieur de la mise en page principale : elle se contente du
 * message et des quelques portes de sortie utiles.
 */

import type { Metadata } from "next";
import Link from "next/link";

import { formations } from "@/lib/formations";

export const metadata: Metadata = {
  title: "Page introuvable",
  description:
    "Cette adresse ne correspond à aucune page de la plateforme de formation du Collège de la Providence.",
};

export default function PageIntrouvable() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-medium tracking-wide text-estompe uppercase">
          Erreur 404
        </p>

        <h1 className="mt-3 font-serif text-3xl leading-tight font-semibold tracking-tight text-encre sm:text-4xl">
          Cette page n’existe pas
        </h1>

        <p className="mt-4 text-[1.0625rem] leading-relaxed text-encre-clair">
          L’adresse demandée ne correspond à aucune page de la plateforme. Le
          lien est peut-être incomplet, ou la page a changé d’adresse depuis que
          vous l’avez enregistrée.
        </p>

        <nav
          aria-label="Portes de sortie"
          className="mt-8 border-t border-trait pt-6"
        >
          <p className="text-xs font-medium tracking-wide text-estompe uppercase">
            Où aller maintenant
          </p>

          <ul className="mt-3 space-y-3">
            <li>
              <Link
                href="/"
                className="group flex items-start gap-3 rounded-lg border border-trait bg-craie px-5 py-4 transition-colors hover:border-accent hover:bg-accent-voile"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-base leading-snug text-encre transition-colors group-hover:text-accent-fort">
                    Retour à l’accueil
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-graphite">
                    Le catalogue des formations de la référente numérique.
                  </span>
                </span>
              </Link>
            </li>

            {formations.map((formation) => (
              <li key={formation.slug}>
                <Link
                  href={`/formations/${formation.slug}`}
                  className="group flex items-start gap-3 rounded-lg border border-trait bg-craie px-5 py-4 transition-colors hover:border-accent hover:bg-accent-voile"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-base leading-snug text-encre transition-colors group-hover:text-accent-fort">
                      {formation.titre}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-graphite">
                      {formation.sousTitre}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
