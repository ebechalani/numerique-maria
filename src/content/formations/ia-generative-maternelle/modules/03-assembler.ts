import type { Module } from "@/content/types";

/**
 * Module 3 — Assembler un prompt ACTIF (0:45, 20 min).
 * Source : diapositives 11, 12, 13 et 14 du diaporama « IA générative au
 * service de la maternelle » (Eddy Bachaalany, 2026-2027) et leurs notes de
 * l’animateur : l’exemple complet Moyenne Section sur le thème de la ferme,
 * la comparaison entre un prompt vague et un prompt ACTIF, l’atelier de
 * quatre minutes et la check-list de validation en cinq questions.
 */
export const assemblerUnPrompt: Module = {
  slug: "assembler-un-prompt",
  numero: 3,
  titre: "Assembler un prompt ACTIF",
  sousTitre: "Un exemple complet, une comparaison, un atelier",
  duree: 20,
  horaire: "0:45",
  objectif:
    "Vous saurez assembler les cinq lettres en une seule demande, écrire un prompt ACTIF sur une de vos préparations de la semaine et le vérifier en cinq questions avant de l’envoyer.",
  blocs: [
    {
      type: "paragraphe",
      texte:
        "Les cinq lettres sont maintenant connues une à une. Reste le geste qui compte : les mettre bout à bout dans une seule demande. Nous partons d’un exemple complet, nous le comparons à la demande vague que l’on écrit spontanément, puis vous écrivez le vôtre — sur un vrai besoin de la semaine.",
    },

    { type: "titre", texte: "Un prompt complet, lettre par lettre" },
    {
      type: "paragraphe",
      texte:
        "Contexte de l’exemple : une Moyenne Section, thème de la ferme. Chaque ligne du tableau est une phrase du prompt, et une seule lettre de la méthode.",
    },
    {
      type: "tableau",
      entetes: ["Lettre", "Ce que dit le prompt"],
      lignes: [
        ["A", "Tu es un assistant pédagogique spécialisé en maternelle."],
        [
          "C",
          "Je prépare une séquence de Moyenne Section sur le thème de la ferme.",
        ],
        [
          "T",
          "Propose 12 mots concrets. Pour chaque mot, écris une phrase-modèle de 5 mots maximum et une devinette en 3 indices.",
        ],
        [
          "I",
          "Utilise un ton simple, bienveillant et adapté à des enfants de 4–5 ans.",
        ],
        ["F", "Présente le résultat dans un tableau : Mot | Phrase-modèle | Devinette."],
      ],
    },
    {
      type: "paragraphe",
      texte:
        "Mises bout à bout, ces cinq phrases forment un paragraphe qui tient en quelques lignes. Rien d’inhabituel : c’est ce que vous diriez à une collègue remplaçante qui préparerait l’atelier à votre place.",
    },
    {
      type: "requete",
      titre: "Le prompt complet, prêt à copier",
      texte:
        "Tu es un assistant pédagogique spécialisé en maternelle. Je prépare une séquence de Moyenne Section sur le thème de la ferme. Propose 12 mots concrets. Pour chaque mot, écris une phrase-modèle de 5 mots maximum et une devinette en 3 indices. Utilise un ton simple, bienveillant et adapté à des enfants de 4–5 ans. Présente le résultat dans un tableau : Mot | Phrase-modèle | Devinette.",
      commentaire:
        "Le résultat devient plus prévisible, plus cohérent et surtout plus facile à utiliser en classe.",
    },
    {
      type: "encadre",
      ton: "info",
      titre: "Les lettres ne s’écrivent pas",
      texte:
        "Il n’est pas nécessaire d’utiliser les lettres dans le prompt : elles servent seulement à structurer votre pensée. Vous écrivez un paragraphe ordinaire ; A, C, T, I et F ne sont que la grille de relecture qui vous dit si quelque chose manque.",
    },

    { type: "titre", texte: "Le même besoin, deux niveaux de précision" },
    {
      type: "paragraphe",
      texte:
        "Le besoin est identique dans les deux colonnes : une activité sur la ferme. Seule change la quantité d’informations données au départ — et donc le travail qu’il restera à faire ensuite.",
    },
    {
      type: "tableau",
      entetes: ["", "Prompt vague", "Prompt ACTIF"],
      lignes: [
        [
          "Ce qu’on écrit",
          "« Fais-moi une activité sur la ferme. »",
          "Rôle + niveau + objectif + contraintes + format",
        ],
        [
          "Le résultat",
          "Risque : réponse trop générale, durée inadaptée, niveau imprécis.",
          "Résultat : une première version directement exploitable et facile à ajuster.",
        ],
        [
          "La conséquence",
          "Il faudra beaucoup retravailler.",
          "Moins de temps perdu à corriger.",
        ],
      ],
    },
    {
      type: "paragraphe",
      texte:
        "Le but n’est pas d’obtenir une réponse parfaite du premier coup, mais une base de travail beaucoup plus proche du besoin. La demande vague n’est pas fausse : elle oblige simplement à tout reprendre — le niveau, la durée, le vocabulaire, la mise en forme — alors que ces informations étaient déjà dans votre tête au moment d’écrire.",
    },

    { type: "titre", texte: "Composer son prompt lettre par lettre" },
    {
      type: "paragraphe",
      texte:
        "C’est l’outil qui permet de composer son prompt lettre par lettre : vous remplissez les cinq champs, le paragraphe s’assemble au fur et à mesure, et vous copiez le résultat dans ChatGPT.",
    },
    { type: "constructeurRequete" },

    { type: "titre", texte: "À vous de jouer" },
    {
      type: "exercice",
      id: "exercice-prompt-actif",
      titre: "Votre prompt ACTIF",
      consigne:
        "Choisissez un prochain cours et rédigez un prompt en une seule phrase contenant les 5 éléments ACTIF.",
      duree: "4 min",
      etapes: [
        "Commencez par votre vrai besoin de la semaine — l’exercice sera immédiatement utile.",
      ],
      champs: [
        {
          id: "acteur",
          type: "texte",
          libelle: "A — Acteur / Identité",
          aide: "Quel rôle voulez-vous lui donner ? Quelle expertise est utile ici ?",
        },
        {
          id: "contexte",
          type: "texte",
          libelle: "C — Contexte",
          aide: "À qui s’adresse la réponse ? Quel niveau / thème / objectif ?",
        },
        {
          id: "tache",
          type: "texte",
          libelle: "T — Tâche / Action",
          aide: "Quelle action concrète ? Quel résultat doit être obtenu ?",
        },
        {
          id: "intention",
          type: "texte",
          libelle: "I — Intention / Tonalité",
          aide: "Pour quel public ? Quel ton doit-on entendre ?",
        },
        {
          id: "format",
          type: "texte",
          libelle: "F — Format",
          aide: "Liste, tableau ou paragraphes ? Quelle longueur / structure ?",
        },
        {
          /*
            Cet identifiant est aussi celui du champ « Le prompt ACTIF » de la
            trame de restitution : c’est lui qui s’y retrouve pré-rempli.
          */
          id: "requete",
          type: "texte-long",
          libelle: "Votre prompt assemblé",
          aide: "Les cinq éléments mis bout à bout, en une seule demande — sans écrire les lettres.",
          lignes: 5,
        },
      ],
      retour: {
        titre: "Ce qu’on corrige en séance",
        texte:
          "Deux personnes lisent leur prompt à voix haute. On corrige uniquement ce qui manque dans ACTIF, sans réécrire tout le prompt à la place de son auteur.",
        points: [
          "Vérifiez le F : tant que la forme attendue n’est pas écrite, elle reste dans votre tête.",
          "Vérifiez le C : le niveau ne suffit pas — le thème, l’objectif et la durée en font partie.",
          "Un prompt court et complet vaut mieux qu’un prompt long et flou.",
        ],
      },
      alimenteRestitution: true,
      suite: {
        href: "/outils/redacteur-de-prompt",
        libelle: "Ouvrir le rédacteur de prompt",
      },
    },

    { type: "titre", texte: "Votre prompt est-il prêt ?" },
    {
      type: "checklist",
      id: "checklist-actif",
      consigne:
        "Cinq questions avant d’envoyer. Objectif : 5 sur 5. Si un élément manque, ajoutez-le avant d’envoyer.",
      items: [
        {
          titre: "A — Acteur / Identité",
          texte: "Ai-je précisé le rôle ou l’identité de l’IA ?",
        },
        {
          titre: "C — Contexte",
          texte: "Ai-je expliqué dans quel contexte j’utilise la réponse ?",
        },
        {
          titre: "T — Tâche / Action",
          texte: "Ai-je dit exactement ce que j’attends ?",
        },
        {
          titre: "I — Intention / Tonalité",
          texte: "Ai-je précisé le style ou le niveau de langage ?",
        },
        {
          titre: "F — Format",
          texte: "Ai-je demandé une forme claire et exploitable ?",
        },
      ],
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "On peut aussi corriger après coup",
      texte:
        "En pratique, on peut aussi corriger après la première réponse : « refais plus court », « mets en tableau », « adapte à la MS », etc. La check-list sert à partir sur de bonnes bases, pas à interdire de reprendre la main ensuite.",
    },

    {
      type: "notesAnimateur",
      texte:
        "0:45 — 20 min. Diapositive 11 : lisez le prompt complet en montrant les couleurs ACTIF. Soulignez qu’il n’est pas nécessaire d’utiliser les lettres dans le prompt : elles servent seulement à structurer votre pensée. Diapositive 12 : montrez la différence entre une demande vague et une demande structurée. Le but n’est pas d’obtenir une réponse parfaite du premier coup, mais une base de travail beaucoup plus proche du besoin. Diapositive 13 — atelier : donnez 4 minutes. Rappelez l’astuce : commencer par un vrai besoin de la semaine, l’exercice sera immédiatement utile. Demandez ensuite à deux personnes de lire leur prompt. Corrigez uniquement ce qui manque dans ACTIF, sans réécrire tout le prompt à leur place. Diapositive 14 : utilisez la check-list comme validation finale, objectif 5 sur 5 — si un élément manque, ajoutez-le avant d’envoyer. Expliquez qu’en pratique on peut aussi corriger après la première réponse : « refais plus court », « mets en tableau », « adapte à la MS », etc.",
    },
  ],
};
