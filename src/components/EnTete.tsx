"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ETABLISSEMENT, REFERENT, SIGNATURE } from "@/content/site";

/** Adresse de contact du référent numérique. */
const COURRIEL = REFERENT.courriel;

/** Identifiant du panneau mobile, référencé par aria-controls. */
const ID_PANNEAU = "menu-principal";

/**
 * Barre supérieure collante du site.
 * Sur mobile, la navigation est repliée dans un panneau ouvert par un bouton
 * accessible ; le panneau se referme dès qu’une navigation a lieu.
 */
export default function EnTete() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  // La touche Échap referme le panneau.
  useEffect(() => {
    if (!menuOuvert) return;
    function surTouche(evenement: KeyboardEvent) {
      if (evenement.key === "Escape") setMenuOuvert(false);
    }
    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, [menuOuvert]);

  return (
    <header className="sans-impression sticky top-0 z-40 border-b border-trait bg-craie/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-serif text-base leading-tight text-encre transition-colors hover:text-accent sm:text-lg"
        >
          Numérique{" "}
          <span aria-hidden="true" className="mx-0.5 text-trait-fort">
            ·
          </span>{" "}
          <span className="text-encre-clair">{ETABLISSEMENT.nom}</span>
          <span className="mt-0.5 block font-sans text-[0.7rem] leading-none tracking-wide text-estompe sm:text-xs">
            {SIGNATURE}
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-7 text-sm md:flex"
        >
          <Link
            href="/"
            className="text-graphite transition-colors hover:text-accent"
          >
            Les formations
          </Link>
          <Link
            href="/outils/redacteur-de-prompt"
            className="text-graphite transition-colors hover:text-accent"
          >
            Rédacteur de prompt
          </Link>
          <a
            href={`mailto:${COURRIEL}`}
            className="text-graphite transition-colors hover:text-accent"
            title={`Écrire à ${REFERENT.nom}`}
          >
            Contact
          </a>
        </nav>

        {/* Bouton du panneau mobile */}
        <button
          type="button"
          aria-expanded={menuOuvert}
          aria-controls={ID_PANNEAU}
          aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMenuOuvert((ouvert) => !ouvert)}
          className="-mr-1 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-trait text-encre transition-colors hover:bg-voile md:hidden"
        >
          {menuOuvert ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Panneau mobile */}
      <div
        id={ID_PANNEAU}
        hidden={!menuOuvert}
        className="border-t border-trait bg-craie md:hidden"
      >
        <nav
          aria-label="Navigation principale (mobile)"
          // Le panneau ne contient que des liens : suivre l’un d’eux le referme.
          onClick={() => setMenuOuvert(false)}
          className="mx-auto flex max-w-6xl flex-col px-4 py-2 text-sm sm:px-6"
        >
          <Link
            href="/"
            className="border-b border-trait py-3 text-encre transition-colors hover:text-accent"
          >
            Les formations
          </Link>
          <Link
            href="/outils/redacteur-de-prompt"
            className="border-b border-trait py-3 text-encre transition-colors hover:text-accent"
          >
            Rédacteur de prompt{" "}
            <span className="block text-xs text-estompe">Méthode ACTIF</span>
          </Link>
          <a
            href={`mailto:${COURRIEL}`}
            className="py-3 text-encre transition-colors hover:text-accent"
          >
            Contact{" "}
            <span className="block text-xs text-estompe">
              {REFERENT.nom} · {COURRIEL}
            </span>
          </a>
        </nav>
      </div>
    </header>
  );
}
