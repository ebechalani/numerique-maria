import type { Module } from "@/content/types";

/**
 * Module 2 — La méthode ACTIF : cinq réflexes avant d’envoyer (0:20, 25 min).
 * Source : diapositives 5 à 10 du diaporama « IA générative au service de la
 * maternelle » (Eddy Bachaalany, 2026-2027) et leurs notes de l’animateur.
 * Le QCM reprend en outre trois morceaux du prompt complet de la diapositive 11.
 * Les définitions, les questions à se poser et les exemples sont repris mot
 * pour mot de `@/content/outils/actif` — c’est la même transcription.
 */
export const methodeActif: Module = {
  slug: "la-methode-actif",
  numero: 2,
  titre: "La méthode ACTIF",
  sousTitre: "Cinq réflexes avant d’envoyer",
  duree: 25,
  horaire: "0:20",
  objectif:
    "Vous saurez nommer les cinq éléments d’ACTIF — acteur, contexte, tâche, intention, format —, dire ce que chacun apporte à la réponse, et reconnaître à quelle lettre correspond chaque morceau d’un prompt que vous relisez.",
  blocs: [
    {
      type: "paragraphe",
      texte:
        "Avant d’envoyer votre prompt, vérifiez ces 5 éléments. Chacun répond à une question que l’outil se posera à votre place si vous ne la tranchez pas : qui parle, dans quelle situation, pour produire quoi, sur quel ton et sous quelle forme. Quand la réponse revient trop générale, c’est presque toujours qu’un de ces cinq points était resté implicite.",
    },
    {
      type: "encadre",
      ton: "info",
      titre: "Ce que la méthode fait vraiment",
      texte:
        "ACTIF ne rallonge pas forcément le prompt : il enlève surtout les zones floues.",
    },

    { type: "titre", texte: "Les cinq lettres en un coup d’œil" },
    {
      type: "paragraphe",
      texte:
        "Les cinq lettres se lisent dans l’ordre, mais elles ne s’écrivent pas forcément dans cet ordre : ce sont cinq informations à vérifier, pas cinq paragraphes à rédiger. Nous les reprenons ensuite une par une, avec les exemples du support.",
    },
    {
      type: "cartes",
      colonnes: 3,
      cartes: [
        {
          numero: "A",
          titre: "Acteur / Identité",
          texte: "Rôle de l’IA. Quel rôle doit jouer l’IA ?",
        },
        {
          numero: "C",
          titre: "Contexte",
          texte: "Situation. Dans quelle situation ?",
        },
        {
          numero: "T",
          titre: "Tâche / Action",
          texte: "Résultat attendu. Que doit faire l’IA ?",
        },
        {
          numero: "I",
          titre: "Intention / Tonalité",
          texte: "Style de réponse. Quel style de réponse ?",
        },
        {
          numero: "F",
          titre: "Format",
          texte: "Présentation. Sous quelle forme ?",
        },
      ],
    },

    { type: "titre", texte: "A — Acteur / Identité" },
    {
      type: "paragraphe",
      texte:
        "Quel rôle doit jouer l’IA ? Il s’agit de définir le rôle ou l’expertise que l’IA doit adopter pour cadrer sa réponse. Une même demande n’obtient pas le même texte selon que l’outil se place en assistant pédagogique de maternelle, en spécialiste du langage oral ou en collègue qui relit une consigne : le rôle oriente le vocabulaire, le niveau de détail et ce qui est jugé important.",
    },
    {
      type: "liste",
      items: [
        "Quel rôle voulez-vous lui donner ?",
        "Quelle expertise est utile ici ?",
      ],
    },
    { type: "citation", texte: "Tu es mon assistant pédagogique en maternelle." },
    {
      type: "citation",
      texte: "Tu es un expert en langage oral pour les 4–5 ans.",
    },
    {
      type: "citation",
      texte: "Tu es un professeur qui m’aide à reformuler mes consignes.",
    },

    { type: "titre", texte: "C — Contexte" },
    {
      type: "paragraphe",
      texte:
        "Dans quelle situation ? Il s’agit de donner les informations qui expliquent la situation, le niveau, le thème et l’objectif. En maternelle, la section change tout : ce qui convient à une Grande Section est hors de portée en Petite Section. Le thème de la période, la durée dont vous disposez et le moment de la journée — un rituel du matin, un atelier, un temps de regroupement — appartiennent eux aussi au contexte.",
    },
    {
      type: "liste",
      items: ["À qui s’adresse la réponse ?", "Quel niveau / thème / objectif ?"],
    },
    { type: "citation", texte: "Je prépare une séquence de Moyenne Section." },
    { type: "citation", texte: "Le thème est la ferme." },
    {
      type: "citation",
      texte: "Je veux préparer une activité de 20 minutes pour demain.",
    },

    { type: "titre", texte: "T — Tâche / Action" },
    {
      type: "paragraphe",
      texte:
        "Que doit faire l’IA ? Il s’agit de dire précisément ce que vous attendez : produire, expliquer, reformuler, comparer, corriger… C’est la lettre où l’on gagne le plus de précision, parce qu’une quantité et un verbe d’action suffisent souvent à transformer la réponse : « douze mots » plutôt que « du vocabulaire », « reformule » plutôt que « aide-moi ».",
    },
    {
      type: "liste",
      items: ["Quelle action concrète ?", "Quel résultat doit être obtenu ?"],
    },
    { type: "citation", texte: "Propose 12 mots concrets sur la ferme." },
    { type: "citation", texte: "Crée 5 questions de compréhension." },
    {
      type: "citation",
      texte: "Reformule cette consigne en langage plus simple.",
    },

    { type: "titre", texte: "I — Intention / Tonalité" },
    {
      type: "paragraphe",
      texte:
        "Quel style de réponse ? Il s’agit de préciser le niveau de langage, le ton et l’intention : simple, rassurant, dynamique, professionnel… Sans cette indication, l’outil écrit volontiers pour un adulte. Or une consigne destinée à des enfants de 4–5 ans se dit avec des phrases courtes et des mots connus, et il faut le demander explicitement.",
    },
    {
      type: "liste",
      items: ["Pour quel public ?", "Quel ton doit-on entendre ?"],
    },
    { type: "citation", texte: "Utilise un vocabulaire simple et clair." },
    { type: "citation", texte: "Adopte un ton bienveillant et rassurant." },
    { type: "citation", texte: "Explique comme à un enfant de 5 ans." },

    { type: "titre", texte: "F — Format" },
    {
      type: "paragraphe",
      texte:
        "Sous quelle forme ? Il s’agit d’indiquer la forme attendue afin que la réponse soit directement exploitable. C’est la lettre qui décide du temps que vous passerez ensuite à recopier : un tableau se colle dans une fiche de préparation, une liste à puces s’affiche au tableau, une suite de paragraphes demande d’être retravaillée. Précisez aussi ce que chaque élément doit contenir.",
    },
    {
      type: "liste",
      items: [
        "Liste, tableau ou paragraphes ?",
        "Quelle longueur / structure ?",
      ],
    },
    { type: "citation", texte: "Présente le résultat dans un tableau." },
    { type: "citation", texte: "Donne 5 idées sous forme de puces." },
    { type: "citation", texte: "Pour chaque mot : phrase-modèle + devinette." },

    { type: "titre", texte: "Reconnaître les cinq lettres" },
    {
      type: "qcm",
      id: "qcm-actif",
      consigne:
        "Cinq morceaux de prompt, repris des exemples du support. Pour chacun, dites à quelle lettre d’ACTIF il correspond.",
      questions: [
        {
          question: "« Tu es un expert en langage oral pour les 4–5 ans. »",
          options: [
            "A — Acteur / Identité",
            "C — Contexte",
            "T — Tâche / Action",
            "I — Intention / Tonalité",
            "F — Format",
          ],
          bonne: 0,
          explication:
            "C’est le A : la phrase attribue un rôle et une expertise à l’IA, elle ne demande encore rien. Le A cadre la réponse avant même de dire ce qu’il faut produire.",
        },
        {
          question:
            "« Je prépare une séquence de Moyenne Section sur le thème de la ferme. »",
          options: [
            "A — Acteur / Identité",
            "C — Contexte",
            "T — Tâche / Action",
            "I — Intention / Tonalité",
            "F — Format",
          ],
          bonne: 1,
          explication:
            "C’est le C : la section et le thème expliquent la situation dans laquelle la réponse sera utilisée. Sans eux, l’outil écrit pour une classe indéterminée.",
        },
        {
          question:
            "« Propose 12 mots concrets. Pour chaque mot, écris une phrase-modèle de 5 mots maximum et une devinette en 3 indices. »",
          options: [
            "A — Acteur / Identité",
            "C — Contexte",
            "T — Tâche / Action",
            "I — Intention / Tonalité",
            "F — Format",
          ],
          bonne: 2,
          explication:
            "C’est le T : un verbe d’action et une quantité précise disent le résultat attendu. La phrase-modèle et la devinette font partie de ce qu’il faut produire, donc de la tâche.",
        },
        {
          question: "« Explique comme à un enfant de 5 ans. »",
          options: [
            "A — Acteur / Identité",
            "C — Contexte",
            "T — Tâche / Action",
            "I — Intention / Tonalité",
            "F — Format",
          ],
          bonne: 3,
          explication:
            "C’est le I : la phrase ne change pas ce qui est produit, elle règle le niveau de langage et le ton. C’est ce qui évite une réponse écrite pour des adultes.",
        },
        {
          question:
            "« Présente le résultat dans un tableau : Mot | Phrase-modèle | Devinette. »",
          options: [
            "A — Acteur / Identité",
            "C — Contexte",
            "T — Tâche / Action",
            "I — Intention / Tonalité",
            "F — Format",
          ],
          bonne: 4,
          explication:
            "C’est le F : la consigne porte sur la présentation, colonnes comprises, pour que la réponse soit directement exploitable en classe.",
        },
      ],
    },

    {
      type: "encadre",
      ton: "astuce",
      titre: "Une check-list, pas une formule",
      texte:
        "Voyez ACTIF comme une check-list mentale, pas comme une formule rigide. Votre prompt peut rester court, à condition que les informations essentielles soient présentes : l’objectif n’est pas d’écrire cinq phrases, mais de ne laisser aucun des cinq points dans le flou.",
    },

    {
      type: "notesAnimateur",
      texte:
        "0:20 — 25 min. Diapositive 5 : présenter ACTIF comme une checklist mentale, pas comme une formule rigide ; un prompt peut rester court, à condition que les informations essentielles soient présentes. Rappeler la phrase du support : ACTIF ne rallonge pas forcément le prompt, il enlève surtout les zones floues. Puis une diapositive par lettre, environ trois minutes chacune, toujours selon le même geste : expliquer la lettre, dire ce que ça signifie, lire un ou deux exemples puis demander aux participantes d’en proposer un adapté à leur prochaine séquence. Diapositive 6, A — Acteur / Identité : définir le rôle ou l’expertise que l’IA doit adopter pour cadrer sa réponse. Diapositive 7, C — Contexte : donner les informations qui expliquent la situation, le niveau, le thème et l’objectif. Diapositive 8, T — Tâche / Action : dire précisément ce que l’on attend — produire, expliquer, reformuler, comparer, corriger. Diapositive 9, I — Intention / Tonalité : préciser le niveau de langage, le ton et l’intention — simple, rassurant, dynamique, professionnel. Diapositive 10, F — Format : indiquer la forme attendue afin que la réponse soit directement exploitable. Ne pas commenter les propositions des participantes au-delà de la lettre travaillée : elles seront reprises et assemblées au module suivant. Terminer par le QCM, en le faisant à main levée si le groupe préfère, puis revenir sur l’écart le plus fréquent entre le T et le F.",
    },
  ],
};
