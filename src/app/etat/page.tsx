/**
 * État du site — page publique de vérification.
 *
 * Trois lignes, sans rien de secret : la base est-elle reliée et jointe, les
 * tables sont-elles en place, un code animateur est-il défini, l’assistant
 * est-il configuré. De quoi comprendre, sans se connecter nulle part,
 * pourquoi une fonction ne répond pas — et quoi faire.
 *
 * Aucune chaîne de connexion, aucun nom d’hôte, aucun message d’erreur
 * complet : seulement des états et, au pire, un code d’erreur.
 */

import type { Metadata } from "next";
import Link from "next/link";

import { codeAnimateurConfigure, secretAnimateur } from "@/lib/animateur";
import { collecteConfiguree, diagnostiquerBase } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "État du site",
  robots: { index: false, follow: false },
};

type Etat = "ok" | "erreur" | "attention" | "neutre";

/** Ne garde d’un message d’erreur que son code, jamais son texte. */
function codeSeul(detail: string): string {
  const code = detail.split(" — ")[0]?.trim() ?? "";
  return /^[A-Z0-9_]{3,20}$/.test(code) ? code : "erreur";
}

function Ligne({
  etat,
  titre,
  detail,
  action,
}: {
  etat: Etat;
  titre: string;
  detail?: string;
  action?: string;
}) {
  const pastille: Record<Etat, string> = {
    ok: "bg-vert",
    erreur: "bg-rouge",
    attention: "bg-ambre",
    neutre: "bg-trait-fort",
  };
  const libelle: Record<Etat, string> = {
    ok: "OK",
    erreur: "Problème",
    attention: "À faire",
    neutre: "Non vérifié",
  };
  return (
    <li className="flex items-start gap-4 py-4">
      <span
        aria-hidden="true"
        className={`mt-1.5 size-3 shrink-0 rounded-full ${pastille[etat]}`}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-encre">
          <span className="sr-only">{libelle[etat]} — </span>
          {titre}
        </p>
        {detail ? (
          <p className="mt-0.5 text-sm text-graphite">{detail}</p>
        ) : null}
        {action ? (
          <p className="mt-2 rounded-md border border-ambre-trait bg-ambre-voile px-3 py-2 text-sm leading-relaxed text-encre">
            {action}
          </p>
        ) : null}
      </div>
      <span
        className={[
          "shrink-0 rounded-full border px-2 py-0.5 font-mono text-xs",
          etat === "ok"
            ? "border-vert-trait text-vert"
            : etat === "erreur"
              ? "border-rouge-trait text-rouge"
              : etat === "attention"
                ? "border-ambre-trait text-ambre"
                : "border-trait text-estompe",
        ].join(" ")}
      >
        {libelle[etat]}
      </span>
    </li>
  );
}

export default async function PageEtat() {
  const base = await diagnostiquerBase();
  const secret = await secretAnimateur();
  const assistant = Boolean(process.env.ANTHROPIC_API_KEY);

  const baseReliee = collecteConfiguree();
  const connexionOk = base.connexion.ok;
  const tablesOk = base.schema?.ok === true && base.schema.tables.length >= 4;

  const ACTION_RELIER =
    "Sur Vercel : ouvrir le projet, onglet Storage, Create Database (Postgres), relier la base au projet. Puis Deployments, menu du dernier déploiement, Redeploy. Recharger cette page ensuite.";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm text-accent">Vérification</p>
      <h1 className="mt-2 font-serif text-3xl leading-tight text-encre sm:text-4xl">
        État du site
      </h1>
      <p className="mt-3 text-graphite">
        Ce que le site voit de sa configuration, à l’instant. Rien de secret
        n’est affiché : cette page peut être partagée telle quelle.
      </p>

      <ul className="mt-8 divide-y divide-trait rounded-lg border border-trait bg-craie px-5">
        <Ligne
          etat={baseReliee ? "ok" : "attention"}
          titre="Base de données reliée"
          detail={
            baseReliee
              ? `Chaîne de connexion trouvée dans ${base.variable}.`
              : base.variablesUrl.length > 0
                ? "Aucune variable ne contient une adresse Postgres."
                : "Aucune variable de connexion n’est présente."
          }
          action={baseReliee ? undefined : ACTION_RELIER}
        />
        <Ligne
          etat={!baseReliee ? "neutre" : connexionOk ? "ok" : "erreur"}
          titre="Connexion à la base"
          detail={
            !baseReliee
              ? "Non tentée : aucune base reliée."
              : connexionOk
                ? "Le site joint la base."
                : `Échec (${codeSeul(base.connexion.erreur)}).`
          }
          action={
            baseReliee && !connexionOk
              ? "La base existe mais ne répond pas au site. Sur Vercel, onglet Storage : vérifier que la base est bien reliée à ce projet et active, puis Redeploy. Si le problème persiste, envoyer une capture de cette page au référent numérique."
              : undefined
          }
        />
        <Ligne
          etat={
            !baseReliee || !connexionOk
              ? "neutre"
              : tablesOk
                ? "ok"
                : "erreur"
          }
          titre="Tables de collecte"
          detail={
            !baseReliee || !connexionOk
              ? "Non vérifiées."
              : base.schema?.ok
                ? `${base.schema.tables.length} table${base.schema.tables.length > 1 ? "s" : ""} en place.`
                : `Création impossible (${codeSeul(base.schema?.ok === false ? base.schema.erreur : "")}).`
          }
        />
        <Ligne
          etat={secret ? "ok" : baseReliee && connexionOk ? "attention" : "neutre"}
          titre="Code d’accès animateur"
          detail={
            secret
              ? secret.origine === "environnement"
                ? "Défini par la variable d’environnement CODE_ANIMATEUR."
                : "Défini depuis le site."
              : codeAnimateurConfigure()
                ? "Défini par l’environnement."
                : "Aucun code défini pour l’instant."
          }
          action={
            !secret && baseReliee && connexionOk
              ? "Ouvrir la page animateur : elle propose de choisir le code."
              : undefined
          }
        />
        <Ligne
          etat={assistant ? "ok" : "neutre"}
          titre="Assistant IA"
          detail={
            assistant
              ? "Configuré."
              : "Non configuré (facultatif) : ajouter ANTHROPIC_API_KEY dans les variables du projet pour l’activer."
          }
        />
      </ul>

      <p className="mt-6 text-sm text-graphite">
        <Link
          href="/formations/ia-generative-maternelle/animateur"
          className="text-accent underline underline-offset-4 hover:text-accent-fort"
        >
          Aller à la page animateur
        </Link>
      </p>
    </div>
  );
}
