/**
 * Pied de page du site : l’établissement, le référent numérique et le rappel
 * de la règle non négociable de la charte.
 * Composant serveur — aucun état, aucune interactivité.
 */
import { ETABLISSEMENT, LOCALISATION, REFERENT, SIGNATURE } from "@/content/site";

export default function PiedDePage() {
  return (
    <footer className="sans-impression mt-16 border-t border-trait bg-voile">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 md:gap-10">
        <section>
          <h2 className="font-serif text-sm text-encre">L’établissement</h2>
          <p className="mt-2 text-sm leading-relaxed text-graphite">
            {ETABLISSEMENT.nom}
            {LOCALISATION ? (
              <>
                <span aria-hidden="true" className="mx-1.5 text-trait-fort">
                  ·
                </span>
                {LOCALISATION}
              </>
            ) : null}
            <br />
            <span className="text-estompe">
              Sous tutelle des {ETABLISSEMENT.tutelle}
            </span>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-sm text-encre">Le site est animé par</h2>
          <p className="mt-2 text-sm leading-relaxed text-graphite">
            <span className="font-medium text-encre">{REFERENT.nom}</span>,{" "}
            {REFERENT.role}
            <br />
            <a
              href={`mailto:${REFERENT.courriel}`}
              className="break-words text-accent underline decoration-trait-fort underline-offset-2 transition-colors hover:text-accent-fort"
            >
              {REFERENT.courriel}
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-sm text-encre">
            La règle non négociable
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-graphite">
            Aucune donnée personnelle d’enfant dans un outil d’IA, quel que soit
            le compte. L’IA propose ; l’enseignant décide.
          </p>
        </section>
      </div>
      <div className="border-t border-trait">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-estompe sm:px-6">
          © {new Date().getFullYear()} {SIGNATURE} — {ETABLISSEMENT.nom}
          {LOCALISATION ? `, ${LOCALISATION}` : ""}.
        </p>
      </div>
    </footer>
  );
}
