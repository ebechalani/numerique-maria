/**
 * Identité du site : l’établissement et la personne qui le porte.
 * Un seul endroit à modifier ; l’en-tête, le pied de page, l’accueil, les
 * métadonnées et l’assistant s’y réfèrent.
 */

export const ETABLISSEMENT = {
  nom: "Collège de la Providence",
  /** Congrégation de tutelle, portée par les propriétés du diaporama source. */
  tutelle: "Carmélites",
  /**
   * Ville et pays. Ils ne sont pas encore arrêtés : laissés vides, ils sont
   * simplement omis partout ; renseignés, ils s’affichent dans le pied de page
   * et sur l’accueil — rien d’autre à modifier.
   */
  lieu: "",
  pays: "",
} as const;

export const REFERENT = {
  nom: "Maria Bachaalany",
  role: "référente numérique",
  /**
   * Adresse de contact. Tant qu’elle est vide, aucun lien « Contact » ni
   * aucune adresse ne s’affiche, et l’assistant renvoie vers la référente
   * numérique sans citer d’adresse. La renseigner ici suffit à tout activer.
   */
  courriel: "",
} as const;

/** « Maria Bachaalany, référente numérique » */
export const SIGNATURE = `${REFERENT.nom}, ${REFERENT.role}`;

/** Initiales affichées dans la pastille de l’accueil : « MB ». */
export const INITIALES: string = REFERENT.nom
  .split(/\s+/)
  .map((mot) => mot.charAt(0).toUpperCase())
  .join("")
  .slice(0, 2);

/** Vrai dès qu’une adresse de contact est renseignée. */
export const CONTACT_OUVERT: boolean = REFERENT.courriel.length > 0;

/**
 * « Beyrouth · Liban », ou une chaîne vide tant que ni la ville ni le pays ne
 * sont renseignés. Les composants testent la chaîne avant de l’afficher.
 */
export const LOCALISATION: string = [ETABLISSEMENT.lieu, ETABLISSEMENT.pays]
  .filter((part) => part.length > 0)
  .join(" · ");
