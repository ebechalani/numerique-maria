/**
 * Mur public des contributions de l’atelier ACTIF.
 *
 * Projeté pendant la restitution éclair, et consultable par les enseignants
 * après la séance : chacune y lit ce que les autres ont produit.
 *
 * Anonymisation. La page affiche le niveau, le besoin, l’outil, le prompt,
 * la réponse obtenue, les corrections et la vigilance — jamais le champ
 * «&nbsp;membres du groupe&nbsp;», qui reste réservé au tableau de bord de
 * l’animateur. Le tri est celui de la base (ordre de dépôt) ; aucune heure
 * d’envoi n’est affichée, car dans une salle de vingt personnes un horodatage
 * suffit à réattribuer une contribution à son auteur.
 *
 * Rendue à la requête : un mur qui date de la compilation serait vide toute la
 * séance.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { chargerResultats, collecteConfiguree, type Restitution } from "@/lib/db";
import { getFormation } from "@/lib/formations";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ formation: string }>;
}

/* ------------------------------------------------------------------ */
/* Métadonnées                                                         */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { formation: formationSlug } = await params;
  const formation = getFormation(formationSlug);

  if (!formation) return { title: "Formation introuvable" };

  return {
    title: "Contributions déposées",
    description: `Les ressources produites pendant l’atelier ACTIF — ${formation.titre}.`,
  };
}

/* ------------------------------------------------------------------ */
/* Lecture                                                             */
/* ------------------------------------------------------------------ */

/**
 * Ce que la page doit afficher. La distinction entre « non configurée »,
 * « indisponible » et « vide » n’est pas cosmétique : elle dit à l’animateur où
 * chercher quand le mur reste blanc.
 */
type Contenu =
  | { genre: "non-configuree" }
  | { genre: "indisponible" }
  | { genre: "hors-session" }
  | { genre: "mur"; libelle: string; restitutions: Restitution[] };

async function lireContributions(formation: string): Promise<Contenu> {
  if (!collecteConfiguree()) return { genre: "non-configuree" };

  try {
    const resultats = await chargerResultats(formation);
    if (!resultats.session) return { genre: "hors-session" };

    return {
      genre: "mur",
      libelle: resultats.session.libelle,
      restitutions: resultats.restitutions,
    };
  } catch (erreur) {
    console.error(
      "[contributions] résultats illisibles :",
      erreur instanceof Error ? erreur.message : erreur,
    );
    return { genre: "indisponible" };
  }
}

/* ------------------------------------------------------------------ */
/* Présentation                                                        */
/* ------------------------------------------------------------------ */

function EtatVide({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="rounded-[--radius-carte] border border-dashed border-trait-fort bg-voile px-6 py-12 text-center">
      <p className="font-serif text-lg font-semibold text-encre">{titre}</p>
      <p className="mx-auto mt-2 max-w-[55ch] leading-relaxed text-graphite">
        {texte}
      </p>
    </div>
  );
}

/**
 * Une rubrique d’une contribution. `mono` sert aux requêtes, collées telles
 * quelles : elles peuvent être longues et sans espace, d’où `break-words`, qui
 * empêche le mur de déborder horizontalement sur un téléphone.
 */
function Rubrique({
  titre,
  texte,
  mono = false,
}: {
  titre: string;
  texte: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-estompe uppercase">
        {titre}
      </dt>
      <dd
        className={
          mono
            ? "mt-1.5 overflow-x-auto rounded-md border border-trait bg-voile px-3 py-2 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap text-encre-clair"
            : "mt-1 leading-relaxed break-words whitespace-pre-wrap text-encre-clair"
        }
      >
        {texte}
      </dd>
    </div>
  );
}

