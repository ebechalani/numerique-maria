-- ---------------------------------------------------------------------------
-- Plateforme de formation — Providence
-- Schéma de la collecte des réponses : sondage d'entrée, enquête de
-- satisfaction et trame de restitution de l'atelier, collectés sur le site.
--
-- Trois tables seulement, appliquées par le site lui-même au premier accès à
-- la base (src/lib/db.ts), ou à la main par `npm run db:init`. Le fichier est
-- idempotent : chaque instruction est écrite en « create ... if not exists »,
-- on peut donc le rejouer sans risque sur une base déjà en service.
--
-- Anonymat : aucune colonne nominative. Les questionnaires d'entrée et de
-- satisfaction ne comportent aucun champ d'identité. Seule la restitution
-- possède une colonne « membres », renseignée volontairement par le binôme
-- ou le groupe lui-même, et il s'agit d'adultes.
-- ---------------------------------------------------------------------------

-- Une session de formation = une occurrence d'une formation, un jour donné.
-- Les réponses sont toujours rattachées à une session : deux groupes formés à
-- deux dates différentes ne se mélangent donc jamais dans le tableau de bord.
create table if not exists formation_session (
  id serial primary key,
  formation text not null,
  libelle text not null,
  ouverte boolean not null default true,
  creee_le timestamptz not null default now()
);

-- Une réponse anonyme à l'un des deux questionnaires :
--   'sondage'      — sondage d'entrée, rempli pendant l'installation ;
--   'satisfaction' — enquête de satisfaction, remplie avant de quitter la salle.
-- Le détail est stocké en jsonb (identifiant de question -> valeur), pour que
-- l'ajout d'une question au contenu ne demande aucune migration de schéma.
-- L'agrégation est faite en TypeScript : le volume se compte en dizaines de
-- lignes par session.
create table if not exists formation_reponse (
  id serial primary key,
  session_id integer not null references formation_session(id) on delete cascade,
  formation text not null,
  questionnaire text not null check (questionnaire in ('sondage','satisfaction')),
  reponses jsonb not null,
  envoye_le timestamptz not null default now()
);

-- La trame de restitution de l'atelier ACTIF, une ligne par contribution.
-- Ce que le groupe a écrit comme prompt, avec quel outil, ce qu'il a obtenu,
-- ce qu'il a dû corriger et ce qui appelle une vigilance. C'est la seule table
-- où figure un texte saisi volontairement par les participantes (colonne
-- « membres ») ; elle reste facultative.
-- La colonne « domaine » est l'axe de regroupement du mur des contributions :
-- le domaine d'apprentissage travaillé.
create table if not exists formation_restitution (
  id serial primary key,
  session_id integer not null references formation_session(id) on delete cascade,
  formation text not null,
  domaine text not null,
  niveau text,
  membres text,
  outil text not null,
  ressource text not null,
  requete text,
  corrections text,
  vigilance text,
  envoye_le timestamptz not null default now()
);

-- Réglages du site définis depuis le site lui-même, une ligne par clé. Sert au
-- code d'accès animateur quand il n'est pas fourni par l'environnement : la
-- valeur stockée est une empreinte SHA-256, jamais le code en clair.
create table if not exists formation_reglage (
  cle text primary key,
  valeur text not null,
  modifie_le timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Index
--
-- Toutes les lectures du tableau de bord partent soit d'une formation
-- (« quelle est la session ouverte ? »), soit d'une session (« toutes les
-- réponses de cette session »). Ces trois index couvrent ces accès.
-- ---------------------------------------------------------------------------

-- Retrouver la session ouverte d'une formation, et lister l'historique.
create index if not exists formation_session_formation_idx
  on formation_session (formation, creee_le desc);

-- Charger les réponses d'une session, questionnaire par questionnaire.
create index if not exists formation_reponse_session_idx
  on formation_reponse (session_id, questionnaire, envoye_le);

-- Charger les restitutions d'une session, dans l'ordre d'envoi.
create index if not exists formation_restitution_session_idx
  on formation_restitution (session_id, envoye_le);

-- ---------------------------------------------------------------------------
-- Commentaires de catalogue (visibles avec \d+ sous psql).
-- ---------------------------------------------------------------------------

comment on table formation_session is
  'Une occurrence de formation (une date, un groupe). Les réponses s''y rattachent.';
comment on table formation_reponse is
  'Réponses anonymes aux questionnaires d''entrée et de satisfaction (jsonb).';
comment on table formation_restitution is
  'Trame de restitution de l''atelier ACTIF, une ligne par contribution.';
comment on table formation_reglage is
  'Réglages définis depuis le site (empreinte du code animateur, etc.).';

comment on column formation_session.libelle is
  'Nom lisible de la session, ex. « Formation IA 2026-2027 — groupe du matin ».';
comment on column formation_session.ouverte is
  'Une session fermée n''accepte plus de réponse ; elle reste consultable.';
comment on column formation_reponse.reponses is
  'Identifiant de question -> valeur (texte, liste de textes, ou nombre).';
comment on column formation_restitution.membres is
  'Prénoms des membres du groupe, saisis volontairement. Jamais de donnée d''enfant.';
comment on column formation_restitution.domaine is
  'Domaine d''apprentissage travaillé — axe de regroupement des contributions.';
