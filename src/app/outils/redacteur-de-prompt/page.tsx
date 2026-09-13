/**
 * Outil : rédacteur de prompt selon la méthode ACTIF.
 *
 * Page statique ; tout l’interactif est dans le composant client.
 */

import type { Metadata } from "next";
import Link from "next/link";

import RedacteurActif from "@/components/outils/RedacteurActif";
import { CITATIONS_ACTIF, METHODE_ACTIF } from "@/content/outils/actif";
import { REFERENT } from "@/content/site";

export const metadata: Metadata = {
  title: "Rédacteur de prompt — méthode ACTIF",
  description:
    "Écrivez votre demande à l’IA en cinq étapes — Acteur, Contexte, Tâche, Intention, Format — et repartez avec trois prompts prêts à coller dans ChatGPT ou NotebookLM.",
};

export default function PageRedacteur() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
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
          <li>Outils</li>
          <li aria-hidden="true" className="text-trait-fort">
            /
          </li>
          <li aria-current="page" className="text-encre">
            Rédacteur de prompt
          </li>
        </ol>
      </nav>

      <header className="mt-5 max-w-3xl">
        <p className="text-sm text-accent">Méthode ACTIF</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight text-encre sm:text-5xl">
          Rédacteur de prompt
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-graphite">
          Écrivez votre demande en cinq réflexes — le rôle de l’IA, votre
          contexte, la tâche, le ton, le format — et repartez avec trois prompts
          prêts à coller dans ChatGPT ou NotebookLM.
        </p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {METHODE_ACTIF.map((element) => (
            <li
              key={element.lettre}
              className="inline-flex items-center gap-2 rounded-full border border-trait bg-craie py-1 pr-3 pl-1 text-sm text-graphite"
            >
              <span
                aria-hidden="true"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-encre font-serif text-xs font-semibold text-papier"
              >
                {element.lettre}
              </span>
              {element.titre}
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-lg border border-trait border-l-2 border-l-accent bg-craie px-5 py-4">
          <p className="text-xs font-medium tracking-wide text-estompe uppercase">
            À retenir
          </p>
          <p className="mt-1.5 leading-relaxed text-encre-clair">
            {CITATIONS_ACTIF.definition}
          </p>
          <p className="mt-2 font-medium text-encre">{CITATIONS_ACTIF.principe}</p>
        </div>
      </header>

      <div className="mt-10">
        <RedacteurActif />
      </div>

      <footer className="mt-12 border-t border-trait pt-5 text-sm text-graphite">
        <p>
          La méthode ACTIF est présentée par {REFERENT.nom}, {REFERENT.role},
          dans la formation « IA générative au service de la maternelle ».{" "}
          {CITATIONS_ACTIF.reflexes}
        </p>
      </footer>
    </div>
  );
}
