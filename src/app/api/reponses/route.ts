/**
 * Enregistrement d’une réponse de questionnaire, collectée sur le site.
 *
 * Deux questionnaires passent par ici : le sondage d’entrée et l’enquête de
 * satisfaction. Les deux sont anonymes, et la route le
 * reste : elle n’écrit que les réponses aux questions déclarées dans le
 * contenu. Ni nom, ni adresse, ni identifiant, ni adresse IP — rien d’autre que
 * le contenu du questionnaire n’est lu dans la requête, et rien d’autre n’est
 * transmis à la base.
 *
 * Le formulaire vérifie déjà les réponses avant l’envoi, mais cette
 * vérification-là est un confort d’usage : elle ne protège rien, puisqu’une
 * requête peut être forgée sans passer par la page. La validation qui fait foi
 * est celle-ci. Chaque réponse est confrontée à la définition de sa question —
 * type, options, bornes, longueur — et toute clé qui ne correspond à aucune
 * question fait échouer l’envoi. Rien qui n’ait été déclaré dans le contenu
 * n’atteint la base.
 *
 * Sans DATABASE_URL, la route répond 503 avec un code explicite : le site
 * continue de fonctionner et le formulaire affiche « collecte non configurée »
 * plutôt qu’une erreur technique.
 */

import {
  enqueteSatisfaction,
  sondageEntree,
} from "@/content/formations/ia-generative-en-classe/ressources/questionnaires";
import type {
  Question,
  Questionnaire,
  ReponsesQuestionnaire,
} from "@/content/types";
import {
  collecteConfiguree,
  enregistrerReponse,
  sessionActive,
  type NomQuestionnaire,
  type SessionFormation,
} from "@/lib/db";
import { getFormation } from "@/lib/formations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* Constantes                                                          */
/* ------------------------------------------------------------------ */

/**
 * Les deux questionnaires collectés, indexés par le nom attendu en base.
 *
 * Une seule formation est publiée, et la couche données agrège contre ces
 * mêmes définitions : la table est donc globale. Le jour où une deuxième
 * formation apporte ses propres questionnaires, c’est ici — et au même endroit
 * dans src/lib/db.ts — qu’elle devient une table par formation.
 */
const QUESTIONNAIRES: Record<NomQuestionnaire, Questionnaire> = {
  sondage: sondageEntree,
  satisfaction: enqueteSatisfaction,
};

/** Longueur maximale d’une réponse libre, en caractères. */
const MAX_TEXTE_LIBRE = 2000;

/**
 * Plafond du corps de la requête : d’abord sur l’en-tête Content-Length, en
 * octets, puis sur la longueur du texte reçu, en caractères. Une réponse
 * complète pèse moins d’un kilo-octet — ce plafond n’écarte que les envois
 * manifestement anormaux, et il s’applique avant l’analyse JSON, qui serait le
 * vrai coût.
 */
const LIMITE_CORPS = 64_000;

/** Au-delà, une clé inconnue est tronquée avant d’être citée dans le message. */
const MAX_CLE_CITEE = 60;

/**
 * Message renvoyé quand la base est en cause. Neutre à dessein : le message
 * d’erreur de Postgres nomme les tables et les colonnes, il reste au journal du
 * serveur et ne descend jamais jusqu’au navigateur.
 */
const MESSAGE_INCIDENT =
  "L’enregistrement n’a pas abouti. Réessayez dans un instant.";

const MESSAGE_CORPS_TROP_GRAND = "Le corps de la requête est trop volumineux.";

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

function refus(statut: number, code: string, message: string): Response {
  return Response.json({ erreur: code, message }, { status: statut });
}

function estObjetSimple(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === "object" && valeur !== null && !Array.isArray(valeur);
}

/**
 * Lecture d’une propriété **propre**. Les identifiants de question viennent du
 * contenu : si l’un d’eux s’appelait un jour « constructor » ou « toString »,
 * un accès direct trouverait la valeur héritée d’Object.prototype et prendrait
 * une fonction pour une réponse.
 */
