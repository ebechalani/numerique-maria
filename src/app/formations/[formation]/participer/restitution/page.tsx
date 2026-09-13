/**
 * Page de dépôt de la trame de restitution — atelier ACTIF (diapositive 13).
 *
 * Même gabarit épuré que les questionnaires, un peu plus large : les champs de
 * la trame sont longs (ressource produite, requêtes, corrections), et une
 * colonne trop étroite obligerait à faire défiler une requête collée sur dix
 * lignes.
 *
 * La page porte ce que le formulaire ne peut pas porter : la consigne de
 * l’atelier — sa minuterie et sa composition de groupe — et ce qu’on attend
 * d’une contribution. Le formulaire, lui, garde ses libellés de champs, ses
 * aides et le rappel « aucune donnée d’élève » sous le bouton d’envoi ; la page
 * ne les répète pas.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import EtatCollecte from "@/components/EtatCollecte";
import FormulaireRestitution from "@/components/formulaires/FormulaireRestitution";
import { champsRestitution } from "@/content/formations/ia-generative-en-classe/ressources/questionnaires";
import { formations, getFormation } from "@/lib/formations";

interface Props {
  params: Promise<{ formation: string }>;
}

/**
 * Minuterie de l’atelier. Les quatre minutes d’écriture sont celles annoncées
 * par la diapositive 13 ; l’essai et l’ajustement prolongent les réflexes
 * « Vérifier » et « Itérer » de la diapositive 16.
 */
const ETAPES: { duree: string; titre: string; texte: string }[] = [
  {
    duree: "4 min",
    titre: "Écrire",
    texte:
      "Un prompt en une seule phrase, contenant les cinq éléments ACTIF, pour une préparation que vous avez réellement à faire cette semaine. Partez de votre vrai besoin : l’exercice sera immédiatement utile.",
  },
  {
    duree: "6 min",
    titre: "Essayer",
    texte:
      "Envoyez-le dans ChatGPT, ou dans NotebookLM si votre besoin part d’un document que vous avez importé. Gardez le prompt sous la main : c’est ce qui servira le plus aux collègues.",
  },
  {
    duree: "5 min",
    titre: "Ajuster",
    texte:
      "Relisez la réponse, corrigez ce qui est faux, relancez pour une version plus courte, plus simple ou mieux présentée — puis déposez la trame ci-dessous.",
  },
];

/* ------------------------------------------------------------------ */
/* Pré-rendu et métadonnées                                            */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return formations.map((formation) => ({ formation: formation.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { formation: formationSlug } = await params;
  const formation = getFormation(formationSlug);

  if (!formation) return { title: "Formation introuvable" };

  return {
    title: "Trame de restitution",
    description: `Dépôt de la trame de restitution de l’atelier ACTIF — ${formation.titre}.`,
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function PageRestitution({ params }: Props) {
  const { formation: formationSlug } = await params;
  const formation = getFormation(formationSlug);

  if (!formation) notFound();

  const lienContributions = `/formations/${formation.slug}/participer/restitution/contributions`;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Retour — seul repère de navigation conservé */}
      <nav aria-label="Retour à la formation">
        <Link
          href={`/formations/${formation.slug}`}
          className="inline-flex items-center gap-2 text-xs text-graphite transition-colors hover:text-accent"
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
          {formation.titre}
        </Link>
      </nav>

      <header className="mt-5">
        <p className="text-xs font-medium tracking-wide text-estompe uppercase">
          Atelier ACTIF
        </p>

        <h1 className="mt-2 font-serif text-3xl leading-tight font-semibold tracking-tight text-encre sm:text-4xl">
          Trame de restitution
        </h1>

        <p className="mt-3 max-w-[70ch] leading-relaxed text-graphite">
          Une trame par participant ou par binôme, déposée à la fin de
          l’atelier. Les dépôts alimentent la mise en commun et la liste
          collective des vigilances.
        </p>
      </header>

      {/* Consigne de l’atelier */}
      <section
        aria-labelledby="consigne-atelier"
        className="mt-8 rounded-[--radius-carte] border border-trait bg-voile px-4 py-5 sm:px-6"
      >
        <h2
          id="consigne-atelier"
          className="font-serif text-lg font-semibold text-encre"
        >
          Comment se déroule l’atelier
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-graphite">
          Seul ou en binôme, de préférence avec un collègue du même cycle. Quinze minutes en tout.
        </p>

        <ol className="mt-5 space-y-4">
          {ETAPES.map((etape) => (
            <li key={etape.titre} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
              <span className="shrink-0 font-mono text-xs tabular-nums text-accent sm:w-16 sm:pt-0.5 sm:text-right">
                {etape.duree}
              </span>
              <div className="min-w-0 border-l border-trait-fort pl-4 sm:border-l-0 sm:pl-0">
                <p className="font-semibold text-encre">{etape.titre}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-encre-clair">
                  {etape.texte}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Ce qu’on attend d’une contribution */}
      <section aria-labelledby="attendu" className="mt-8">
        <h2
          id="attendu"
          className="font-serif text-lg font-semibold text-encre"
        >
          Ce qu’on attend d’une contribution
        </h2>
        <p className="mt-2 max-w-[70ch] leading-relaxed text-encre-clair">
          Une contribution utile n’est pas une contribution parfaite&nbsp;: c’est
          une contribution honnête. Ce qui sert le plus aux collègues, ce sont
          les requêtes collées telles quelles et ce qu’il a fallu corriger — pas
          la ressource réussie du premier coup. Un groupe qui n’a rien produit
          d’exploitable peut le déposer aussi&nbsp;: c’est un résultat, et il
          évite à d’autres de refaire le même essai.
        </p>
        <p className="mt-3 max-w-[70ch] leading-relaxed text-graphite">
          Le champ «&nbsp;membres du groupe&nbsp;» ne figure pas sur le mur
          public des contributions&nbsp;: il n’est visible que dans le tableau de
          bord de l’animateur.
        </p>
      </section>

      {/* État de la collecte, avant toute saisie */}
      <div className="mt-8">
        <EtatCollecte formation={formation.slug} />
      </div>

      {/* Le formulaire porte ses aides et le rappel « aucune donnée d’élève » */}
      <div className="mt-8 border-t border-trait pt-8">
        <FormulaireRestitution
          champs={champsRestitution}
          formation={formation.slug}
        />
      </div>

      {/* Mur des contributions */}
      <nav
        aria-label="Contributions déposées"
        className="mt-10 border-t border-trait pt-6"
      >
        <Link
          href={lienContributions}
          className="group inline-flex items-center gap-2 text-sm text-accent transition-colors hover:text-accent-fort"
        >
          Voir les contributions déposées
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
          >
            <path d="M10 6l6 6-6 6" />
          </svg>
        </Link>
      </nav>
    </div>
  );
}
