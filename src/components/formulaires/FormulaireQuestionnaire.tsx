"use client";

/**
 * Questionnaire rempli sur le site, sans application externe.
 *
 * Le formulaire est anonyme par construction : il n’envoie que les réponses
 * aux questions déclarées dans le contenu, jamais de nom, d’adresse ni
 * d’identifiant. Aucun champ n’invite à saisir une donnée d’élève, et le
 * rappel figure sous le bouton d’envoi.
 *
 * L’envoi distingue trois situations côté serveur — collecte fermée (409),
 * collecte non configurée (503), incident (le reste) — et n’affiche jamais de
 * trace technique : l’enseignant lit une phrase en français, pas un statut
 * HTTP.
 *
 * Le repère « déjà répondu » vit dans le navigateur (localStorage). C’est un
 * garde-fou de confort contre le double envoi involontaire, pas une sécurité :
 * il n’identifie personne et se contourne d’un clic.
 */

import type { FormEvent } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  ChampChoixMultiple,
  ChampChoixUnique,
  ChampEchelle,
  ChampTexteLibre,
} from "@/components/formulaires/Champs";
import type {
  Question,
  Questionnaire,
  ReponsesQuestionnaire,
} from "@/content/types";
import { useEtatLocal } from "@/lib/progression";

interface Proprietes {
  questionnaire: Questionnaire;
  formation: string;
}

/** Étapes de l’envoi. « succes » remplace définitivement le formulaire. */
type EtatEnvoi = "repos" | "envoi" | "succes";

/** Échec d’envoi : le message affiché, et s’il vaut la peine de réessayer. */
interface Echec {
  message: string;
  reessayable: boolean;
}

const MESSAGE_GENERIQUE =
  "L’envoi n’a pas abouti. Vérifiez votre connexion, puis réessayez.";

/* ------------------------------------------------------------------ */
/* Lecture et validation des réponses                                  */
/* ------------------------------------------------------------------ */

function valeurTexte(brut: unknown): string {
  return typeof brut === "string" ? brut : "";
}

function valeurListe(brut: unknown): string[] {
  return Array.isArray(brut)
    ? brut.filter((item): item is string => typeof item === "string")
    : [];
}

function valeurNombre(brut: unknown): number | null {
  return typeof brut === "number" ? brut : null;
}

/** Une question obligatoire est-elle restée sans réponse ? */
function reponseManquante(
  question: Question,
  reponses: ReponsesQuestionnaire,
): boolean {
  const brut = reponses[question.id];
  switch (question.type) {
    case "choix-unique":
      return valeurTexte(brut).length === 0;
    case "choix-multiple":
      return valeurListe(brut).length === 0;
    case "echelle":
      return valeurNombre(brut) === null;
    case "texte-libre":
      return valeurTexte(brut).trim().length === 0;
  }
}

/** Message d’erreur adapté au geste attendu. */
function messageManquant(question: Question): string {
  switch (question.type) {
    case "choix-unique":
      return "Choisissez une réponse.";
    case "choix-multiple":
      return "Choisissez au moins une réponse.";
    case "echelle":
      return "Choisissez une note sur l’échelle.";
    case "texte-libre":
      return "Complétez cette réponse.";
  }
}

/**
 * Ne garde que les réponses aux questions encore présentes dans le contenu,
 * texte élagué. Une question retirée du questionnaire ne part pas au serveur.
 */
function chargeUtile(
  questions: Question[],
  reponses: ReponsesQuestionnaire,
): ReponsesQuestionnaire {
  const propres: ReponsesQuestionnaire = {};

  for (const question of questions) {
    const brut = reponses[question.id];
    if (brut === undefined) continue;

    if (typeof brut === "string") {
      const elague = brut.trim();
      if (elague.length > 0) propres[question.id] = elague;
    } else if (Array.isArray(brut)) {
      if (brut.length > 0) propres[question.id] = brut;
    } else {
      propres[question.id] = brut;
    }
  }

  return propres;
}

/* ------------------------------------------------------------------ */
/* Icônes                                                              */
/* ------------------------------------------------------------------ */

function IconeValide() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-6 w-6 shrink-0 text-accent"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.25 2.75 2.75L16 9.5" />
    </svg>
  );
}

function IconeAlerte() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0"
    >
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 6.25v4.5" />
      <path d="M10 13.5h.01" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Formulaire                                                          */
/* ------------------------------------------------------------------ */

