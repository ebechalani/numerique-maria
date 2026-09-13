/**
 * Changement du code d’accès animateur — réservé à un animateur déjà entré.
 *
 * Si le code vient de la variable d’environnement, la page l’explique au lieu
 * de proposer un formulaire qui ne pourrait rien changer.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import DefinirCodeAnimateur from "@/components/DefinirCodeAnimateur";
import { animateurAutorise, secretAnimateur } from "@/lib/animateur";
import { getFormation } from "@/lib/formations";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ formation: string }>;
}

export const metadata: Metadata = {
  title: "Code d’accès animateur",
  robots: { index: false, follow: false },
};

export default async function PageCodeAnimateur({ params }: Props) {
  const { formation: slug } = await params;
  const formation = getFormation(slug);
  if (!formation) notFound();

  const lienRetour = `/formations/${formation.slug}/animateur`;

  if (!(await animateurAutorise())) redirect(lienRetour);

  const secret = await secretAnimateur();
  if (secret?.origine === "environnement") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 sm:py-24">
        <div className="rounded-[--radius-carte] border border-trait bg-craie p-6 sm:p-8">
          <p className="text-sm text-accent">Espace animateur</p>
          <h1 className="mt-3 font-serif text-2xl leading-tight text-encre">
            Le code est défini par l’environnement
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-graphite">
            Sur ce déploiement, le code d’accès vient de la variable
            d’environnement CODE_ANIMATEUR : il se change dans les réglages du
            projet, puis le site est redéployé. Pour le choisir depuis le site,
            supprimez cette variable.
          </p>
          <Link
            href={lienRetour}
            className="mt-5 inline-block text-sm text-accent underline underline-offset-4 hover:text-accent-fort"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return <DefinirCodeAnimateur mode="modification" lienRetour={lienRetour} />;
}
