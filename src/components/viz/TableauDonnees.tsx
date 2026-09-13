"use client";

import { useId } from "react";

/*
  Un nombre, éventuellement suivi d’un signe pour-cent : « 12 », « 4,2 »,
  « 30 % ». La classe \s couvre déjà l’espace fine insécable placée devant le
  pour-cent par les graphiques.
*/
const MOTIF_NUMERIQUE = /^[+-]?\d[\d\s.,]*%?$/;

function estNumerique(cellule: string | number): boolean {
  if (typeof cellule === "number") return Number.isFinite(cellule);
  return MOTIF_NUMERIQUE.test(cellule.trim());
}

interface ProprietesTableauDonnees {
  /** Intitulés de colonnes, dans l’ordre des cellules de chaque ligne. */
  entetes: string[];
  /** Lignes de données ; la première cellule sert d’en-tête de ligne. */
  lignes: (string | number)[][];
  /** Phrase de contexte affichée sous le tableau. */
  legende?: string;
}

/**
 * Tableau de données brut.
 *
 * C’est la vue accessible du tableau de bord : tout ce qu’un graphique encode
 * par la longueur ou la couleur d’une barre doit pouvoir se lire ici en toutes
 * lettres. Elle n’est donc jamais tronquée — pas de `truncate`, pas de
 * `whitespace-nowrap` sur les cellules de contenu — et le conteneur défile
 * horizontalement plutôt que de rogner une colonne.
 */
export default function TableauDonnees({
  entetes,
  lignes,
  legende,
}: ProprietesTableauDonnees) {
  const idLegende = useId();

  /*
    Une colonne dont toutes les cellules sont des grandeurs — nombres bruts ou
    pourcentages déjà mis en forme — est alignée à droite et rendue en chiffres
    à chasse fixe : les ordres de grandeur se comparent alors d’un coup d’œil,
    unité sous unité, dizaine sous dizaine.
  */
  const colonnesNumeriques = entetes.map(
    (_, colonne) =>
      lignes.length > 0 &&
      lignes.every((ligne) => {
        const cellule = ligne[colonne];
        return cellule !== undefined && estNumerique(cellule);
      }),
  );

  return (
    <div>
      <div className="overflow-x-auto rounded-[--radius-carte] border border-trait">
        <table
          className="w-full border-collapse text-left text-sm"
          aria-describedby={legende ? idLegende : undefined}
        >
          <thead className="bg-voile">
            <tr>
              {entetes.map((entete, colonne) => (
                <th
                  key={colonne}
                  scope="col"
                  className={[
                    "whitespace-nowrap border-b border-trait px-4 py-2.5",
                    "font-semibold text-encre",
                    colonnesNumeriques[colonne] ? "text-right" : "text-left",
                  ].join(" ")}
                >
                  {entete}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-trait">
            {lignes.length === 0 ? (
              <tr>
                <td
                  colSpan={Math.max(entetes.length, 1)}
                  className="px-4 py-4 text-center text-graphite"
                >
                  Aucune donnée à afficher pour l’instant.
                </td>
              </tr>
            ) : (
              lignes.map((ligne, rang) => (
                <tr key={rang} className="odd:bg-craie even:bg-papier">
                  {ligne.map((cellule, colonne) =>
                    colonne === 0 ? (
                      <th
                        key={colonne}
                        scope="row"
                        className="px-4 py-2.5 text-left align-top font-medium text-encre"
                      >
                        {cellule}
                      </th>
                    ) : (
                      <td
                        key={colonne}
                        className={[
                          "px-4 py-2.5 align-top leading-relaxed text-encre-clair",
                          colonnesNumeriques[colonne]
                            ? "text-right tabular-nums"
                            : "text-left",
                        ].join(" ")}
                      >
                        {cellule}
                      </td>
                    ),
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {legende ? (
        <p id={idLegende} className="mt-2 text-xs leading-relaxed text-graphite">
          {legende}
        </p>
      ) : null}
    </div>
  );
}
