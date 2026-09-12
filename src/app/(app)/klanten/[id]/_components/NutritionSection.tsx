import type { NutritionAnalysis } from "@/generated/prisma/client";
import { formatDate } from "@/lib/domain";
import { deleteNutritionAnalysis } from "../actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { SectionHeader, EmptyState } from "./ContactMomentsSection";

export default function NutritionSection({
  clientId,
  analyses,
}: {
  clientId: string;
  analyses: NutritionAnalysis[];
}) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Voedingsanalyses"
        addHref={`/klanten/${clientId}/voeding/nieuw`}
        addLabel="Nieuwe analyse"
      />

      {analyses.length === 0 ? (
        <EmptyState text="Nog geen voedingsanalyses geregistreerd." />
      ) : (
        <ul className="space-y-2">
          {analyses.map((a) => (
            <li key={a.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs text-slate-400">{formatDate(a.date)}</span>
                  <p className="mt-1 font-medium text-slate-900">{a.summary}</p>
                  {(a.kcalTarget || a.proteinGrams || a.carbsGrams || a.fatGrams) && (
                    <p className="mt-1 text-slate-600">
                      {a.kcalTarget != null && `${a.kcalTarget} kcal`}
                      {a.proteinGrams != null && ` · ${a.proteinGrams}g eiwit`}
                      {a.carbsGrams != null && ` · ${a.carbsGrams}g koolhydraten`}
                      {a.fatGrams != null && ` · ${a.fatGrams}g vet`}
                    </p>
                  )}
                  {a.advice && <p className="mt-1 text-slate-600">{a.advice}</p>}
                </div>
                <form action={deleteNutritionAnalysis.bind(null, clientId, a.id)}>
                  <ConfirmSubmitButton confirmMessage="Analyse verwijderen?">Verwijderen</ConfirmSubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
