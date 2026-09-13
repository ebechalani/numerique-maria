/**
 * Accès animateur — protection du tableau de bord des résultats.
 *
 * Le site est en accès libre : les enseignants répondent aux questionnaires
 * sans se connecter, et c’est voulu (aucun identifiant, donc aucune trace
 * nominative). Seul le tableau de bord — qui projette les résultats de la salle
 * et ouvre ou ferme les sessions — demande un code : celui de la variable
 * d’environnement `CODE_ANIMATEUR` si elle existe, sinon celui que l’animateur
 * a choisi depuis le site, dont seule l’empreinte est enregistrée en base.
 *
 * Trois choix de conception, tous délibérés.
 *
 *  1. Pas d’accès par défaut. Si `CODE_ANIMATEUR` n’est pas défini,
 *     `animateurAutorise()` renvoie **false** : un déploiement où l’on aurait
 *     oublié la variable garde le tableau de bord fermé plutôt que de l’ouvrir
 *     à tous. C’est l’inverse de la dégradation des autres modules, et c’est
 *     normal : ici, l’absence de configuration ne doit rien débloquer.
 *
 *  2. Comparaison en temps constant. Les deux valeurs comparées sont d’abord
 *     réduites à leur condensat SHA-256 : les longueurs deviennent identiques
 *     (32 octets), `timingSafeEqual` ne lève donc jamais, et la durée de la
 *     comparaison ne dépend pas du contenu. Comparer directement deux chaînes
 *     de longueurs différentes ferait lever la fonction, et un `===` classique
 *     s’arrête au premier caractère qui diffère, ce qui se mesure.
 *
 *  3. Le cookie ne contient pas le code. Il porte le condensat de
 *     (code + « : » + sel) : lire le cookie ne redonne pas le code, et un
 *     changement de `CODE_ANIMATEUR` invalide immédiatement tous les cookies
 *     déjà posés. Aucune donnée personnelle n’y figure — pas de nom, pas
 *     d’identifiant, pas d’adresse.
 *
 * Module serveur : il utilise `node:crypto` et `next/headers`.
 */

import { createHash, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { collecteConfiguree, lireReglage } from "@/lib/db";

/* ------------------------------------------------------------------ */
/* Constantes                                                          */
/* ------------------------------------------------------------------ */

/** Nom du cookie d’accès. */
export const COOKIE_ANIMATEUR = "animateur";

/**
 * Sel du condensat stocké dans le cookie. Il n’est pas secret : son rôle est
 * d’éviter que la valeur du cookie soit le SHA-256 nu du code, qu’un
 * dictionnaire de phrases courantes retrouverait.
 */
const SEL_COOKIE = "lm-numerique";

/** Durée de l’accès : une journée de formation, largement. */
export const DUREE_ACCES_SECONDES = 12 * 60 * 60;

/** Message unique du refus : il ne dit pas si un code est configuré. */
export const MESSAGE_ACCES_REFUSE =
  "Accès réservé à l’animateur de la formation. Saisissez le code d’accès pour " +
  "consulter le tableau de bord.";

/** En-têtes communs : rien de ce que renvoient ces routes n’est cachable. */
export const ENTETES_SANS_CACHE = { "Cache-Control": "no-store" } as const;

/* ------------------------------------------------------------------ */
/* Outils de condensat                                                 */
/* ------------------------------------------------------------------ */

function condensat(valeur: string): Buffer {
  return createHash("sha256").update(valeur, "utf8").digest();
}

/** Condensat SHA-256 en hexadécimal — utilisé aussi pour anonymiser une clé. */
export function empreinte(valeur: string): string {
  return condensat(valeur).toString("hex");
}

/**
 * Égalité de deux chaînes en temps constant.
 *
 * Les deux valeurs sont hachées avant comparaison : `timingSafeEqual` exige des
 * tampons de même longueur, et le hachage la garantit quelles que soient les
 * chaînes reçues.
 */
export function egalTempsConstant(gauche: string, droite: string): boolean {
  return timingSafeEqual(condensat(gauche), condensat(droite));
}

/** Valeur que doit porter le cookie pour un code donné. */
export function valeurCookieAttendue(code: string): string {
  return empreinte(`${code}:${SEL_COOKIE}`);
}

/* ------------------------------------------------------------------ */
/* Cookie                                                              */
/* ------------------------------------------------------------------ */

export interface OptionsCookieAnimateur {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
}

/**
 * Options du cookie d’accès, partagées par la connexion et la déconnexion :
 * un cookie ne s’efface que si on le réécrit avec le même chemin et les mêmes
 * attributs.
 *
 * `httpOnly` : aucun script de page ne peut le lire.
 * `sameSite: "lax"` : il n’accompagne pas les requêtes déclenchées depuis un
 * autre site, ce qui écarte les envois de formulaire croisés.
 * `secure` en production seulement : en développement, le site est en http et
 * un cookie « secure » ne serait jamais renvoyé.
 */
export function optionsCookieAnimateur(): OptionsCookieAnimateur {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DUREE_ACCES_SECONDES,
  };
}

