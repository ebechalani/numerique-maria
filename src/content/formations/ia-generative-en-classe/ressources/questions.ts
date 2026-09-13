import type { QuestionFrequente } from "@/content/types";

/**
 * Questions fréquentes — formation « IA générative au service de la classe »
 * (méthode ACTIF, Collège de la Providence, 2026-2027).
 *
 * Douze questions posées en séance, avec des réponses qui ne disent rien de
 * plus que le diaporama. Source : diapositives 5 et 11 et leurs notes (la
 * longueur du prompt, les lettres qu’on n’écrit pas), 12, 13 et 14 (la demande
 * vague, l’atelier en une phrase, la reprise après la première réponse), 15 et
 * sa note (comment ChatGPT produit une réponse, la recherche web), 16
 * (vérifier, protéger, itérer), 17 et 18 (NotebookLM et les sources
 * acceptées), 19 (le workflow et les citations) et 21 (l’action à mener dès
 * cette semaine, et les références citées en note : OpenAI Help Center,
 * Google NotebookLM Help).
 */
export const questionsFrequentes: QuestionFrequente[] = [
  {
    question: "« Faut-il un compte pour utiliser ChatGPT ? Et NotebookLM ? »",
    reponse:
      "La formation ne porte pas sur les modalités d’inscription : elle porte sur la manière de formuler vos demandes, puis sur deux usages concrets. Pour les conditions d’accès exactes, reportez-vous aux deux sources citées en fin de séance — le centre d’aide d’OpenAI pour ChatGPT, l’aide Google NotebookLM pour NotebookLM. Ce que le diaporama précise, en revanche, c’est ce dont vous avez besoin pour travailler : pour ChatGPT, une intention pédagogique claire ; pour NotebookLM, vos documents de référence, puisque ce sont eux qui deviennent le contexte de travail. Préparez donc le support que vous voulez exploiter avant d’ouvrir l’outil.",
  },
  {
    question: "« Mon prompt doit-il être long ? »",
    reponse:
      "Non. ACTIF ne rallonge pas forcément le prompt : il enlève surtout les zones floues. Un prompt peut rester court, à condition que les informations essentielles soient présentes — le rôle, le contexte, la tâche, le ton et le format. L’atelier de la séance demande d’ailleurs d’écrire un prompt en une seule phrase contenant les cinq éléments. Ce qui coûte du temps, ce n’est pas la longueur, c’est l’imprécision : « Fais-moi une activité sur la ferme » oblige à beaucoup retravailler la réponse.",
  },
  {
    question: "« Dois-je écrire les lettres A, C, T, I, F dans mon prompt ? »",
    reponse:
      "Non. Il n’est pas nécessaire d’utiliser les lettres dans le prompt : elles servent seulement à structurer votre pensée. ACTIF est une check-list mentale, pas une formule rigide ni un gabarit à recopier. Vous écrivez une consigne en français ordinaire — « Tu es un assistant pédagogique spécialisé en maternelle. Je prépare une séquence de Moyenne Section sur le thème de la ferme… » — et les cinq lettres vous servent seulement à vérifier, avant d’envoyer, qu’aucune information ne manque.",
  },
  {
    question: "« ChatGPT peut-il se tromper ? »",
    reponse:
      "Oui. Le modèle construit une réponse à partir de motifs appris dans de grandes quantités de données : il ne comprend pas comme un humain, il produit des réponses à partir de modèles statistiques appris. La réponse peut être utile, mais elle peut aussi être inexacte ou trop générale. C’est pourquoi la troisième étape — vous vérifiez — fait partie du processus au même titre que les deux premières. Relisez les faits, les consignes et les références avant toute utilisation en classe.",
  },
  {
    question: "« ChatGPT a-t-il accès à Internet ? »",
    reponse:
      "ChatGPT peut aussi rechercher le web lorsque des informations actuelles sont nécessaires. OpenAI l’indique dans son centre d’aide, et recommande dans le même temps de vérifier les sources. Autrement dit, la recherche web ne dispense pas de la relecture : vérifiez toujours les sources importantes avant de vous appuyer dessus en classe.",
  },
  {
    question:
      "« Puis-je écrire le nom d’un élève dans ma demande, pour que la réponse soit plus adaptée ? »",
    reponse:
      "Non : protéger fait partie des trois réflexes professionnels, et il s’agit d’éviter d’envoyer des données sensibles ou identifiantes sur les élèves. Vous n’avez d’ailleurs pas besoin du nom pour obtenir une réponse utile : le contexte se donne par le niveau, le thème et l’objectif — « Je prépare une séquence de Moyenne Section sur le thème de la ferme ». Décrivez la situation, pas l’enfant. L’adaptation à tel ou tel enfant de votre classe, c’est vous qui la faites, au moment d’utiliser le support.",
  },
  {
    question: "« Quelle différence entre ChatGPT et NotebookLM ? »",
    reponse:
      "ChatGPT construit sa réponse à partir de motifs appris dans de grandes quantités de données : vous formulez, le modèle génère, vous vérifiez. NotebookLM, lui, travaille à partir de vos sources pour vous aider à comprendre, synthétiser et transformer vos documents. L’idée clé est là : vos documents deviennent le contexte de travail. En pratique, ChatGPT sert à produire quelque chose de nouveau — douze mots sur la ferme, cinq questions de compréhension —, NotebookLM à exploiter un document que vous possédez déjà, avec des réponses qui citent les passages utilisés.",
  },
  {
    question: "« Et si la première réponse ne me convient pas ? »",
    reponse:
      "C’est le cas normal, et c’est prévu : le but n’est pas d’obtenir une réponse parfaite du premier coup, mais une base de travail beaucoup plus proche du besoin. Le troisième réflexe s’appelle itérer — demander une version plus courte, plus simple, plus adaptée ou mieux structurée. En pratique, on corrige après la première réponse : « refais plus court », « mets en tableau », « adapte à la MS ». Si la réponse est franchement à côté, reprenez plutôt la check-list : il manque souvent une des cinq informations dans la demande de départ.",
  },
  {
    question: "« Quelles sources NotebookLM accepte-t-il ? »",
    reponse:
      "Vous ajoutez vos ressources sous quatre formes : des PDF, des documents et présentations Google, des pages web, de l’audio ou de la vidéo. Vous interrogez ensuite le notebook, qui répond avec des citations liées aux sources. À partir des mêmes documents, il peut produire des synthèses et des briefings — transformer un document long en points clés — ainsi que des guides, des quiz ou des cartes mentales. Google le décrit comme un assistant de recherche alimenté par l’IA.",
  },
  {
    question:
      "« Les citations de NotebookLM me dispensent-elles de relire le document source ? »",
    reponse:
      "Non. Une citation facilite la vérification, mais ne remplace pas votre lecture du document source. C’est la quatrième étape du workflow, après importer, questionner et transformer : vous ouvrez les citations et vous relisez avant usage. NotebookLM aide à retrouver la source ; l’enseignant relit toujours le passage important.",
  },
  {
    question: "« Puis-je utiliser l’IA pour évaluer un élève ? »",
    reponse:
      "L’enseignant garde la décision pédagogique : l’IA accélère la préparation, elle ne remplace pas votre jugement. Juger des acquis d’un élève relève de votre observation en classe, et ce jugement-là ne se délègue pas. S’ajoute la règle de protection : les données sensibles ou identifiantes sur les élèves n’ont pas à être envoyées à un outil. Ce que l’IA peut faire, c’est vous aider à préparer les supports en amont — des questions de compréhension, une consigne reformulée en langage plus simple, un tableau de mots — que vous utiliserez ensuite avec votre classe.",
  },
  {
    question: "« Par où commencer dès demain ? »",
    reponse:
      "Choisissez une préparation de la semaine et testez un prompt ACTIF dessus. Partez de votre vrai besoin — l’exercice sera immédiatement utile —, écrivez la demande en une phrase, puis passez la check-list avant d’envoyer : le rôle, le contexte, la tâche, le ton, le format. Si un élément manque, ajoutez-le. Comparez ensuite le temps gagné et la qualité obtenue : c’est cette comparaison, sur une vraie préparation, qui vous dira quelle place donner à l’outil.",
  },
];
