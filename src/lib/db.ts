/**
 * Couche d'accès aux données — collecte des réponses de formation.
 *
 * Sondage d'entrée, enquête de satisfaction et trame de restitution : les
 * enseignantes répondent sur
 * le site, les résultats sont agrégés ici, le tableau de bord les projette.
 *
 * Trois principes gouvernent ce fichier.
 *
 *  1. Anonymat. Rien n'est écrit qui permette d'identifier un répondant :
 *     ni nom, ni adresse, ni identifiant de navigation, ni adresse IP. Une
 *     réponse est une ligne rattachée à une session de formation, rien de plus.
 *     Seul le champ « membres » de la restitution porte un texte d'identité, et
 *     il est saisi volontairement par le groupe.
 *
 *  2. Dégradation propre. Sans DATABASE_URL, le module se charge sans erreur et
 *     `collecteConfiguree()` renvoie false : les pages affichent alors
 *     « collecte non configurée ». Aucune connexion n'est tentée au chargement ;
 *     les fonctions d'accès ne lèvent une erreur que si on les appelle.
 *
 *  3. Agrégation en TypeScript. Le volume est de l'ordre de quelques dizaines de
 *     lignes par session : on lit les lignes brutes et on compte ici, plutôt que
 *     d'écrire de l'agrégation jsonb en SQL, illisible et difficile à corriger.
 *
 * Toutes les requêtes sont paramétrées ($1, $2…) : aucune valeur n'est jamais
 * concaténée dans du SQL.
 */

import { Pool, type QueryResultRow } from "pg";

import * as sourceQuestionnaires from "@/content/formations/ia-generative-maternelle/ressources/questionnaires";
import type { Question, Questionnaire } from "@/content/types";
import { SCHEMA_SQL } from "@/lib/schema.generated";

/* ------------------------------------------------------------------ */
/* Contrat public                                                      */
/* ------------------------------------------------------------------ */

export interface SessionFormation {
  id: number;
  /** Slug de la formation, ex. « ia-generative-maternelle ». */
  formation: string;
  libelle: string;
  ouverte: boolean;
  /** Date ISO 8601 (UTC). */
  creeeLe: string;
}

export interface Agregat {
  questionId: string;
  libelle: string;
  /** « choix-unique », « choix-multiple », « echelle » ou « texte-libre ». */
  type: string;
  /**
   * Nombre de répondants à cette question — jamais le nombre de cases cochées :
   * pour un choix multiple, un enseignant qui coche trois options compte pour un.
   */
  total: number;
  /**
   * Une entrée par option déclarée, dans l'ordre du questionnaire, y compris les
   * options que personne n'a choisies (`nombre: 0`) : un graphique qui masque
   * les options à zéro ment sur l'état de la salle.
   *
   * `part` est un **pourcentage de 0 à 100** (arrondi au dixième), directement
   * utilisable comme largeur de barre. Vaut 0 quand personne n'a répondu.
   */
  repartition: { option: string; nombre: number; part: number }[];
  /** Questions « echelle » seulement : moyenne arrondie au centième, 0 sans réponse. */
  moyenne?: number;
  /** Questions « texte-libre » seulement : réponses non vides, dans l'ordre d'envoi. */
  verbatims?: string[];
}

export interface Restitution {
  id: number;
  domaine: string;
  niveau: string | null;
  membres: string | null;
  outil: string;
  ressource: string;
  requete: string | null;
  corrections: string | null;
  vigilance: string | null;
  /** Date ISO 8601 (UTC). */
  envoyeLe: string;
}

export interface Resultats {
  session: SessionFormation | null;
  sondage: Agregat[];
  satisfaction: Agregat[];
  restitutions: Restitution[];
  compte: { sondage: number; satisfaction: number; restitutions: number };
}

/** Les deux questionnaires collectés : sondage d'entrée et satisfaction. */
export type NomQuestionnaire = "sondage" | "satisfaction";

/* ------------------------------------------------------------------ */
/* Connexion                                                           */
/* ------------------------------------------------------------------ */

/**
 * La collecte est-elle configurée ?
 *
 * Seule fonction du module utilisable sans base : elle ne lit qu'une variable
 * d'environnement, n'ouvre aucune connexion et ne lève jamais d'erreur. Les
 * pages et les routes l'appellent en premier pour choisir entre le formulaire
 * et l'état « collecte non configurée ».
 */
