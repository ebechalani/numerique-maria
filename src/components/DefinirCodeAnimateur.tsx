"use client";

/**
 * Choix du code d’accès animateur, depuis le site.
 *
 * Deux usages : l’installation (aucun code n’existe, le premier visiteur de la
 * page animateur le choisit et entre aussitôt), et le changement (un animateur
 * connecté en choisit un nouveau). Le code est saisi deux fois, en clair : on
 * doit pouvoir le relire avant de l’enregistrer, il servira toute la séance.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useId, useRef, useState } from "react";

const ROUTE_CODE = "/api/animateur/code";

interface Proprietes {
  mode: "creation" | "modification";
  /** Adresse du tableau de bord, proposée après un changement. */
  lienRetour: string;
}

type Etat = "repos" | "envoi" | "succes";

function IconeCle() {
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
      <circle cx="8" cy="15" r="4" />
      <path d="M10.85 12.15 20 3" />
      <path d="M17 6l3 3" />
      <path d="M14 9l2 2" />
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

const CLASSES_CHAMP = [
  "mt-2 block w-full rounded-lg border bg-craie px-3.5 py-2.5",
  "text-base text-encre placeholder:text-estompe",
  "transition-colors disabled:opacity-60",
].join(" ");

export default function DefinirCodeAnimateur({ mode, lienRetour }: Proprietes) {
  const router = useRouter();
  const base = useId();
  const idCode = `${base}-code`;
  const idConfirmation = `${base}-confirmation`;
  const idErreur = `${base}-erreur`;

  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [etat, setEtat] = useState<Etat>("repos");
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const envoiEnCours = useRef(false);

  const enregistrer = useCallback(
    async (evenement: FormEvent<HTMLFormElement>) => {
      evenement.preventDefault();
      if (envoiEnCours.current) return;

      const propre = code.trim();
      if (propre.length < 6) {
        setErreur("Choisissez un code d’au moins 6 caractères — une phrase courte, par exemple.");
        return;
      }
      if (propre !== confirmation.trim()) {
        setErreur("Les deux saisies ne sont pas identiques.");
        return;
      }

      envoiEnCours.current = true;
      setEtat("envoi");
      setErreur(null);

      try {
        const reponse = await fetch(ROUTE_CODE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: propre }),
        });
        const corps = (await reponse.json().catch(() => ({}))) as {
          message?: string;
        };

        if (!reponse.ok) {
          setErreur(
            corps.message ??
              "L’enregistrement n’a pas abouti. Vérifiez votre connexion, puis réessayez.",
          );
          setEtat("repos");
          envoiEnCours.current = false;
          return;
        }

        setCode("");
        setConfirmation("");
        setMessage(corps.message ?? "Code enregistré.");
        setEtat("succes");
        if (mode === "creation") router.refresh();
      } catch {
        setErreur(
          "L’enregistrement n’a pas abouti. Vérifiez votre connexion, puis réessayez.",
        );
        setEtat("repos");
        envoiEnCours.current = false;
      }
    },
    [code, confirmation, mode, router],
  );

  const enCours = etat !== "repos";

  if (etat === "succes" && mode === "modification") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-24">
        <div
          role="status"
          className="rounded-[--radius-carte] border border-accent bg-accent-voile p-6 sm:p-8"
        >
          <h1 className="font-serif text-2xl leading-tight text-encre">
            Code modifié
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-encre-clair">{message}</p>
          <Link
            href={lienRetour}
            className="mt-5 inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-craie transition-colors hover:bg-accent-fort"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-24">
      <div className="rounded-[--radius-carte] border border-trait bg-craie p-6 sm:p-8">
        <p className="flex items-center gap-2 text-accent">
          <IconeCle />
          <span className="text-sm">Espace animateur</span>
        </p>

        <h1 className="mt-3 font-serif text-2xl leading-tight text-encre">
          {mode === "creation"
            ? "Choisissez votre code d’accès"
            : "Changer le code d’accès"}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-graphite">
          {mode === "creation"
            ? "Aucun code n’est encore défini sur ce site. Le premier à en choisir un ouvre le tableau de bord : faites-le maintenant. Une phrase courte, connue de vous seul, que vous pourrez changer à chaque séance."
            : "Le nouveau code prend effet immédiatement : les autres appareils connectés devront le saisir à nouveau."}
        </p>

        <form onSubmit={enregistrer} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor={idCode} className="block text-sm font-medium text-encre">
              Nouveau code
            </label>
            <input
              id={idCode}
              name="code"
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={code}
              disabled={enCours}
              onChange={(evenement) => {
                setCode(evenement.target.value);
                if (erreur) setErreur(null);
              }}
              placeholder="ex. rentree-montaigne-2026"
              aria-invalid={erreur ? true : undefined}
              aria-describedby={erreur ? idErreur : undefined}
              className={[
                CLASSES_CHAMP,
                erreur ? "border-encre" : "border-trait hover:border-trait-fort",
              ].join(" ")}
            />
          </div>

          <div>
            <label
              htmlFor={idConfirmation}
              className="block text-sm font-medium text-encre"
            >
              Le même code, une seconde fois
            </label>
            <input
              id={idConfirmation}
              name="confirmation"
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={confirmation}
              disabled={enCours}
              onChange={(evenement) => {
                setConfirmation(evenement.target.value);
                if (erreur) setErreur(null);
              }}
              className={[
                CLASSES_CHAMP,
                erreur ? "border-encre" : "border-trait hover:border-trait-fort",
              ].join(" ")}
            />
          </div>

          {erreur ? (
            <p
              id={idErreur}
              role="alert"
              className="flex items-start gap-1.5 text-sm leading-snug text-encre"
            >
              <IconeAlerte />
              <span>{erreur}</span>
            </p>
          ) : null}

          <button
            type="submit"
            disabled={enCours}
            className={[
              "mt-2 inline-flex w-full items-center justify-center rounded-lg",
              "bg-accent px-5 py-3 text-base font-medium text-craie",
              "transition-colors hover:bg-accent-fort disabled:opacity-60",
            ].join(" ")}
          >
            {etat === "envoi"
              ? "Enregistrement…"
              : etat === "succes"
                ? "Ouverture…"
                : mode === "creation"
                  ? "Enregistrer et ouvrir le tableau de bord"
                  : "Enregistrer le nouveau code"}
          </button>
        </form>

        <p className="mt-5 text-xs leading-relaxed text-estompe">
          Seule une empreinte du code est conservée dans la base du site : il ne
          peut pas être relu, seulement remplacé. Notez-le quelque part de sûr.
        </p>

        {mode === "modification" ? (
          <p className="mt-3 text-xs">
            <Link
              href={lienRetour}
              className="text-accent underline underline-offset-4 hover:text-accent-fort"
            >
              Revenir au tableau de bord sans changer le code
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
