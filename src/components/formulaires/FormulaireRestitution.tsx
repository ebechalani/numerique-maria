"use client";

/**
 * Trame de restitution de l’atelier ACTIF, déposée sur le site.
 *
 * Seul formulaire du site où une identité peut apparaître, et seulement celle
 * des adultes, saisie volontairement : le champ « membres du groupe ». Les
 * prénoms suffisent, l’aide du champ le dit. Rien n’invite à saisir une donnée
 * d’élève, et le rappel figure sous le bouton d’envoi.
 *
 * Un même groupe peut déposer plusieurs contributions au cours de la séance :
 * après un envoi réussi, le formulaire se rouvre à vide — en conservant les
 * membres déjà saisis, qui ne changent pas d’une contribution à l’autre.
 */

import Link from "next/link";
import type { FormEvent } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  EtiquetteChamp,
  MentionObligatoire,
  MessageErreur,
  OptionCliquable,
} from "@/components/formulaires/Champs";
import { CLE_BROUILLON_RESTITUTION } from "@/components/interactif/Exercice";
import type { ChampRestitution } from "@/content/types";
import { useEtatLocal } from "@/lib/progression";

/** Référence stable pour le hook de stockage. */
const AUCUN_BROUILLON: Record<string, string> = {};

interface Proprietes {
  champs: ChampRestitution[];
  formation: string;
}

type EtatEnvoi = "repos" | "envoi" | "succes";

interface Echec {
  message: string;
  reessayable: boolean;
}

const MESSAGE_GENERIQUE =
  "L’envoi n’a pas abouti. Vérifiez votre connexion, puis réessayez.";

/** Longueurs maximales : une ligne de saisie, une zone de texte. */
const LIMITE_COURTE = 200;
const LIMITE_LONGUE = 2000;

/** Au-delà, le compteur de caractères apparaît. */
const SEUIL_COMPTEUR = 400;

/** Aide par défaut du champ « membres », si le contenu n’en fournit pas. */
const AIDE_MEMBRES =
  "Les prénoms suffisent : inutile d’indiquer les noms complets.";

/** Un champ nomme-t-il les membres du groupe ? */
function estChampMembres(champ: ChampRestitution): boolean {
  return /membre/i.test(champ.id);
}

function aideDuChamp(champ: ChampRestitution): string | undefined {
  if (champ.aide) return champ.aide;
  return estChampMembres(champ) ? AIDE_MEMBRES : undefined;
}

/* ------------------------------------------------------------------ */
/* Icônes                                                              */
/* ------------------------------------------------------------------ */

function IconeValide() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-6 w-6 shrink-0 text-accent"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.25 2.75 2.75L16 9.5" />
    </svg>
  );
}

function IconeAlerte() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0"
    >
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 6.25v4.5" />
      <path d="M10 13.5h.01" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Un champ de la trame                                                */
/* ------------------------------------------------------------------ */

interface ProprietesChampTrame {
  champ: ChampRestitution;
  valeur: string;
  onChange: (valeur: string) => void;
  erreur?: string;
  id: string;
}

