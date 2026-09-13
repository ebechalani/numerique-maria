import type { Metadata } from "next";
import Link from "next/link";

import { ETABLISSEMENT, LOCALISATION, REFERENT, SIGNATURE } from "@/content/site";
import { formations } from "@/lib/formations";

export const metadata: Metadata = {
  description: `Le catalogue des formations d’${SIGNATURE} de ${ETABLISSEMENT.nom}.`,
};

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

/** Trois usages de l’espace, affichés en colonnes numérotées. */
const usages = [
  {
    numero: "1",
    titre: "Suivre la formation à son rythme",
    texte:
      "Module par module, dans l’ordre ou non. La progression est enregistrée dans votre navigateur : rien n’est transmis.",
  },
  {
    numero: "2",
    titre: "Garder les ressources sous la main",
    texte:
      "La fiche méthode remise en séance et les requêtes prêtes à l’emploi restent accessibles après la formation.",
  },
  {
    numero: "3",
    titre: "Poser une question à l’assistant",
    texte:
      "Il répond à partir du contenu de la formation : la méthode ACTIF, les outils, les gestes vus en séance.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Accueil() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      {/* En-tête éditorial */}
      <header className="max-w-3xl">
        <p className="text-xs font-medium tracking-wide text-estompe uppercase">
          {ETABLISSEMENT.nom} <Point /> {ETABLISSEMENT.tutelle}
          {LOCALISATION ? (
            <>
              {" "}
              <Point /> {LOCALISATION}
            </>
          ) : null}
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-encre sm:text-5xl">
          Numérique
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-graphite sm:text-xl">
          L’espace de formation du référent numérique : suivre les formations,
          retrouver les ressources, poser ses questions.
        </p>
        <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-graphite">
          <span
            aria-hidden="true"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-encre font-serif text-sm text-papier"
          >
            EB
          </span>
          <span>
            Animé par{" "}
            <span className="font-medium text-encre">{REFERENT.nom}</span>,{" "}
            {REFERENT.role}
            <Point />{" "}
            <a
              href={`mailto:${REFERENT.courriel}`}
              className="text-accent underline decoration-trait-fort underline-offset-2 transition-colors hover:text-accent-fort"
            >
              {REFERENT.courriel}
            </a>
          </span>
        </p>
      </header>

      {/* Catalogue */}
      <section aria-labelledby="titre-formations" className="mt-12 sm:mt-16">
        <h2
          id="titre-formations"
          className="text-xs font-medium tracking-wide text-estompe uppercase"
        >
          Les formations
        </h2>

        <ul className="mt-4 space-y-6">
          {formations.map((formation) => (
            <li key={formation.slug}>
              <Link
                href={`/formations/${formation.slug}`}
                className="group block rounded-lg border border-trait bg-craie p-6 transition-colors hover:border-accent hover:bg-accent-voile sm:p-8"
              >
                <p className="text-sm text-accent">{formation.sousTitre}</p>
                <h3 className="mt-1 font-serif text-2xl leading-tight text-encre sm:text-3xl">
                  {formation.titre}
                </h3>
                <p className="mt-3 max-w-3xl leading-relaxed text-graphite">
                  {formation.accroche}
                </p>

                <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-graphite">
                  <span>{formation.public}</span>
                  <Point />
                  <span>{formation.duree}</span>
                  <Point />
                  <span>{formation.session}</span>
                  <Point />
                  <span>{formation.modules.length} modules</span>
                </p>

                <p className="mt-5 flex items-center gap-2 text-sm font-medium text-accent">
                  Voir la formation
                  <Fleche className="transition-transform group-hover:translate-x-0.5" />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Outils */}
      <section aria-labelledby="titre-outils" className="mt-12 sm:mt-16">
        <h2
          id="titre-outils"
          className="text-xs font-medium tracking-wide text-estompe uppercase"
        >
          Les outils
        </h2>
        <ul className="mt-4">
          <li>
            <Link
              href="/outils/redacteur-de-prompt"
              className="group flex items-start gap-5 rounded-lg border border-trait bg-craie p-6 transition-colors hover:border-accent hover:bg-accent-voile"
            >
              <span
                aria-hidden="true"
                className="hidden shrink-0 items-center gap-1 sm:flex"
              >
                {["A", "C", "T", "I", "F"].map((lettre) => (
                  <span
                    key={lettre}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-encre font-serif text-xs font-semibold text-papier"
                  >
                    {lettre}
                  </span>
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-sm text-accent">Méthode ACTIF</span>
                <span className="mt-1 block font-serif text-2xl leading-tight text-encre">
                  Rédacteur de prompt
                </span>
                <span className="mt-2 block max-w-3xl leading-relaxed text-graphite">
                  Cinq étapes — Acteur, Contexte, Tâche, Intention, Format — et
                  trois prompts prêts à coller dans ChatGPT ou NotebookLM.
                </span>
                <span className="mt-4 flex items-center gap-2 text-sm font-medium text-accent">
                  Ouvrir le rédacteur
                  <Fleche className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
          </li>

        </ul>
      </section>

      {/* Mode d’emploi */}
      <section aria-labelledby="titre-usage" className="mt-14 sm:mt-20">
        <h2
          id="titre-usage"
          className="font-serif text-2xl text-encre sm:text-3xl"
        >
          Comment utiliser cet espace
        </h2>

        <ul className="mt-6 grid gap-5 sm:grid-cols-3">
          {usages.map((usage) => (
            <li
              key={usage.numero}
              className="rounded-lg border border-trait bg-craie p-5"
            >
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent text-sm tabular-nums text-accent"
              >
                {usage.numero}
              </span>
              <h3 className="mt-3 font-serif text-lg leading-snug text-encre">
                {usage.titre}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-graphite">
                {usage.texte}
              </p>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
