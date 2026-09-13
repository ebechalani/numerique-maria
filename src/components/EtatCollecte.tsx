/**
 * Bandeau d’état de la collecte, affiché en tête de chaque page de réponse.
 *
 * Une page de questionnaire ne peut rien promettre sans savoir si la base
 * répond et si une session est ouverte. Ce composant le dit avant que
 * l’enseignant ne remplisse quoi que ce soit — en français, sans statut HTTP ni
 * trace technique.
 *
 * Quatre situations, deux voix :
 *
 *  — collecte non configurée (pas de DATABASE_URL) — encadré d’attention ;
 *  — base injoignable — encadré d’attention, volontairement distinct du
 *    précédent : un animateur qui lit « la collecte est fermée » alors que sa
 *    base est tombée cherche la panne au mauvais endroit ;
 *  — aucune session ouverte — encadré d’attention ;
 *  — session ouverte — un simple liseré rappelant le libellé. Quand tout va
 *    bien, l’interface se tait.
 *
 * `connection()` est appelé en premier, avant même la lecture de la variable
 * d’environnement : sans lui, l’état serait figé au moment de la compilation et
 * le liseré « session ouverte » n’apparaîtrait jamais pendant la séance. La
 * page qui rend ce composant est donc rendue à la requête — c’est exactement ce
 * qu’on attend d’un état vivant.
 *
 * L’appel à la base est enveloppé : une base tombée dégrade le bandeau, jamais
 * la page.
 *
 * Aucune couleur de verdict ici. « Collecte non configurée », « base
 * injoignable », « collecte fermée » sont des états de la collecte, pas des
 * verdicts du contenu : vert, ambre et rouge restent réservés à autorisé /
 * encadré / interdit. Le bandeau s’exprime donc en encre et en voile, comme les
 * messages d’erreur des formulaires, et la session ouverte en accent.
 *
 * Composant serveur : aucune directive « use client », aucun hook.
 */

import type { ReactNode } from "react";
import { connection } from "next/server";

import { collecteConfiguree, sessionActive } from "@/lib/db";

interface Proprietes {
  /** Slug de la formation, ex. « ia-generative-en-classe ». */
  formation: string;
}

type Etat =
  | { genre: "non-configuree" }
  | { genre: "injoignable" }
  | { genre: "fermee" }
  | { genre: "ouverte"; libelle: string };

/* ------------------------------------------------------------------ */
/* Lecture de l’état                                                   */
/* ------------------------------------------------------------------ */

async function lireEtat(formation: string): Promise<Etat> {
  // L’état doit être lu à chaque requête, jamais figé à la compilation.
  await connection();

  if (!collecteConfiguree()) return { genre: "non-configuree" };

  try {
    const session = await sessionActive(formation);
    return session
      ? { genre: "ouverte", libelle: session.libelle }
      : { genre: "fermee" };
  } catch (erreur) {
    // La panne est tracée côté serveur ; le visiteur, lui, lit une phrase.
    console.error(
      "[EtatCollecte] session illisible :",
      erreur instanceof Error ? erreur.message : erreur,
    );
    return { genre: "injoignable" };
  }
}

/* ------------------------------------------------------------------ */
/* Présentation                                                        */
/* ------------------------------------------------------------------ */

function IconeAttention() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M10.7 4.2 2.9 17.4a1.5 1.5 0 0 0 1.3 2.3h15.6a1.5 1.5 0 0 0 1.3-2.3L13.3 4.2a1.5 1.5 0 0 0-2.6 0Z" />
      <path d="M12 9.5v4" />
      <path d="M12 16.75h.01" />
    </svg>
  );
}

/**
 * Notice d’état, en encre sur voile : la même sobriété que les messages
 * d’erreur des formulaires. Le trait épais à gauche porte l’attention, la
 * couleur ne la porte pas.
 */
function EncadreAttention({
  titre,
  children,
}: {
  titre: string;
  children: ReactNode;
}) {
  return (
    <div
      role="note"
      className="rounded-r-[--radius-carte] border-l-4 border-l-encre-clair bg-voile px-4 py-4 sm:px-5"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-encre-clair">
          <IconeAttention />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-encre">{titre}</p>
          <p className="mt-1 text-sm leading-relaxed text-encre-clair sm:text-base">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

export default async function EtatCollecte({ formation }: Proprietes) {
  const etat = await lireEtat(formation);

  if (etat.genre === "non-configuree") {
    return (
      <EncadreAttention titre="La collecte n’est pas encore configurée sur ce site.">
        L’animateur doit renseigner la base de données du site avant la séance.
        D’ici là, le formulaire ci-dessous ne mènerait nulle part : vos réponses
        ne seraient enregistrées nulle part.
      </EncadreAttention>
    );
  }

  if (etat.genre === "injoignable") {
    return (
      <EncadreAttention titre="La collecte est momentanément indisponible.">
        Le site n’arrive pas à joindre la base de données. Ce n’est pas votre
        connexion qui est en cause&nbsp;: signalez-le à l’animateur.
      </EncadreAttention>
    );
  }

  if (etat.genre === "fermee") {
    return (
      <EncadreAttention titre="La collecte est fermée.">
        L’animateur ouvrira une session au début de la séance. Revenez sur cette
        page à ce moment-là&nbsp;: elle s’ouvrira d’elle-même.
      </EncadreAttention>
    );
  }

  // Session ouverte : un liseré, rien de plus.
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-l-2 border-accent py-1 pl-3 text-xs text-graphite">
      <span className="font-medium text-encre-clair">Session ouverte</span>
      <span aria-hidden="true" className="text-trait-fort">
        ·
      </span>
      <span className="min-w-0 break-words">{etat.libelle}</span>
    </p>
  );
}