function ChampTrame({
  champ,
  valeur,
  onChange,
  erreur,
  id,
}: ProprietesChampTrame) {
  const idAide = `${id}-aide`;
  const idCompteur = `${id}-compteur`;
  const idErreur = `${id}-erreur`;

  const aide = aideDuChamp(champ);
  const longueur = valeur.length;
  const compteurVisible = champ.type === "texte-long" && longueur > SEUIL_COMPTEUR;

  const decritPar =
    [
      aide ? idAide : null,
      compteurVisible ? idCompteur : null,
      erreur ? idErreur : null,
    ]
      .filter((partie): partie is string => partie !== null)
      .join(" ") || undefined;

  /* --- Choix : mêmes zones cliquables que les questionnaires --- */
  if (champ.type === "choix") {
    const options = champ.options ?? [];
    return (
      <fieldset
        role="radiogroup"
        aria-describedby={erreur ? idErreur : undefined}
        aria-invalid={erreur ? true : undefined}
      >
        <legend className="font-serif text-base font-semibold text-encre sm:text-lg">
          {champ.libelle}
          {champ.obligatoire ? <MentionObligatoire /> : null}
        </legend>

        {aide ? (
          <p id={idAide} className="mt-1 text-sm text-graphite">
            {aide}
          </p>
        ) : null}

        <div
          className={[
            "mt-3 space-y-2",
            erreur ? "border-l-2 border-encre-clair pl-3" : "",
          ].join(" ")}
        >
          {options.map((option, rang) => (
            <OptionCliquable
              key={rang}
              type="radio"
              nom={`${id}-choix`}
              libelle={option}
              coche={valeur === option}
              onChange={() => onChange(option)}
              id={rang === 0 ? id : undefined}
              decritPar={decritPar}
              invalide={Boolean(erreur)}
            />
          ))}
        </div>

        {erreur ? <MessageErreur id={idErreur} texte={erreur} /> : null}
      </fieldset>
    );
  }

  const classesSaisie = [
    "mt-3 block w-full rounded-md border bg-papier px-3 py-2 leading-relaxed text-encre placeholder:text-estompe focus:outline-none",
    erreur ? "border-encre-clair" : "border-trait focus:border-accent",
  ].join(" ");

  return (
    <div>
      <EtiquetteChamp
        htmlFor={id}
        libelle={champ.libelle}
        obligatoire={champ.obligatoire}
      />

      {aide ? (
        <p id={idAide} className="mt-1 text-sm text-graphite">
          {aide}
        </p>
      ) : null}

      {champ.type === "texte-long" ? (
        <textarea
          id={id}
          rows={4}
          value={valeur}
          maxLength={LIMITE_LONGUE}
          onChange={(evenement) => onChange(evenement.target.value)}
          aria-describedby={decritPar}
          aria-invalid={erreur ? true : undefined}
          className={`${classesSaisie} resize-y`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={valeur}
          maxLength={LIMITE_COURTE}
          onChange={(evenement) => onChange(evenement.target.value)}
          aria-describedby={decritPar}
          aria-invalid={erreur ? true : undefined}
          className={classesSaisie}
        />
      )}

      {compteurVisible ? (
        <p
          id={idCompteur}
          className="mt-1 text-right font-mono text-xs tabular-nums text-estompe"
        >
          {longueur} / {LIMITE_LONGUE} caractères
        </p>
      ) : null}

      {erreur ? <MessageErreur id={idErreur} texte={erreur} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Formulaire                                                          */
/* ------------------------------------------------------------------ */

export default function FormulaireRestitution({
  champs,
  formation,
}: Proprietes) {
  const base = useId();
  const idBloc = (champ: string) => `${base}-bloc-${champ}`;
  const idChamp = (champ: string) => `${base}-champ-${champ}`;

  /**
   * Mur des contributions de la formation, alimenté par les dépôts.
   * Chemin exact de la page : elle vit sous « participer/restitution », à côté
   * de ce formulaire — c’est la route rendue par
   * src/app/formations/[formation]/participer/restitution/contributions.
   */
  const lienMur = `/formations/${formation}/participer/restitution/contributions`;

  const [saisies, setSaisies] = useState<Record<string, string>>({});
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [etat, setEtat] = useState<EtatEnvoi>("repos");
  const [echec, setEchec] = useState<Echec | null>(null);

  /**
   * Champ vers lequel amener l’attention. Passer par un état garantit que le
   * rendu portant les messages d’erreur est posé avant qu’on y saute, y compris
   * quand l’onglet est en arrière-plan — où requestAnimationFrame ne serait
   * jamais appelé. Le jeton distingue deux demandes visant le même champ.
   */
  const [cible, setCible] = useState<{ id: string; jeton: number } | null>(
    null,
  );
  const prochainJeton = useRef(0);

  /** Garde synchrone : un double clic ne déclenche pas deux dépôts. */
  const envoiEnCours = useRef(false);
  const titreSucces = useRef<HTMLHeadingElement>(null);

  const fautives = champs.filter((champ) => erreurs[champ.id] !== undefined);

  useEffect(() => {
    if (etat === "succes") titreSucces.current?.focus();
  }, [etat]);

  /*
   * Reprise des réponses de l’exercice « Votre atelier, pas à pas » (module 5),
   * conservées dans le navigateur sous les mêmes identifiants de champ. Elles
   * servent de valeurs de départ ; ce que l’enseignant saisit ici prime. Après
   * un dépôt, la contribution suivante repart à vide.
   */
  const [brouillon] = useEtatLocal<Record<string, string>>(
    CLE_BROUILLON_RESTITUTION,
    AUCUN_BROUILLON,
  );
  const [brouillonIgnore, setBrouillonIgnore] = useState(false);

  const reprises = useMemo(() => {
    const valeurs: Record<string, string> = {};
    if (brouillonIgnore || typeof brouillon !== "object" || brouillon === null) {
      return valeurs;
    }
    for (const champ of champs) {
      const valeur = (brouillon as Record<string, unknown>)[champ.id];
      if (typeof valeur === "string" && valeur.trim().length > 0) {
        valeurs[champ.id] = valeur;
      }
    }
    return valeurs;
  }, [brouillon, brouillonIgnore, champs]);

  const reprisDeLAtelier = Object.keys(reprises).length > 0;

  /** Valeurs affichées et envoyées : le brouillon repris, recouvert par la saisie. */
  const valeurs: Record<string, string> = { ...reprises, ...saisies };

  const definirSaisie = useCallback((id: string, valeur: string) => {
    setSaisies((precedentes) => ({ ...precedentes, [id]: valeur }));
    setErreurs((precedentes) => {
      if (precedentes[id] === undefined) return precedentes;
      const suite = { ...precedentes };
      delete suite[id];
      return suite;
    });
  }, []);

  /** Demande le déplacement de l’attention vers un champ. */
  const viser = useCallback((id: string) => {
    prochainJeton.current += 1;
    setCible({ id, jeton: prochainJeton.current });
  }, []);

  useEffect(() => {
    if (cible === null) return;
    document
      .getElementById(`${base}-bloc-${cible.id}`)
      ?.scrollIntoView({ block: "start" });
    const champ = document.getElementById(`${base}-champ-${cible.id}`);
    if (champ instanceof HTMLElement) champ.focus({ preventScroll: true });
  }, [base, cible]);

  /** Rouvre le formulaire à vide, en gardant les membres déjà saisis. */
  function deposerUneAutre() {
    const membres = champs.filter(estChampMembres);
    const conserves: Record<string, string> = {};
    for (const champ of membres) {
      const valeur = valeurs[champ.id];
      if (valeur !== undefined) conserves[champ.id] = valeur;
    }
    setBrouillonIgnore(true);
    setSaisies(conserves);
    setErreurs({});
    setEchec(null);
    setEtat("repos");
  }

  async function envoyer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    if (envoiEnCours.current) return;

    const manquants = champs.filter(
      (champ) =>
        champ.obligatoire && (valeurs[champ.id] ?? "").trim().length === 0,
    );

    if (manquants.length > 0) {
      const nouvelles: Record<string, string> = {};
      for (const champ of manquants) {
        nouvelles[champ.id] =
          champ.type === "choix"
            ? "Choisissez une réponse."
            : "Complétez ce champ.";
      }
      setErreurs(nouvelles);
      setEchec(null);
      viser(manquants[0].id);
      return;
    }

    // Seuls les champs déclarés partent au serveur, texte élagué, vides écartés.
    const charge: Record<string, string> = {};
    for (const champ of champs) {
      const valeur = (valeurs[champ.id] ?? "").trim();
      if (valeur.length > 0) charge[champ.id] = valeur;
    }

    envoiEnCours.current = true;
    setEtat("envoi");
    setEchec(null);

    try {
      const reponse = await fetch("/api/restitutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formation, champs: charge }),
      });

      if (reponse.ok) {
        setEtat("succes");
        return;
      }

      if (reponse.status === 409) {
        setEchec({
          message: "La collecte est fermée pour cette session.",
          reessayable: false,
        });
      } else if (reponse.status === 503) {
        setEchec({
          message: "La collecte n’est pas configurée sur ce site.",
          reessayable: false,
        });
      } else {
        setEchec({ message: MESSAGE_GENERIQUE, reessayable: true });
      }
      setEtat("repos");
    } catch {
      setEchec({ message: MESSAGE_GENERIQUE, reessayable: true });
      setEtat("repos");
    } finally {
      envoiEnCours.current = false;
    }
  }

  /* ---------------------------------------------------------------- */
  /* Contribution déposée                                              */
  /* ---------------------------------------------------------------- */

  if (etat === "succes") {
    return (
      <section
        role="status"
        className="rounded-lg border border-accent bg-accent-voile p-5 sm:p-6"
      >
        <div className="flex gap-3 sm:gap-4">
          <IconeValide />
          <div className="min-w-0 flex-1">
            {/*
              Niveau 2 : ce bloc remplace le formulaire, il est donc au même
              rang que les sections de la page, dont le titre est le h1.
            */}
            <h2
              ref={titreSucces}
              tabIndex={-1}
              className="font-serif text-lg font-semibold text-encre focus:outline-none"
            >
              Contribution déposée
            </h2>
            <p className="mt-2 text-encre-clair">
              Elle rejoint le mur des contributions de la formation, projeté
              lors de la restitution éclair.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={deposerUneAutre}
                className="cursor-pointer rounded-md border border-trait-fort bg-craie px-4 py-2 text-sm font-medium text-encre transition-colors duration-150 hover:border-accent hover:text-accent"
              >
                Déposer une autre contribution
              </button>
              <Link
                href={lienMur}
                className="text-sm font-medium text-accent underline underline-offset-4 transition-colors duration-150 hover:text-accent-fort"
              >
                Voir le mur des contributions
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Formulaire                                                        */
  /* ---------------------------------------------------------------- */

  const enCours = etat === "envoi";
  const bloque = echec !== null && !echec.reessayable;

  return (
    <form
      noValidate
      onSubmit={envoyer}
      aria-label="Trame de restitution"
      className="space-y-6"
    >
      {reprisDeLAtelier ? (
        <p
          role="status"
          className="rounded-lg border border-accent bg-accent-voile p-4 text-sm text-encre-clair"
        >
          Vos réponses de l’exercice « Votre atelier, pas à pas » ont été
          reprises. Relisez-les, complétez les membres du groupe, puis déposez.
        </p>
      ) : null}

      {fautives.length > 0 ? (
        <div
          role="alert"
          className="rounded-lg border border-encre-clair bg-voile p-4"
        >
          <p className="font-semibold text-encre">
            {fautives.length === 1
              ? "Un champ obligatoire attend encore d’être renseigné."
              : `${fautives.length} champs obligatoires attendent encore d’être renseignés.`}
          </p>
          <ul className="mt-2 space-y-1">
            {fautives.map((champ) => (
              <li key={champ.id}>
                <button
                  type="button"
                  onClick={() => viser(champ.id)}
                  className="cursor-pointer text-left text-sm text-accent underline underline-offset-4 transition-colors duration-150 hover:text-accent-fort"
                >
                  {champ.libelle}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ol className="space-y-4">
        {champs.map((champ, rang) => (
          <li
            key={champ.id}
            id={idBloc(champ.id)}
            className="scroll-mt-28 rounded-lg border border-trait bg-craie p-4 sm:p-5"
          >
            <div className="flex gap-3 sm:gap-4">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-trait bg-voile font-mono text-xs tabular-nums text-graphite"
              >
                {rang + 1}
              </span>

              <div className="min-w-0 flex-1">
                <ChampTrame
                  champ={champ}
                  valeur={valeurs[champ.id] ?? ""}
                  onChange={(valeur) => definirSaisie(champ.id, valeur)}
                  erreur={erreurs[champ.id]}
                  id={idChamp(champ.id)}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>

      {echec ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-encre-clair bg-voile p-4 font-medium text-encre"
        >
          <IconeAlerte />
          <span>{echec.message}</span>
        </p>
      ) : null}

      <div className="space-y-3 rounded-lg border border-trait bg-voile p-4 sm:p-5">
        <button
          type="submit"
          disabled={enCours || bloque}
          aria-busy={enCours}
          className="w-full cursor-pointer rounded-md bg-accent px-5 py-2.5 font-medium text-craie transition-colors duration-150 hover:bg-accent-fort disabled:cursor-default disabled:bg-estompe sm:w-auto"
        >
          {enCours ? "Envoi en cours…" : "Déposer la contribution"}
        </button>

        <p className="text-xs leading-relaxed text-graphite">
          Cette contribution est lue et projetée en salle. N’y saisissez aucune
          donnée personnelle d’élève — nom, classe, note, situation — ni aucun
          extrait de copie. Les prénoms des membres du groupe suffisent.
        </p>
      </div>
    </form>
  );
}
