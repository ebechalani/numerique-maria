/**
 * Inventaire des exercices d’un module.
 *
 * Sert au bilan affiché en tête de module et au compteur de la page de
 * formation. Module serveur : aucun accès au navigateur ; la lecture de
 * l’état se fait côté client, dans le composant de bilan, à partir des clés
 * de stockage listées ici — les mêmes que celles des composants interactifs.
 */

import type { Bloc } from "@/content/types";

export type TypeExercice =
  | "quiz"
  | "qcm"
  | "casPratiques"
  | "checklist"
  | "exercice";

export interface ItemBilan {
  type: TypeExercice;
  /** Clé de stockage local, sans préfixe — identique à celle du composant. */
  cle: string;
  /** Intitulé affiché dans le bilan. */
  libelle: string;
  /** Nature de l’activité, en un mot. */
  nature: string;
  /** Nombre d’éléments à traiter pour que l’exercice compte comme fait. */
  total: number;
  /** Ancre du bloc dans la page. */
  ancre: string;
}

/** Ancre d’un bloc interactif — posée par le rendu des blocs. */
export function ancreExercice(id: string): string {
  return `exercice-${id}`;
}

function pluriel(nombre: number, singulier: string, plurielForme: string) {
  return `${nombre} ${nombre > 1 ? plurielForme : singulier}`;
}

export function exercicesDuModule(blocs: Bloc[]): ItemBilan[] {
  const items: ItemBilan[] = [];

  for (const bloc of blocs) {
    switch (bloc.type) {
      case "quiz":
        items.push({
          type: "quiz",
          cle: `quiz:${bloc.id}`,
          libelle: `Vrai ou faux — ${pluriel(bloc.items.length, "affirmation", "affirmations")}`,
          nature: "Quiz",
          total: bloc.items.length,
          ancre: ancreExercice(bloc.id),
        });
        break;
      case "qcm":
        items.push({
          type: "qcm",
          cle: `qcm:${bloc.id}`,
          libelle: `À choix unique — ${pluriel(bloc.questions.length, "question", "questions")}`,
          nature: "QCM",
          total: bloc.questions.length,
          ancre: ancreExercice(bloc.id),
        });
        break;
      case "casPratiques":
        items.push({
          type: "casPratiques",
          cle: `casPratiques:${bloc.id}`,
          libelle: `Autorisé, encadré ou interdit — ${pluriel(bloc.cas.length, "cas", "cas")}`,
          nature: "Cas pratiques",
          total: bloc.cas.length,
          ancre: ancreExercice(bloc.id),
        });
        break;
      case "checklist":
        items.push({
          type: "checklist",
          cle: `checklist:${bloc.id}`,
          libelle: bloc.consigne ?? `${pluriel(bloc.items.length, "point", "points")} à vérifier`,
          nature: "Check-list",
          total: bloc.items.length,
          ancre: ancreExercice(bloc.id),
        });
        break;
      case "exercice":
        items.push({
          type: "exercice",
          cle: `exercice:${bloc.id}`,
          libelle: bloc.titre,
          nature: "Exercice",
          total: bloc.champs.length,
          ancre: ancreExercice(bloc.id),
        });
        break;
      default:
        break;
    }
  }

  return items;
}

/**
 * Un exercice est-il fait, au vu de la valeur stockée ? Pure : utilisable
 * côté client comme dans un test.
 */
export function estFait(item: ItemBilan, valeur: unknown): boolean {
  if (typeof valeur !== "object" || valeur === null) return false;
  const objet = valeur as Record<string, unknown>;

  switch (item.type) {
    case "exercice":
      return objet.valide === true;
    case "checklist":
      return (
        Object.values(objet).filter((coche) => coche === true).length >=
        item.total
      );
    case "quiz":
    case "qcm":
    case "casPratiques":
      return (
        Object.values(objet).filter(
          (reponse) => reponse !== undefined && reponse !== null,
        ).length >= item.total
      );
    default:
      return false;
  }
}
