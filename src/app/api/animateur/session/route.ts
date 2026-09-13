/**
 * Sessions de formation — POST { action, formation, libelle?, id? }
 *
 * Une session = une occurrence d’une formation, un jour donné. Toutes les
 * réponses lui sont rattachées : c’est ce qui empêche deux groupes formés à
 * deux dates différentes de se mélanger dans le tableau de bord.
 *
 * Trois actions, toutes réservées à l’animateur :
 *   { action: "creer",  formation, libelle? }  ouvre une nouvelle session ;
 *   { action: "ouvrir", formation, id }        rouvre une session existante ;
 *   { action: "fermer", formation, id }        la ferme aux nouvelles réponses.
 *
 * **Une seule session ouverte à la fois par formation.** À la création comme à
 * la réouverture, les autres sessions de la même formation sont fermées. Sans
 * cette règle, `sessionActive()` renverrait la plus récente et les réponses de
 * la salle iraient silencieusement dans la mauvaise séance — une erreur
 * invisible jusqu’au moment où l’on projette les résultats.
 *
 * Fermer ne supprime rien : la session cesse d’accepter des réponses, ses
 * résultats restent consultables par le sélecteur de sessions.
 *
 * Réponse (200) : { ok: true, session: SessionFormation | null,
 *                   sessions: SessionFormation[] }
 * — la session visée après l’opération, puis la liste complète et à jour, pour
 * que le tableau de bord se réaffiche sans seconde requête.
 */

import {
  ENTETES_SANS_CACHE,
  animateurAutorise,
  refuserAcces,
} from "@/lib/animateur";
import {
  basculerSession,
  collecteConfiguree,
  creerSession,
  detailErreurBase,
  listerSessions,
  type SessionFormation,
} from "@/lib/db";
import { getFormation } from "@/lib/formations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* Constantes et aides                                                 */
/* ------------------------------------------------------------------ */

const ACTIONS = ["creer", "ouvrir", "fermer"] as const;
type Action = (typeof ACTIONS)[number];

/** Le libellé est projeté en salle : long, il déborderait de l’en-tête. */
const MAX_CARACTERES_LIBELLE = 120;

const MESSAGE_COLLECTE_ABSENTE =
  "Collecte non configurée : la variable d’environnement DATABASE_URL est " +
  "absente, aucune session ne peut être ouverte. Renseignez la variable et " +
  "redéployez : les tables sont créées automatiquement.";

function erreur(code: string, message: string, statut: number): Response {
  return Response.json(
    { erreur: code, message },
    { status: statut, headers: ENTETES_SANS_CACHE },
  );
}

/**
 * Libellé par défaut : « Séance du 3 septembre 2026 ».
 *
 * Le fuseau est fixé à celui de l’établissement : l’hébergeur exécute le code
 * en UTC, et une session ouverte en fin de journée hériterait sinon de la date
 * de la veille.
 */
function libelleDuJour(): string {
  const maintenant = new Date();
  const zone = "Asia/Beirut";

  const jour = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    timeZone: zone,
  }).format(maintenant);

  const moisEtAnnee = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: zone,
  }).format(maintenant);

  // En français, seul le premier du mois s’écrit en ordinal.
  return `Séance du ${jour === "1" ? "1er" : jour} ${moisEtAnnee}`;
}

/**
 * Ferme toutes les sessions ouvertes de la formation, sauf celle indiquée.
 * Appelée avant chaque ouverture pour garantir l’unicité de la session active.
 */
async function fermerLesAutres(
  formation: string,
  sauf?: number,
): Promise<void> {
  const sessions = await listerSessions(formation);
  const aFermer = sessions.filter(
    (session) => session.ouverte && session.id !== sauf,
  );
  for (const session of aFermer) {
    await basculerSession(session.id, false);
  }
}

/* ------------------------------------------------------------------ */
/* Lecture du corps                                                    */
/* ------------------------------------------------------------------ */

interface Demande {
  action: Action;
  formation: string;
  libelle?: string;
  id?: number;
}

type Lecture = { demande: Demande } | { erreur: Response };

