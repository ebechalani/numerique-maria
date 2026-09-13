"use client";

/**
 * Diagnostic de la base, affiché dans l’onglet Séance du tableau de bord.
 *
 * Un bouton, une lecture de /api/animateur/diagnostic, et trois lignes :
 * la variable trouvée, la connexion, le schéma. Quand une séance refuse de
 * s’ouvrir, c’est ici que l’animateur voit pourquoi — sans ouvrir la console
 * de l’hébergeur.
 */

import { useCallback, useState } from "react";

interface Diagnostic {
  variable: string | null;
  variablesUrl: string[];
  hote: string | null;
  connexion: { ok: true; version: string } | { ok: false; erreur: string };
  schema:
    | { ok: true; tables: string[] }
    | { ok: false; erreur: string }
    | null;
}

const ROUTE = "/api/animateur/diagnostic";

const TABLES_ATTENDUES = [
  "formation_reglage",
  "formation_reponse",
  "formation_restitution",
  "formation_session",
];

function Ligne({
  etat,
  titre,
  detail,
}: {
  etat: "ok" | "erreur" | "neutre";
  titre: string;
  detail?: string;
}) {
  const pastille =
    etat === "ok"
      ? "bg-vert"
      : etat === "erreur"
        ? "bg-rouge"
        : "bg-trait-fort";
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className={`mt-[0.45rem] size-2.5 shrink-0 rounded-full ${pastille}`}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-encre">
          <span className="sr-only">
            {etat === "ok" ? "OK — " : etat === "erreur" ? "Problème — " : ""}
          </span>
          {titre}
        </span>
        {detail ? (
          <span className="mt-0.5 block break-words text-xs leading-relaxed text-graphite">
            {detail}
          </span>
        ) : null}
      </span>
    </li>
  );
}

export default function DiagnosticBase({ ouvert = false }: { ouvert?: boolean }) {
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [etat, setEtat] = useState<"repos" | "chargement" | "erreur">("repos");
  const [visible, setVisible] = useState(ouvert);

  const lancer = useCallback(async () => {
    setEtat("chargement");
    setVisible(true);
    try {
      const reponse = await fetch(ROUTE, { cache: "no-store" });
      if (!reponse.ok) {
        setEtat("erreur");
        return;
      }
      setDiagnostic((await reponse.json()) as Diagnostic);
      setEtat("repos");
    } catch {
      setEtat("erreur");
    }
  }, []);

  const tablesPresentes =
    diagnostic?.schema && diagnostic.schema.ok ? diagnostic.schema.tables : null;
  const manquantes = tablesPresentes
    ? TABLES_ATTENDUES.filter((table) => !tablesPresentes.includes(table))
    : [];

  return (
    <div className="mt-4 border-t border-trait pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-graphite">
          Une séance ne s’ouvre pas ? Le diagnostic dit ce que le site voit de
          sa base de données.
        </p>
        <button
          type="button"
          onClick={() => void lancer()}
          disabled={etat === "chargement"}
          className="rounded-lg border border-trait bg-craie px-3 py-1.5 text-sm font-medium text-encre transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {etat === "chargement" ? "Diagnostic en cours…" : "Lancer le diagnostic"}
        </button>
      </div>

      {visible && etat === "erreur" ? (
        <p role="alert" className="mt-3 text-sm text-encre">
          Le diagnostic n’a pas pu être lu. Votre accès a peut-être expiré :
          rechargez la page.
        </p>
      ) : null}

      {visible && diagnostic ? (
        <ul className="mt-4 space-y-3 rounded-lg border border-trait bg-voile p-4">
          <Ligne
            etat={diagnostic.variable ? "ok" : "erreur"}
            titre={
              diagnostic.variable
                ? `Chaîne de connexion trouvée dans ${diagnostic.variable}`
                : "Aucune chaîne de connexion Postgres dans l’environnement"
            }
            detail={
              diagnostic.variable
                ? diagnostic.hote
                  ? `Hôte : ${diagnostic.hote}`
                  : undefined
                : diagnostic.variablesUrl.length > 0
                  ? `Variables *_URL présentes, mais aucune ne contient une adresse postgres:// : ${diagnostic.variablesUrl.join(", ")}. Sur Vercel : Storage → relier la base au projet, puis Redeploy.`
                  : "Aucune variable *_URL n’est présente. Sur Vercel : Storage → Create Database (Postgres) → relier au projet → Deployments → Redeploy."
            }
          />
          <Ligne
            etat={diagnostic.connexion.ok ? "ok" : diagnostic.variable ? "erreur" : "neutre"}
            titre={
              diagnostic.connexion.ok
                ? "Connexion à la base réussie"
                : diagnostic.variable
                  ? "Connexion à la base impossible"
                  : "Connexion non tentée"
            }
            detail={
              diagnostic.connexion.ok
                ? diagnostic.connexion.version.split(" on ")[0]
                : diagnostic.variable
                  ? diagnostic.connexion.erreur
                  : undefined
            }
          />
          <Ligne
            etat={
              diagnostic.schema === null
                ? "neutre"
                : diagnostic.schema.ok && manquantes.length === 0
                  ? "ok"
                  : "erreur"
            }
            titre={
              diagnostic.schema === null
                ? "Tables non vérifiées"
                : diagnostic.schema.ok
                  ? manquantes.length === 0
                    ? "Les quatre tables sont en place"
                    : `Tables manquantes : ${manquantes.join(", ")}`
                  : "Création des tables impossible"
            }
            detail={
              diagnostic.schema === null
                ? undefined
                : diagnostic.schema.ok
                  ? `Présentes : ${diagnostic.schema.tables.join(", ") || "aucune"}`
                  : diagnostic.schema.erreur
            }
          />
        </ul>
      ) : null}
    </div>
  );
}
