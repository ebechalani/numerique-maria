/**
 * Définition du code d’accès animateur depuis le site.
 *
 * POST { code }
 *
 * Deux situations :
 *  - aucun code n’existe encore : le premier visiteur de la page animateur le
 *    choisit ici — c’est l’installation du site, à faire dès la base reliée ;
 *  - un code existe déjà en base : seul un animateur connecté peut le changer.
 *
 * Quand le code vient de la variable d’environnement CODE_ANIMATEUR, cette
 * route refuse : le code se change là où il est défini.
 *
 * Seule l’empreinte SHA-256 du code est enregistrée. Le cookie d’accès est posé
 * dans la foulée : l’animateur qui vient de choisir son code est connecté.
 */

import { cookies } from "next/headers";

import {
  animateurAutorise,
  COOKIE_ANIMATEUR,
  empreinteDuCode,
  ENTETES_SANS_CACHE,
  optionsCookieAnimateur,
  refuserAcces,
  REGLAGE_CODE_ANIMATEUR,
  secretAnimateur,
  valeurCookieAttendue,
} from "@/lib/animateur";
import { collecteConfiguree, ecrireReglage } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Bornes du code : assez long pour ne pas se deviner, assez court pour se dire. */
export const MIN_CARACTERES_CODE = 6;
export const MAX_CARACTERES_CODE = 120;

function erreur(code: string, message: string, statut: number): Response {
  return Response.json(
    { erreur: code, message },
    { status: statut, headers: ENTETES_SANS_CACHE },
  );
}

export async function POST(requete: Request): Promise<Response> {
  let charge: unknown;
  try {
    charge = await requete.json();
  } catch {
    return erreur(
      "requete-invalide",
      "Le corps de la requête n’est pas un JSON valide.",
      400,
    );
  }

  const brut =
    typeof charge === "object" && charge !== null
      ? (charge as { code?: unknown }).code
      : undefined;
  const code = typeof brut === "string" ? brut.trim() : "";

  if (code.length < MIN_CARACTERES_CODE) {
    return erreur(
      "code-trop-court",
      `Choisissez un code d’au moins ${MIN_CARACTERES_CODE} caractères — une phrase courte, par exemple.`,
      400,
    );
  }
  if (code.length > MAX_CARACTERES_CODE) {
    return erreur(
      "code-trop-long",
      `Le code ne peut pas dépasser ${MAX_CARACTERES_CODE} caractères.`,
      400,
    );
  }

  const secret = await secretAnimateur();

  if (secret?.origine === "environnement") {
    return erreur(
      "code-environnement",
      "Le code d’accès est fourni par la variable d’environnement CODE_ANIMATEUR : " +
        "c’est là qu’il se change.",
      409,
    );
  }

  if (!collecteConfiguree()) {
    return erreur(
      "collecte-non-configuree",
      "Le code se conserve dans la base de données du site, qui n’est pas encore " +
        "reliée. Reliez la base, puis revenez choisir le code.",
      503,
    );
  }

  // Un code existe : on ne le remplace qu’en étant déjà entré.
  if (secret && !(await animateurAutorise())) return refuserAcces();

  const empreinteCode = empreinteDuCode(code);
  try {
    await ecrireReglage(REGLAGE_CODE_ANIMATEUR, empreinteCode);
  } catch (souci) {
    console.error("[animateur/code] enregistrement impossible :", souci);
    return erreur(
      "enregistrement-impossible",
      "Le code n’a pas pu être enregistré. La base est peut-être injoignable ; " +
        "réessayez dans un instant.",
      500,
    );
  }

  const boite = await cookies();
  boite.set(
    COOKIE_ANIMATEUR,
    valeurCookieAttendue(empreinteCode),
    optionsCookieAnimateur(),
  );

  return Response.json(
    {
      ok: true,
      modifie: secret !== null,
      message: secret
        ? "Nouveau code enregistré. Les autres appareils devront le saisir à nouveau."
        : "Code enregistré. Le tableau de bord s’ouvre.",
    },
    { status: 200, headers: ENTETES_SANS_CACHE },
  );
}
