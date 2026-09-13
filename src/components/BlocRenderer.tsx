/**
 * Rendu d’une suite de blocs de contenu.
 *
 * Point d’entrée unique : les pages passent `blocs` (issus de src/content) et
 * ce composant délègue à la variante correspondante. Le `switch` est exhaustif —
 * ajouter une variante au contrat sans l’y déclarer casse la compilation.
 */

import { Fragment } from "react";

import type { Bloc } from "@/content/types";

import {
  Cartes,
  Citation,
  Encadre,
  Etapes,
  Feu,
  Liste,
  NotesAnimateur,
  Paragraphe,
  Tableau,
  Titre,
} from "@/components/blocs/Statiques";
import Requete from "@/components/blocs/Requete";

import BibliothequeRequetes from "@/components/interactif/BibliothequeRequetes";
import CasPratiques from "@/components/interactif/CasPratiques";
import Checklist from "@/components/interactif/Checklist";
import ConstructeurRequete from "@/components/interactif/ConstructeurRequete";
import Exercice from "@/components/interactif/Exercice";
import Qcm from "@/components/interactif/Qcm";
import Quiz from "@/components/interactif/Quiz";
import { ancreExercice } from "@/lib/exercices";

function rendreBloc(bloc: Bloc) {
  switch (bloc.type) {
    /* --- blocs statiques --- */
    case "titre":
      return <Titre bloc={bloc} />;
    case "paragraphe":
      return <Paragraphe bloc={bloc} />;
    case "liste":
      return <Liste bloc={bloc} />;
    case "cartes":
      return <Cartes bloc={bloc} />;
    case "etapes":
      return <Etapes bloc={bloc} />;
    case "encadre":
      return <Encadre bloc={bloc} />;
    case "citation":
      return <Citation bloc={bloc} />;
    case "tableau":
      return <Tableau bloc={bloc} />;
    case "feu":
      return <Feu bloc={bloc} />;
    case "requete":
      return <Requete bloc={bloc} />;

    /* --- blocs interactifs (composants client) --- */
    case "quiz":
      return <Quiz bloc={bloc} />;
    case "qcm":
      return <Qcm bloc={bloc} />;
    case "casPratiques":
      return <CasPratiques bloc={bloc} />;
    case "checklist":
      return <Checklist bloc={bloc} />;
    case "exercice":
      return <Exercice bloc={bloc} />;
    case "constructeurRequete":
      return <ConstructeurRequete />;
    case "bibliothequeRequetes":
      return <BibliothequeRequetes bloc={bloc} />;

    /* --- encart animateur --- */
    case "notesAnimateur":
      return <NotesAnimateur bloc={bloc} />;

    default: {
      // Exhaustivité : si une variante du contrat n’est pas traitée ci-dessus,
      // TypeScript refuse cette affectation.
      const inconnu: never = bloc;
      return inconnu;
    }
  }
}

/** Identifiant d’un bloc répondable, cible des liens du bilan du module. */
function ancreDe(bloc: Bloc): string | null {
  switch (bloc.type) {
    case "quiz":
    case "qcm":
    case "casPratiques":
    case "checklist":
    case "exercice":
      return ancreExercice(bloc.id);
    default:
      return null;
  }
}

export function Blocs({
  blocs,
  montrerNotesAnimateur = false,
}: {
  blocs: Bloc[];
  montrerNotesAnimateur?: boolean;
}) {
  return (
    <div className="space-y-8">
      {blocs.map((bloc, i) => {
        if (bloc.type === "notesAnimateur" && !montrerNotesAnimateur) {
          return null;
        }
        const ancre = ancreDe(bloc);
        // Les blocs sont statiques : l’index est une clé stable.
        return ancre ? (
          <div key={i} id={ancre} className="scroll-mt-28">
            {rendreBloc(bloc)}
          </div>
        ) : (
          <Fragment key={i}>{rendreBloc(bloc)}</Fragment>
        );
      })}
    </div>
  );
}

export default Blocs;
