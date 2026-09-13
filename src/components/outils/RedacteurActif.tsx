"use client";

/**
 * Rédacteur de prompt — méthode ACTIF.
 *
 * Cinq étapes, une lettre chacune : l’enseignant écrit le rôle (A), le
 * contexte (C), la tâche (T), le ton (I) et le format (F). À la fin, trois
 * prompts sont assemblés à partir de ses phrases, prêts à copier dans ChatGPT
 * ou NotebookLM. Aucun texte n’est inventé : les propositions ne font
 * que réordonner et ponctuer ce qui a été saisi.
 *
 * Tout reste dans le navigateur (useEtatLocal) : on retrouve son brouillon en
 * revenant sur la page.
 */

import { useCallback, useId, useMemo } from "react";

import BoutonCopier from "@/components/ui/BoutonCopier";
import {
  CITATIONS_ACTIF,
  EXEMPLE_COMPLET,
  METHODE_ACTIF,
  RELANCES,
  type LettreActif,
} from "@/content/outils/actif";
import { useEtatLocal } from "@/lib/progression";

/* ------------------------------------------------------------------ */
/* État                                                                */
/* ------------------------------------------------------------------ */

type Valeurs = Record<LettreActif, string>;

interface EtatRedacteur {
  valeurs: Valeurs;
  /** Rang de l’étape affichée, 0 à 4. */
  etape: number;
  /** Vrai quand l’enseignant a demandé ses prompts. */
  resultats: boolean;
}

const VALEURS_VIDES: Valeurs = { A: "", C: "", T: "", I: "", F: "" };
const ETAT_INITIAL: EtatRedacteur = {
  valeurs: VALEURS_VIDES,
  etape: 0,
  resultats: false,
};

const CLE_STOCKAGE = "redacteur-actif";

/** Le stockage peut contenir n’importe quoi : on reconstruit un état sûr. */
function etatSur(brut: unknown): EtatRedacteur {
  const objet = (brut ?? {}) as Partial<EtatRedacteur> & {
    valeurs?: Partial<Record<string, unknown>>;
  };
  const valeurs: Valeurs = { ...VALEURS_VIDES };
  for (const lettre of Object.keys(VALEURS_VIDES) as LettreActif[]) {
    const v = objet.valeurs?.[lettre];
    if (typeof v === "string") valeurs[lettre] = v;
  }
  const etape =
    typeof objet.etape === "number" && Number.isInteger(objet.etape)
      ? Math.min(Math.max(objet.etape, 0), METHODE_ACTIF.length - 1)
      : 0;
  return { valeurs, etape, resultats: objet.resultats === true };
}

/* ------------------------------------------------------------------ */
/* Assemblage des prompts                                              */
/* ------------------------------------------------------------------ */

/** Une phrase propre : espaces réduits, majuscule initiale, point final. */
function phrase(texte: string): string {
  let t = texte.trim().replace(/\s+/g, " ");
  if (!t) return "";
  t = t.charAt(0).toUpperCase() + t.slice(1);
  if (!/[.!?…»)]$/.test(t)) t += ".";
  return t;
}

const DEBUTS_ROLE =
  /^(tu es|tu seras|tu joues|agis|vous êtes|joue|imagine|en tant que|comporte-toi|sois)\b/i;

/** Le rôle : « Tu es … » si l’enseignant n’a écrit que le rôle lui-même. */
function phraseRole(texte: string): string {
  const t = texte.trim();
  if (!t) return "";
  return DEBUTS_ROLE.test(t) ? phrase(t) : phrase(`Tu es ${t}`);
}

const DEBUTS_CONSIGNE =
  /^(utilise|adopte|explique|emploie|reste|parle|écris|ecris|sois|garde|privilégie|privilegie|évite|evite|réponds|reponds|présente|presente|donne|mets|propose|fais|rédige|redige|structure|limite|organise|formule|termine|commence|classe|indique|pour chaque|sous forme|en|dans|avec|au format|ton |style )/i;

/** Le ton : une consigne telle quelle, sinon « Adopte un ton … ». */
function phraseTon(texte: string): string {
  const t = texte.trim();
  if (!t) return "";
  return DEBUTS_CONSIGNE.test(t) ? phrase(t) : phrase(`Adopte un ton ${t}`);
}

