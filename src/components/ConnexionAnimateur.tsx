"use client";

/**
 * Porte d’entrée du tableau de bord animateur.
 *
 * Un seul champ : le code de session, connu de l’animateur seul. Le composant
 * ne sait rien du contenu qu’il protège et n’en laisse rien transparaître —
 * c’est la page qui décide de rendre ce formulaire ou le tableau de bord, et
 * elle ne rend jamais les deux.
 *
 * Le code n’est jamais conservé côté navigateur : il part une fois vers
 * /api/animateur/connexion, qui le compare en temps constant et pose un cookie
 * de session. En cas de succès, on ne construit pas l’écran ici : on demande à
 * Next de rejouer le rendu serveur de la page (`router.refresh()`), qui relit
 * le cookie et sert le tableau de bord.
 *
 * Volontairement petit et sobre : ce n’est pas une page d’accueil, c’est un
 * verrou.
 */

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useId, useRef, useState } from "react";

/** Route de vérification du code. Réunie ici : un seul endroit à corriger. */
const ROUTE_CONNEXION = "/api/animateur/connexion";

/** Étapes de la vérification. « succes » laisse la page se recharger. */
type EtatConnexion = "repos" | "envoi" | "succes";

/**
 * Message affiché pour un statut HTTP.
 *
 * L’animateur lit une phrase en français, jamais un code de statut ; et un
 * code refusé ne dit pas si le code attendu existe, sauf dans le cas 503 où
 * l’absence de configuration est justement l’information utile.
 */
function messageDuStatut(statut: number): string {
  switch (statut) {
    case 400:
      return "Saisissez le code de la session.";
    case 401:
    case 403:
      return "Code incorrect. Vérifiez la saisie, puis réessayez.";
    case 429:
      return "Trop de tentatives. Patientez un instant avant de réessayer.";
    case 503:
      return "Aucun code d’accès n’est défini sur ce site : le tableau de bord reste fermé.";
    default:
      return "La vérification n’a pas abouti. Vérifiez votre connexion, puis réessayez.";
  }
}

function IconeCadenas() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
    >
      <rect x="4.5" y="10" width="15" height="10.5" rx="2" />
      <path d="M8.25 10V7.25a3.75 3.75 0 0 1 7.5 0V10" />
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

export default function ConnexionAnimateur() {
  const router = useRouter();
  const base = useId();
  const idChamp = `${base}-code`;
  const idErreur = `${base}-erreur`;

  const [code, setCode] = useState("");
  const [etat, setEtat] = useState<EtatConnexion>("repos");
  const [erreur, setErreur] = useState<string | null>(null);

  /** Garde synchrone : un double clic ne déclenche pas deux vérifications. */
  const envoiEnCours = useRef(false);

  const verifier = useCallback(
    async (evenement: FormEvent<HTMLFormElement>) => {
      evenement.preventDefault();
      if (envoiEnCours.current) return;

      const saisie = code.trim();
      if (saisie.length === 0) {
        setErreur("Saisissez le code de la session.");
        return;
      }

      envoiEnCours.current = true;
      setEtat("envoi");
      setErreur(null);

      try {
        const reponse = await fetch(ROUTE_CONNEXION, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: saisie }),
        });

        if (!reponse.ok) {
          setErreur(messageDuStatut(reponse.status));
          setEtat("repos");
          envoiEnCours.current = false;
          return;
        }

        // Le cookie est posé : le code n’a plus aucune raison de rester en mémoire.
        setCode("");
        setEtat("succes");
        router.refresh();
      } catch {
        setErreur(
          "La vérification n’a pas abouti. Vérifiez votre connexion, puis réessayez.",
        );
        setEtat("repos");
        envoiEnCours.current = false;
      }
    },
    [code, router],
  );

  const enCours = etat !== "repos";

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-24">
      <div className="rounded-[--radius-carte] border border-trait bg-craie p-6 sm:p-8">
        <p className="flex items-center gap-2 text-accent">
          <IconeCadenas />
          <span className="text-sm">Espace animateur</span>
        </p>

        <h1 className="mt-3 font-serif text-2xl leading-tight text-encre">
          Tableau de bord de la séance
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-graphite">
          Cet écran est réservé à l’animateur : il affiche les réponses de la
          salle et permet d’ouvrir ou de fermer la collecte. Les formulaires,
          eux, restent en accès libre.
        </p>

        <form onSubmit={verifier} noValidate className="mt-6">
          <label
            htmlFor={idChamp}
            className="block text-sm font-medium text-encre"
          >
            Code de la session
          </label>

          <input
            id={idChamp}
            name="code"
            type="password"
            autoComplete="current-password"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={code}
            disabled={enCours}
            onChange={(evenement) => {
              setCode(evenement.target.value);
              if (erreur) setErreur(null);
            }}
            aria-invalid={erreur ? true : undefined}
            aria-describedby={erreur ? idErreur : undefined}
            className={[
              "mt-2 block w-full rounded-lg border bg-craie px-3.5 py-2.5",
              "text-base text-encre placeholder:text-estompe",
              "transition-colors disabled:opacity-60",
              erreur ? "border-encre" : "border-trait hover:border-trait-fort",
            ].join(" ")}
          />

          {erreur ? (
            <p
              id={idErreur}
              role="alert"
              className="mt-2 flex items-start gap-1.5 text-sm leading-snug text-encre"
            >
              <IconeAlerte />
              <span>{erreur}</span>
            </p>
          ) : null}

          <button
            type="submit"
            disabled={enCours}
            className={[
              "mt-5 inline-flex w-full items-center justify-center rounded-lg",
              "bg-accent px-5 py-3 text-base font-medium text-craie",
              "transition-colors hover:bg-accent-fort disabled:opacity-60",
            ].join(" ")}
          >
            {etat === "envoi"
              ? "Vérification…"
              : etat === "succes"
                ? "Ouverture…"
                : "Ouvrir le tableau de bord"}
          </button>
        </form>

        <p className="mt-5 text-xs leading-relaxed text-estompe">
          Le code est celui choisi par l’animateur — depuis le site, ou dans la
          variable d’environnement CODE_ANIMATEUR. Il n’est pas conservé dans le
          navigateur : l’accès tient douze heures, puis il faut le saisir à
          nouveau.
        </p>
      </div>
    </div>
  );
}
