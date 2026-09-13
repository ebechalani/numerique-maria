/**
 * Initialisation de la base de collecte — `npm run db:init`.
 *
 * Applique db/schema.sql à la base désignée par DATABASE_URL, puis affiche un
 * compte rendu : tables présentes, index posés, lignes déjà enregistrées.
 *
 * Le script est sans dépendance autre que `pg` : il lit lui-même .env.local
 * (puis .env), sans jamais écraser une variable déjà présente dans
 * l'environnement — celles de Vercel ou du shell gardent la priorité.
 *
 * Il est rejouable : le schéma n'emploie que des « create ... if not exists ».
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import process from "node:process";

import pg from "pg";

const { Client } = pg;

const racine = new URL("../", import.meta.url);
const cheminSchema = fileURLToPath(new URL("db/schema.sql", racine));

/* ------------------------------------------------------------------ */
/* Petites aides d'affichage                                           */
/* ------------------------------------------------------------------ */

const dire = (texte = "") => console.log(texte);
const echouer = (texte) => {
  console.error(`\n  Échec — ${texte}\n`);
  process.exit(1);
};

/* ------------------------------------------------------------------ */
/* Chargement des variables d'environnement                            */
/* ------------------------------------------------------------------ */

/**
 * Lit un fichier de type .env et injecte dans process.env les paires absentes.
 * Gère « export KEY=valeur », les commentaires, les guillemets encadrants.
 */
function chargerFichierEnv(nom) {
  const chemin = fileURLToPath(new URL(nom, racine));
  if (!existsSync(chemin)) return false;

  const contenu = readFileSync(chemin, "utf8");
  for (const ligneBrute of contenu.split(/\r?\n/)) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;

    const sansExport = ligne.startsWith("export ") ? ligne.slice(7).trim() : ligne;
    const separateur = sansExport.indexOf("=");
    if (separateur <= 0) continue;

    const cle = sansExport.slice(0, separateur).trim();
    let valeur = sansExport.slice(separateur + 1).trim();

    const encadre =
      valeur.length >= 2 &&
      ((valeur.startsWith('"') && valeur.endsWith('"')) ||
        (valeur.startsWith("'") && valeur.endsWith("'")));
    if (encadre) valeur = valeur.slice(1, -1);

    if (!(cle in process.env)) process.env[cle] = valeur;
  }
  return true;
}

const fichiersLus = [".env.local", ".env"].filter(chargerFichierEnv);

/* ------------------------------------------------------------------ */
/* Vérifications préalables                                            */
/* ------------------------------------------------------------------ */

dire();
dire("  Initialisation de la base de collecte");
dire("  ─────────────────────────────────────");
dire(
  fichiersLus.length > 0
    ? `  Variables lues depuis : ${fichiersLus.join(", ")}`
    : "  Aucun fichier .env.local trouvé — variables prises dans l'environnement.",
);

// Même règle que le site (src/lib/db.ts) : DATABASE_URL, puis POSTGRES_URL,
// puis toute variable *_URL dont la valeur est une URL Postgres.
const URL_POSTGRES = /^postgres(ql)?:\/\//i;
const url =
  [process.env.DATABASE_URL, process.env.POSTGRES_URL].find(
    (valeur) => valeur && URL_POSTGRES.test(valeur),
  ) ??
  Object.entries(process.env)
    .filter(
      ([nom, valeur]) =>
        nom.endsWith("_URL") &&
        !nom.includes("UNPOOLED") &&
        typeof valeur === "string" &&
        URL_POSTGRES.test(valeur),
    )
    .sort(([a], [b]) => a.localeCompare(b))[0]?.[1];
if (!url) {
  console.error();
  console.error("  DATABASE_URL est absente : impossible d'initialiser la base.");
  console.error();
  console.error("  En local   : copier .env.example en .env.local, puis y coller la");
  console.error("               chaîne de connexion Postgres.");
  console.error("  Sur Vercel : onglet Storage → Postgres. La variable est injectée");
  console.error("               automatiquement dans le projet en production.");
  console.error();
  console.error("  Sans elle, le site fonctionne : la collecte des réponses est");
  console.error("  simplement désactivée et les pages l'annoncent explicitement.");
  console.error();
  process.exit(1);
}

if (!existsSync(cheminSchema)) {
  echouer(`schéma introuvable : ${cheminSchema}`);
}

const schema = readFileSync(cheminSchema, "utf8");

/** Une base locale n'a pas de certificat TLS : inutile d'exiger SSL. */
function urlLocale(chaine) {
  if (/[?&]sslmode=disable\b/.test(chaine)) return true;
  try {
    const hote = new URL(chaine).hostname.toLowerCase();
    return (
      hote === "localhost" ||
      hote === "127.0.0.1" ||
      hote === "0.0.0.0" ||
      hote === "::1" ||
      hote === "[::1]" ||
      hote.endsWith(".local")
    );
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Application du schéma                                               */
/* ------------------------------------------------------------------ */

const TABLES = ["formation_session", "formation_reponse", "formation_restitution"];

const client = new Client({
  connectionString: url,
  connectionTimeoutMillis: 15_000,
  ssl: urlLocale(url) ? undefined : { rejectUnauthorized: false },
});

try {
  await client.connect();
} catch (erreur) {
  echouer(`connexion impossible à la base. ${erreur.message}`);
}

try {
  const avant = await client.query(
    `select table_name from information_schema.tables
      where table_schema = current_schema() and table_name = any($1)`,
    [TABLES],
  );
  const dejaLa = new Set(avant.rows.map((ligne) => ligne.table_name));

  const cible = await client.query(
    "select current_database() as base, current_schema() as schema",
  );
  dire(
    `  Base « ${cible.rows[0].base} », schéma « ${cible.rows[0].schema} »` +
      `${urlLocale(url) ? " (connexion locale, sans TLS)" : " (connexion TLS)"}`,
  );
  dire();

  await client.query(schema);

  dire("  Schéma appliqué.");
  dire();

  /* --- compte rendu table par table --- */
  for (const table of TABLES) {
    const lignes = await client.query(`select count(*)::int as total from ${table}`);
    const etat = dejaLa.has(table) ? "déjà présente" : "créée";
    const total = lignes.rows[0].total;
    const suffixe =
      total === 0
        ? "aucune ligne"
        : `${total} ligne${total > 1 ? "s" : ""} enregistrée${total > 1 ? "s" : ""}`;
    dire(`    ${table.padEnd(24)} ${etat.padEnd(14)} ${suffixe}`);
  }

  const index = await client.query(
    `select count(*)::int as total from pg_indexes
      where schemaname = current_schema() and tablename = any($1)`,
    [TABLES],
  );
  dire();
  dire(`  ${index.rows[0].total} index en place (clés primaires comprises).`);
  dire();
  dire("  La collecte est prête : sondage d'entrée, enquête de satisfaction et");
  dire("  trame de restitution enregistrent désormais leurs réponses.");
  dire();
} catch (erreur) {
  echouer(`application du schéma interrompue. ${erreur.message}`);
} finally {
  await client.end().catch(() => {});
}