function lire(charge: unknown): Lecture {
  if (typeof charge !== "object" || charge === null) {
    return {
      erreur: erreur(
        "requete-invalide",
        "Le corps de la requête doit être un objet JSON.",
        400,
      ),
    };
  }

  const brut = charge as {
    action?: unknown;
    formation?: unknown;
    libelle?: unknown;
    id?: unknown;
  };

  if (
    typeof brut.action !== "string" ||
    !ACTIONS.includes(brut.action as Action)
  ) {
    return {
      erreur: erreur(
        "action-invalide",
        `Le champ « action » doit valoir ${ACTIONS.map((a) => `« ${a} »`).join(", ")}.`,
        400,
      ),
    };
  }
  const action = brut.action as Action;

  const formation =
    typeof brut.formation === "string" ? brut.formation.trim() : "";
  if (!formation) {
    return {
      erreur: erreur(
        "formation-manquante",
        "Le champ « formation » est obligatoire.",
        400,
      ),
    };
  }
  if (!getFormation(formation)) {
    return {
      erreur: erreur(
        "formation-inconnue",
        `Aucune formation ne porte l’identifiant « ${formation} ».`,
        404,
      ),
    };
  }

  if (action === "creer") {
    const libelle =
      typeof brut.libelle === "string" ? brut.libelle.trim() : "";
    if (libelle.length > MAX_CARACTERES_LIBELLE) {
      return {
        erreur: erreur(
          "libelle-trop-long",
          `Le libellé de la séance ne peut pas dépasser ${MAX_CARACTERES_LIBELLE} caractères.`,
          400,
        ),
      };
    }
    // Libellé absent ou vide : la date du jour tient lieu de nom.
    return {
      demande: { action, formation, libelle: libelle || libelleDuJour() },
    };
  }

  // « ouvrir » et « fermer » désignent une session existante.
  const id = typeof brut.id === "number" ? brut.id : Number(brut.id);
  if (!Number.isInteger(id) || id <= 0) {
    return {
      erreur: erreur(
        "session-invalide",
        "Le champ « id » doit être l’identifiant entier d’une session.",
        400,
      ),
    };
  }

  return { demande: { action, formation, id } };
}

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

export async function POST(requete: Request): Promise<Response> {
  if (!(await animateurAutorise())) return refuserAcces();

  if (!collecteConfiguree()) {
    return erreur("collecte-non-configuree", MESSAGE_COLLECTE_ABSENTE, 503);
  }

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

  const lecture = lire(charge);
  if ("erreur" in lecture) return lecture.erreur;
  const { action, formation, libelle, id } = lecture.demande;

  try {
    let cible: number;

    if (action === "creer") {
      // Fermer d’abord, créer ensuite : entre les deux, la formation n’a aucune
      // session ouverte — état inoffensif — alors que l’ordre inverse laisserait
      // passer un instant à deux sessions ouvertes, où une réponse pourrait
      // partir dans la mauvaise.
      await fermerLesAutres(formation);
      const creee = await creerSession(formation, libelle ?? libelleDuJour());
      cible = creee.id;
    } else {
      // La session doit appartenir à cette formation : sans cette vérification,
      // un identifiant d’une autre formation serait basculé sans le dire.
      const existantes = await listerSessions(formation);
      const session = existantes.find((candidate) => candidate.id === id);
      if (!session) {
        return erreur(
          "session-introuvable",
          `Aucune séance n’a l’identifiant ${id} dans cette formation.`,
          404,
        );
      }

      if (action === "ouvrir") {
        await fermerLesAutres(formation, session.id);
        await basculerSession(session.id, true);
      } else {
        await basculerSession(session.id, false);
      }
      cible = session.id;
    }

    // Relecture après coup : on renvoie l’état réellement enregistré, jamais
    // celui qu’on croit avoir écrit.
    const sessions = await listerSessions(formation);
    const session: SessionFormation | null =
      sessions.find((candidate) => candidate.id === cible) ?? null;

    return Response.json(
      { ok: true, session, sessions },
      { status: 200, headers: ENTETES_SANS_CACHE },
    );
  } catch (souci) {
    console.error("[animateur/session] opération impossible :", souci);
    return erreur(
      "operation-impossible",
      "L’opération sur la séance a échoué. La base est peut-être injoignable ; " +
        `réessayez dans un instant. Détail : ${detailErreurBase(souci)}`,
      500,
    );
  }
}