export default function FormulaireQuestionnaire({
  questionnaire,
  formation,
}: Proprietes) {
  const base = useId();
  const idBloc = (question: string) => `${base}-bloc-${question}`;
  const idChamp = (question: string) => `${base}-champ-${question}`;

  const [reponses, setReponses] = useState<ReponsesQuestionnaire>({});
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [etat, setEtat] = useState<EtatEnvoi>("repos");
  const [echec, setEchec] = useState<Echec | null>(null);
  const [reprise, setReprise] = useState(false);

  /**
   * Question vers laquelle amener l’attention. Passer par un état plutôt que
   * de déplacer le focus depuis le gestionnaire d’envoi garantit que le rendu
   * portant les messages d’erreur est bien posé avant qu’on y saute — et,
   * contrairement à requestAnimationFrame, cela fonctionne aussi quand l’onglet
   * est en arrière-plan, où les trames d’animation ne sont pas émises.
   *
   * Le jeton distingue deux demandes successives visant la même question :
   * sans lui, un second envoi fautif ne relancerait pas le déplacement.
   */
  const [cible, setCible] = useState<{ id: string; jeton: number } | null>(
    null,
  );
  const prochainJeton = useRef(0);

  /* Repère local de passage — clé dérivée de la formation et du questionnaire. */
  const [dejaRepondu, setDejaRepondu] = useEtatLocal<boolean>(
    `questionnaire:${formation}:${questionnaire.slug}`,
    false,
  );

  /** Garde synchrone : un double clic ne déclenche pas deux requêtes. */
  const envoiEnCours = useRef(false);
  const titreSucces = useRef<HTMLHeadingElement>(null);

  const manquantes = questionnaire.questions.filter(
    (question) => erreurs[question.id] !== undefined,
  );

  // Le formulaire disparaît à l’envoi : le focus doit suivre le remerciement,
  // sinon il retombe sur le document et l’utilisateur au clavier perd le fil.
  useEffect(() => {
    if (etat === "succes") titreSucces.current?.focus();
  }, [etat]);

  const definirReponse = useCallback(
    (id: string, valeur: string | string[] | number) => {
      setReponses((precedentes) => ({ ...precedentes, [id]: valeur }));
      setErreurs((precedentes) => {
        if (precedentes[id] === undefined) return precedentes;
        const suite = { ...precedentes };
        delete suite[id];
        return suite;
      });
    },
    [],
  );

  /** Demande le déplacement de l’attention vers une question. */
  const viser = useCallback((id: string) => {
    prochainJeton.current += 1;
    setCible({ id, jeton: prochainJeton.current });
  }, []);

  // Amène la question visée à l’écran, puis donne le focus à son premier
  // contrôle.
  useEffect(() => {
    if (cible === null) return;
    document
      .getElementById(`${base}-bloc-${cible.id}`)
      ?.scrollIntoView({ block: "start" });
    const champ = document.getElementById(`${base}-champ-${cible.id}`);
    if (champ instanceof HTMLElement) champ.focus({ preventScroll: true });
  }, [base, cible]);

  async function envoyer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    if (envoiEnCours.current) return;

    const fautives = questionnaire.questions.filter(
      (question) =>
        question.obligatoire && reponseManquante(question, reponses),
    );

    if (fautives.length > 0) {
      const nouvelles: Record<string, string> = {};
      for (const question of fautives) {
        nouvelles[question.id] = messageManquant(question);
      }
      setErreurs(nouvelles);
      setEchec(null);
      viser(fautives[0].id);
      return;
    }

    envoiEnCours.current = true;
    setEtat("envoi");
    setEchec(null);

    try {
      const reponse = await fetch("/api/reponses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formation,
          questionnaire: questionnaire.slug,
          reponses: chargeUtile(questionnaire.questions, reponses),
        }),
      });

      if (reponse.ok) {
        setDejaRepondu(true);
        setEtat("succes");
        return;
      }

      if (reponse.status === 409) {
        setEchec({
          message: "La collecte est fermée pour cette session.",
          reessayable: false,
        });
      } else if (reponse.status === 503) {
        setEchec({
          message: "La collecte n’est pas configurée sur ce site.",
          reessayable: false,
        });
      } else {
        setEchec({ message: MESSAGE_GENERIQUE, reessayable: true });
      }
      setEtat("repos");
    } catch {
      // Réseau coupé, requête interrompue : même message, aucun détail technique.
      setEchec({ message: MESSAGE_GENERIQUE, reessayable: true });
      setEtat("repos");
    } finally {
      envoiEnCours.current = false;
    }
  }

  /* ---------------------------------------------------------------- */
  /* Remerciement                                                      */
  /* ---------------------------------------------------------------- */

  if (etat === "succes") {
    return (
      <section
        role="status"
        className="rounded-lg border border-accent bg-accent-voile p-5 sm:p-6"
      >
        <div className="flex gap-3 sm:gap-4">
          <IconeValide />
          <div className="min-w-0 flex-1">
            {/*
              Niveau 2 : ce bloc remplace le formulaire, il est donc au même
              rang que les sections de la page, dont le titre est le h1.
            */}
            <h2
              ref={titreSucces}
              tabIndex={-1}
              className="font-serif text-lg font-semibold text-encre focus:outline-none"
            >
              Réponse enregistrée
            </h2>
            <p className="mt-2 text-encre-clair">
              {questionnaire.remerciement}
            </p>
            <p className="mt-3 text-xs text-graphite">
              Elle a été envoyée sans nom ni identifiant.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Garde-fou : ce navigateur a déjà servi à répondre                 */
  /* ---------------------------------------------------------------- */

  if (dejaRepondu && !reprise) {
    return (
      <section className="rounded-lg border border-trait bg-craie p-5 sm:p-6">
        <h2 className="font-serif text-lg font-semibold text-encre">
          Vous avez déjà répondu
        </h2>
        <p className="mt-2 text-encre-clair">
          Ce navigateur a déjà envoyé une réponse à «&nbsp;
          {questionnaire.titre}&nbsp;». Inutile de répondre une seconde fois.
        </p>
        <button
          type="button"
          onClick={() => setReprise(true)}
          className="mt-4 cursor-pointer rounded-md border border-trait-fort bg-craie px-4 py-2 text-sm font-medium text-encre transition-colors duration-150 hover:border-accent hover:text-accent"
        >
          Répondre à nouveau
        </button>
        <p className="mt-3 text-xs leading-relaxed text-graphite">
          Ce repère est enregistré dans votre navigateur seulement. Il
          n’identifie personne et n’empêche rien&nbsp;: si vous partagez ce
          poste, répondez à nouveau.
        </p>
      </section>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Formulaire                                                        */
  /* ---------------------------------------------------------------- */

  const enCours = etat === "envoi";
  const bloque = echec !== null && !echec.reessayable;

  return (
    <form
      noValidate
      onSubmit={envoyer}
      aria-label={questionnaire.titre}
      className="space-y-6"
    >
      <p className="text-encre-clair">{questionnaire.intro}</p>

      {manquantes.length > 0 ? (
        <div
          role="alert"
          className="rounded-lg border border-encre-clair bg-voile p-4"
        >
          <p className="font-semibold text-encre">
            {manquantes.length === 1
              ? "Une question obligatoire attend encore votre réponse."
              : `${manquantes.length} questions obligatoires attendent encore votre réponse.`}
          </p>
          <ul className="mt-2 space-y-1">
            {manquantes.map((question) => (
              <li key={question.id}>
                <button
                  type="button"
                  onClick={() => viser(question.id)}
                  className="cursor-pointer text-left text-sm text-accent underline underline-offset-4 transition-colors duration-150 hover:text-accent-fort"
                >
                  {question.libelle}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ol className="space-y-4">
        {questionnaire.questions.map((question, rang) => {
          const erreur = erreurs[question.id];
          const identifiant = idChamp(question.id);
          const brut = reponses[question.id];

          return (
            <li
              key={question.id}
              id={idBloc(question.id)}
              className="scroll-mt-28 rounded-lg border border-trait bg-craie p-4 sm:p-5"
            >
              <div className="flex gap-3 sm:gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-trait bg-voile font-mono text-xs tabular-nums text-graphite"
                >
                  {rang + 1}
                </span>

                <div className="min-w-0 flex-1">
                  {question.type === "choix-unique" ? (
                    <ChampChoixUnique
                      question={question}
                      valeur={valeurTexte(brut)}
                      onChange={(valeur) =>
                        definirReponse(question.id, valeur)
                      }
                      erreur={erreur}
                      id={identifiant}
                    />
                  ) : null}

                  {question.type === "choix-multiple" ? (
                    <ChampChoixMultiple
                      question={question}
                      valeur={valeurListe(brut)}
                      onChange={(valeur) =>
                        definirReponse(question.id, valeur)
                      }
                      erreur={erreur}
                      id={identifiant}
                    />
                  ) : null}

                  {question.type === "echelle" ? (
                    <ChampEchelle
                      question={question}
                      valeur={valeurNombre(brut)}
                      onChange={(valeur) =>
                        definirReponse(question.id, valeur)
                      }
                      erreur={erreur}
                      id={identifiant}
                    />
                  ) : null}

                  {question.type === "texte-libre" ? (
                    <ChampTexteLibre
                      question={question}
                      valeur={valeurTexte(brut)}
                      onChange={(valeur) =>
                        definirReponse(question.id, valeur)
                      }
                      erreur={erreur}
                      id={identifiant}
                    />
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {echec ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-encre-clair bg-voile p-4 font-medium text-encre"
        >
          <IconeAlerte />
          <span>{echec.message}</span>
        </p>
      ) : null}

      <div className="space-y-3 rounded-lg border border-trait bg-voile p-4 sm:p-5">
        <button
          type="submit"
          disabled={enCours || bloque}
          aria-busy={enCours}
          className="w-full cursor-pointer rounded-md bg-accent px-5 py-2.5 font-medium text-craie transition-colors duration-150 hover:bg-accent-fort disabled:cursor-default disabled:bg-estompe sm:w-auto"
        >
          {enCours ? "Envoi en cours…" : "Envoyer mes réponses"}
        </button>

        <p className="text-xs leading-relaxed text-graphite">
          Réponse anonyme&nbsp;: ni nom, ni adresse, ni identifiant ne sont
          enregistrés, et rien ne permet de remonter jusqu’à vous. N’y saisissez
          aucune donnée personnelle d’élève — nom, classe, note, situation.
        </p>
      </div>
    </form>
  );
}
