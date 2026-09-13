"use client";

import BoutonCopier from "@/components/ui/BoutonCopier";
import type { Bloc } from "@/content/types";

type BlocRequete = Extract<Bloc, { type: "requete" }>;

interface ProprietesRequete {
  bloc: BlocRequete;
}

/**
 * Requête prête à l’emploi, à copier telle quelle dans ChatGPT ou NotebookLM.
 * Le texte reste en fonte à chasse fixe : ce que l’on voit est exactement ce
 * que l’on colle.
 */
export default function Requete({ bloc }: ProprietesRequete) {
  return (
    <div className="my-6">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
        {bloc.titre ? (
          <p className="font-serif text-base font-semibold text-encre">
            {bloc.titre}
          </p>
        ) : (
          <span />
        )}
        <BoutonCopier texte={bloc.texte} />
      </div>

      <p className="rounded-r-lg border-l-[3px] border-accent bg-voile px-4 py-3 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap text-encre">
        {bloc.texte}
      </p>

      {bloc.commentaire ? (
        <p className="mt-2 text-sm text-graphite italic">{bloc.commentaire}</p>
      ) : null}
    </div>
  );
}
