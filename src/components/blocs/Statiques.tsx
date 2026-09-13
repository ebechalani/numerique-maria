/**
 * Blocs statiques — rendu serveur.
 *
 * Un composant par variante statique du contrat de contenu (src/content/types.ts).
 * Aucun état, aucun effet : ces blocs sont rendus côté serveur et restent lisibles
 * à l’impression comme au clavier.
 */

import type { ReactNode } from "react";
import type { Bloc, TonEncadre, Verdict } from "@/content/types";

/* ------------------------------------------------------------------ */
/* Types dérivés du contrat                                            */
/* ------------------------------------------------------------------ */

type BlocTitre = Extract<Bloc, { type: "titre" }>;
type BlocParagraphe = Extract<Bloc, { type: "paragraphe" }>;
type BlocListe = Extract<Bloc, { type: "liste" }>;
type BlocCartes = Extract<Bloc, { type: "cartes" }>;
type BlocEtapes = Extract<Bloc, { type: "etapes" }>;
type BlocEncadre = Extract<Bloc, { type: "encadre" }>;
type BlocCitation = Extract<Bloc, { type: "citation" }>;
type BlocTableau = Extract<Bloc, { type: "tableau" }>;
type BlocFeu = Extract<Bloc, { type: "feu" }>;
type BlocNotesAnimateur = Extract<Bloc, { type: "notesAnimateur" }>;

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

/**
 * Ancre stable dérivée d’un intitulé : sans accents, en minuscules, mots
 * séparés par des tirets. Sert d’`id` aux titres et de cible aux sommaires.
 */
