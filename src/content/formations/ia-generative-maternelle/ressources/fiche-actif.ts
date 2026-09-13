import type { SectionFiche } from "@/content/types";

/**
 * Fiche mémo ACTIF remise en séance — formation « IA générative au service de
 * la maternelle » (Eddy Bachaalany, Providence, 2026-2027).
 *
 * Six sections qui condensent tout le diaporama et se consultent seules, sans
 * la séance. Source : diapositives 3 et 4 (définition du prompt et exemples de
 * demandes), 5 à 10 (les cinq lettres de la méthode), 11 (le prompt complet
 * Moyenne Section sur le thème de la ferme), 14 (la check-list de validation et
 * ses notes), 16 (le réflexe « Itérer »), 18, 19 et 20 (NotebookLM : les
 * sources acceptées, le workflow en quatre étapes, le prompt de démonstration).
 * Les textes de la méthode sont repris de src/content/outils/actif.ts.
 */
export const ficheActif: SectionFiche[] = [
  {
    slug: "un-prompt-une-consigne",
    numero: 1,
    titre: "Un prompt, c’est une consigne",
    blocs: [
      {
        type: "encadre",
        ton: "regle",
        titre: "À retenir",
        texte:
          "Un prompt est la demande que vous adressez à une IA pour lui indiquer ce que vous voulez obtenir. Plus la consigne est précise, plus la réponse a de chances d’être adaptée à votre contexte.",
      },
      {
        type: "paragraphe",
        texte:
          "Rien de plus : c’est une consigne, comme celle que vous donneriez à une collègue qui préparerait l’atelier à votre place. Les demandes les plus courantes tiennent d’ailleurs en une phrase.",
      },
      {
        type: "liste",
        items: [
          "Explique-moi ce concept.",
          "Résume ce texte.",
          "Propose 5 idées.",
          "Corrige ce paragraphe.",
        ],
      },
      {
        type: "paragraphe",
        texte:
          "Ces phrases fonctionnent, mais elles laissent tout le reste dans le flou : pour qui, à quel niveau, sous quelle forme. C’est exactement ce que la méthode ACTIF vient combler — cinq informations faciles à vérifier avant d’envoyer une demande.",
      },
    ],
  },

  {
    slug: "actif-en-un-coup-d-oeil",
    numero: 2,
    titre: "La méthode ACTIF en un coup d’œil",
    blocs: [
      {
        type: "paragraphe",
        texte:
          "Avant d’envoyer votre prompt, vérifiez ces cinq éléments. Une lettre, une question, une phrase du prompt.",
      },
      {
        type: "tableau",
        entetes: ["Lettre", "Ce qu’elle désigne", "La question", "Un exemple"],
        lignes: [
          [
            "A",
            "Acteur / Identité",
            "Quel rôle doit jouer l’IA ?",
            "Tu es mon assistant pédagogique en maternelle.",
          ],
          [
            "C",
            "Contexte",
            "Dans quelle situation ?",
            "Je prépare une séquence de Moyenne Section.",
          ],
          [
            "T",
            "Tâche / Action",
            "Que doit faire l’IA ?",
            "Propose 12 mots concrets sur la ferme.",
          ],
          [
            "I",
            "Intention / Tonalité",
            "Quel style de réponse ?",
            "Utilise un vocabulaire simple et clair.",
          ],
          [
            "F",
            "Format",
            "Sous quelle forme ?",
            "Présente le résultat dans un tableau.",
          ],
        ],
      },
      {
        type: "encadre",
        ton: "info",
        titre: "Une check-list mentale, pas une formule",
        texte:
          "ACTIF ne rallonge pas forcément le prompt : il enlève surtout les zones floues. Un prompt peut rester court, à condition que les informations essentielles soient présentes.",
      },
      {
        type: "paragraphe",
        texte:
          "Il n’est pas nécessaire d’utiliser les lettres dans le prompt : elles servent seulement à structurer votre pensée.",
      },
    ],
  },

  {
    slug: "un-prompt-complet",
    numero: 3,
    titre: "Un prompt complet, ligne à ligne",
    blocs: [
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
          [
            "F",
            "Présente le résultat dans un tableau : Mot | Phrase-modèle | Devinette.",
          ],
        ],
      },
      {
        type: "requete",
        titre: "Le prompt assemblé, prêt à copier",
        texte:
          "Tu es un assistant pédagogique spécialisé en maternelle. Je prépare une séquence de Moyenne Section sur le thème de la ferme. Propose 12 mots concrets. Pour chaque mot, écris une phrase-modèle de 5 mots maximum et une devinette en 3 indices. Utilise un ton simple, bienveillant et adapté à des enfants de 4–5 ans. Présente le résultat dans un tableau : Mot | Phrase-modèle | Devinette.",
        commentaire:
          "Le résultat devient plus prévisible, plus cohérent et surtout plus facile à utiliser en classe.",
      },
      {
        type: "paragraphe",
        texte:
          "Comparez avec la demande que l’on écrit spontanément — « Fais-moi une activité sur la ferme. » La réponse sera trop générale, la durée inadaptée, le niveau imprécis : il faudra beaucoup retravailler. Le but n’est pas d’obtenir une réponse parfaite du premier coup, mais une base de travail beaucoup plus proche du besoin.",
      },
    ],
  },

  {
    slug: "check-list-avant-d-envoyer",
    numero: 4,
    titre: "La check-list avant d’envoyer",
    blocs: [
      {
        type: "checklist",
        id: "fiche-checklist-actif",
        consigne:
          "Cinq questions, objectif 5/5. Si un élément manque, ajoutez-le avant d’envoyer.",
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
        type: "paragraphe",
        texte:
          "En pratique, on peut aussi corriger après la première réponse : la section suivante donne les relances les plus utiles.",
      },
    ],
  },

  {
    slug: "ameliorer-la-reponse",
    numero: 5,
    titre: "Améliorer la réponse : les relances",
    blocs: [
      {
        type: "paragraphe",
        texte:
          "Itérer est l’un des trois réflexes professionnels : demander une version plus courte, plus simple, plus adaptée ou mieux structurée. La première réponse est une base de travail, pas un résultat définitif. Une relance tient en une phrase, et elle conserve tout le contexte déjà donné.",
      },
      {
        type: "liste",
        items: [
          "Refais plus court.",
          "Mets le résultat en tableau.",
          "Adapte à la Moyenne Section.",
          "Propose une version plus simple.",
          "Ajoute un exemple pour chaque point.",
          "Reformule pour des enfants de 4–5 ans.",
        ],
      },
      {
        type: "encadre",
        ton: "regle",
        titre: "Vérifier, protéger, itérer",
        texte:
          "Relire les faits, les consignes et les références avant utilisation en classe. Éviter d’envoyer des données sensibles ou identifiantes sur les élèves. Demander une version plus courte, plus simple, plus adaptée ou mieux structurée. L’enseignant garde la décision pédagogique : l’IA accélère la préparation ; elle ne remplace pas votre jugement.",
      },
    ],
  },

  {
    slug: "notebooklm-en-quatre-gestes",
    numero: 6,
    titre: "NotebookLM en quatre gestes",
    blocs: [
      {
        type: "paragraphe",
        texte:
          "NotebookLM est un assistant IA qui travaille à partir de vos sources pour vous aider à comprendre, synthétiser et transformer vos documents. Idée clé : vos documents deviennent le contexte de travail.",
      },
      {
        type: "etapes",
        etapes: [
          {
            titre: "Importer",
            texte: "Ajoutez vos documents de référence.",
          },
          {
            titre: "Questionner",
            texte: "Posez une question précise sur ces sources.",
          },
          {
            titre: "Transformer",
            texte: "Demandez un résumé, un quiz, une fiche…",
          },
          {
            titre: "Vérifier",
            texte: "Ouvrez les citations et relisez avant usage.",
          },
        ],
      },
      {
        type: "paragraphe",
        texte: "Les sources acceptées :",
      },
      {
        type: "liste",
        items: ["PDF", "Google Docs / Slides", "Pages web", "Audio / vidéo"],
      },
      {
        type: "paragraphe",
        texte:
          "Le carnet répond ensuite avec des citations liées aux sources, produit des synthèses et des briefings, et crée des guides, des quiz ou des cartes mentales à partir des mêmes documents. La démonstration de la séance part du règlement intérieur de l’établissement, importé en PDF.",
      },
      {
        type: "requete",
        titre: "Le prompt de la démonstration",
        texte:
          "À partir du règlement intérieur, génère un QCM sur les droits et devoirs des élèves. Crée 6 questions, 4 choix par question, indique la bonne réponse et cite le passage utilisé.",
        commentaire:
          "On peut ensuite demander une version plus simple, un vrai/faux ou des cas pratiques.",
      },
      {
        type: "encadre",
        ton: "attention",
        titre: "Bon réflexe",
        texte:
          "Une citation facilite la vérification, mais ne remplace pas votre lecture du document source.",
      },
      {
        type: "encadre",
        ton: "attention",
        titre: "Jamais de donnée personnelle d’enfant",
        texte:
          "Ne déposez jamais de donnée personnelle d’enfant dans un outil d’IA — nom, photo, observation nominative, information de santé ou de famille — quel que soit le compte utilisé, dans ChatGPT comme dans NotebookLM. Les documents importés sont des supports de travail, jamais des documents nominatifs.",
      },
    ],
  },
];
