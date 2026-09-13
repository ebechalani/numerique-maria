/**
 * Identité du site : l’établissement et la personne qui le porte.
 * Un seul endroit à modifier ; l’en-tête, le pied de page, l’accueil et les
 * métadonnées s’y réfèrent.
 */

export const ETABLISSEMENT = {
  nom: "Providence",
  /**
   * Congrégation de tutelle. Le diaporama source la porte dans ses propriétés
   * (« Carmélites ») et « Providence » dans son pied de page.
   */
  tutelle: "Carmélites",
  /**
   * Ville et pays. Le diaporama ne les mentionne pas : ils sont laissés vides
   * plutôt que devinés. Renseignés, ils s’affichent dans le pied de page ;
   * vides, ils sont simplement omis — rien d’autre à modifier.
   */
  lieu: "",
  pays: "",
} as const;

export const REFERENT = {
  nom: "Eddy Bachaalany",
  role: "référent numérique",
  courriel: "eddy.bachaalany@lycee-montaigne.edu.lb",
} as const;

/** « Eddy Bachaalany, référent numérique » */
export const SIGNATURE = `${REFERENT.nom}, ${REFERENT.role}`;

/**
 * « Beyrouth · Liban », ou une chaîne vide tant que ni la ville ni le pays ne
 * sont renseignés. Les composants testent la chaîne avant de l’afficher.
 */
export const LOCALISATION: string = [ETABLISSEMENT.lieu, ETABLISSEMENT.pays]
  .filter((part) => part.length > 0)
  .join(" · ");