/** Une contribution — sans le champ « membres », jamais rendu ici. */
function CarteContribution({ restitution }: { restitution: Restitution }) {
  return (
    <article className="rounded-[--radius-carte] border border-trait bg-craie p-5 sm:p-6">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-trait pb-3">
        <h2 className="min-w-0 font-serif text-lg font-semibold text-encre">
          {restitution.niveau}
        </h2>
        <span className="shrink-0 rounded-full border border-trait bg-voile px-2.5 py-0.5 text-xs font-medium text-graphite">
          {restitution.outil}
        </span>
      </header>

      <dl className="mt-4 space-y-4">
        {restitution.besoin ? (
          <Rubrique
            titre="Le besoin de la semaine"
            texte={restitution.besoin}
          />
        ) : null}

        {restitution.requete ? (
          <Rubrique titre="Le prompt ACTIF" texte={restitution.requete} mono />
        ) : null}

        <Rubrique
          titre="Ce que l’IA a répondu"
          texte={restitution.ressource}
        />

        {restitution.corrections ? (
          <Rubrique
            titre="Ce qu’il a fallu corriger ou relancer"
            texte={restitution.corrections}
          />
        ) : null}

        {restitution.vigilance ? (
          <Rubrique titre="Vigilance à partager" texte={restitution.vigilance} />
        ) : null}
      </dl>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function PageContributions({ params }: Props) {
  const { formation: formationSlug } = await params;
  const formation = getFormation(formationSlug);

  if (!formation) notFound();

  const contenu = await lireContributions(formation.slug);
  const lienDepot = `/formations/${formation.slug}/participer/restitution`;

  const nombre = contenu.genre === "mur" ? contenu.restitutions.length : 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Retour au dépôt */}
      <nav aria-label="Retour à la trame de restitution">
        <Link
          href={lienDepot}
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
          Trame de restitution
        </Link>
      </nav>

      <header className="mt-5 border-b border-trait pb-6">
        <p className="text-xs font-medium tracking-wide text-estompe uppercase">
          Atelier ACTIF
          <span aria-hidden="true" className="mx-1.5 text-trait-fort">
            ·
          </span>
          {formation.titre}
        </p>

        <h1 className="mt-2 font-serif text-3xl leading-tight font-semibold tracking-tight text-encre sm:text-4xl">
          Contributions déposées
        </h1>

        <p className="mt-3 max-w-[70ch] leading-relaxed text-graphite">
          Ce que les groupes ont produit pendant l’atelier, dans l’ordre des
          dépôts. Les membres des groupes ne sont pas affichés ici.
        </p>

        {contenu.genre === "mur" && nombre > 0 ? (
          <p className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-l-2 border-accent py-1 pl-3 text-xs text-graphite">
            <span className="font-medium text-encre-clair">
              {nombre}{" "}
              {nombre > 1 ? "contributions déposées" : "contribution déposée"}
            </span>
            <span aria-hidden="true" className="text-trait-fort">
              ·
            </span>
            <span className="min-w-0 break-words">{contenu.libelle}</span>
          </p>
        ) : null}
      </header>

      <div className="mt-8">
        {contenu.genre === "non-configuree" ? (
          <EtatVide
            titre="La collecte n’est pas encore configurée sur ce site."
            texte="L’animateur doit renseigner la base de données du site avant la séance. Aucune contribution ne peut être enregistrée ni affichée d’ici là."
          />
        ) : null}

        {contenu.genre === "indisponible" ? (
          <EtatVide
            titre="Les contributions sont momentanément indisponibles."
            texte="Le site n’arrive pas à joindre la base de données. Ce n’est pas votre connexion qui est en cause : signalez-le à l’animateur."
          />
        ) : null}

        {contenu.genre === "hors-session" ? (
          <EtatVide
            titre="Aucune session n’est ouverte."
            texte="Le mur des contributions se remplit pendant la séance, à mesure que les groupes déposent leur trame. L’animateur ouvrira une session au début de l’atelier."
          />
        ) : null}

        {contenu.genre === "mur" && nombre === 0 ? (
          <EtatVide
            titre="Aucune contribution pour le moment."
            texte="Le premier groupe qui dépose sa trame ouvre le mur. Il se remplit ensuite tout seul : rafraîchissez la page pour voir les dépôts suivants."
          />
        ) : null}

        {contenu.genre === "mur" && nombre > 0 ? (
          <div className="grid items-start gap-5 lg:grid-cols-2">
            {contenu.restitutions.map((restitution) => (
              <CarteContribution
                key={restitution.id}
                restitution={restitution}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Dépôt */}
      <nav
        aria-label="Déposer une contribution"
        className="mt-10 border-t border-trait pt-6"
      >
        <Link
          href={lienDepot}
          className="group inline-flex items-center gap-2 text-sm text-accent transition-colors hover:text-accent-fort"
        >
          Déposer la trame de mon groupe
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