export function ancre(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'"«»]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Gabarit d’icône : trait 1.5, currentColor, aucune dépendance externe. */
function Icone({ children }: { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Titre                                                               */
/* ------------------------------------------------------------------ */

export function Titre({ bloc }: { bloc: BlocTitre }) {
  return (
    <h2
      id={ancre(bloc.texte)}
      className="scroll-mt-28 border-b border-trait pb-2 font-serif text-2xl font-semibold tracking-tight text-encre sm:text-[1.75rem]"
    >
      {bloc.texte}
    </h2>
  );
}

/* ------------------------------------------------------------------ */
/* Paragraphe                                                          */
/* ------------------------------------------------------------------ */

export function Paragraphe({ bloc }: { bloc: BlocParagraphe }) {
  return (
    <p className="max-w-[70ch] text-[1.0625rem] leading-relaxed text-encre-clair">
      {bloc.texte}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Liste                                                               */
/* ------------------------------------------------------------------ */

export function Liste({ bloc }: { bloc: BlocListe }) {
  if (bloc.ordonnee) {
    return (
      <ol className="max-w-[70ch] space-y-3">
        {bloc.items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-voile text-xs font-semibold tabular-nums text-encre"
            >
              {i + 1}
            </span>
            <span className="leading-relaxed text-encre-clair">{item}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="max-w-[70ch] space-y-2">
      {bloc.items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-trait-fort"
          />
          <span className="leading-relaxed text-encre-clair">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Cartes                                                              */
/* ------------------------------------------------------------------ */

/** Classes figées (le JIT de Tailwind ne lit pas les noms construits). */
const grilleCartes: Record<2 | 3 | 4, string> = {
  2: "md:grid-cols-2",
  3: "sm:grid-cols-2 md:grid-cols-3",
  4: "sm:grid-cols-2 md:grid-cols-4",
};

export function Cartes({ bloc }: { bloc: BlocCartes }) {
  const colonnes = bloc.colonnes ?? 3;

  return (
    <div className={`grid grid-cols-1 gap-4 ${grilleCartes[colonnes]}`}>
      {bloc.cartes.map((carte, i) => (
        <article
          key={i}
          className="rounded-[--radius-carte] border border-trait bg-craie p-5"
        >
          <h3 className="flex items-start gap-2.5 font-serif text-base font-semibold text-encre">
            {carte.numero ? (
              <span className="mt-px grid size-6 shrink-0 place-items-center rounded-full bg-encre text-[0.7rem] font-semibold tabular-nums text-papier">
                {carte.numero}
              </span>
            ) : null}
            <span>{carte.titre}</span>
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-graphite">
            {carte.texte}
          </p>
        </article>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Étapes                                                              */
/* ------------------------------------------------------------------ */

export function Etapes({ bloc }: { bloc: BlocEtapes }) {
  return (
    <ol className="max-w-[70ch]">
      {bloc.etapes.map((etape, i) => (
        <li key={i} className="relative pb-7 pl-12 last:pb-0">
          {i < bloc.etapes.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-4 top-9 w-px -translate-x-1/2 bg-trait"
            />
          ) : null}
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 grid size-8 place-items-center rounded-full border border-trait-fort bg-craie font-mono text-sm font-semibold tabular-nums text-encre"
          >
            {i + 1}
          </span>
          <h3 className="font-serif text-lg font-semibold text-encre">
            {etape.titre}
          </h3>
          <p className="mt-1 leading-relaxed text-encre-clair">{etape.texte}</p>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Encadré                                                             */
/* ------------------------------------------------------------------ */

const styleEncadre: Record<
  TonEncadre,
  { boite: string; accent: string; libelle: string; icone: ReactNode }
> = {
  info: {
    boite: "border-l-accent bg-accent-voile",
    accent: "text-accent",
    libelle: "Information",
    icone: (
      <Icone>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 7.75h.01" />
      </Icone>
    ),
  },
  attention: {
    boite: "border-l-ambre bg-ambre-voile",
    accent: "text-ambre",
    libelle: "Attention",
    icone: (
      <Icone>
        <path d="M10.7 4.2 2.9 17.4a1.5 1.5 0 0 0 1.3 2.3h15.6a1.5 1.5 0 0 0 1.3-2.3L13.3 4.2a1.5 1.5 0 0 0-2.6 0Z" />
        <path d="M12 9.5v4" />
        <path d="M12 16.75h.01" />
      </Icone>
    ),
  },
  regle: {
    boite: "border-l-encre bg-voile",
    accent: "text-encre",
    libelle: "Règle",
    icone: (
      <Icone>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M14 3v5h5" />
        <path d="M9.5 12.5h5" />
        <path d="M9.5 16h5" />
      </Icone>
    ),
  },
  astuce: {
    boite: "border-l-vert bg-vert-voile",
    accent: "text-vert",
    libelle: "Astuce",
    icone: (
      <Icone>
        <path d="M9.5 17.5h5" />
        <path d="M10.5 20.5h3" />
        <path d="M12 3a5.5 5.5 0 0 0-3.2 9.98c.45.33.7.86.7 1.42v.1h5v-.1c0-.56.25-1.09.7-1.42A5.5 5.5 0 0 0 12 3Z" />
      </Icone>
    ),
  },
};

export function Encadre({ bloc }: { bloc: BlocEncadre }) {
  const style = styleEncadre[bloc.ton];

  return (
    <div
      className={`rounded-r-[--radius-carte] border-l-4 px-5 py-4 ${style.boite}`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${style.accent}`}>{style.icone}</span>
        <div className="min-w-0">
          {bloc.titre ? (
            <p className="font-semibold text-encre">{bloc.titre}</p>
          ) : (
            <span className="sr-only">{style.libelle}</span>
          )}
          <p
            className={`leading-relaxed text-encre-clair ${bloc.titre ? "mt-1" : ""}`}
          >
            {bloc.texte}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Citation                                                            */
/* ------------------------------------------------------------------ */

export function Citation({ bloc }: { bloc: BlocCitation }) {
  return (
    <figure className="max-w-[62ch] border-l-2 border-trait-fort pl-5">
      <blockquote className="font-serif text-lg italic leading-relaxed text-encre sm:text-xl">
        {bloc.texte}
      </blockquote>
      {bloc.source ? (
        <figcaption className="mt-2 text-sm text-graphite">
          <cite className="not-italic">— {bloc.source}</cite>
        </figcaption>
      ) : null}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Tableau                                                             */
/* ------------------------------------------------------------------ */

export function Tableau({ bloc }: { bloc: BlocTableau }) {
  return (
    <div className="overflow-x-auto rounded-[--radius-carte] border border-trait">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-voile">
          <tr>
            {bloc.entetes.map((entete, i) => (
              <th
                key={i}
                scope="col"
                className="whitespace-nowrap border-b border-trait px-4 py-3 font-semibold text-encre"
              >
                {entete}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-trait">
          {bloc.lignes.map((ligne, i) => (
            <tr key={i} className="odd:bg-craie even:bg-papier">
              {ligne.map((cellule, j) =>
                j === 0 ? (
                  <th
                    key={j}
                    scope="row"
                    className="px-4 py-3 text-left align-top font-medium text-encre"
                  >
                    {cellule}
                  </th>
                ) : (
                  <td
                    key={j}
                    className="px-4 py-3 align-top leading-relaxed text-encre-clair"
                  >
                    {cellule}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feu tricolore                                                       */
/* ------------------------------------------------------------------ */

const styleVerdict: Record<
  Verdict,
  { boite: string; titre: string; puce: string; filet: string }
> = {
  autorise: {
    boite: "border-vert-trait bg-vert-voile",
    titre: "text-vert",
    puce: "bg-vert",
    filet: "border-vert-trait",
  },
  encadre: {
    boite: "border-ambre-trait bg-ambre-voile",
    titre: "text-ambre",
    puce: "bg-ambre",
    filet: "border-ambre-trait",
  },
  interdit: {
    boite: "border-rouge-trait bg-rouge-voile",
    titre: "text-rouge",
    puce: "bg-rouge",
    filet: "border-rouge-trait",
  },
};

export function Feu({ bloc }: { bloc: BlocFeu }) {
  // Le libellé « Règle d’or » est porté par la mise en page : on évite de le
  // répéter si le texte du contenu le porte déjà.
  const regleOr = bloc.regleOr?.replace(/^\s*règle\s+d[’']or\s*[:—–-]?\s*/i, "");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {bloc.colonnes.map((colonne, i) => {
          const style = styleVerdict[colonne.verdict];

          return (
            <section
              key={i}
              className={`rounded-[--radius-carte] border p-4 ${style.boite}`}
            >
              <h3
                className={`text-sm font-semibold uppercase tracking-[0.08em] ${style.titre}`}
              >
                {colonne.titre}
              </h3>
              <p className="mt-1 text-xs italic text-graphite">
                {colonne.precision}
              </p>
              <ul className="mt-3 space-y-2">
                {colonne.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-2.5 text-sm leading-relaxed text-encre-clair"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-[0.45rem] size-1.5 shrink-0 rounded-full ${style.puce}`}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {colonne.note ? (
                <p
                  className={`mt-3 border-t pt-2.5 text-xs leading-relaxed text-graphite ${style.filet}`}
                >
                  {colonne.note}
                </p>
              ) : null}
            </section>
          );
        })}
      </div>

      {regleOr ? (
        <div className="rounded-[--radius-carte] bg-encre px-5 py-4 text-papier">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-trait-fort">
            Règle d’or
          </p>
          <p className="mt-1.5 font-serif text-base leading-relaxed sm:text-lg">
            {regleOr}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Note pour l’animateur                                               */
/* ------------------------------------------------------------------ */

export function NotesAnimateur({ bloc }: { bloc: BlocNotesAnimateur }) {
  return (
    <aside className="rounded-[--radius-carte] border border-dashed border-trait-fort bg-voile px-5 py-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-graphite">
        Note pour l’animateur
      </p>
      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-encre-clair">
        {bloc.texte}
      </p>
    </aside>
  );
}
