"use client";

import { useCallback, useEffect, useId, useRef } from "react";

import BoutonCopier from "@/components/ui/BoutonCopier";
import { briquesRequete } from "@/content/formations/ia-generative-maternelle/ressources/requetes";
import { useEtatLocal } from "@/lib/progression";

/** Clé de persistance — un enseignant retrouve sa requête en revenant. */
const CLE_STOCKAGE = "constructeur-requete";

type Brique = (typeof briquesRequete)[number];

/** Toutes les briques à vide : sert d’état initial et de « tout effacer ». */
const briquesVides: Record<string, string> = Object.fromEntries(
  briquesRequete.map((brique) => [brique.cle, ""]),
);

/**
 * Les exemples de la fiche méthode sont cités entre guillemets. Les guillemets
 * signalent la citation, ils ne font pas partie de la requête : on les retire
 * à l’insertion pour que les cinq briques s’assemblent en un texte suivi.
 */
function sansGuillemets(texte: string): string {
  const correspondance = /^«\s*([\s\S]*?)\s*»$/.exec(texte.trim());
  return correspondance ? correspondance[1] : texte;
}

/* ------------------------------------------------------------------ */
/* Un champ de saisie                                                  */
/* ------------------------------------------------------------------ */

interface ProprietesChampBrique {
  brique: Brique;
  numero: number;
  valeur: string;
  onModifier: (cle: string, valeur: string) => void;
}

function ChampBrique({
  brique,
  numero,
  valeur,
  onModifier,
}: ProprietesChampBrique) {
  const identifiant = useId();
  const idChamp = `${identifiant}-champ`;
  const idAide = `${identifiant}-aide`;
  const zoneRef = useRef<HTMLTextAreaElement>(null);

  // La zone de saisie épouse la hauteur de son contenu : la requête reste
  // lisible d’un coup d’œil, sans ascenseur interne.
  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;

    const ajuster = () => {
      zone.style.height = "auto";
      zone.style.height = `${zone.scrollHeight}px`;
    };

    ajuster();
    window.addEventListener("resize", ajuster);
    return () => window.removeEventListener("resize", ajuster);
  }, [valeur]);

  return (
    <li className="rounded-lg border border-trait bg-craie p-4">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-1 items-baseline gap-3">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-trait-fort bg-voile text-xs font-medium text-graphite tabular-nums"
          >
            {numero}
          </span>
          <div className="min-w-0">
            <label
              htmlFor={idChamp}
              className="font-serif text-base font-semibold text-encre"
            >
              {brique.titre}
            </label>
            <p id={idAide} className="mt-0.5 text-sm text-graphite">
              {brique.question}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onModifier(brique.cle, sansGuillemets(brique.exemple))}
          aria-label={`Voir un exemple pour la brique ${brique.titre}`}
          className="sans-impression shrink-0 rounded-md px-1.5 py-1 text-xs font-medium text-accent transition-colors hover:text-accent-fort hover:underline"
        >
          Voir un exemple
        </button>
      </div>

      <textarea
        id={idChamp}
        ref={zoneRef}
        value={valeur}
        onChange={(evenement) => onModifier(brique.cle, evenement.target.value)}
        aria-describedby={idAide}
        rows={2}
        placeholder={brique.exemplePlaceholder}
        className="mt-3 block w-full resize-none overflow-hidden rounded-md border border-trait bg-papier px-3 py-2 text-sm leading-relaxed text-encre placeholder:text-estompe focus:border-accent focus:outline-none"
      />
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Le constructeur                                                     */
/* ------------------------------------------------------------------ */

/**
 * Les cinq lettres de la méthode ACTIF — Acteur, Contexte, Tâche, Intention,
 * Format — assemblées en direct sous les yeux de la participante.
 * La structure vaut pour les deux outils de la formation, ChatGPT et
 * NotebookLM.
 */
export default function ConstructeurRequete() {
  const [valeurs, setValeurs] = useEtatLocal<Record<string, string>>(
    CLE_STOCKAGE,
    briquesVides,
  );
  const identifiant = useId();
  const idApercu = `${identifiant}-apercu`;

  const modifier = useCallback(
    (cle: string, valeur: string) => {
      // On repart des briques vides : une saisie enregistrée avant l’ajout
      // d’une brique reste exploitable.
      setValeurs({ ...briquesVides, ...valeurs, [cle]: valeur });
    },
    [setValeurs, valeurs],
  );

  const effacerTout = useCallback(() => {
    setValeurs({ ...briquesVides });
  }, [setValeurs]);

  const morceaux = briquesRequete
    .map((brique) => (valeurs?.[brique.cle] ?? "").trim())
    .filter((morceau) => morceau.length > 0);

  const requeteAssemblee = morceaux.join(" ");
  const nbRenseignees = morceaux.length;
  const total = briquesRequete.length;

  return (
    <div className="my-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p role="status" className="text-sm text-graphite">
          {nbRenseignees} brique{nbRenseignees > 1 ? "s" : ""} renseignée
          {nbRenseignees > 1 ? "s" : ""} sur {total}
        </p>
        <button
          type="button"
          onClick={effacerTout}
          disabled={nbRenseignees === 0}
          className="sans-impression rounded-md border border-trait bg-craie px-2 py-1 text-xs font-medium text-graphite transition-colors hover:border-trait-fort hover:text-encre disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-trait disabled:hover:text-graphite"
        >
          Tout effacer
        </button>
      </div>

      <ol className="space-y-3">
        {briquesRequete.map((brique, index) => (
          <ChampBrique
            key={brique.cle}
            brique={brique}
            numero={index + 1}
            valeur={valeurs?.[brique.cle] ?? ""}
            onModifier={modifier}
          />
        ))}
      </ol>

      <section
        aria-labelledby={idApercu}
        className="mt-6 rounded-lg border border-trait bg-craie p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <h3
            id={idApercu}
            className="font-serif text-base font-semibold text-encre"
          >
            Votre requête
          </h3>
          {requeteAssemblee ? <BoutonCopier texte={requeteAssemblee} /> : null}
        </div>

        <p className="mt-3 rounded-r-lg border-l-[3px] border-accent bg-voile px-4 py-3 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap text-encre">
          {requeteAssemblee || (
            <span className="text-estompe">
              Remplissez au moins une brique : la requête s’assemble ici, prête
              à copier.
            </span>
          )}
        </p>

        <p className="mt-3 flex items-start gap-2 text-sm text-graphite">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          >
            <path d="M12 3 4 6v6c0 4.5 3.2 7.9 8 9 4.8-1.1 8-4.5 8-9V6l-8-3Z" />
            <path d="M12 9v4" />
            <path d="M12 16h.01" />
          </svg>
          <span>
            Ne jamais saisir de données personnelles d’enfants : utiliser
            « enfant A », « enfant B ».
          </span>
        </p>
      </section>

      <p className="mt-2 text-xs text-estompe">
        Votre saisie est conservée sur cet appareil : vous la retrouverez en
        revenant sur cette page.
      </p>
    </div>
  );
}