export function collecteConfiguree(): boolean {
  return Boolean(urlBase());
}

/** Une chaîne de connexion Postgres se reconnaît à son schéma. */
const URL_POSTGRES = /^postgres(ql)?:\/\//i;

/**
 * Chaîne de connexion.
 *
 * `DATABASE_URL` d'abord, puis `POSTGRES_URL` ; à défaut, la première variable
 * d'environnement dont la valeur est une URL Postgres. Les intégrations Vercel
 * laissent choisir un préfixe (`STORAGE_URL`, `NEON_URL`…) : quel que soit le
 * nom retenu, la base est trouvée sans rien reconfigurer.
 */
export function urlBase(): string | undefined {
  return sourceUrlBase()?.valeur;
}

/** La variable retenue, avec son nom : sert au diagnostic. */
export function sourceUrlBase(): { nom: string; valeur: string } | undefined {
  const prioritaires = ["DATABASE_URL", "POSTGRES_URL"];
  for (const nom of prioritaires) {
    const valeur = process.env[nom];
    if (valeur && URL_POSTGRES.test(valeur)) return { nom, valeur };
  }
  const candidates = Object.entries(process.env)
    .filter(
      ([nom, valeur]) =>
        nom.endsWith("_URL") &&
        !nom.includes("UNPOOLED") &&
        typeof valeur === "string" &&
        URL_POSTGRES.test(valeur),
    )
    .sort(([a], [b]) => a.localeCompare(b));
  const premiere = candidates[0];
  return premiere ? { nom: premiere[0], valeur: premiere[1] as string } : undefined;
}

/**
 * Noms des variables d'environnement se terminant par _URL, sans leur valeur :
 * de quoi voir, depuis le tableau de bord, ce que l'hébergeur a réellement
 * injecté quand la base semble absente.
 */
export function nomsVariablesUrl(): string[] {
  return Object.keys(process.env)
    .filter((nom) => nom.endsWith("_URL"))
    .sort();
}

/**
 * Détail d'une erreur de base, présentable à l'animateur : code Postgres et
 * message, sans jamais la chaîne de connexion (un mot de passe pourrait s'y
 * trouver). Tronqué pour rester lisible.
 */
