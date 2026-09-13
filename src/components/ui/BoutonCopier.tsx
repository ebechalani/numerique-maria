"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Retour visuel du bouton — revient à « repos » au bout de deux secondes. */
type EtatCopie = "repos" | "copie" | "echec";

interface ProprietesBoutonCopier {
  /** Contenu exact placé dans le presse-papiers. */
  texte: string;
  /** Libellé au repos. « Copier » par défaut. */
  libelle?: string;
}

/**
 * Écrit dans le presse-papiers.
 *
 * L’API `navigator.clipboard` n’existe qu’en contexte sécurisé (HTTPS ou
 * localhost) : en salle, un site servi en HTTP simple la voit absente. On
 * replie alors sur une zone de texte placée hors écran, sélectionnée puis
 * copiée — le seul mécanisme disponible dans ce cas.
 */
async function ecrireDansPressePapiers(texte: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(texte);
      return true;
    } catch {
      // Permission refusée ou contexte non sécurisé : on tente le repli.
    }
  }

  if (typeof document === "undefined") return false;

  try {
    const zone = document.createElement("textarea");
    zone.value = texte;
    zone.setAttribute("readonly", "");
    zone.style.position = "fixed";
    zone.style.top = "0";
    zone.style.left = "-9999px";
    zone.style.opacity = "0";
    document.body.appendChild(zone);
    zone.select();
    zone.setSelectionRange(0, zone.value.length);
    const reussi = document.execCommand("copy");
    document.body.removeChild(zone);
    return reussi;
  } catch {
    return false;
  }
}

const LIBELLES: Record<EtatCopie, string | null> = {
  repos: null,
  copie: "Copié",
  echec: "Échec",
};

/**
 * Petit bouton discret « Copier » — utilisé partout où une requête est
 * proposée à l’essai immédiat dans ChatGPT ou NotebookLM.
 */
export default function BoutonCopier({
  texte,
  libelle = "Copier",
}: ProprietesBoutonCopier) {
  const [etat, setEtat] = useState<EtatCopie>("repos");
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Le retour « Copié » ne doit pas survivre au démontage du composant.
  useEffect(() => {
    return () => {
      if (minuterie.current !== null) clearTimeout(minuterie.current);
    };
  }, []);

  const copier = useCallback(async () => {
    const reussi = await ecrireDansPressePapiers(texte);
    setEtat(reussi ? "copie" : "echec");
    if (minuterie.current !== null) clearTimeout(minuterie.current);
    minuterie.current = setTimeout(() => setEtat("repos"), 2000);
  }, [texte]);

  const auRepos = etat === "repos";
  const texteAffiche = LIBELLES[etat] ?? libelle;

  return (
    <button
      type="button"
      onClick={() => {
        void copier();
      }}
      className={[
        "sans-impression inline-flex shrink-0 items-center gap-1.5 rounded-md border",
        "px-2 py-1 text-xs font-medium transition-colors",
        etat === "copie"
          ? "border-accent bg-accent-voile text-accent-fort"
          : etat === "echec"
            ? "border-trait-fort bg-craie text-graphite"
            : "border-trait bg-craie text-graphite hover:border-trait-fort hover:text-encre",
      ].join(" ")}
    >
      {auRepos || etat === "echec" ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
      <span aria-live="polite" className="whitespace-nowrap">
        {texteAffiche}
      </span>
    </button>
  );
}