/** Le format : une consigne telle quelle, sinon « Présente le résultat … ». */
function phraseFormat(texte: string): string {
  const t = texte.trim();
  if (!t) return "";
  if (DEBUTS_CONSIGNE.test(t)) return phrase(t);
  // « un tableau » → « sous forme d’un tableau » ; « liste à puces » →
  // « sous forme de liste à puces » ; « le tableau… » → « ainsi : le tableau… ».
  if (/^(un|une)\b/i.test(t)) return phrase(`Présente le résultat sous forme d’${t}`);
  if (/^(le|la|les|des|l’|l')/i.test(t)) return phrase(`Présente le résultat ainsi : ${t}`);
  return phrase(`Présente le résultat sous forme de ${t}`);
}

/** Termine un texte par une ponctuation, sans toucher au reste. */
function ponctuer(texte: string): string {
  const t = texte.trim();
  if (!t) return "";
  return /[.!?…»)]$/.test(t) ? t : `${t}.`;
}

interface Phrases {
  role: string;
  contexte: string;
  tache: string;
  ton: string;
  format: string;
}

function phrasesDe(valeurs: Valeurs): Phrases {
  return {
    role: phraseRole(valeurs.A),
    contexte: phrase(valeurs.C),
    tache: phrase(valeurs.T),
    ton: phraseTon(valeurs.I),
    format: phraseFormat(valeurs.F),
  };
}

interface Proposition {
  cle: string;
  titre: string;
  description: string;
  /** Un ou deux messages à envoyer, dans l’ordre. */
  messages: { libelle?: string; texte: string }[];
}

function propositions(p: Phrases): Proposition[] {
  const complet = [p.role, p.contexte, p.tache, p.ton, p.format]
    .filter(Boolean)
    .join(" ");

  const structure = [
    p.role ? `Rôle : ${p.role}` : null,
    p.contexte ? `Contexte : ${p.contexte}` : null,
    p.tache ? `Tâche : ${p.tache}` : null,
    p.ton ? `Ton : ${p.ton}` : null,
    p.format ? `Format : ${p.format}` : null,
  ]
    .filter((ligne): ligne is string => ligne !== null)
    .join("\n");

  const premier = [
    p.role,
    p.contexte,
    "Avant de commencer, pose-moi deux questions si quelque chose te manque, puis attends ma réponse.",
  ]
    .filter(Boolean)
    .join(" ");
  const second = [p.tache, p.ton, p.format].filter(Boolean).join(" ");

  return [
    {
      cle: "complet",
      titre: "Le prompt complet",
      description:
        "Vos cinq phrases, dans l’ordre ACTIF, en un seul paragraphe — comme l’exemple de la formation.",
      messages: [{ texte: complet }],
    },
    {
      cle: "structure",
      titre: "Le prompt structuré",
      description:
        "Les mêmes éléments, une ligne par rubrique : facile à relire, facile à corriger avant d’envoyer.",
      messages: [{ texte: structure }],
    },
    {
      cle: "dialogue",
      titre: "Le prompt en deux temps",
      description:
        "D’abord le cadre, avec une invitation à poser des questions ; puis la demande. Utile quand le besoin est encore un peu flou.",
      messages: [
        { libelle: "Premier message", texte: premier },
        { libelle: "Second message", texte: second },
      ],
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Icônes                                                              */
/* ------------------------------------------------------------------ */

function IconeCoche() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <path d="M4 10.5 8 14.5 16 5.5" />
    </svg>
  );
}

function IconeFleche({ sens }: { sens: "gauche" | "droite" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      {sens === "gauche" ? <path d="M14 6l-6 6 6 6" /> : <path d="M10 6l6 6-6 6" />}
    </svg>
  );
}

function IconeExterne() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
    >
      <path d="M14 4h6v6" />
      <path d="M20 4l-8.5 8.5" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Pastille de lettre                                                  */
/* ------------------------------------------------------------------ */

function Lettre({
  lettre,
  taille = "md",
  ton = "encre",
}: {
  lettre: string;
  taille?: "md" | "lg";
  ton?: "encre" | "accent" | "vert" | "voile";
}) {
  const tons = {
    encre: "bg-encre text-papier",
    accent: "bg-accent text-craie",
    vert: "bg-vert text-craie",
    voile: "bg-voile text-graphite",
  };
  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full font-serif font-semibold",
        taille === "lg" ? "h-12 w-12 text-2xl" : "h-8 w-8 text-sm",
        tons[ton],
      ].join(" ")}
    >
      {lettre}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Le rédacteur                                                        */
/* ------------------------------------------------------------------ */

const OUTILS_IA = [
  { nom: "ChatGPT", url: "https://chatgpt.com" },
  { nom: "NotebookLM", url: "https://notebooklm.google.com" },
];

export default function RedacteurActif() {
  const base = useId();
  const [brut, setEtat] = useEtatLocal<EtatRedacteur>(CLE_STOCKAGE, ETAT_INITIAL);
  const etat = useMemo(() => etatSur(brut), [brut]);
  const { valeurs, etape, resultats } = etat;

  const element = METHODE_ACTIF[etape];
  const total = METHODE_ACTIF.length;
  const renseignes = METHODE_ACTIF.filter(
    (e) => valeurs[e.lettre].trim().length > 0,
  ).length;

  const modifier = useCallback(
    (lettre: LettreActif, texte: string) => {
      setEtat((precedent) => {
        const sur = etatSur(precedent);
        return { ...sur, valeurs: { ...sur.valeurs, [lettre]: texte } };
      });
    },
    [setEtat],
  );

  const allerA = useCallback(
    (rang: number, versResultats = false) => {
      setEtat((precedent) => ({
        ...etatSur(precedent),
        etape: Math.min(Math.max(rang, 0), total - 1),
        resultats: versResultats,
      }));
    },
    [setEtat, total],
  );

  const inserer = useCallback(
    (lettre: LettreActif, exemple: string) => {
      const actuel = ponctuer(valeurs[lettre]);
      modifier(lettre, actuel ? `${actuel} ${exemple}` : exemple);
    },
    [modifier, valeurs],
  );

  const chargerExemple = useCallback(() => {
    setEtat({ valeurs: { ...EXEMPLE_COMPLET }, etape: total - 1, resultats: true });
  }, [setEtat, total]);

  const recommencer = useCallback(() => {
    setEtat(ETAT_INITIAL);
  }, [setEtat]);

  const phrases = useMemo(() => phrasesDe(valeurs), [valeurs]);
  const props = useMemo(() => propositions(phrases), [phrases]);

  /* ---------------- Fil des étapes ---------------- */

  const fil = (
    <nav aria-label="Les cinq étapes de la méthode ACTIF">
      <ol className="flex flex-wrap items-center gap-2">
        {METHODE_ACTIF.map((e, rang) => {
          const courant = !resultats && rang === etape;
          const fait = valeurs[e.lettre].trim().length > 0;
          return (
            <li key={e.lettre} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => allerA(rang)}
                aria-current={courant ? "step" : undefined}
                className={[
                  "flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm transition-colors",
                  courant
                    ? "border-accent bg-accent-voile text-accent-fort"
                    : "border-trait bg-craie text-graphite hover:border-trait-fort hover:text-encre",
                ].join(" ")}
              >
                <Lettre
                  lettre={e.lettre}
                  ton={courant ? "accent" : fait ? "vert" : "voile"}
                />
                <span className="hidden sm:inline">{e.titre}</span>
                {fait ? (
                  <span className="sr-only">renseigné</span>
                ) : null}
              </button>
              {rang < total - 1 ? (
                <span aria-hidden="true" className="text-trait-fort">
                  ·
                </span>
              ) : null}
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => allerA(etape, true)}
            aria-current={resultats ? "step" : undefined}
            className={[
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              resultats
                ? "border-encre bg-encre text-papier"
                : "border-trait bg-craie text-graphite hover:border-trait-fort hover:text-encre",
            ].join(" ")}
          >
            Mes prompts
            <span className="ml-1.5 font-mono text-xs tabular-nums opacity-70">
              {renseignes}/{total}
            </span>
          </button>
        </li>
      </ol>
    </nav>
  );

  /* ---------------- Une étape ---------------- */

  const idChamp = `${base}-${element.lettre}`;
  const idAide = `${idChamp}-aide`;

  const carteEtape = (
    <section
      aria-labelledby={`${base}-titre-etape`}
      className="rounded-lg border border-trait bg-craie p-5 sm:p-7"
    >
      <p className="font-mono text-xs tracking-wide text-estompe uppercase">
        Étape {etape + 1} sur {total}
      </p>
      <div className="mt-3 flex items-start gap-4">
        <Lettre lettre={element.lettre} taille="lg" />
        <div className="min-w-0">
          <h2
            id={`${base}-titre-etape`}
            className="font-serif text-2xl leading-tight text-encre"
          >
            {element.lettre} — {element.titre}
          </h2>
          <p className="mt-1 text-lg text-accent">{element.question}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <div className="space-y-5 text-sm">
          <div>
            <p className="font-medium tracking-wide text-estompe uppercase">
              Ce que ça signifie
            </p>
            <p className="mt-1.5 leading-relaxed text-encre-clair">
              {element.signification}
            </p>
          </div>
          <div>
            <p className="font-medium tracking-wide text-estompe uppercase">
              Questions à se poser
            </p>
            <ul className="mt-1.5 space-y-1">
              {element.questions.map((q) => (
                <li key={q} className="flex gap-2 text-encre-clair">
                  <span
                    aria-hidden="true"
                    className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <label htmlFor={idChamp} className="block font-semibold text-encre">
            Votre {element.motCle}
          </label>
          <p id={idAide} className="mt-1 text-sm text-graphite">
            Une ou deux phrases, dans vos mots. Vous pourrez tout relire à la
            fin.
          </p>
          <textarea
            id={idChamp}
            rows={4}
            value={valeurs[element.lettre]}
            onChange={(evenement) => modifier(element.lettre, evenement.target.value)}
            placeholder={element.indication}
            aria-describedby={idAide}
            maxLength={1500}
            className="mt-3 block w-full resize-y rounded-md border border-trait bg-papier px-3 py-2 text-base leading-relaxed text-encre placeholder:text-estompe focus:border-accent focus:outline-none"
          />

          <p className="mt-4 text-xs font-medium tracking-wide text-estompe uppercase">
            Exemples de la formation — cliquer pour reprendre
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {element.exemples.map((exemple) => (
              <li key={exemple}>
                <button
                  type="button"
                  onClick={() => inserer(element.lettre, exemple)}
                  className="rounded-md border border-trait bg-voile px-2.5 py-1.5 text-left text-sm text-encre-clair transition-colors hover:border-accent hover:bg-accent-voile hover:text-accent-fort"
                >
                  {exemple}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-trait pt-5">
        <button
          type="button"
          onClick={() => allerA(etape - 1)}
          disabled={etape === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-trait bg-craie px-3 py-2 text-sm font-medium text-encre transition-colors hover:border-trait-fort disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconeFleche sens="gauche" />
          Précédent
        </button>
        {etape < total - 1 ? (
          <button
            type="button"
            onClick={() => allerA(etape + 1)}
            className="inline-flex items-center gap-1.5 rounded-md bg-encre px-4 py-2 text-sm font-medium text-papier transition-colors hover:bg-encre-clair"
          >
            Suivant : {METHODE_ACTIF[etape + 1].lettre} —{" "}
            {METHODE_ACTIF[etape + 1].titre}
            <IconeFleche sens="droite" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => allerA(etape, true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-craie transition-colors hover:bg-accent-fort"
          >
            Voir mes prompts
            <IconeFleche sens="droite" />
          </button>
        )}
      </div>
    </section>
  );

  /* ---------------- Les résultats ---------------- */

  const manquants = METHODE_ACTIF.filter(
    (e) => valeurs[e.lettre].trim().length === 0,
  );

  const carteResultats = (
    <section aria-labelledby={`${base}-titre-resultats`} className="space-y-6">
      {/* Check-list 5/5 */}
      <div className="rounded-lg border border-trait bg-craie p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2
            id={`${base}-titre-resultats`}
            className="font-serif text-2xl leading-tight text-encre"
          >
            Votre prompt est-il prêt ?
          </h2>
          <p
            className={[
              "font-mono text-lg tabular-nums",
              renseignes === total ? "text-vert" : "text-ambre",
            ].join(" ")}
          >
            {renseignes}/{total}
          </p>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {METHODE_ACTIF.map((e, rang) => {
            const fait = valeurs[e.lettre].trim().length > 0;
            return (
              <li key={e.lettre}>
                <button
                  type="button"
                  onClick={() => allerA(rang)}
                  className={[
                    "flex w-full items-start gap-3 rounded-md border p-3 text-left text-sm transition-colors",
                    fait
                      ? "border-vert-trait bg-vert-voile hover:border-vert"
                      : "border-ambre-trait bg-ambre-voile hover:border-ambre",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      fait ? "bg-vert text-craie" : "border border-ambre bg-craie text-ambre",
                    ].join(" ")}
                  >
                    {fait ? <IconeCoche /> : e.lettre}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-encre">
                      {e.lettre} — {e.verification}
                    </span>
                    <span className="mt-0.5 block text-graphite">
                      {fait ? valeurs[e.lettre].trim() : "Manquant — cliquer pour compléter."}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm text-graphite">
          {manquants.length === 0
            ? "Objectif 5/5 atteint. Copiez la proposition qui vous convient, collez-la dans l’IA, puis relisez la réponse avant tout usage en classe."
            : "Objectif : 5/5. Si un élément manque, ajoutez-le avant d’envoyer — les prompts ci-dessous s’assemblent avec ce que vous avez déjà écrit."}
        </p>
      </div>

      {/* Les propositions */}
      {renseignes === 0 ? (
        <div className="rounded-lg border border-dashed border-trait-fort bg-voile p-6 text-center">
          <p className="text-encre-clair">
            Rien n’a encore été écrit : commencez par l’étape A.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => allerA(0)}
              className="rounded-md bg-encre px-4 py-2 text-sm font-medium text-papier transition-colors hover:bg-encre-clair"
            >
              Commencer par A — Acteur
            </button>
            <button
              type="button"
              onClick={chargerExemple}
              className="rounded-md border border-trait bg-craie px-4 py-2 text-sm font-medium text-encre transition-colors hover:border-accent hover:text-accent"
            >
              Voir l’exemple de la formation
            </button>
          </div>
        </div>
      ) : (
        <ol className="space-y-4">
          {props.map((proposition, rang) => (
            <li
              key={proposition.cle}
              className="rounded-lg border border-trait bg-craie p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs tracking-wide text-estompe uppercase">
                    Proposition {rang + 1}
                  </p>
                  <h3 className="mt-1 font-serif text-xl leading-snug text-encre">
                    {proposition.titre}
                  </h3>
                  <p className="mt-1 text-sm text-graphite">
                    {proposition.description}
                  </p>
                </div>
                {proposition.messages.length === 1 ? (
                  <BoutonCopier
                    texte={proposition.messages[0].texte}
                    libelle="Copier ce prompt"
                  />
                ) : null}
              </div>

              <div className="mt-4 space-y-3">
                {proposition.messages.map((message, indice) => (
                  <div key={indice}>
                    {message.libelle ? (
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <p className="text-xs font-medium tracking-wide text-estompe uppercase">
                          {message.libelle}
                        </p>
                        <BoutonCopier texte={message.texte} libelle="Copier" />
                      </div>
                    ) : null}
                    <pre className="rounded-r-lg border-l-[3px] border-accent bg-voile px-4 py-3 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap text-encre">
                      {message.texte}
                    </pre>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}

      {/* Où coller, et comment poursuivre */}
      {renseignes > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-trait bg-craie p-5">
            <h3 className="font-serif text-lg text-encre">Coller dans l’IA</h3>
            <p className="mt-1 text-sm text-graphite">
              Copiez une proposition, ouvrez l’outil, collez, envoyez. Puis
              relisez : l’IA propose, l’enseignant décide.
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {OUTILS_IA.map((outil) => (
                <li key={outil.nom}>
                  <a
                    href={outil.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-trait bg-papier px-3 py-1.5 text-sm font-medium text-encre transition-colors hover:border-accent hover:text-accent"
                  >
                    {outil.nom}
                    <IconeExterne />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-estompe">
              Jamais de donnée d’élève dans un prompt : ni nom, ni note, ni observation, ni
              situation.
            </p>
          </div>
          <div className="rounded-lg border border-trait bg-craie p-5">
            <h3 className="font-serif text-lg text-encre">
              Après la première réponse : itérer
            </h3>
            <p className="mt-1 text-sm text-graphite">
              Le but n’est pas la réponse parfaite du premier coup, mais une base
              proche du besoin. Ces relances se copient telles quelles.
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {RELANCES.map((relance) => (
                <li key={relance}>
                  <BoutonCopier texte={relance} libelle={relance} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-trait pt-5">
        <button
          type="button"
          onClick={() => allerA(0)}
          className="inline-flex items-center gap-1.5 rounded-md border border-trait bg-craie px-3 py-2 text-sm font-medium text-encre transition-colors hover:border-trait-fort"
        >
          <IconeFleche sens="gauche" />
          Reprendre les étapes
        </button>
        <button
          type="button"
          onClick={recommencer}
          className="rounded-md px-2 py-1 text-sm text-graphite underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          Tout effacer
        </button>
        {renseignes > 0 ? (
          <button
            type="button"
            onClick={chargerExemple}
            className="rounded-md px-2 py-1 text-sm text-graphite underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            Remplacer par l’exemple de la formation
          </button>
        ) : null}
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      {fil}
      {resultats ? carteResultats : carteEtape}
      <p className="text-xs leading-relaxed text-estompe">
        {CITATIONS_ACTIF.lettres} Votre brouillon reste dans ce navigateur :
        rien n’est transmis.
      </p>
    </div>
  );
}
