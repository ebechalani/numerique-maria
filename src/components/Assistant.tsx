"use client";

/**
 * Assistant de la formation — panneau de conversation.
 *
 * La conversation ne vit que le temps de la session de navigation : elle peut
 * contenir des éléments de cours, elle n’est donc jamais écrite dans le
 * stockage local.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { CONTACT_OUVERT, REFERENT } from "@/content/site";

interface MessageAffiche {
  role: "user" | "assistant";
  content: string;
}

/** Vide tant que l’adresse de contact n’est pas arrêtée : on ne cite alors rien. */
const COURRIEL_REFERENT = REFERENT.courriel;

const MESSAGE_NON_CONFIGURE = CONTACT_OUVERT
  ? "L’assistant n’est pas configuré sur ce site. Pour une question sur la formation, écrivez à la référente numérique : " +
    COURRIEL_REFERENT +
    "."
  : "L’assistant n’est pas configuré sur ce site. Pour une question sur la formation, adressez-vous à la référente numérique de l’établissement.";

const MESSAGE_GENERIQUE =
  "La réponse n’a pas pu être obtenue. Réessayez dans un instant.";

const QUESTIONS_SUGGEREES = [
  "Que veut dire ACTIF, en une phrase ?",
  "Quelle différence entre ChatGPT et NotebookLM ?",
  "Mon prompt doit-il être long ?",
];

/** Distance au bas de la zone en deçà de laquelle on suit le fil du regard. */
const SEUIL_BAS = 40;

/** Hauteur maximale du champ de saisie, en pixels. */
const HAUTEUR_MAX_CHAMP = 140;

/* ------------------------------------------------------------------ */
/* Icônes                                                              */
/* ------------------------------------------------------------------ */

function IconeBulle() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path d="M20.5 12.2c0 4-3.8 7.2-8.5 7.2a9.8 9.8 0 0 1-2.6-.35L4.5 20.5l1.2-3.4A6.9 6.9 0 0 1 3.5 12.2C3.5 8.2 7.3 5 12 5s8.5 3.2 8.5 7.2Z" />
      <path d="M8.5 11.5h7" />
      <path d="M8.5 14.5h4.5" />
    </svg>
  );
}

function IconeCroix({ classe }: { classe: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={classe}
    >
      <path d="M6.5 6.5 17.5 17.5" />
      <path d="M17.5 6.5 6.5 17.5" />
    </svg>
  );
}

function IconeEnvoi() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path d="M4.5 12h13" />
      <path d="M12.5 6.5 18.5 12l-6 5.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

