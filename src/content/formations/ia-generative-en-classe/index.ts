import type { Formation } from "@/content/types";

import { avantDeCommencer } from "./modules/00-avant";
import { quEstCeQuUnPrompt } from "./modules/01-prompt";
import { methodeActif } from "./modules/02-methode-actif";
import { assemblerUnPrompt } from "./modules/03-assembler";
import { comprendreChatGpt } from "./modules/04-chatgpt";
import { notebookLm } from "./modules/05-notebooklm";
import { bilanEtSuite } from "./modules/06-bilan";

/**
 * Formation « IA générative au service de la classe » — Collège de la
 * Providence.
 *
 * Source : le diaporama de vingt-et-une diapositives « IA générative au
 * service de la maternelle » (2026-2027) et ses vingt-et-une pages de notes.
 *
 * La méthode ACTIF, les définitions, la check-list et le workflow NotebookLM
 * sont repris du diaporama sans changement. Ses exemples, tous pris en
 * maternelle, sont conservés — le prompt sur le thème de la ferme en Moyenne
 * Section reste l’exemple fil rouge — et complétés pour l’élémentaire, le
 * collège et le lycée, la formation s’adressant à tout l’établissement.
 *
 * Le diaporama ne porte pas de minutage. Le programme ci-dessous le déduit du
 * contenu — un atelier de quatre minutes annoncé diapositive 13, une
 * démonstration NotebookLM diapositive 20 — pour une séance de deux heures,
 * pause comprise. C’est la seule donnée de ce fichier qui ne soit pas lue
 * directement sur une diapositive : à ajuster au besoin, ici et dans le
 * déroulé animateur.
 */
export const iaGenerativeEnClasse: Formation = {
  slug: "ia-generative-en-classe",
  titre: "IA générative au service de la classe",
  sousTitre: "Créer de meilleurs prompts · Utiliser ChatGPT avec méthode",
  accroche:
    "Une séance très pratique : vous repartez avec la méthode ACTIF, un prompt écrit sur une de vos préparations réelles, et un premier carnet NotebookLM construit à partir de vos propres documents.",
  etablissement: "Collège de la Providence",
  public:
    "Enseignants de l’établissement, de la maternelle au secondaire, toutes disciplines. Aucun prérequis technique.",
  duree: "2 heures",
  session: "Année 2026-2027",

  formateur: {
    nom: "Maria Bachaalany",
    role: "Référente numérique",
    /* Vide tant que l’adresse n’est pas arrêtée : elle n’est alors pas affichée. */
    email: "",
  },

  /* Les trois objectifs de la diapositive 2, « Aujourd’hui, vous allez… ». */
  objectifs: [
    {
      numero: "1",
      titre: "Mieux formuler",
      texte: "Construire un prompt précis avec la méthode ACTIF.",
    },
    {
      numero: "2",
      titre: "Mieux dialoguer",
      texte: "Obtenir une première réponse utile… puis l’améliorer.",
    },
    {
      numero: "3",
      titre: "Mieux exploiter vos sources",
      texte: "Utiliser NotebookLM à partir de documents pédagogiques.",
    },
  ],

  emporte: [
    "La méthode ACTIF : cinq réflexes à vérifier avant d’envoyer une demande",
    "Un prompt complet, écrit sur une de vos préparations de la semaine",
    "Un premier carnet NotebookLM construit sur un de vos documents",
    "La fiche méthode et une bibliothèque de requêtes, classées par cycle",
  ],

  prerequis: [
    {
      titre: "Un ordinateur portable ou une tablette",
      texte: "Chargé — un par participant, ou un pour deux en binôme.",
    },
    {
      titre: "Un accès à ChatGPT",
      texte:
        "Testez la connexion avant la séance. Si vous n’avez pas de compte, mettez-vous en binôme : la démonstration se fait aussi au vidéoprojecteur.",
    },
    {
      titre: "Un compte Google actif",
      texte:
        "Il donne accès à notebooklm.google.com. Vérifiez l’accès avant la séance, la création est gratuite.",
    },
    {
      titre: "Un document de travail en PDF",
      texte:
        "Une fiche de séquence, une progression, un chapitre de cours, un document de l’établissement — sans aucune donnée personnelle d’élève.",
    },
  ],

  /* Minutage déduit du contenu : voir la note d’en-tête du fichier. */
  programme: [
    {
      horaire: "0:00",
      titre: "Avant de commencer",
      duree: "10 min",
      moduleSlug: "avant-de-commencer",
    },
    {
      horaire: "0:10",
      titre: "Qu’est-ce qu’un prompt ?",
      duree: "10 min",
      moduleSlug: "qu-est-ce-qu-un-prompt",
    },
    {
      horaire: "0:20",
      titre: "La méthode ACTIF",
      duree: "25 min",
      moduleSlug: "la-methode-actif",
    },
    {
      horaire: "0:45",
      titre: "Assembler un prompt ACTIF",
      duree: "20 min",
      moduleSlug: "assembler-un-prompt",
    },
    { horaire: "1:05", titre: "Pause", duree: "5 min" },
    {
      horaire: "1:10",
      titre: "Comprendre ChatGPT",
      duree: "15 min",
      moduleSlug: "comprendre-chatgpt",
    },
    {
      horaire: "1:25",
      titre: "NotebookLM",
      duree: "25 min",
      moduleSlug: "notebooklm",
    },
    {
      horaire: "1:50",
      titre: "Bilan et suite",
      duree: "10 min",
      moduleSlug: "bilan-et-suite",
    },
  ],

  modules: [
    avantDeCommencer,
    quEstCeQuUnPrompt,
    methodeActif,
    assemblerUnPrompt,
    comprendreChatGpt,
    notebookLm,
    bilanEtSuite,
  ],

  ressources: [
    {
      slug: "fiche-actif",
      titre: "Fiche méthode ACTIF",
      description:
        "La fiche remise en séance, en six sections : la définition, les cinq lettres, un prompt complet ligne à ligne, la check-list, les relances et NotebookLM en quatre gestes.",
      icone: "fiche",
    },
    {
      slug: "requetes",
      titre: "Bibliothèque de requêtes",
      description:
        "Des requêtes prêtes à l’emploi pour la maternelle, écrites selon ACTIF et classées par outil — à copier et à adapter à votre section.",
      icone: "requete",
    },
    {
      slug: "questions",
      titre: "Questions fréquentes",
      description:
        "Les questions posées en séance — comptes, longueur du prompt, erreurs de l’IA, données des enfants, différence entre ChatGPT et NotebookLM — et leurs réponses.",
      icone: "question",
    },
    {
      slug: "animateur",
      titre: "Déroulé animateur",
      description:
        "L’intention, la préparation, le minutage et les notes des vingt-et-une diapositives, pour animer la séance à son tour.",
      icone: "animateur",
    },
  ],
};
