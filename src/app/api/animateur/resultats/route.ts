/**
 * Résultats de la séance — GET ?formation=…&session=…
 *
 * Route interrogée périodiquement par le tableau de bord projeté en salle :
 * elle renvoie, en une seule réponse, tout ce qu’il faut afficher — la session
 * en cours, les agrégats des deux questionnaires, les restitutions des groupes,
 * et la liste des sessions de la formation (pour le sélecteur).
 *
 * Deux paramètres :
 *   formation  obligatoire, slug d’une formation publiée ;
 *   session    facultatif, identifiant d’une session passée. Sans lui, la
 *              session ouverte est utilisée — c’est le cas courant en séance.
 *
 * Forme de la réponse (200) :
 *   {
 *     configuree: boolean,          // false si DATABASE_URL est absente
 *     message?: string,             // explication, seulement si configuree vaut false
 *     formation: string,
 *     session: SessionFormation | null,
 *     sondage: Agregat[],
 *     satisfaction: Agregat[],
 *     restitutions: Restitution[],
 *     compte: { sondage, satisfaction, restitutions },
 *     sessions: SessionFormation[],
 *     actualiseLe: string           // ISO 8601, horodatage de la lecture
 *   }
 *
 * Sans base configurée, la route répond **200 avec `configuree: false`** et des
 * résultats vides, et non une erreur : le tableau de bord doit alors afficher
 * « collecte non configurée », qui est un état, pas une panne. Le client n’a
 * ainsi qu’un seul format à savoir lire, et son rafraîchissement périodique ne
 * se met pas à empiler des erreurs réseau dans la console pendant la séance.
 *
 * `Cache-Control: no-store` : ces chiffres changent à chaque réponse envoyée
 * par la salle ; rien ne doit être servi depuis un cache intermédiaire.
 */

import {
  ENTETES_SANS_CACHE,
  animateurAutorise,
  refuserAcces,
} from "@/lib/animateur";
import {
  chargerResultats,
  collecteConfiguree,
  listerSessions,
  type Resultats,
} from "@/lib/db";
import { getFormation } from "@/lib/formations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* Aides                                                               */
/* ------------------------------------------------------------------ */

const MESSAGE_COLLECTE_ABSENTE =
  "Collecte non configurée : la variable d’environnement DATABASE_URL est " +
  "absente. Les questionnaires ne sont pas enregistrés et le tableau de bord " +
  "reste vide. Renseignez la variable et redéployez : les tables sont créées " +
  "automatiquement.";

/** Résultats vides — même forme qu’une séance sans réponse, donc affichables. */
function resultatsVides(): Resultats {
  return {
    session: null,
    sondage: [],
    satisfaction: [],
    restitutions: [],
    compte: { sondage: 0, satisfaction: 0, restitutions: 0 },
  };
}

function erreur(code: string, message: string, statut: number): Response {
  return Response.json(
    { erreur: code, message },
    { status: statut, headers: ENTETES_SANS_CACHE },
  );
}

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

export async function GET(requete: Request): Promise<Response> {
  if (!(await animateurAutorise())) return refuserAcces();

  const parametres = new URL(requete.url).searchParams;

  const formation = (parametres.get("formation") ?? "").trim();
  if (!formation) {
    return erreur(
      "formation-manquante",
      "Le paramètre « formation » est obligatoire.",
      400,
    );
  }
  if (!getFormation(formation)) {
    return erreur(
      "formation-inconnue",
      `Aucune formation ne porte l’identifiant « ${formation} ».`,
      404,
    );
  }

  // « session » absent ou vide : la session ouverte fait foi.
  const brutSession = (parametres.get("session") ?? "").trim();
  let sessionId: number | undefined;
  if (brutSession) {
    const nombre = Number(brutSession);
    if (!Number.isInteger(nombre) || nombre <= 0) {
      return erreur(
        "session-invalide",
        "Le paramètre « session » doit être un identifiant entier positif.",
        400,
      );
    }
    sessionId = nombre;
  }

  const horodatage = () => new Date().toISOString();

  if (!collecteConfiguree()) {
    return Response.json(
      {
        configuree: false,
        message: MESSAGE_COLLECTE_ABSENTE,
        formation,
        ...resultatsVides(),
        sessions: [],
        actualiseLe: horodatage(),
      },
      { status: 200, headers: ENTETES_SANS_CACHE },
    );
  }

  try {
    // Les deux lectures sont indépendantes : autant les mener de front, le
    // tableau de bord rappelle cette route toutes les quelques secondes.
    const [resultats, sessions] = await Promise.all([
      chargerResultats(formation, sessionId),
      listerSessions(formation),
    ]);

    return Response.json(
      {
        configuree: true,
        formation,
        ...resultats,
        sessions,
        actualiseLe: horodatage(),
      },
      { status: 200, headers: ENTETES_SANS_CACHE },
    );
  } catch (souci) {
    // Le détail va dans les journaux du serveur, pas dans la réponse : il peut
    // contenir la chaîne de connexion.
    console.error("[animateur/resultats] lecture impossible :", souci);
    return erreur(
      "lecture-impossible",
      "La lecture des résultats a échoué. La base est peut-être injoignable ; " +
        "réessayez dans un instant.",
      500,
    );
  }
}