/* ------------------------------------------------------------------ */
/* Contrat public                                                      */
/* ------------------------------------------------------------------ */

/** Clé, dans les réglages du site, de l’empreinte du code animateur. */
export const REGLAGE_CODE_ANIMATEUR = "code-animateur";

/**
 * Le secret contre lequel on vérifie le code saisi.
 *
 * Deux origines possibles, dans cet ordre :
 *  - la variable d’environnement `CODE_ANIMATEUR` : le secret est le code ;
 *  - à défaut, le réglage enregistré depuis le site : le secret est
 *    l’empreinte SHA-256 du code, jamais le code lui-même.
 *
 * Dans les deux cas, c’est `secret` qui sert à dériver la valeur du cookie :
 * changer le code, d’un côté comme de l’autre, invalide tous les accès posés.
 */
export interface SecretAnimateur {
  origine: "environnement" | "base";
  secret: string;
}

/** Un code d’accès est-il fourni par l’environnement ? Synchrone, ne lève jamais. */
export function codeAnimateurConfigure(): boolean {
  return Boolean(process.env.CODE_ANIMATEUR?.trim());
}

/** Empreinte stockée pour un code choisi depuis le site. */
export function empreinteDuCode(code: string): string {
  return empreinte(code.trim());
}

/**
 * Le secret en vigueur, ou null si aucun code n’est défini nulle part.
 * Une base injoignable compte comme « aucun code » : le tableau reste fermé.
 */
export async function secretAnimateur(): Promise<SecretAnimateur | null> {
  const env = process.env.CODE_ANIMATEUR?.trim();
  if (env) return { origine: "environnement", secret: env };

  if (!collecteConfiguree()) return null;
  try {
    const stocke = await lireReglage(REGLAGE_CODE_ANIMATEUR);
    return stocke ? { origine: "base", secret: stocke } : null;
  } catch (souci) {
    console.error("[animateur] lecture du code enregistré impossible :", souci);
    return null;
  }
}

/** Le code saisi correspond-il au secret ? Comparaison en temps constant. */
export function codeCorrespond(saisi: string, secret: SecretAnimateur): boolean {
  const propre = saisi.trim();
  return secret.origine === "environnement"
    ? egalTempsConstant(propre, secret.secret)
    : egalTempsConstant(empreinte(propre), secret.secret);
}

/**
 * L’appelant présente-t-il un cookie d’accès valide ?
 *
 * Appelée par la page animateur et par chacune des routes protégées. Renvoie
 * false dans tous les cas douteux : code non configuré, cookie absent, cookie
 * périmé ou forgé.
 *
 * L’appel à `cookies()` n’est **pas** enveloppé dans un try/catch, et c’est
 * délibéré : c’est en levant que cette fonction signale à Next qu’une page ne
 * peut pas être pré-rendue statiquement. Intercepter cette exception ferait
 * figer la page animateur en HTML statique, où le cookie n’existe pas — le
 * tableau de bord afficherait alors éternellement le formulaire de connexion,
 * même pour un animateur connecté.
 */
export async function animateurAutorise(): Promise<boolean> {
  const secret = await secretAnimateur();

  // Pas de code défini : personne n’entre. Voir le point 1 de l’en-tête.
  if (!secret) return false;

  const boite = await cookies();
  const valeur = boite.get(COOKIE_ANIMATEUR)?.value;
  if (!valeur) return false;

  return egalTempsConstant(valeur, valeurCookieAttendue(secret.secret));
}

/** Réponse 401 commune aux routes protégées. */
export function refuserAcces(): Response {
  return Response.json(
    { erreur: "non-autorise", message: MESSAGE_ACCES_REFUSE },
    { status: 401, headers: ENTETES_SANS_CACHE },
  );
}
