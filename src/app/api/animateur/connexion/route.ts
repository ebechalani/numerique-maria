/**
 * Connexion de l’animateur — POST { code }.
 *
 * Reçoit le code d’accès saisi sur la page animateur, le compare à
 * `CODE_ANIMATEUR` en temps constant, et pose le cookie d’accès si les deux
 * correspondent. C’est le seul endroit du site où un secret est comparé.
 *
 * Réponses possibles :
 *   200  { ok: true }                      cookie posé, valable 12 h
 *   400  corps illisible ou code manquant
 *   401  code refusé — sans dire si un code est configuré
 *   429  trop de tentatives depuis la même adresse
 *   503  aucun code configuré sur ce déploiement
 *
 * Le 401 est volontairement muet : il ne distingue pas « mauvais code » de
 * « code d’une autre longueur », et ne révèle rien de la valeur attendue.
 */

import { cookies } from "next/headers";

import {
  COOKIE_ANIMATEUR,
  ENTETES_SANS_CACHE,
  codeCorrespond,
  empreinte,
  optionsCookieAnimateur,
  secretAnimateur,
  valeurCookieAttendue,
} from "@/lib/animateur";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* Limitation des tentatives                                           */
/* ------------------------------------------------------------------ */

/** Fenêtre glissante et plafond : dix essais par tranche de dix minutes. */
const FENETRE_MS = 10 * 60 * 1000;
const MAX_TENTATIVES = 10;

/** Au-delà, la saisie n’est même pas un code : on refuse sans hacher. */
const MAX_CARACTERES_CODE = 512;

/** Nettoyage préventif : au-delà, on purge les fenêtres échues. */
const SEUIL_PURGE = 500;

/**
 * Compteur de tentatives, en mémoire du processus.
 *
 * IMPORTANT — cette limite est **par instance**. En hébergement sans état
 * (Vercel), plusieurs instances peuvent servir les requêtes en parallèle et
 * chacune tient son propre compteur : le plafond réel est donc un multiple
 * approximatif de MAX_TENTATIVES, et une instance recyclée repart de zéro. Ce
 * n’est pas une protection robuste contre une attaque par force brute, c’est un
 * garde-fou contre l’essai manuel répété — ce qui correspond à l’usage visé (un
 * code de séance, changé à chaque formation, sur un site de formation interne).
 * Une vraie limitation demanderait un magasin partagé (Redis, table Postgres) ;
 * ce serait disproportionné ici, mais il vaut mieux le dire que laisser croire
 * la mesure plus solide qu’elle n’est.
 *
 * La clé n’est pas l’adresse IP mais son condensat : la mémoire du serveur ne
 * contient donc aucune adresse en clair, et rien n’est écrit en base.
 */
const tentatives = new Map<string, { compte: number; finFenetre: number }>();

/** Clé d’appel anonymisée, dérivée de l’adresse vue par le proxy. */
function cleAppelant(requete: Request): string {
  const entete =
    requete.headers.get("x-forwarded-for") ??
    requete.headers.get("x-real-ip") ??
    "";
  // « x-forwarded-for » liste les relais traversés : le client est en tête.
  const adresse = entete.split(",")[0]?.trim() ?? "";
  return empreinte(adresse || "adresse-inconnue");
}

function purger(maintenant: number): void {
  if (tentatives.size < SEUIL_PURGE) return;
  for (const [cle, suivi] of tentatives) {
    if (suivi.finFenetre <= maintenant) tentatives.delete(cle);
  }
}

/** Compte la tentative et indique si le plafond est dépassé. */
function tropDeTentatives(cle: string): boolean {
  const maintenant = Date.now();
  purger(maintenant);

  const suivi = tentatives.get(cle);
  if (!suivi || suivi.finFenetre <= maintenant) {
    tentatives.set(cle, { compte: 1, finFenetre: maintenant + FENETRE_MS });
    return false;
  }

  suivi.compte += 1;
  return suivi.compte > MAX_TENTATIVES;
}

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

function erreur(
  code: string,
  message: string,
  statut: number,
  entetes: Record<string, string> = {},
): Response {
  return Response.json(
    { erreur: code, message },
    { status: statut, headers: { ...ENTETES_SANS_CACHE, ...entetes } },
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

  if (typeof brut !== "string" || brut.trim().length === 0) {
    return erreur("code-manquant", "Saisissez le code d’accès.", 400);
  }

  if (brut.length > MAX_CARACTERES_CODE) {
    return erreur(
      "code-invalide",
      `Le code d’accès ne peut pas dépasser ${MAX_CARACTERES_CODE} caractères.`,
      400,
    );
  }

  const secret = await secretAnimateur();

  // Aucun code défini : le tableau de bord est fermé pour tout le monde, et
  // le dire ici est utile — c’est l’animateur qui lit ce message. La page
  // animateur lui propose de choisir un code dès que la base est reliée.
  if (!secret) {
    return erreur(
      "code-non-configure",
      "Aucun code d’accès n’est défini sur ce site : le tableau de bord reste " +
        "fermé. Rechargez la page animateur pour en choisir un, une fois la " +
        "base de données reliée.",
      503,
    );
  }

  const cle = cleAppelant(requete);

  if (tropDeTentatives(cle)) {
    return erreur(
      "trop-de-tentatives",
      "Trop de tentatives depuis cet appareil. Attendez une dizaine de minutes " +
        "avant de réessayer.",
      429,
      { "Retry-After": String(Math.ceil(FENETRE_MS / 1000)) },
    );
  }

  // Le code saisi est comparé après avoir été rogné : un espace collé par un
  // copier-coller ne doit pas faire échouer une saisie par ailleurs correcte.
  if (!codeCorrespond(brut, secret)) {
    return erreur(
      "code-refuse",
      "Code d’accès incorrect. Vérifiez la saisie, ou demandez le code au " +
        "référent numérique.",
      401,
    );
  }

  // Succès : la fenêtre de tentatives est remise à zéro pour cet appareil.
  tentatives.delete(cle);

  const boite = await cookies();
  boite.set(
    COOKIE_ANIMATEUR,
    valeurCookieAttendue(secret.secret),
    optionsCookieAnimateur(),
  );

  return Response.json(
    { ok: true, message: "Accès animateur ouvert pour douze heures." },
    { status: 200, headers: ENTETES_SANS_CACHE },
  );
}
