"use client";

import type { Bloc, Verdict } from "@/content/types";
import { useEtatLocal } from "@/lib/progression";

type BlocCasPratiques = Extract<Bloc, { type: "casPratiques" }>;

/** Verdict choisi par le participant, indexé par le rang du cas. */
type Choix = Record<string, Verdict | undefined>;

/** Référence stable : évite de repasser un nouvel objet au hook à chaque rendu. */
const AUCUN_CHOIX: Choix = {};

/** Ordre du feu tricolore de la charte. */
const VERDICTS: Verdict[] = ["autorise", "encadre", "interdit"];

/** Libellé par défaut, utilisé quand le cas n’en impose pas un autre. */
const LIBELLES: Record<Verdict, string> = {
  autorise: "Autorisé",
  encadre: "Encadré",
  interdit: "Interdit",
};

/** Habillage du feu tricolore, réservé aux trois états de la charte. */
const TONS: Record<
  Verdict,
  { propose: string; retenu: string; voile: string; texte: string }
> = {
  autorise: {
    propose:
      "border-vert-trait bg-vert-voile text-vert hover:border-vert hover:bg-vert hover:text-craie",
    retenu: "border-vert bg-vert text-craie",
    voile: "border-vert-trait bg-vert-voile",
    texte: "text-vert",
  },
  encadre: {
    propose:
      "border-ambre-trait bg-ambre-voile text-ambre hover:border-ambre hover:bg-ambre hover:text-craie",
    retenu: "border-ambre bg-ambre text-craie",
    voile: "border-ambre-trait bg-ambre-voile",
    texte: "text-ambre",
  },
  interdit: {
    propose:
      "border-rouge-trait bg-rouge-voile text-rouge hover:border-rouge hover:bg-rouge hover:text-craie",
    retenu: "border-rouge bg-rouge text-craie",
    voile: "border-rouge-trait bg-rouge-voile",
    texte: "text-rouge",
  },
};

function IconeJuste() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <path d="M4 10.5 8 14.5 16 5.5" />
    </svg>
  );
}

function IconeFausse() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <path d="M5.5 5.5 14.5 14.5" />
      <path d="M14.5 5.5 5.5 14.5" />
    </svg>
  );
}

