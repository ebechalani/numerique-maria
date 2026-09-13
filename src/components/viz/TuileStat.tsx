interface ProprietesTuileStat {
  /** Ce que compte la tuile, en casse de phrase et sans deux-points. */
  libelle: string;
  /** La valeur elle-même, déjà mise en forme (« 4,2 », « 37 », « 86 % »). */
  valeur: string;
  /** Contexte de lecture placé sous la valeur (« sur 5 · 37 réponses »). */
  precision?: string;
  /** Typographie agrandie pour la lecture au vidéoprojecteur. */
  projection?: boolean;
}

/**
 * Tuile de statistique — moyenne d’une échelle de satisfaction, compteur de
 * réponses, taux de participation.
 *
 * Composant serveur : elle n’affiche qu’un résultat déjà calculé, aucun état
 * ni interaction. La valeur est le seul élément en semi-gras ; le libellé et
 * la précision restent en gris pour que l’œil tombe d’abord sur le chiffre.
 */
export default function TuileStat({
  libelle,
  valeur,
  precision,
  projection = false,
}: ProprietesTuileStat) {
  return (
    <div
      className={[
        "rounded-[--radius-carte] border border-trait bg-craie",
        projection ? "p-7" : "p-5",
      ].join(" ")}
    >
      <p
        className={[
          "leading-snug text-graphite",
          projection ? "text-lg" : "text-sm",
        ].join(" ")}
      >
        {libelle}
      </p>

      <p
        className={[
          "mt-2 font-sans font-semibold leading-none tabular-nums text-encre",
          // En projection, la valeur ne descend jamais sous 3rem.
          projection ? "text-5xl" : "text-3xl",
        ].join(" ")}
      >
        {valeur}
      </p>

      {precision ? (
        <p
          className={[
            "mt-2.5 leading-snug text-estompe",
            projection ? "text-base" : "text-xs",
          ].join(" ")}
        >
          {precision}
        </p>
      ) : null}
    </div>
  );
}
