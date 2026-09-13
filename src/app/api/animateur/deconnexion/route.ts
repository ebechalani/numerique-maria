/**
 * Déconnexion de l’animateur — POST, sans corps.
 *
 * Efface le cookie d’accès. Utile en fin de séance, surtout lorsque le tableau
 * de bord a été projeté depuis un poste partagé de la salle : refermer l’accès
 * y prend un clic, plutôt que d’attendre l’expiration des douze heures.
 *
 * La route ne vérifie pas l’autorisation : se déconnecter sans être connecté
 * n’est pas une erreur, et répondre 401 ici n’aurait aucun sens. Elle réécrit
 * simplement le cookie, vide et expiré.
 *
 * En POST et non en GET : une navigation ou un préchargement ne doit pas
 * fermer la session par inadvertance.
 */

import { cookies } from "next/headers";

import {
  COOKIE_ANIMATEUR,
  ENTETES_SANS_CACHE,
  optionsCookieAnimateur,
} from "@/lib/animateur";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  const boite = await cookies();

  // Un cookie ne s’efface qu’en le réécrivant avec les mêmes attributs (même
  // chemin, même « secure ») : d’où les options partagées, avec une durée nulle.
  boite.set(COOKIE_ANIMATEUR, "", {
    ...optionsCookieAnimateur(),
    maxAge: 0,
  });

  return Response.json(
    { ok: true, message: "Accès animateur fermé." },
    { status: 200, headers: ENTETES_SANS_CACHE },
  );
}
