import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import Assistant from "@/components/Assistant";
import EnTete from "@/components/EnTete";
import PiedDePage from "@/components/PiedDePage";
import { ETABLISSEMENT, REFERENT, SIGNATURE } from "@/content/site";

/**
 * Métadonnées par défaut du site.
 * `metadataBase` est volontairement omis : aucune URL de production n’est
 * arrêtée à ce jour.
 */
export const metadata: Metadata = {
  title: {
    default: `Numérique · ${ETABLISSEMENT.nom}`,
    template: `%s · Numérique — ${ETABLISSEMENT.nom}`,
  },
  description: `L’espace de formation d’${SIGNATURE} de ${ETABLISSEMENT.nom} : suivre les formations, retrouver les ressources, poser ses questions.`,
  authors: [{ name: REFERENT.nom }],
  creator: REFERENT.nom,
};

/**
 * Layout racine : en-tête collant, contenu, pied de page, assistant flottant.
 * Le lien d’évitement reste le premier élément focusable de la page.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col">
        <a
          href="#contenu"
          className="sans-impression sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:border focus:border-accent focus:bg-craie focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-fort"
        >
          Aller au contenu
        </a>

        <EnTete />

        <main id="contenu" className="flex-1">
          {children}
        </main>

        <PiedDePage />

        <Assistant />
      </body>
    </html>
  );
}
