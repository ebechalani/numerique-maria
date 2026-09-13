/**
 * Page de réponse à un questionnaire — sondage d’entrée ou enquête de
 * satisfaction, remplis sur le site.
 *
 * Gabarit volontairement épuré : une seule colonne, pas de sommaire latéral,
 * pas de fil d’Ariane à trois niveaux. Elle est ouverte sur un téléphone, en
 * début ou en fin de séance, souvent debout — tout ce qui n’aide pas à répondre
 * est retiré.
 *
 * Répartition des rôles avec le formulaire, pour ne rien afficher deux fois :
 * la page porte le titre et le moment, le formulaire porte l’introduction
 * (juste au-dessus des questions, là où elle se lit) et le rappel d’anonymat
 * sous le bouton d’envoi. La page n’ajoute donc ni intro, ni second rappel.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import EtatCollecte from "@/components/EtatCollecte";
import FormulaireQuestionnaire from "@/components/formulaires/FormulaireQuestionnaire";
import {
  enqueteSatisfaction,
  sondageEntree,
} from "@/content/formations/ia-generative-maternelle/ressources/questionnaires";
import type { Formation, Questionnaire } from "@/content/types";
import { formations, getFormation } from "@/lib/formations";

interface Props {
  params: Promise<{ formation: string; questionnaire: string }>;
}

/**
 * Les deux questionnaires collectés, indexés par leur propre slug — « sondage »
 * et « satisfaction ». Passer par le slug déclaré dans le contenu, plutôt que
 * par des chaînes écrites ici, garantit que l’URL, le pré-rendu et l’agrégation
 * en base désignent toujours la même chose.
 */
const QUESTIONNAIRES: Record<string, Questionnaire> = {
  [sondageEntree.slug]: sondageEntree,
  [enqueteSatisfaction.slug]: enqueteSatisfaction,
};

interface QuestionnaireSitue {
  formation: Formation;
  questionnaire: Questionnaire;
}

/** Renvoie `undefined` si la formation ou le questionnaire est inconnu. */
function situer(
  formationSlug: string,
  questionnaireSlug: string,
): QuestionnaireSitue | undefined {
  const formation = getFormation(formationSlug);
  if (!formation) return undefined;

  const questionnaire = QUESTIONNAIRES[questionnaireSlug];
  if (!questionnaire) return undefined;

  return { formation, questionnaire };
}

/* ------------------------------------------------------------------ */
/* Pré-rendu et métadonnées                                            */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return formations.flatMap((formation) =>
    Object.keys(QUESTIONNAIRES).map((questionnaire) => ({
      formation: formation.slug,
      questionnaire,
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { formation: formationSlug, questionnaire: questionnaireSlug } =
    await params;
  const situe = situer(formationSlug, questionnaireSlug);

  if (!situe) return { title: "Questionnaire introuvable" };

  return {
    title: situe.questionnaire.titre,
    description: `Réponse anonyme au questionnaire « ${situe.questionnaire.titre} » de la formation ${situe.formation.titre}.`,
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function IconeHorloge() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 1.75" />
    </svg>
  );
}

export default async function PageQuestionnaire({ params }: Props) {
  const { formation: formationSlug, questionnaire: questionnaireSlug } =
    await params;
  const situe = situer(formationSlug, questionnaireSlug);

  if (!situe) notFound();

  const { formation, questionnaire } = situe;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
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
          Questionnaire
        </p>

        <h1 className="mt-2 font-serif text-3xl leading-tight font-semibold tracking-tight text-encre sm:text-4xl">
          {questionnaire.titre}
        </h1>

        <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-graphite">
          <IconeHorloge />
          <span className="min-w-0">{questionnaire.moment}</span>
        </p>
      </header>

      {/* État de la collecte, avant toute saisie */}
      <div className="mt-6">
        <EtatCollecte formation={formation.slug} />
      </div>

      {/* Le formulaire porte l’introduction et le rappel d’anonymat */}
      <div className="mt-8 border-t border-trait pt-8">
        <FormulaireQuestionnaire
          questionnaire={questionnaire}
          formation={formation.slug}
        />
      </div>
    </div>
  );
}
