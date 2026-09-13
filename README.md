# Numérique — plateforme de formation du Collège de la Providence

Site des formations de la référente numérique du Collège de la Providence
(établissement sous tutelle des Carmélites). Les enseignants y suivent une
formation module par module, y répondent aux questions posées en séance et y
retrouvent les ressources après coup.

Première formation publiée : **« IA générative au service de la classe — Créer
de meilleurs prompts · Utiliser ChatGPT avec méthode »** (année 2026-2027, deux
heures), destinée aux enseignants de tous les cycles, de la maternelle au
secondaire.

Elle est transcrite depuis un diaporama de vingt-et-une diapositives et ses
vingt-et-une pages de notes, « IA générative au service de la maternelle ». La
méthode ACTIF, les définitions, la check-list et le workflow NotebookLM en sont
repris sans changement ; ses exemples, tous pris en maternelle, sont conservés
comme fil rouge et complétés pour l’élémentaire, le collège et le lycée.

## Ce que le site permet

- **Suivre la formation** : sept modules, une barre de progression enregistrée
  dans le navigateur, navigation module précédent / suivant.
- **Faire les exercices directement sur le site** : vrai/faux et QCM corrigés,
  cas pratiques classés autorisé / encadré / interdit, listes de vérification,
  constructeur de requête ACTIF, et des exercices guidés où l’enseignant
  consigne ce qu’il obtient dans ChatGPT ou NotebookLM puis découvre le
  retour de la formation. Chaque module ouvre sur le bilan de ses exercices.
  Les réponses restent locales au navigateur.
- **Répondre aux questionnaires de la séance** : sondage d’entrée, enquête de
  satisfaction et trame de restitution de l’atelier, collectés sur le site
  (anonymes, sans application externe).
- **Tableau de bord animateur** : résultats agrégés en direct, mode projection,
  QR codes vers les questionnaires, ouverture et fermeture des séances. Protégé
  par un code que l’animateur choisit depuis le site, une fois la base reliée,
  et change à chaque séance.
- **Assistant IA** : répond aux questions des enseignants uniquement à partir
  du contenu de la formation, et cite le module ou la ressource source.
- **Rédacteur de prompt ACTIF** : un outil autonome, hors formation, qui
  compose un prompt en cinq étapes et le rend prêt à coller.
- **Tutoriels d’outils** : la prise en main de chaque outil utilisé en
  formation, pas à pas, avec une check-list à cocher pendant qu’on manipule.
  Publié à ce jour : NotebookLM. Ces tutoriels alimentent aussi l’assistant.