export function detailErreurBase(souci: unknown): string {
  const objet = (souci ?? {}) as { code?: unknown; message?: unknown };
  const code = typeof objet.code === "string" ? objet.code : "";
  let message =
    typeof objet.message === "string"
      ? objet.message
      : souci instanceof Error
        ? souci.message
        : String(souci);
  // Une URL avec identifiants n'a rien à faire dans un message d'écran.
  message = message.replace(/postgres(ql)?:\/\/[^\s'"]+/gi, "postgresql://…");
  const texte = [code, message].filter(Boolean).join(" — ").trim();
  return texte.length > 240 ? `${texte.slice(0, 237)}…` : texte;
}

const MESSAGE_NON_CONFIGURE =
  "Collecte non configurée : la variable d'environnement DATABASE_URL est absente. " +
  "La renseigner dans .env.local (en local) ou dans les variables du projet " +
  "(en production) ; les tables sont créées automatiquement au premier accès.";

/**
 * Le pool et la promesse de schéma sont conservés sur `globalThis` : en
 * développement, le rechargement à chaud réévalue les modules à chaque édition,
 * et un pool par évaluation finirait par épuiser les connexions autorisées par
 * l'hébergeur.
 */
const espaceGlobal = globalThis as typeof globalThis & {
  __poolFormation?: Pool;
  __schemaFormation?: Promise<void>;
};

/** Une base locale n'a pas de certificat TLS : inutile (et bloquant) d'exiger SSL. */
function urlLocale(url: string): boolean {
  if (/[?&]sslmode=disable\b/.test(url)) return true;
  try {
    const hote = new URL(url).hostname.toLowerCase();
    return (
      hote === "localhost" ||
      hote === "127.0.0.1" ||
      hote === "0.0.0.0" ||
      hote === "::1" ||
      hote === "[::1]" ||
      hote.endsWith(".local")
    );
  } catch {
    // URL non analysable : on laisse SSL actif, c'est le cas d'un hébergeur.
    return false;
  }
}

/** Pool partagé. Créé à la première requête réelle, jamais au chargement. */
function connexion(): Pool {
  const url = urlBase();
  if (!url) throw new Error(MESSAGE_NON_CONFIGURE);

  if (!espaceGlobal.__poolFormation) {
    const pool = new Pool({
      connectionString: url,
      // Les hébergeurs sans serveur (Vercel, Neon) plafonnent les connexions :
      // une poignée suffit largement pour une salle de formation.
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      // Vercel Postgres et Neon imposent TLS, avec un certificat que Node ne
      // valide pas sans autorité déclarée.
      ssl: urlLocale(url) ? undefined : { rejectUnauthorized: false },
    });

    // Sans cet écouteur, une erreur survenue sur un client inactif fait tomber
    // le processus Node entier.
    pool.on("error", (erreur: Error) => {
      console.error("[db] client inactif en erreur :", erreur.message);
    });

    espaceGlobal.__poolFormation = pool;
  }

  return espaceGlobal.__poolFormation;
}

/* ------------------------------------------------------------------ */
/* Schéma                                                              */
/* ------------------------------------------------------------------ */

/**
 * Verrou consultatif pris le temps d'appliquer le schéma : deux instances
 * démarrant en même temps ne créent pas les tables en parallèle.
 */
const VERROU_SCHEMA = 7412026;

/**
 * Applique le schéma (db/schema.sql, embarqué dans le code par
 * scripts/embed-schema.mjs) une fois par processus, avant la première requête.
 *
 * Le schéma n'emploie que des « create … if not exists » : le rejouer sur une
 * base déjà en service ne change rien. Ainsi, renseigner DATABASE_URL suffit ;
 * aucune commande à lancer à la main. En cas d'échec, la promesse est oubliée
 * pour que l'appel suivant retente.
 */
function garantirSchema(): Promise<void> {
  if (!espaceGlobal.__schemaFormation) {
    espaceGlobal.__schemaFormation = (async () => {
      // Plusieurs instructions dans une seule requête simple : Postgres les
      // exécute dans une transaction implicite, et le verrou tient jusqu'au bout.
      await connexion().query(
        `select pg_advisory_xact_lock(${VERROU_SCHEMA});\n${SCHEMA_SQL}`,
      );
    })().catch((erreur: unknown) => {
      espaceGlobal.__schemaFormation = undefined;
      throw erreur;
    });
  }
  return espaceGlobal.__schemaFormation;
}

/* ------------------------------------------------------------------ */
/* Diagnostic                                                          */
/* ------------------------------------------------------------------ */

export interface DiagnosticBase {
  /** Nom de la variable d'environnement retenue, ou null. */
  variable: string | null;
  /** Toutes les variables *_URL présentes (noms seulement). */
  variablesUrl: string[];
  /** Hôte de la base, sans identifiants — pour reconnaître le fournisseur. */
  hote: string | null;
  connexion: { ok: true; version: string } | { ok: false; erreur: string };
  schema:
    | { ok: true; tables: string[] }
    | { ok: false; erreur: string }
    | null;
}

/** État réel de la base, tel que le tableau de bord peut l'afficher. */
export async function diagnostiquerBase(): Promise<DiagnosticBase> {
  const source = sourceUrlBase();
  const variablesUrl = nomsVariablesUrl();

  let hote: string | null = null;
  if (source) {
    try {
      hote = new URL(source.valeur).hostname || null;
    } catch {
      hote = null;
    }
  }

  if (!source) {
    return {
      variable: null,
      variablesUrl,
      hote,
      connexion: { ok: false, erreur: "Aucune chaîne de connexion Postgres trouvée." },
      schema: null,
    };
  }

  let connexionEtat: DiagnosticBase["connexion"];
  try {
    const resultat = await connexion().query<{ version: string }>(
      "select version() as version",
    );
    connexionEtat = { ok: true, version: resultat.rows[0]?.version ?? "" };
  } catch (souci) {
    return {
      variable: source.nom,
      variablesUrl,
      hote,
      connexion: { ok: false, erreur: detailErreurBase(souci) },
      schema: null,
    };
  }

  let schemaEtat: DiagnosticBase["schema"];
  try {
    await garantirSchema();
    const lignes = await connexion().query<{ table_name: string }>(
      `select table_name from information_schema.tables
        where table_schema = current_schema() and table_name like 'formation_%'
        order by table_name`,
    );
    schemaEtat = { ok: true, tables: lignes.rows.map((l) => l.table_name) };
  } catch (souci) {
    schemaEtat = { ok: false, erreur: detailErreurBase(souci) };
  }

  return { variable: source.nom, variablesUrl, hote, connexion: connexionEtat, schema: schemaEtat };
}

/** Exécute une requête paramétrée et renvoie les lignes. */
async function interroger<L extends QueryResultRow>(
  texte: string,
  valeurs: unknown[] = [],
): Promise<L[]> {
  await garantirSchema();
  const resultat = await connexion().query<L>(texte, valeurs);
  return resultat.rows;
}

/* ------------------------------------------------------------------ */
/* Lignes telles que Postgres les renvoie                              */
/* ------------------------------------------------------------------ */

/* Des alias de type, et non des interfaces : pg exige que le paramètre de
   query<T> accepte une signature d'index, ce que TypeScript n'accorde
   implicitement qu'aux alias. */

type LigneSession = {
  id: number;
  formation: string;
  libelle: string;
  ouverte: boolean;
  creee_le: Date | string;
};

type LigneReponse = {
  questionnaire: string;
  reponses: unknown;
  envoye_le: Date | string;
};

type LigneRestitution = {
  id: number;
  domaine: string;
  niveau: string | null;
  membres: string | null;
  outil: string;
  ressource: string;
  requete: string | null;
  corrections: string | null;
  vigilance: string | null;
  envoye_le: Date | string;
};

/** Un `timestamptz` arrive en `Date` ; le contrat public expose une chaîne ISO. */
function versIso(valeur: Date | string): string {
  const date = valeur instanceof Date ? valeur : new Date(valeur);
  return Number.isNaN(date.getTime()) ? String(valeur) : date.toISOString();
}

function versSession(ligne: LigneSession): SessionFormation {
  return {
    id: ligne.id,
    formation: ligne.formation,
    libelle: ligne.libelle,
    ouverte: ligne.ouverte,
    creeeLe: versIso(ligne.creee_le),
  };
}

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

/**
 * La session ouverte d'une formation, la plus récente s'il y en a plusieurs.
 * `null` si aucune n'est ouverte — ce n'est pas une erreur, c'est l'état normal
 * en dehors des jours de formation.
 */
export async function sessionActive(
  formation: string,
): Promise<SessionFormation | null> {
  const lignes = await interroger<LigneSession>(
    `select id, formation, libelle, ouverte, creee_le
       from formation_session
      where formation = $1 and ouverte
      order by creee_le desc, id desc
      limit 1`,
    [formation],
  );
  return lignes.length > 0 ? versSession(lignes[0]) : null;
}

/** Toutes les sessions d'une formation, de la plus récente à la plus ancienne. */
export async function listerSessions(
  formation: string,
): Promise<SessionFormation[]> {
  const lignes = await interroger<LigneSession>(
    `select id, formation, libelle, ouverte, creee_le
       from formation_session
      where formation = $1
      order by creee_le desc, id desc`,
    [formation],
  );
  return lignes.map(versSession);
}

/** Ouvre une nouvelle session. Les précédentes restent dans leur état. */
export async function creerSession(
  formation: string,
  libelle: string,
): Promise<SessionFormation> {
  const intitule = libelle.trim();
  if (!intitule) {
    throw new Error("Le libellé de la session ne peut pas être vide.");
  }

  const lignes = await interroger<LigneSession>(
    `insert into formation_session (formation, libelle)
          values ($1, $2)
       returning id, formation, libelle, ouverte, creee_le`,
    [formation, intitule],
  );
  return versSession(lignes[0]);
}

/**
 * Ouvre ou ferme une session. Une session fermée n'accepte plus de réponse ;
 * ses résultats restent consultables.
 */
export async function basculerSession(
  id: number,
  ouverte: boolean,
): Promise<void> {
  await interroger(`update formation_session set ouverte = $2 where id = $1`, [
    id,
    ouverte,
  ]);
}

/* ------------------------------------------------------------------ */
/* Réglages                                                            */
/* ------------------------------------------------------------------ */

/** Valeur d'un réglage défini depuis le site, ou null s'il n'existe pas. */
export async function lireReglage(cle: string): Promise<string | null> {
  const lignes = await interroger<{ valeur: string }>(
    `select valeur from formation_reglage where cle = $1`,
    [cle],
  );
  return lignes[0]?.valeur ?? null;
}

/** Crée ou remplace un réglage. */
export async function ecrireReglage(cle: string, valeur: string): Promise<void> {
  await interroger(
    `insert into formation_reglage (cle, valeur)
          values ($1, $2)
     on conflict (cle) do update
            set valeur = excluded.valeur, modifie_le = now()`,
    [cle, valeur],
  );
}

/* ------------------------------------------------------------------ */
/* Écriture des réponses                                               */
/* ------------------------------------------------------------------ */

/**
 * Enregistre une réponse anonyme à l'un des deux questionnaires.
 *
 * `reponses` associe un identifiant de question à sa valeur (texte, liste de
 * textes, ou nombre) ; l'ensemble est stocké tel quel en jsonb, ce qui évite une
 * migration chaque fois qu'une question est ajoutée au contenu.
 */
export async function enregistrerReponse(
  sessionId: number,
  formation: string,
  questionnaire: "sondage" | "satisfaction",
  reponses: Record<string, unknown>,
): Promise<void> {
  await interroger(
    `insert into formation_reponse (session_id, formation, questionnaire, reponses)
          values ($1, $2, $3, $4::jsonb)`,
    [sessionId, formation, questionnaire, JSON.stringify(reponses ?? {})],
  );
}

/** Champs obligatoires de la trame de restitution. */
const CHAMPS_RESTITUTION_REQUIS = ["domaine", "outil", "ressource"] as const;

function texteOuNull(valeur: string | undefined): string | null {
  const texte = (valeur ?? "").trim();
  return texte.length > 0 ? texte : null;
}

/**
 * Enregistre la trame de restitution d'un groupe. Les clés attendues sont
 * celles de la trame :
 * domaine, niveau, membres, outil, ressource, requete, corrections,
 * vigilance.
 */
export async function enregistrerRestitution(
  sessionId: number,
  formation: string,
  champs: Record<string, string>,
): Promise<void> {
  for (const requis of CHAMPS_RESTITUTION_REQUIS) {
    if (!texteOuNull(champs[requis])) {
      throw new Error(`Le champ « ${requis} » est obligatoire.`);
    }
  }

  await interroger(
    `insert into formation_restitution
       (session_id, formation, domaine, niveau, membres,
        outil, ressource, requete, corrections, vigilance)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      sessionId,
      formation,
      texteOuNull(champs.domaine),
      texteOuNull(champs.niveau),
      texteOuNull(champs.membres),
      texteOuNull(champs.outil),
      texteOuNull(champs.ressource),
      texteOuNull(champs.requete),
      texteOuNull(champs.corrections),
      texteOuNull(champs.vigilance),
    ],
  );
}

/* ------------------------------------------------------------------ */
/* Définitions des questionnaires                                      */
/* ------------------------------------------------------------------ */

/*
 * Les questions viennent du contenu, jamais de la base : c'est le contenu qui
 * fait foi sur le libellé, le type et l'ordre des options. Les exports du module
 * de contenu sont parcourus puis indexés par slug, ce qui rend l'agrégation
 * indépendante du nom donné à chaque constante (une constante par questionnaire
 * ou un tableau des deux, peu importe).
 */

function estQuestionnaire(valeur: unknown): valeur is Questionnaire {
  if (typeof valeur !== "object" || valeur === null) return false;
  const candidat = valeur as { slug?: unknown; questions?: unknown };
  return typeof candidat.slug === "string" && Array.isArray(candidat.questions);
}

let indexQuestionnaires: Map<string, Questionnaire> | null = null;

function questionnairesParSlug(): Map<string, Questionnaire> {
  if (indexQuestionnaires) return indexQuestionnaires;

  const index = new Map<string, Questionnaire>();
  const parcourir = (valeur: unknown): void => {
    if (Array.isArray(valeur)) {
      valeur.forEach(parcourir);
    } else if (estQuestionnaire(valeur) && !index.has(valeur.slug)) {
      index.set(valeur.slug, valeur);
    }
  };
  Object.values(sourceQuestionnaires).forEach(parcourir);

  indexQuestionnaires = index;
  return index;
}

/** Retrouve les questions d'un questionnaire, avec une tolérance sur le slug. */
function questionsDe(nom: NomQuestionnaire): Question[] {
  const index = questionnairesParSlug();
  const exact = index.get(nom);
  if (exact) return exact.questions;

  for (const [slug, questionnaire] of index) {
    if (slug.includes(nom)) return questionnaire.questions;
  }
  return [];
}

/* ------------------------------------------------------------------ */
/* Agrégation                                                          */
/* ------------------------------------------------------------------ */

/** Lecture d'une valeur jsonb en texte. Chaîne vide si la réponse est absente. */
function enTexte(valeur: unknown): string {
  if (typeof valeur === "string") return valeur.trim();
  if (typeof valeur === "number" && Number.isFinite(valeur)) return String(valeur);
  return "";
}

/** Lecture d'une valeur jsonb en liste de textes (choix multiple). */
function enListe(valeur: unknown): string[] {
  if (Array.isArray(valeur)) {
    return valeur.map(enTexte).filter((texte) => texte.length > 0);
  }
  const unique = enTexte(valeur);
  return unique ? [unique] : [];
}

/** Lecture d'une valeur jsonb en nombre (échelle). `null` si ce n'en est pas un. */
function enNombre(valeur: unknown): number | null {
  if (typeof valeur === "number" && Number.isFinite(valeur)) return valeur;
  if (typeof valeur === "string" && valeur.trim() !== "") {
    const nombre = Number(valeur);
    if (Number.isFinite(nombre)) return nombre;
  }
  return null;
}

/** Pourcentage de 0 à 100, arrondi au dixième. 0 quand personne n'a répondu. */
function pourcentage(nombre: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((nombre / total) * 1000) / 10;
}

/**
 * Répartition d'une question à options : toutes les options déclarées sont
 * reprises dans l'ordre du questionnaire, celles restées à zéro comprises.
 */
function repartitionSur(
  options: string[],
  comptes: Map<string, number>,
  total: number,
): { option: string; nombre: number; part: number }[] {
  return options.map((option) => {
    const nombre = comptes.get(option) ?? 0;
    return { option, nombre, part: pourcentage(nombre, total) };
  });
}

/** Agrège une question sur l'ensemble des réponses reçues (ordre d'envoi). */
function agreger(
  question: Question,
  reponses: Record<string, unknown>[],
): Agregat {
  const base = {
    questionId: question.id,
    libelle: question.libelle,
    type: question.type,
  };

  switch (question.type) {
    case "choix-unique": {
      const comptes = new Map<string, number>();
      let total = 0;
      for (const reponse of reponses) {
        const choix = enTexte(reponse[question.id]);
        // Une valeur hors des options déclarées serait une donnée corrompue :
        // on ne la compte pas, pour que les parts restent lisibles.
        if (!choix || !question.options.includes(choix)) continue;
        comptes.set(choix, (comptes.get(choix) ?? 0) + 1);
        total += 1;
      }
      return {
        ...base,
        total,
        repartition: repartitionSur(question.options, comptes, total),
      };
    }

    case "choix-multiple": {
      const comptes = new Map<string, number>();
      let total = 0; // nombre de répondants, et non de cases cochées
      for (const reponse of reponses) {
        const choix = enListe(reponse[question.id]).filter((valeur) =>
          question.options.includes(valeur),
        );
        if (choix.length === 0) continue;
        total += 1;
        // Dédoublonnage : une même option envoyée deux fois reste un répondant.
        for (const valeur of new Set(choix)) {
          comptes.set(valeur, (comptes.get(valeur) ?? 0) + 1);
        }
      }
      return {
        ...base,
        total,
        repartition: repartitionSur(question.options, comptes, total),
      };
    }

    case "echelle": {
      const bornes: string[] = [];
      for (let valeur = question.min; valeur <= question.max; valeur += 1) {
        bornes.push(String(valeur));
      }

      const comptes = new Map<string, number>();
      let total = 0;
      let somme = 0;
      for (const reponse of reponses) {
        const nombre = enNombre(reponse[question.id]);
        if (nombre === null) continue;
        const entier = Math.round(nombre);
        if (entier < question.min || entier > question.max) continue;
        const cle = String(entier);
        comptes.set(cle, (comptes.get(cle) ?? 0) + 1);
        total += 1;
        somme += entier;
      }

      return {
        ...base,
        total,
        repartition: repartitionSur(bornes, comptes, total),
        moyenne: total > 0 ? Math.round((somme / total) * 100) / 100 : 0,
      };
    }

    case "texte-libre": {
      const verbatims: string[] = [];
      for (const reponse of reponses) {
        const texte = enTexte(reponse[question.id]);
        if (texte) verbatims.push(texte);
      }
      return { ...base, total: verbatims.length, repartition: [], verbatims };
    }
  }
}

/* ------------------------------------------------------------------ */
/* Lecture des résultats                                               */
/* ------------------------------------------------------------------ */

/** Résultats d'une salle sans session ouverte : vides, mais parfaitement valides. */
function resultatsVides(): Resultats {
  return {
    session: null,
    sondage: [],
    satisfaction: [],
    restitutions: [],
    compte: { sondage: 0, satisfaction: 0, restitutions: 0 },
  };
}

/**
 * Charge de quoi projeter le tableau de bord : la session, les deux séries
 * d'agrégats et les restitutions.
 *
 * Sans `sessionId`, la session ouverte est utilisée. S'il n'y en a aucune (ou si
 * l'identifiant demandé n'appartient pas à cette formation), la fonction renvoie
 * des résultats vides plutôt qu'une erreur : le tableau de bord affiche alors
 * « aucune session ouverte », qui est un état normal et non une panne.
 */
export async function chargerResultats(
  formation: string,
  sessionId?: number,
): Promise<Resultats> {
  let session: SessionFormation | null;

  if (typeof sessionId === "number" && Number.isFinite(sessionId)) {
    const lignes = await interroger<LigneSession>(
      `select id, formation, libelle, ouverte, creee_le
         from formation_session
        where id = $1 and formation = $2`,
      [sessionId, formation],
    );
    session = lignes.length > 0 ? versSession(lignes[0]) : null;
  } else {
    session = await sessionActive(formation);
  }

  if (!session) return resultatsVides();

  const [lignesReponses, lignesRestitutions] = await Promise.all([
    interroger<LigneReponse>(
      `select questionnaire, reponses, envoye_le
         from formation_reponse
        where session_id = $1
        order by envoye_le asc, id asc`,
      [session.id],
    ),
    interroger<LigneRestitution>(
      `select id, domaine, niveau, membres, outil, ressource,
              requete, corrections, vigilance, envoye_le
         from formation_restitution
        where session_id = $1
        order by envoye_le asc, id asc`,
      [session.id],
    ),
  ]);

  const reponsesDe = (nom: NomQuestionnaire): Record<string, unknown>[] =>
    lignesReponses
      .filter((ligne) => ligne.questionnaire === nom)
      .map((ligne) =>
        typeof ligne.reponses === "object" && ligne.reponses !== null
          ? (ligne.reponses as Record<string, unknown>)
          : {},
      );

  const reponsesSondage = reponsesDe("sondage");
  const reponsesSatisfaction = reponsesDe("satisfaction");

  const restitutions: Restitution[] = lignesRestitutions.map((ligne) => ({
    id: ligne.id,
    domaine: ligne.domaine,
    niveau: ligne.niveau,
    membres: ligne.membres,
    outil: ligne.outil,
    ressource: ligne.ressource,
    requete: ligne.requete,
    corrections: ligne.corrections,
    vigilance: ligne.vigilance,
    envoyeLe: versIso(ligne.envoye_le),
  }));

  return {
    session,
    sondage: questionsDe("sondage").map((question) =>
      agreger(question, reponsesSondage),
    ),
    satisfaction: questionsDe("satisfaction").map((question) =>
      agreger(question, reponsesSatisfaction),
    ),
    restitutions,
    compte: {
      sondage: reponsesSondage.length,
      satisfaction: reponsesSatisfaction.length,
      restitutions: restitutions.length,
    },
  };
}
