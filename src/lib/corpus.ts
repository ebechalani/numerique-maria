/**
 * Corpus d’ancrage de l’assistant IA.
 *
 * Le corpus est reconstruit à partir des mêmes données que les pages : ce que
 * l’assistant sait est exactement ce que le site affiche, ni plus ni moins.
 * Aucun texte n’est saisi ici — seulement de la mise en forme.
 *
 * Chaque section porte son slug, pour que l’assistant puisse citer sa source
 * (« Module 2 — … », « Ressource — Fiche méthode ACTIF »).
 *
 * Module serveur : il ne doit jamais être importé par un composant client,
 * le corpus n’a pas à voyager jusqu’au navigateur.
 */

import type { Bloc, Formation, Verdict } from "@/content/types";
import { briquesRequete, formations, getRessource } from "./formations";

/* ------------------------------------------------------------------ */
/* Utilitaires de mise en forme                                        */
/* ------------------------------------------------------------------ */

const LIBELLE_VERDICT: Record<Verdict, string> = {
  autorise: "Autorisé",
  encadre: "Encadré",
  interdit: "Interdit",
};

const LIBELLE_TON: Record<string, string> = {
  info: "Information",
  attention: "Attention",
  regle: "Règle",
  astuce: "Astuce",
};

const LIBELLE_OUTIL: Record<string, string> = {
  notebooklm: "NotebookLM",
  chatgpt: "ChatGPT",
  "les-deux": "ChatGPT et NotebookLM",
};

/** Assemble des fragments en ignorant les vides, sans lignes blanches en trop. */
function joindre(fragments: Array<string | undefined | null>): string {
  return fragments
    .filter((fragment): fragment is string => Boolean(fragment && fragment.trim()))
    .join("\n\n");
}

/* ------------------------------------------------------------------ */
/* Rendu d’un bloc                                                     */
/* ------------------------------------------------------------------ */

/**
 * Rend un bloc de contenu en texte lisible. Tous les types du contrat sont
 * couverts : le `never` final fait échouer la compilation si une variante est
 * ajoutée à `Bloc` sans être traitée ici.
 */
