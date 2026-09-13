import type { Module } from "@/content/types";

/**
 * Module 4 — Comprendre ChatGPT (1:10, 15 min).
 * Source : diapositives 15 et 16 du diaporama « IA générative au service de la
 * maternelle » (Eddy Bachaalany, 2026-2027) et leurs notes de l’animateur :
 * les trois temps de la production d’une réponse, la recherche web signalée
 * par OpenAI, et les trois réflexes professionnels — vérifier, protéger,
 * itérer. La référence OpenAI figure dans la note de la diapositive 21.
 */
export const comprendreChatGpt: Module = {
  slug: "comprendre-chatgpt",
  numero: 4,
  titre: "Comprendre ChatGPT",
  sousTitre: "Comment il répond, et trois réflexes professionnels",
  duree: 15,
  horaire: "1:10",
  objectif:
    "Vous saurez expliquer en trois temps comment ChatGPT produit une réponse, dire pourquoi il ne « comprend » pas comme un humain, et appliquer les trois réflexes — vérifier, protéger, itérer — à vos propres préparations.",
  blocs: [
    {
      type: "paragraphe",
      texte:
        "Jusqu’ici, nous avons travaillé la demande. Reste à savoir ce qui se passe une fois qu’elle est envoyée — sans jargon, et sans en savoir plus que nécessaire. Trois temps suffisent à décrire le fonctionnement, et trois réflexes suffisent à en faire un usage professionnel.",
    },

    { type: "titre", texte: "Comment ChatGPT produit une réponse" },
    {
      type: "etapes",
      etapes: [
        {
          titre: "Vous formulez",
          texte:
            "Un prompt + votre contexte. C’est exactement ce que la méthode ACTIF sert à préparer : l’acteur, le contexte, la tâche, l’intention et le format.",
        },
        {
          titre: "Le modèle génère",
          texte:
            "Il construit une réponse à partir de motifs appris dans de grandes quantités de données. Il assemble ce qui, statistiquement, va ensemble — il ne consulte pas votre programmation de classe ni le dossier de vos élèves.",
        },
        {
          titre: "Vous vérifiez",
          texte:
            "La réponse peut être utile… mais elle peut aussi être inexacte ou trop générale. Cette troisième étape n’est pas facultative : c’est elle qui transforme une proposition en support de classe.",
        },
      ],
    },
    {
      type: "encadre",
      ton: "attention",
      titre: "Il ne « comprend » pas comme un humain",
      texte:
        "Évitez l’idée que ChatGPT « comprend comme un humain ». Il produit des réponses à partir de modèles statistiques appris. Cela explique deux choses que vous observerez en pratique : il répond toujours, même quand il ne sait pas, et il répond avec la même assurance qu’il ait raison ou tort.",
    },

    { type: "titre", texte: "Quand ChatGPT cherche sur le web" },
    {
      type: "paragraphe",
      texte:
        "ChatGPT peut aussi rechercher le web lorsque des informations actuelles sont nécessaires ; vérifiez toujours les sources importantes. Ce n’est pas une précaution ajoutée par la formation : c’est OpenAI qui l’indique dans sa propre documentation.",
    },
    {
      type: "citation",
      texte:
        "OpenAI indique que ChatGPT peut rechercher le web pour des informations actuelles, mais recommande aussi de vérifier les sources.",
      source: "OpenAI Help Center — “Searching the web with ChatGPT”",
    },
    {
      type: "paragraphe",
      texte:
        "En maternelle, cela concerne peu de choses — mais celles-ci comptent : le titre et l’auteur d’un album, les paroles exactes d’une comptine, une date, un dispositif. Dans ces cas, ouvrir le lien et lire la source fait partie du travail de préparation.",
    },

    { type: "titre", texte: "Trois réflexes professionnels avec l’IA" },
    {
      type: "cartes",
      colonnes: 3,
      cartes: [
        {
          numero: "1",
          titre: "Vérifier",
          texte:
            "Relire les faits, les consignes et les références avant utilisation en classe.",
        },
        {
          numero: "2",
          titre: "Protéger",
          texte:
            "Éviter d’envoyer des données sensibles ou identifiantes sur les élèves.",
        },
        {
          numero: "3",
          titre: "Itérer",
          texte:
            "Demander une version plus courte, plus simple, plus adaptée ou mieux structurée.",
        },
      ],
    },
    {
      type: "encadre",
      ton: "regle",
      titre: "La règle qui tient tout",
      texte:
        "L’enseignant garde la décision pédagogique. L’IA accélère la préparation ; elle ne remplace pas votre jugement.",
    },
    {
      type: "paragraphe",
      texte:
        "Ces trois réflexes sont non négociables. Le plus important reste le dernier mot : l’enseignant est responsable du contenu final et de son adaptation à sa classe — au niveau réel des enfants, à la durée de l’atelier, au vocabulaire déjà travaillé.",
    },

    { type: "titre", texte: "Six situations de classe" },
    {
      type: "casPratiques",
      id: "cas-reflexes",
      consigne:
        "Pour chaque situation, dites si l’usage est autorisé, encadré ou interdit, et repérez le réflexe qui s’applique. Répondez avant d’afficher le corrigé.",
      cas: [
        {
          situation:
            "Vous demandez à ChatGPT des idées de comptines sur l’automne pour le rituel du matin en Petite Section.",
          verdict: "autorise",
          pourquoi:
            "Préparation pédagogique, sans aucune donnée d’enfant. Il reste à relire les textes proposés avant de les chanter en classe : réflexe « Vérifier ».",
        },
        {
          situation:
            "Vous lui faites reformuler la consigne d’un atelier de motricité en phrases plus simples, pour des enfants de 3 ans.",
          verdict: "autorise",
          pourquoi:
            "Reformuler est une tâche typique — et c’est le réflexe « Itérer » : demander une version plus courte, plus simple, plus adaptée. La consigne retenue reste celle que vous validez.",
        },
        {
          situation:
            "Vous collez le compte rendu nominatif d’un entretien avec une famille pour qu’il le résume.",
          verdict: "interdit",
          pourquoi:
            "Réflexe « Protéger » : éviter d’envoyer des données sensibles ou identifiantes sur les élèves. Un compte rendu d’entretien nomme l’enfant et sa famille. Si vous voulez de l’aide pour la rédaction, décrivez la situation sans le moindre élément identifiant.",
        },
        {
          situation:
            "ChatGPT vous donne le titre et l’auteur d’un album sur la ferme ; vous recopiez la référence dans votre fiche de séquence et la commandez telle quelle.",
          verdict: "interdit",
          pourquoi:
            "Réflexe « Vérifier » : relire les faits, les consignes et les références avant utilisation en classe. La réponse peut être inexacte, et une référence est précisément ce qui se vérifie en une minute.",
        },
        {
          situation:
            "Vous posez une question qui demande une information actuelle ; ChatGPT effectue une recherche web et cite des pages.",
          verdict: "encadre",
          pourquoi:
            "C’est un usage prévu : ChatGPT peut rechercher le web lorsque des informations actuelles sont nécessaires. La condition est la même que celle indiquée par OpenAI — vérifiez toujours les sources importantes, en ouvrant les liens.",
        },
        {
          situation:
            "La première réponse propose une activité d’une heure pour une Moyenne Section, alors que l’atelier que vous préparez est bien plus court.",
          verdict: "encadre",
          pourquoi:
            "La réponse peut être utile, mais aussi trop générale ou inadaptée. Réflexe « Itérer » : demandez une version plus courte et adaptée à la Moyenne Section, puis tranchez vous-même — la décision pédagogique vous revient.",
        },
      ],
    },

    {
      type: "notesAnimateur",
      texte:
        "1:10 — 15 min. Diapositive 15 : restez simple, prompt → modèle → réponse → vérification. Évitez l’idée que ChatGPT « comprend comme un humain » : il produit des réponses à partir de modèles statistiques appris. OpenAI indique que ChatGPT peut rechercher le web pour des informations actuelles, mais recommande aussi de vérifier les sources — la référence est le OpenAI Help Center, “Searching the web with ChatGPT”. Diapositive 16 : présentez ces trois réflexes — vérifier, protéger, itérer — comme non négociables. Le plus important : l’enseignant reste responsable du contenu final et de son adaptation à la classe. Terminez sur la phrase de la diapositive : l’enseignant garde la décision pédagogique, l’IA accélère la préparation mais ne remplace pas votre jugement. Les six situations se traitent en binôme, une minute par cas, puis le corrigé.",
    },
  ],
};
