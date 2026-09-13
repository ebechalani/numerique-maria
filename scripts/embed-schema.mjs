/**
 * Recopie db/schema.sql dans src/lib/schema.generated.ts — `npm run db:embed`,
 * lancé aussi avant chaque build (`prebuild`).
 *
 * Le site applique le schéma lui-même au premier accès à la base. L'embarquer
 * dans le code, plutôt que de lire le fichier au moment de l'exécution, évite
 * toute dépendance à l'arborescence du déploiement (fonctions serveur,
 * conteneurs) : db/schema.sql reste la seule source, ce fichier n'est qu'une
 * copie, régénérée automatiquement.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const racine = new URL("../", import.meta.url);
const source = fileURLToPath(new URL("db/schema.sql", racine));
const cible = fileURLToPath(new URL("src/lib/schema.generated.ts", racine));

const sql = readFileSync(source, "utf8");

const contenu = `/* Fichier généré par scripts/embed-schema.mjs — ne pas modifier à la main.
 * Source : db/schema.sql. Regénérer avec \`npm run db:embed\` (fait avant
 * chaque build). */

export const SCHEMA_SQL = ${JSON.stringify(sql)};
`;

writeFileSync(cible, contenu, "utf8");
console.log(`  Schéma embarqué : ${sql.length} caractères → src/lib/schema.generated.ts`);
