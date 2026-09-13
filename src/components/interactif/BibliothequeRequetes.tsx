"use client";

import { useId, useState, type ReactNode } from "react";

import BoutonCopier from "@/components/ui/BoutonCopier";
import type { Bloc, LigneRequete } from "@/content/types";

type BlocBibliotheque = Extract<Bloc, { type: "bibliothequeRequetes" }>;

interface ProprietesBibliothequeRequetes {
  bloc: BlocBibliotheque;
}

type FiltreOutil = "tous" | "notebooklm" | "chatgpt";

const FILTRES: { cle: FiltreOutil; libelle: string }[] = [
  { cle: "tous", libelle: "Tous" },
  { cle: "notebooklm", libelle: "NotebookLM" },
  { cle: "chatgpt", libelle: "ChatGPT" },
];

const NOMS_OUTILS: Record<"notebooklm" | "chatgpt", string> = {
  notebooklm: "NotebookLM",
  chatgpt: "ChatGPT",
};

/** Une requête « les-deux » apparaît sous les deux onglets. */
function correspond(ligne: LigneRequete, filtre: FiltreOutil): boolean {
  if (filtre === "tous") return true;
  return ligne.outil === filtre || ligne.outil === "les-deux";
}

/**
 * Surligne les crochets — [niveau], [notion]… — pour montrer d’un coup d’œil
 * ce qu’il reste à remplacer. Le texte copié, lui, reste brut.
 */
function rendreAvecCrochets(texte: string): ReactNode[] {
  return texte.split(/(\[[^\]]+\])/).map((segment, index) =>
    /^\[[^\]]+\]$/.test(segment) ? (
      <mark
        key={index}
        className="rounded bg-accent-voile px-1 font-medium text-accent-fort"
      >
        {segment}
      </mark>
    ) : (
      <span key={index}>{segment}</span>
    ),
  );
}

function PastilleOutil({ outil }: { outil: "notebooklm" | "chatgpt" }) {
  return (
    <span className="inline-flex items-center rounded-full border border-trait bg-voile px-2 py-0.5 text-xs font-medium text-graphite">
      {NOMS_OUTILS[outil]}
    </span>
  );
}

/**
 * Requêtes prêtes à l’emploi, filtrables par outil : on repère sa situation,
 * on copie, on remplace les crochets.
 */
export default function BibliothequeRequetes({
  bloc,
}: ProprietesBibliothequeRequetes) {
  const [filtre, setFiltre] = useState<FiltreOutil>("tous");
  const identifiant = useId();

  const lignesFiltrees = bloc.lignes.filter((ligne) =>
    correspond(ligne, filtre),
  );

  return (
    <div className="my-6">
      {bloc.consigne ? (
        <p className="mb-3 text-sm text-graphite">{bloc.consigne}</p>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div
          role="group"
          aria-label="Filtrer les requêtes par outil"
          className="sans-impression flex flex-wrap gap-1.5"
        >
          {FILTRES.map((option) => {
            const actif = filtre === option.cle;
            return (
              <button
                key={option.cle}
                type="button"
                onClick={() => setFiltre(option.cle)}
                aria-pressed={actif}
                className={[
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                  actif
                    ? "border-accent bg-accent-voile text-accent-fort"
                    : "border-trait bg-craie text-graphite hover:border-trait-fort hover:text-encre",
                ].join(" ")}
              >
                {option.libelle}
              </button>
            );
          })}
        </div>

        <p role="status" className="text-sm text-graphite">
          {lignesFiltrees.length} requête{lignesFiltrees.length > 1 ? "s" : ""}
        </p>
      </div>

      {lignesFiltrees.length === 0 ? (
        <p className="rounded-lg border border-trait bg-craie px-4 py-6 text-center text-sm text-graphite">
          Aucune requête pour cet outil.
        </p>
      ) : (
        <ul className="space-y-3">
          {lignesFiltrees.map((ligne, index) => {
            const idUsage = `${identifiant}-usage-${index}`;
            const outils: ("notebooklm" | "chatgpt")[] =
              ligne.outil === "les-deux"
                ? ["notebooklm", "chatgpt"]
                : [ligne.outil];

            return (
              <li key={`${ligne.usage}-${index}`}>
                <article
                  aria-labelledby={idUsage}
                  className="rounded-lg border border-trait bg-craie p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                    <div className="min-w-0 flex-1">
                      <h3
                        id={idUsage}
                        className="font-serif text-base font-semibold text-encre"
                      >
                        {ligne.usage}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {outils.map((outil) => (
                          <PastilleOutil key={outil} outil={outil} />
                        ))}
                      </div>
                    </div>
                    <BoutonCopier texte={ligne.requete} />
                  </div>

                  <p className="mt-3 rounded-md bg-voile px-3 py-2 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap text-encre">
                    {rendreAvecCrochets(ligne.requete)}
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
