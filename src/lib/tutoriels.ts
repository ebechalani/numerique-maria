/**
 * Registre des tutoriels d’outils.
 *
 * Point d’entrée unique des pages, sur le modèle de `lib/formations.ts` : elles
 * ne touchent jamais aux fichiers de contenu directement.
 *
 * Ajouter un tutoriel : écrire `src/content/tutoriels/<slug>.ts` exportant un
 * objet `Tutoriel`, puis l’ajouter au tableau ci-dessous. Le catalogue, la page
 * de détail et le corpus de l’assistant le prennent en compte sans autre
 * modification.
 *
 * Module serveur : aucune directive « use client », aucun accès au navigateur.
 */

import type { Tutoriel } from "@/content/tutoriels/types";

import { chatGpt } from "@/content/tutoriels/chatgpt";
import { notebookLm } from "@/content/tutoriels/notebooklm";

/**
 * Tous les tutoriels publiés, dans l’ordre d’affichage du catalogue — celui de
 * la formation : ChatGPT est présenté au module 4, NotebookLM au module 5.
 */
export const tutoriels: Tutoriel[] = [chatGpt, notebookLm];

export function getTutoriel(slug: string): Tutoriel | undefined {
  return tutoriels.find((tutoriel) => tutoriel.slug === slug);
}

/**
 * Outils présentés en formation dont le tutoriel reste à écrire. Affiché sous
 * le catalogue pour que l’absence soit annoncée plutôt que subie ; vider le
 * tableau fait disparaître la mention.
 */
export const tutorielsAVenir: string[] = [];