export default function Assistant() {
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState<MessageAffiche[]>([]);
  const [saisie, setSaisie] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const boutonRef = useRef<HTMLButtonElement>(null);
  const champRef = useRef<HTMLTextAreaElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const controleurRef = useRef<AbortController | null>(null);

  /** Vrai tant que l’utilisateur n’a pas remonté le fil de la conversation. */
  const enBasRef = useRef(true);

  const fermer = useCallback(() => {
    setOuvert(false);
    boutonRef.current?.focus();
  }, []);

  /* --- ouverture, fermeture, clavier --- */

  useEffect(() => {
    if (!ouvert) return;

    enBasRef.current = true;
    champRef.current?.focus();

    function surTouche(evenement: KeyboardEvent) {
      if (evenement.key === "Escape") fermer();
    }

    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, [ouvert, fermer]);

  /* --- défilement : on suit le flux, sauf si l’utilisateur a remonté --- */

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone || !enBasRef.current) return;
    zone.scrollTop = zone.scrollHeight;
  }, [messages, enCours, erreur, ouvert]);

  function surDefilement() {
    const zone = zoneRef.current;
    if (!zone) return;
    const reste = zone.scrollHeight - zone.scrollTop - zone.clientHeight;
    enBasRef.current = reste < SEUIL_BAS;
  }

  /* --- champ de saisie qui grandit --- */

  useEffect(() => {
    const champ = champRef.current;
    if (!champ) return;
    champ.style.height = "auto";
    champ.style.height = `${Math.min(champ.scrollHeight, HAUTEUR_MAX_CHAMP)}px`;
  }, [saisie, ouvert]);

  /* --- appel de l’assistant --- */

  const demander = useCallback(async (historique: MessageAffiche[]) => {
    setErreur(null);
    setEnCours(true);
    enBasRef.current = true;

    // Bulle vide : les fragments viendront s’y ajouter au fil de l’eau.
    setMessages([...historique, { role: "assistant", content: "" }]);

    const controleur = new AbortController();
    controleurRef.current = controleur;

    try {
      const reponse = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historique }),
        signal: controleur.signal,
      });

      if (!reponse.ok || !reponse.body) {
        throw new Error(
          reponse.status === 503 ? MESSAGE_NON_CONFIGURE : MESSAGE_GENERIQUE,
        );
      }

      const lecteur = reponse.body.getReader();
      const decodeur = new TextDecoder();

      for (;;) {
        const { done, value } = await lecteur.read();
        if (done) break;

        const fragment = decodeur.decode(value, { stream: true });
        if (!fragment) continue;

        setMessages((precedents) => {
          const suivants = [...precedents];
          const dernier = suivants[suivants.length - 1];
          if (!dernier || dernier.role !== "assistant") return precedents;
          suivants[suivants.length - 1] = {
            role: "assistant",
            content: dernier.content + fragment,
          };
          return suivants;
        });
      }
    } catch (echec) {
      // Arrêt demandé par l’utilisateur : on garde ce qui a déjà été reçu.
      const abandon =
        echec instanceof DOMException && echec.name === "AbortError";

      if (!abandon) {
        setErreur(echec instanceof Error ? echec.message : MESSAGE_GENERIQUE);
      }

      // On retire la bulle si elle est restée vide, pour ne pas laisser
      // une réponse fantôme dans la conversation.
      setMessages((precedents) => {
        const dernier = precedents[precedents.length - 1];
        return dernier && dernier.role === "assistant" && dernier.content === ""
          ? precedents.slice(0, -1)
          : precedents;
      });
    } finally {
      controleurRef.current = null;
      setEnCours(false);
    }
  }, []);

  function envoyer(texte: string) {
    const contenu = texte.trim();
    if (!contenu || enCours) return;

    setSaisie("");
    void demander([...messages, { role: "user", content: contenu }]);
  }

  function reessayer() {
    const dernier = messages[messages.length - 1];
    if (!dernier || dernier.role !== "user" || enCours) return;
    void demander(messages);
  }

  function arreter() {
    controleurRef.current?.abort();
  }

  function surTouchesChamp(
    evenement: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (evenement.key === "Enter" && !evenement.shiftKey) {
      evenement.preventDefault();
      envoyer(saisie);
    }
  }

  const vide = messages.length === 0;
  const peutReessayer =
    !enCours &&
    erreur !== null &&
    messages[messages.length - 1]?.role === "user";

  /* --- rendu --- */

  return (
    <>
      <button
        ref={boutonRef}
        type="button"
        onClick={() => (ouvert ? fermer() : setOuvert(true))}
        aria-expanded={ouvert}
        aria-label={
          ouvert
            ? "Fermer l’assistant de la formation"
            : "Ouvrir l’assistant de la formation"
        }
        className="sans-impression fixed bottom-6 right-6 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-encre bg-encre text-papier shadow-lg transition-colors duration-150 hover:bg-encre-clair"
      >
        {ouvert ? <IconeCroix classe="h-6 w-6" /> : <IconeBulle />}
      </button>

      {ouvert ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Assistant de la formation"
          className="sans-impression fixed inset-0 z-50 flex flex-col border-trait bg-craie shadow-2xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[32rem] sm:max-h-[80vh] sm:w-96 sm:rounded-lg sm:border"
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-trait px-4 py-3">
            <div className="min-w-0">
              <h2 className="font-serif text-base leading-tight text-encre">
                Assistant de la formation
              </h2>
              <p className="mt-0.5 text-xs text-estompe">
                Répond à partir du contenu du site
              </p>
            </div>
            <button
              type="button"
              onClick={fermer}
              aria-label="Fermer l’assistant"
              className="-mr-1 shrink-0 cursor-pointer rounded-md p-1.5 text-graphite transition-colors duration-150 hover:bg-voile hover:text-encre"
            >
              <IconeCroix classe="h-5 w-5" />
            </button>
          </header>

          <div
            ref={zoneRef}
            onScroll={surDefilement}
            role="log"
            aria-live="polite"
            aria-busy={enCours}
            aria-label="Conversation"
            className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {vide ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-graphite">
                  Je réponds à vos questions à partir du contenu de cette
                  formation — les modules, la fiche méthode, les requêtes. Si la
                  réponse ne s’y trouve pas, je vous le dis plutôt que de
                  l’inventer.
                </p>
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-estompe">
                    Par exemple
                  </p>
                  {QUESTIONS_SUGGEREES.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => envoyer(question)}
                      className="block w-full cursor-pointer rounded-md border border-trait bg-papier px-3 py-2 text-left text-sm text-encre-clair transition-colors duration-150 hover:border-accent hover:bg-accent-voile hover:text-accent"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((message, rang) =>
              message.role === "user" ? (
                <p
                  key={rang}
                  className="ml-auto max-w-[85%] whitespace-pre-wrap break-words rounded-lg bg-voile px-3 py-2 text-sm text-encre"
                >
                  {message.content}
                </p>
              ) : (
                <p
                  key={rang}
                  className="whitespace-pre-wrap break-words text-sm leading-relaxed text-encre-clair"
                >
                  {message.content}
                  {enCours && rang === messages.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 bg-accent"
                    />
                  ) : null}
                </p>
              ),
            )}

            {erreur ? (
              /* Échec d’envoi : encre sur voile. Les couleurs des verdicts
                 (vert / ambre / rouge) ne sert jamais à un état de formulaire. */
              <div
                role="status"
                className="space-y-2 rounded-md border border-encre-clair bg-voile p-3 text-sm text-encre"
              >
                <p>{erreur}</p>
                {peutReessayer ? (
                  <button
                    type="button"
                    onClick={reessayer}
                    className="cursor-pointer rounded-md border border-trait-fort bg-craie px-2.5 py-1 text-xs font-medium text-encre transition-colors duration-150 hover:border-accent hover:text-accent"
                  >
                    Réessayer
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-trait px-4 py-3">
            <form
              onSubmit={(evenement) => {
                evenement.preventDefault();
                envoyer(saisie);
              }}
              className="flex items-end gap-2"
            >
              <label htmlFor="assistant-saisie" className="sr-only">
                Votre question
              </label>
              <textarea
                id="assistant-saisie"
                ref={champRef}
                value={saisie}
                onChange={(evenement) => setSaisie(evenement.target.value)}
                onKeyDown={surTouchesChamp}
                rows={1}
                maxLength={4000}
                placeholder="Votre question…"
                className="min-h-9 flex-1 resize-none rounded-md border border-trait bg-papier px-3 py-2 text-sm text-encre placeholder:text-estompe focus:border-accent focus:outline-none"
              />

              {enCours ? (
                <button
                  type="button"
                  onClick={arreter}
                  className="shrink-0 cursor-pointer rounded-md border border-trait-fort bg-craie px-3 py-2 text-sm font-medium text-encre transition-colors duration-150 hover:border-accent hover:text-accent"
                >
                  Arrêter
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saisie.trim().length === 0}
                  aria-label="Envoyer la question"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md bg-encre text-papier transition-colors duration-150 hover:bg-encre-clair disabled:cursor-not-allowed disabled:bg-trait-fort disabled:text-craie"
                >
                  <IconeEnvoi />
                </button>
              )}
            </form>

            <p className="mt-2 text-[0.6875rem] leading-snug text-estompe">
              L’assistant peut se tromper — vérifiez les informations
              importantes. Ne saisissez aucune donnée personnelle d’élève.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
