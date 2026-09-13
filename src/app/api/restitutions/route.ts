/**
 * Dépôt d’une trame de restitution de l’atelier ACTIF (diapositive 13).
 *
 * Un groupe de trois ou quatre enseignants dépose ici ce qu’il a produit :
 * domaine, outil, ressource, requêtes, corrections, vigilance. C’est le seul
 * formulaire du site où une identité peut apparaître — le champ « membres du
 * groupe », celle d’adultes, saisie volontairement, et dont l’aide précise que
 * les prénoms suffisent. La route n’ajoute rien à ce que le groupe a écrit : ni
 * horodatage nominatif, ni adresse IP, ni identifiant de navigation.
 *
 * La trame est décrite dans le contenu (`champsRestitution`) et la validation
 * s’y confronte champ par champ : clés inconnues rejetées, obligatoires exigés,
 * options du champ « outil » limitées à celles déclarées, longueurs bornées.
 * Le formulaire fait la même vérification pour le confort de saisie ; celle-ci
 * est la seule qui protège la base, puisqu’une requête peut être forgée sans
 * passer par la page.
 *
 * Sans DATABASE_URL, la route répond 503 avec un code explicite : le site
 * continue de fonctionner et le formulaire affiche « collecte non configurée »
 * plutôt qu’une erreur technique.
 */

import { champsRestitution } from "@/content/formations/ia-generative-en-classe/ressources/questionnaires";
import type { ChampRestitution } from "@/content/types";
import {
  collecteConfiguree,
  enregistrerRestitution,
  sessionActive,
  type SessionFormation,
} from "@/lib/db";
import { getFormation } from "@/lib/formations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/* Constantes                                                          */
/* ------------------------------------------------------------------ */

/**
 * La trame de la seule formation publiée. La couche données écrit dans les
 * mêmes colonnes : le jour où une deuxième formation apporte sa propre trame,
 * c’est ici qu’on résoudra la trame à partir du slug de formation.
 */
const TRAME: ChampRestitution[] = champsRestitution;

/** Longueurs maximales : une ligne de saisie, une zone de texte. */
const MAX_TEXTE = 200;
const MAX_TEXTE_LONG = 4000;

/**
 * Plafond du corps de la requête : d’abord sur l’en-tête Content-Length, en
 * octets, puis sur la longueur du texte reçu, en caractères. Une contribution
 * complète pèse quelques kilo-octets au plus — ce plafond n’écarte que les
 * envois manifestement anormaux, et il s’applique avant l’analyse JSON, qui
 * serait le vrai coût.
 */
const LIMITE_CORPS = 64_000;

/** Au-delà, une clé inconnue est tronquée avant d’être citée dans le message. */
const MAX_CLE_CITEE = 60;

/**
 * Message renvoyé quand la base est en cause. Neutre à dessein : le message
 * d’erreur de Postgres nomme les tables et les colonnes, il reste au journal du
 * serveur et ne descend jamais jusqu’au navigateur.
 */
const MESSAGE_INCIDENT = "Le dépôt n’a pas abouti. Réessayez dans un instant.";

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
 * Lecture d’une propriété **propre**. Les identifiants de champ viennent du
 * contenu : si l’un d’eux s’appelait un jour « constructor » ou « toString »,
 * un accès direct trouverait la valeur héritée d’Object.prototype et prendrait
 * une fonction pour une saisie.
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
/* Validation de la trame                                              */
/* ------------------------------------------------------------------ */

type Verdict =
  | { valide: true; champs: Record<string, string> }
  | { valide: false; message: string };

function manquant(champ: ChampRestitution): string {
  return `Le champ « ${champ.libelle} » est obligatoire : il attend une réponse.`;
}

/** Longueur maximale autorisée pour un champ de saisie libre. */
function maximumDe(champ: ChampRestitution): number {
  return champ.type === "texte-long" ? MAX_TEXTE_LONG : MAX_TEXTE;
}

/**
 * Confronte le corps reçu à la trame déclarée dans le contenu, puis reconstruit
 * la contribution à enregistrer à partir des seuls champs déclarés : ce qui
 * part en base est la valeur que la validation a acceptée, élaguée, jamais
 * l’objet reçu.
 */
function validerChamps(brut: unknown): Verdict {
  if (!estObjetSimple(brut)) {
    return { valide: false, message: "Le champ « champs » doit être un objet." };
  }

  const connus = new Set(TRAME.map((champ) => champ.id));
  for (const cle of Object.keys(brut)) {
    if (!connus.has(cle)) {
      return {
        valide: false,
        message: `La clé « ${citer(cle)} » n’appartient pas à la trame de restitution.`,
      };
    }
  }

  const propres: Record<string, string> = {};

  for (const champ of TRAME) {
    const valeur = proprietePropre(brut, champ.id);

    if (valeur === undefined || valeur === null) {
      if (champ.obligatoire) return { valide: false, message: manquant(champ) };
      continue;
    }

    if (typeof valeur !== "string") {
      return {
        valide: false,
        message: `Le champ « ${champ.libelle} » doit être un texte.`,
      };
    }

    const texte = valeur.trim();

    // Un champ envoyé vide vaut un champ absent : la couche données stocke null.
    if (texte.length === 0) {
      if (champ.obligatoire) return { valide: false, message: manquant(champ) };
      continue;
    }

    if (champ.type === "choix") {
      const options = champ.options ?? [];
      if (!options.includes(texte)) {
        return {
          valide: false,
          message: `La réponse au champ « ${champ.libelle} » ne fait pas partie des choix proposés.`,
        };
      }
    } else {
      const maximum = maximumDe(champ);
      if (texte.length > maximum) {
        return {
          valide: false,
          message: `Le champ « ${champ.libelle} » dépasse ${maximum} caractères.`,
        };
      }
    }

    propres[champ.id] = texte;
  }

  return { valide: true, champs: propres };
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
    console.error("[api/restitutions] lecture de la session ouverte :", erreur);
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

  const verdict = validerChamps(proprietePropre(charge, "champs"));
  if (!verdict.valide) {
    return refus(400, "champs-invalides", verdict.message);
  }

  try {
    // La couche données revérifie les champs obligatoires et lève si l’un
    // manque : la validation ci-dessus l’a déjà écarté, mais le catch couvre
    // ce cas comme le reste, sans jamais renvoyer le détail au navigateur.
    await enregistrerRestitution(session.id, formation, verdict.champs);
  } catch (erreur) {
    console.error("[api/restitutions] enregistrement impossible :", erreur);
    return refus(500, "incident-serveur", MESSAGE_INCIDENT);
  }

  return Response.json({ ok: true }, { status: 201 });
}