export function blocEnTexte(bloc: Bloc): string {
  switch (bloc.type) {
    case "titre":
      return `### ${bloc.texte}`;

    case "paragraphe":
      return bloc.texte;

    case "liste":
      return bloc.items
        .map((item, index) =>
          bloc.ordonnee ? `${index + 1}. ${item}` : `- ${item}`,
        )
        .join("\n");

    case "cartes":
      return bloc.cartes
        .map((carte) => {
          const numero = carte.numero ? `${carte.numero}. ` : "";
          return `- ${numero}${carte.titre} : ${carte.texte}`;
        })
        .join("\n");

    case "etapes":
      return bloc.etapes
        .map((etape, index) => `${index + 1}. ${etape.titre} — ${etape.texte}`)
        .join("\n");

    case "encadre": {
      const ton = LIBELLE_TON[bloc.ton] ?? bloc.ton;
      const titre = bloc.titre ? ` ${bloc.titre} —` : "";
      return `> [${ton}]${titre} ${bloc.texte}`;
    }

    case "citation":
      return bloc.source
        ? `« ${bloc.texte} » — ${bloc.source}`
        : `« ${bloc.texte} »`;

    case "tableau": {
      // Chaque ligne devient un groupe « colonne : valeur », plus robuste
      // qu’un tableau ASCII pour une lecture par un modèle. La première
      // colonne des tableaux comparatifs n’a pas d’en-tête : on rend alors
      // la cellule seule, elle sert d’intitulé de la ligne.
      const lignes = bloc.lignes.map((ligne) =>
        ligne
          .map((cellule, index) => {
            const entete = bloc.entetes[index];
            return entete && entete.trim() ? `${entete} : ${cellule}` : cellule;
          })
          .join("\n  "),
      );
      return lignes.map((ligne) => `- ${ligne}`).join("\n\n");
    }

    case "feu": {
      const colonnes = bloc.colonnes.map((colonne) => {
        const libelle = LIBELLE_VERDICT[colonne.verdict];
        // « AUTORISÉ » et « Autorisé » : inutile de répéter le verdict.
        const rappel =
          colonne.titre.trim().toLowerCase() === libelle.toLowerCase()
            ? ""
            : ` (${libelle})`;
        const entete = `${colonne.titre}${rappel} — ${colonne.precision}`;
        const items = colonne.items.map((item) => `- ${item}`).join("\n");
        const note = colonne.note
          ? colonne.note.startsWith("→")
            ? colonne.note
            : `→ ${colonne.note}`
          : null;
        return joindre([entete, items, note]);
      });
      return joindre([
        ...colonnes,
        bloc.regleOr ? `Règle d’or : ${bloc.regleOr}` : null,
      ]);
    }

    case "requete": {
      const titre = bloc.titre ? `Requête — ${bloc.titre}` : "Requête";
      return joindre([
        titre,
        bloc.texte,
        bloc.commentaire ? `Commentaire : ${bloc.commentaire}` : null,
      ]);
    }

    case "quiz": {
      const items = bloc.items
        .map(
          (item) =>
            `- ${item.affirmation}\n  Réponse : ${item.reponse ? "Vrai" : "Faux"}\n  Explication : ${item.explication}`,
        )
        .join("\n\n");
      return joindre([`Quiz — ${bloc.consigne}`, items]);
    }

    case "qcm": {
      const questions = bloc.questions
        .map(
          (question) =>
            `- ${question.question}\n  Options : ${question.options.join(" / ")}\n  Bonne réponse : ${question.options[question.bonne]}\n  Explication : ${question.explication}`,
        )
        .join("\n\n");
      return joindre([`QCM — ${bloc.consigne}`, questions]);
    }

    case "exercice": {
      const duree = bloc.duree ? ` (${bloc.duree})` : "";
      const etapes = bloc.etapes
        ?.map((etape, index) => `${index + 1}. ${etape}`)
        .join("\n");
      const champs = bloc.champs
        .map((champ) => {
          const aide = champ.aide ? ` — ${champ.aide}` : "";
          const options =
            champ.type === "choix" ? ` (choix : ${champ.options.join(" / ")})` : "";
          return `- ${champ.libelle}${aide}${options}`;
        })
        .join("\n");
      const retour = joindre([
        `${bloc.retour.titre ?? "Retour de la formation"} : ${bloc.retour.texte}`,
        bloc.retour.points?.map((point) => `- ${point}`).join("\n"),
      ]);
      return joindre([
        `Exercice — ${bloc.titre}${duree}`,
        bloc.consigne,
        etapes,
        `À consigner :\n${champs}`,
        retour,
      ]);
    }

    case "casPratiques": {
      const cas = bloc.cas
        .map((unCas) => {
          const verdict = unCas.verdictLibelle ?? LIBELLE_VERDICT[unCas.verdict];
          return `- Situation : ${unCas.situation}\n  Verdict : ${verdict}\n  Pourquoi : ${unCas.pourquoi}`;
        })
        .join("\n\n");
      return joindre([`Cas pratiques — ${bloc.consigne}`, cas]);
    }

    case "checklist": {
      const items = bloc.items
        .map((item) => `- ${item.titre} : ${item.texte}`)
        .join("\n");
      return joindre([
        bloc.consigne ? `Check-list — ${bloc.consigne}` : "Check-list",
        items,
      ]);
    }

    case "constructeurRequete":
      // Le bloc ne porte pas de données : ses briques viennent du contenu.
      return joindre([
        "Constructeur de requête — une bonne requête = 5 briques",
        briquesRequete
          .map(
            (brique) =>
              `- ${brique.titre} — ${brique.question}\n  Exemple : ${brique.exemple}`,
          )
          .join("\n"),
      ]);

    case "bibliothequeRequetes": {
      const lignes = bloc.lignes
        .map(
          (ligne) =>
            `- ${ligne.usage} (${LIBELLE_OUTIL[ligne.outil] ?? ligne.outil})\n  ${ligne.requete}`,
        )
        .join("\n\n");
      return joindre([
        bloc.consigne ? `Bibliothèque de requêtes — ${bloc.consigne}` : "Bibliothèque de requêtes",
        lignes,
      ]);
    }

    case "notesAnimateur":
      return `Note de l’animateur : ${bloc.texte}`;

    default: {
      const jamais: never = bloc;
      return String(jamais);
    }
  }
}