function BarreProgression({
  fait,
  total,
  texte,
  libelle,
}: {
  fait: number;
  total: number;
  texte: string;
  libelle: string;
}) {
  const pourcentage = total > 0 ? Math.round((fait / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label={libelle}
        aria-valuemin={0}
        aria-valuemax={Math.max(total, 1)}
        aria-valuenow={fait}
        aria-valuetext={texte}
        className="h-1 min-w-16 flex-1 overflow-hidden rounded-full bg-voile"
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-150"
          style={{ width: `${pourcentage}%` }}
        />
      </div>
      <span
        aria-hidden="true"
        className="shrink-0 font-mono text-xs tabular-nums text-graphite"
      >
        {texte}
      </span>
    </div>
  );
}

export default function CasPratiques({ bloc }: { bloc: BlocCasPratiques }) {
  const [choix, setChoix] = useEtatLocal<Choix>(
    `casPratiques:${bloc.id}`,
    AUCUN_CHOIX,
  );

  const total = bloc.cas.length;
  const traites = bloc.cas.filter(
    (_, rang) => choix[String(rang)] !== undefined,
  ).length;
  const justes = bloc.cas.filter(
    (cas, rang) => choix[String(rang)] === cas.verdict,
  ).length;
  const termine = total > 0 && traites === total;

  function classer(rang: number, verdict: Verdict) {
    // Le verdict est figé dès le premier clic.
    if (choix[String(rang)] !== undefined) return;
    setChoix({ ...choix, [String(rang)]: verdict });
  }

  function recommencer() {
    setChoix({});
  }

  return (
    <section
      aria-label="Cas pratiques : autorisé, encadré ou interdit"
      className="space-y-4"
    >
      <header className="space-y-3">
        <p className="text-encre-clair">{bloc.consigne}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="min-w-40 flex-1">
            <BarreProgression
              fait={traites}
              total={total}
              texte={`${traites} / ${total} traités`}
              libelle="Cas traités"
            />
          </div>
          {traites > 0 && !termine ? (
            <button
              type="button"
              onClick={recommencer}
              className="sans-impression shrink-0 rounded-md px-2 py-1 text-xs font-medium text-graphite underline-offset-4 transition-colors duration-150 hover:text-accent hover:underline"
            >
              Recommencer
            </button>
          ) : null}
        </div>
      </header>

      <ol className="space-y-3">
        {bloc.cas.map((cas, rang) => {
          const reponse = choix[String(rang)];
          const repondu = reponse !== undefined;
          const correspond = reponse === cas.verdict;
          const ton = TONS[cas.verdict];
          const libelleAttendu = cas.verdictLibelle ?? LIBELLES[cas.verdict];

          return (
            <li
              key={rang}
              className="rounded-lg border border-trait bg-craie p-4 sm:p-5"
            >
              <div className="space-y-3">
                <p className="font-mono text-xs uppercase tracking-wide text-graphite">
                  Cas {rang + 1} sur {total}
                </p>
                <p className="text-encre">{cas.situation}</p>

                <div className="flex flex-wrap gap-2">
                  {VERDICTS.map((verdict) => {
                    const attendu = repondu && verdict === cas.verdict;
                    const choisiAtort =
                      repondu && verdict === reponse && !attendu;

                    let habillage: string;
                    if (!repondu) habillage = TONS[verdict].propose;
                    else if (attendu) habillage = TONS[verdict].retenu;
                    else if (choisiAtort)
                      habillage = "border-trait-fort bg-voile text-graphite";
                    else habillage = "border-trait bg-craie text-estompe";

                    return (
                      <button
                        key={verdict}
                        type="button"
                        onClick={() => classer(rang, verdict)}
                        aria-pressed={repondu && reponse === verdict}
                        aria-disabled={repondu}
                        className={[
                          "inline-flex min-w-28 items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors duration-150",
                          habillage,
                          repondu && reponse === verdict
                            ? "font-semibold"
                            : "font-medium",
                          repondu ? "cursor-default" : "cursor-pointer",
                        ].join(" ")}
                      >
                        {LIBELLES[verdict]}
                        {attendu ? <IconeJuste /> : null}
                        {choisiAtort ? <IconeFausse /> : null}
                      </button>
                    );
                  })}
                </div>

                {repondu ? (
                  <div
                    role="status"
                    className={[
                      "rounded-md border p-3 text-sm",
                      ton.voile,
                    ].join(" ")}
                  >
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-mono text-xs uppercase tracking-wide text-graphite">
                        Verdict
                      </span>
                      <span
                        className={`font-serif text-base font-semibold ${ton.texte}`}
                      >
                        {libelleAttendu}
                      </span>
                    </p>
                    <p className="mt-2 text-graphite">
                      <span className="font-medium text-encre">Pourquoi : </span>
                      {cas.pourquoi}
                    </p>
                    <p className="mt-2 border-t border-trait pt-2 text-xs text-graphite">
                      {correspond
                        ? "Votre réponse correspond au verdict attendu."
                        : `Votre réponse — « ${LIBELLES[reponse]} » — ne correspond pas.`}
                    </p>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {termine ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent bg-accent-voile p-4"
        >
          <p className="font-serif text-base text-encre">
            {justes} cas bien classé{justes > 1 ? "s" : ""} sur {total}.
          </p>
          <button
            type="button"
            onClick={recommencer}
            className="sans-impression shrink-0 cursor-pointer rounded-md border border-trait-fort bg-craie px-3 py-1.5 text-sm font-medium text-encre transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            Recommencer
          </button>
        </div>
      ) : null}
    </section>
  );
}