function proprietePropre(objet: Record<string, unknown>, cle: string): unknown {
  return Object.prototype.hasOwnProperty.call(objet, cle)
    ? objet[cle]
    : undefined;
}

/** Une clé inconnue est renvoyée à l’expéditeur : on la cite, mais bornée. */
function citer(cle: string): string {
  return cle.length > MAX_CLE_CITEE ? `${cle.slice(0, MAX_CLE_CITEE)}…` : cle;
}

/* ------------------------------------------------------------------ */
/* Validation d’une réponse                                            */
/* ------------------------------------------------------------------ */

/**
 * Verdict d’une question : un message d’erreur, ou la valeur à enregistrer.
 * `valeur: null` signifie « rien à enregistrer » — une question facultative
 * laissée vide, qui ne doit pas occuper de clé dans le jsonb.
 */
type VerdictQuestion =
  | { message: string }
  | { valeur: string | string[] | number | null };

const RIEN: VerdictQuestion = { valeur: null };

/** Absence de réponse : faute si la question est obligatoire, sinon rien. */
function absente(question: Question): VerdictQuestion {
  return question.obligatoire
    ? {
        message: `La question « ${question.libelle} » est obligatoire : elle attend une réponse.`,
      }
    : RIEN;
}

function validerQuestion(question: Question, valeur: unknown): VerdictQuestion {
  if (valeur === undefined || valeur === null) return absente(question);

  switch (question.type) {
    case "choix-unique": {
      if (typeof valeur !== "string") {
        return {
          message: `La réponse à la question « ${question.libelle} » doit être un texte.`,
        };
      }
      const choix = valeur.trim();
      if (choix.length === 0) return absente(question);
      if (!question.options.includes(choix)) {
        return {
          message: `La réponse à la question « ${question.libelle} » ne fait pas partie des choix proposés.`,
        };
      }
      return { valeur: choix };
    }

    case "choix-multiple": {
      if (!Array.isArray(valeur)) {
        return {
          message: `La réponse à la question « ${question.libelle} » doit être une liste de choix.`,
        };
      }

      const choix: string[] = [];
      for (const element of valeur) {
        if (typeof element !== "string") {
          return {
            message: `La réponse à la question « ${question.libelle} » doit être une liste de textes.`,
          };
        }
        const option = element.trim();
        if (!question.options.includes(option)) {
          return {
            message: `La réponse à la question « ${question.libelle} » ne fait pas partie des choix proposés.`,
          };
        }
        // Un doublon fausserait le décompte des répondants à l’agrégation.
        if (choix.includes(option)) {
          return {
            message: `La question « ${question.libelle} » comporte deux fois le même choix.`,
          };
        }
        choix.push(option);
      }

      if (choix.length === 0) return absente(question);
      return { valeur: choix };
    }

    case "echelle": {
      // Number.isInteger écarte aussi NaN et l’infini : un JSON ne peut pas les
      // porter, mais un appel programmatique, si.
      if (
        typeof valeur !== "number" ||
        !Number.isInteger(valeur) ||
        valeur < question.min ||
        valeur > question.max
      ) {
        return {
          message: `La réponse à la question « ${question.libelle} » doit être un entier compris entre ${question.min} et ${question.max}.`,
        };
      }
      return { valeur };
    }

    case "texte-libre": {
      if (typeof valeur !== "string") {
        return {
          message: `La réponse à la question « ${question.libelle} » doit être un texte.`,
        };
      }
      const texte = valeur.trim();
      if (texte.length === 0) return absente(question);
      if (texte.length > MAX_TEXTE_LIBRE) {
        return {
          message: `La réponse à la question « ${question.libelle} » dépasse ${MAX_TEXTE_LIBRE} caractères.`,
        };
      }
      return { valeur: texte };
    }
  }
}