function blocsEnTexte(blocs: Bloc[]): string {
  return joindre(blocs.map(blocEnTexte));
}

/* ------------------------------------------------------------------ */
/* Construction du corpus                                              */
/* ------------------------------------------------------------------ */

function formationEnTexte(formation: Formation): string {
  const identite = joindre([
    `# Formation — ${formation.titre} (slug: ${formation.slug})`,
    formation.sousTitre,
    formation.accroche,
    [
      `- Établissement : ${formation.etablissement}`,
      `- Public : ${formation.public}`,
      `- Durée : ${formation.duree}`,
      `- Session : ${formation.session}`,
      `- Formateur : ${formation.formateur.nom}, ${formation.formateur.role}${
        formation.formateur.email ? ` (${formation.formateur.email})` : ""
      }`,
    ].join("\n"),
  ]);

  const objectifs = joindre([
    "## Objectifs",
    formation.objectifs
      .map(
        (objectif) =>
          `- ${objectif.numero}. ${objectif.titre} — ${objectif.texte}`,
      )
      .join("\n"),
  ]);

  const emporte = joindre([
    "## Ce que vous emportez",
    formation.emporte.map((item) => `- ${item}`).join("\n"),
  ]);

  const prerequis = joindre([
    "## Prérequis",
    formation.prerequis
      .map((item) => `- ${item.titre} : ${item.texte}`)
      .join("\n"),
  ]);

  const programme = joindre([
    "## Programme",
    formation.programme
      .map((ligne) => {
        const renvoi = ligne.moduleSlug ? ` (slug: ${ligne.moduleSlug})` : "";
        return `- ${ligne.horaire} · ${ligne.titre} · ${ligne.duree}${renvoi}`;
      })
      .join("\n"),
  ]);

  const modules = formation.modules.map((module) => {
    const horaire = module.horaire ? `, repère ${module.horaire}` : "";
    return joindre([
      `## Module ${module.numero} — ${module.titre} (slug: ${module.slug})`,
      module.sousTitre,
      `Durée : ${module.duree} min${horaire}`,
      `Objectif : ${module.objectif}`,
      blocsEnTexte(module.blocs),
    ]);
  });

  const ressources = formation.ressources.map((ressource) => {
    const rendue = getRessource(formation.slug, ressource.slug);
    return joindre([
      `## Ressource — ${ressource.titre} (slug: ${ressource.slug})`,
      ressource.description,
      rendue ? blocsEnTexte(rendue.blocs) : null,
    ]);
  });

  return joindre([
    identite,
    objectifs,
    emporte,
    prerequis,
    programme,
    ...modules,
    ...ressources,
  ]);
}

/**
 * Sérialise l’intégralité du contenu publié en Markdown lisible.
 * Appelée une fois au chargement du module ; le résultat est figé dans CORPUS.
 */
export function construireCorpus(): string {
  return formations.map(formationEnTexte).join("\n\n---\n\n");
}

/** Base de connaissance de l’assistant, calculée une seule fois. */
export const CORPUS = construireCorpus();

/** Longueur du corpus en caractères — utile au diagnostic et au budget de contexte. */
export function tailleCorpus(): number {
  return CORPUS.length;
}
