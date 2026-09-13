/**
 * Diagnostic de la base de collecte — réservé à l’animateur connecté.
 *
 * GET → { variable, variablesUrl, hote, connexion, schema }
 *
 * Rien de secret n’en sort : des noms de variables, un nom d’hôte, des codes
 * d’erreur Postgres. Jamais une chaîne de connexion. L’animateur peut ainsi
 * voir, depuis le tableau de bord, pourquoi une séance ne s’ouvre pas.
 */

import {
  animateurAutorise,
  ENTETES_SANS_CACHE,
  refuserAcces,
} from "@/lib/animateur";
import { diagnostiquerBase } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  if (!(await animateurAutorise())) return refuserAcces();

  const diagnostic = await diagnostiquerBase();
  return Response.json(
    { ...diagnostic, actualiseLe: new Date().toISOString() },
    { status: 200, headers: ENTETES_SANS_CACHE },
  );
}