- **Ressources** : fiche méthode ACTIF, bibliothèque de dix-neuf requêtes
  classées par cycle, questions fréquentes, déroulé animateur.

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # facultatif, voir plus bas
npm run dev                  # http://localhost:3000
```

Autres commandes :

```bash
npm run lint      # ESLint
npm run build     # compilation de production
npm run start     # sert la version compilée
npm run db:init   # applique db/schema.sql à la main (facultatif, rejouable)
```

## Configuration

Aucune variable n’est obligatoire. Sans elles, le site compile et se consulte
normalement ; seule la fonction concernée est désactivée et la page l’annonce.

| Variable            | Active                                                      |
| ------------------- | ----------------------------------------------------------- |
| `ANTHROPIC_API_KEY` | l’assistant IA                                              |
| `DATABASE_URL`      | la collecte des réponses (Postgres)                         |
| `CODE_ANIMATEUR`    | un code animateur fixe (sinon il se choisit depuis le site) |

Le détail de chaque variable est commenté dans `.env.example`.

## À renseigner

Quatre valeurs ne sont pas encore arrêtées et sont laissées vides plutôt que
devinées :

- **L’adresse de contact de la référente numérique** — `src/content/site.ts`, champ
  `courriel` de `REFERENT`, et `formateur.email` dans le fichier de la
  formation. Tant qu’ils sont vides, aucun lien « Contact » ni aucune adresse
  n’apparaît, et l’assistant renvoie vers la référente sans citer d’adresse.
- **La ville et le pays de l’établissement** — `src/content/site.ts`, champs
  `lieu` et `pays`. Laissés vides, ils ne sont simplement pas affichés ;
  renseignés, ils apparaissent dans le pied de page et sur l’accueil.
- **Le fuseau horaire des séances** — `src/app/api/animateur/session/route.ts`,
  constante `zone`, fixée à `Asia/Beirut`. Il ne sert qu’à dater le libellé
  d’une séance ouverte depuis le tableau de bord.
- **Le minutage de la séance** — le diaporama annonce un atelier de quatre
  minutes mais aucun horaire global. Le programme de deux heures est déduit du
  contenu, dans `src/content/formations/ia-generative-en-classe/index.ts` et
  dans le déroulé animateur ; ajustez les deux ensemble.

## Déploiement

Le projet est une application Next.js standard, prévue pour Vercel :

1. Importer le dépôt dans Vercel.
2. Renseigner les variables ci-dessus dans *Project Settings → Environment
   Variables*. Pour Postgres, l’onglet *Storage* crée la base et injecte
   `DATABASE_URL` automatiquement. Si un autre préfixe a été choisi
   (`STORAGE_URL`, `POSTGRES_URL`…), la variable est reconnue quand même.
3. Redéployer. Les tables sont créées par le site au premier accès à la base :
   aucune commande à lancer. `npm run db:init` reste disponible pour appliquer
   le schéma à la main, par exemple sur une base locale.

## Organisation du code

```
src/
  app/                      pages et routes API (App Router)
    formations/[formation]/ page de formation, modules, ressources,
                            questionnaires participants, tableau animateur
    outils/                 rédacteur de prompt ACTIF
    tutoriels/              catalogue et page d’un tutoriel d’outil
    api/                    assistant, réponses, restitutions, animateur
  content/
    types.ts                contrat de contenu (blocs, modules, questionnaires)
    site.ts                 identité de l’établissement et de la référente
    outils/actif.ts         la méthode ACTIF, transcrite du diaporama
    tutoriels/<slug>.ts     prise en main d’un outil, décrite en données
    formations/<slug>/      contenu d’une formation, décrit en données
  components/               rendu des blocs, interactifs, formulaires, graphiques
  lib/
    formations.ts           registre des formations et accès au contenu
    tutoriels.ts            registre des tutoriels d’outils
    corpus.ts               corpus de l’assistant, dérivé du même contenu
    progression.ts          progression locale (localStorage)
    db.ts, animateur.ts     accès Postgres, session animateur
db/schema.sql               schéma de la collecte
scripts/init-db.mjs         application du schéma
```

Tout le contenu pédagogique est écrit en données, jamais en JSX : les pages, le
corpus de l’assistant et l’agrégation des résultats partent de la même source.

## Ajouter un tutoriel d’outil

1. Créer `src/content/tutoriels/<slug>.ts` exportant un objet `Tutoriel` (voir
   `src/content/tutoriels/types.ts`). Le corps se décrit avec les mêmes blocs
   que les modules, et se rend donc avec le même composant.
2. L’ajouter au tableau `tutoriels` de `src/lib/tutoriels.ts`, et retirer
   l’outil de `tutorielsAVenir` s’il y figurait.

Le catalogue, la page de détail et le corpus de l’assistant le prennent en
compte sans autre modification.

Le champ `interfaceDecrite` est affiché en tête de page : les interfaces des
outils d’IA changent vite, et un tutoriel qui ne dit pas de quand il date fait
perdre plus de temps qu’il n’en gagne.

## Ajouter une formation

1. Créer `src/content/formations/<slug>/index.ts` exportant un objet
   `Formation` (voir `src/content/types.ts`), avec ses modules dans `modules/`
   et, au besoin, ses ressources dans `ressources/`.
2. L’ajouter au tableau `formations` de `src/lib/formations.ts`.
3. Si la formation a des ressources propres, brancher leur construction dans
   `construireBlocs` du même fichier.

Le catalogue, les pages de modules, la progression et le corpus de l’assistant
la prennent en compte sans autre modification.

Deux points restent liés à la première formation, comme dans le site dont
celui-ci est issu : la trame de restitution et les deux questionnaires sont
importés depuis `ia-generative-en-classe/ressources/questionnaires.ts` par la
couche données et les pages « participer ». Une deuxième formation qui
apporterait ses propres questionnaires demanderait de les résoudre à partir du
slug, à ces endroits-là.