type Verdict =
  | { valide: true; reponses: ReponsesQuestionnaire }
  | { valide: false; message: string };

/**
 * Confronte le corps reçu à la définition du questionnaire, puis reconstruit la
 * charge à enregistrer à partir des seules questions déclarées : ce qui part en
 * base est la valeur que la validation a acceptée, jamais l’objet reçu.
 */
function validerReponses(questionnaire: Questionnaire, brut: unknown): Verdict {
  if (!estObjetSimple(brut)) {
    return {
      valide: false,
      message: "Le champ « reponses » doit être un objet.",
    };
  }

  const connues = new Set(
    questionnaire.questions.map((question) => question.id),
  );
  for (const cle of Object.keys(brut)) {
    if (!connues.has(cle)) {
      return {
        valide: false,
        message: `La clé « ${citer(cle)} » n’appartient pas au questionnaire « ${questionnaire.titre} ».`,
      };
    }
  }

  const propres: ReponsesQuestionnaire = {};

  for (const question of questionnaire.questions) {
    const verdict = validerQuestion(
      question,
      proprietePropre(brut, question.id),
    );
    if ("message" in verdict) {
      return { valide: false, message: verdict.message };
    }
    if (verdict.valeur !== null) propres[question.id] = verdict.valeur;
  }

  return { valide: true, reponses: propres };
}

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

export async function POST(requete: Request): Promise<Response> {
  if (!collecteConfiguree()) {
    return refus(
      503,
      "collecte-non-configuree",
      "La collecte n’est pas configurée sur ce site.",
    );
  }

  if (Number(requete.headers.get("content-length")) > LIMITE_CORPS) {
    return refus(413, "corps-trop-grand", MESSAGE_CORPS_TROP_GRAND);
  }

  let charge: unknown;
  try {
    const texte = await requete.text();
    if (texte.length > LIMITE_CORPS) {
      return refus(413, "corps-trop-grand", MESSAGE_CORPS_TROP_GRAND);
    }
    charge = JSON.parse(texte);
  } catch {
    return refus(
      400,
      "requete-invalide",
      "Le corps de la requête n’est pas un JSON valide.",
    );
  }

  if (!estObjetSimple(charge)) {
    return refus(
      400,
      "requete-invalide",
      "Le corps de la requête doit être un objet JSON.",
    );
  }

  const formation =
    typeof charge.formation === "string" ? charge.formation.trim() : "";
  if (!getFormation(formation)) {
    return refus(404, "formation-inconnue", "Cette formation n’existe pas.");
  }

  let session: SessionFormation | null;
  try {
    session = await sessionActive(formation);
  } catch (erreur) {
    console.error("[api/reponses] lecture de la session ouverte :", erreur);
    return refus(500, "incident-serveur", MESSAGE_INCIDENT);
  }

  // Aucune session ouverte n’est pas une panne : c’est l’état normal en dehors
  // des jours de formation.
  if (!session) {
    return refus(
      409,
      "collecte-fermee",
      "La collecte est fermée pour cette session.",
    );
  }

  const nom = charge.questionnaire;
  if (nom !== "sondage" && nom !== "satisfaction") {
    return refus(
      400,
      "questionnaire-inconnu",
      "Le questionnaire demandé n’existe pas : « sondage » ou « satisfaction » sont attendus.",
    );
  }

  const verdict = validerReponses(
    QUESTIONNAIRES[nom],
    proprietePropre(charge, "reponses"),
  );
  if (!verdict.valide) {
    return refus(400, "reponses-invalides", verdict.message);
  }

  try {
    await enregistrerReponse(session.id, formation, nom, verdict.reponses);
  } catch (erreur) {
    console.error("[api/reponses] enregistrement impossible :", erreur);
    return refus(500, "incident-serveur", MESSAGE_INCIDENT);
  }

  return Response.json({ ok: true }, { status: 201 });
}
