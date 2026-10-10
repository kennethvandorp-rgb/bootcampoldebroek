import type { InBodyMeasurement } from "@/generated/prisma/client";
import { formatDate } from "@/lib/domain";
import { deleteInBodyMeasurement } from "../actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { SectionHeader, EmptyState } from "./ContactMomentsSection";

/** InBody-historie met verschil t.o.v. de vorige meting. */
export default function InBodySection({
  clientId,
  measurements,
}: {
  clientId: string;
  measurements: InBodyMeasurement[];
}) {
  return (
    <section className="space-y-3">
      <SectionHeader title="InBody-historie" addHref={`/klanten/${clientId}/inbody/nieuw`} addLabel="Nieuwe meting" />

      {measurements.length === 0 ? (
        <EmptyState text="Nog geen InBody-metingen geregistreerd." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Datum</th>
                <th className="px-3 py-2">Gewicht</th>
                <th className="px-3 py-2">Spier</th>
                <th className="px-3 py-2">Vet %</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {measurements.map((m, i) => {
                const prev = measurements[i + 1];
                return (
                  <tr key={m.id}>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-600">{formatDate(m.date)}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <Value value={m.weightKg} unit=" kg" prev={prev?.weightKg} neutral />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <Value value={m.skeletalMuscleMassKg} unit=" kg" prev={prev?.skeletalMuscleMassKg} higherIsBetter />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <Value value={m.bodyFatPercent} unit="%" prev={prev?.bodyFatPercent} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <form action={deleteInBodyMeasurement.bind(null, clientId, m.id)}>
                        <ConfirmSubmitButton
                          confirmMessage="Meting verwijderen?"
                          className="rounded px-1.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          ✕
                        </ConfirmSubmitButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Value({
  value,
  unit,
  prev,
  higherIsBetter,
  neutral,
}: {
  value: number | null;
  unit: string;
  prev?: number | null;
  higherIsBetter?: boolean;
  /** Geen goed/slecht-kleur (bijv. gewicht, afhankelijk van het doel). */
  neutral?: boolean;
}) {
  if (value == null) return <span className="text-slate-400">-</span>;
  const diff = prev != null ? Math.round((value - prev) * 10) / 10 : null;
  const good = diff != null && diff !== 0 && (higherIsBetter ? diff > 0 : diff < 0);
  return (
    <span>
      {value}
      {unit}
      {diff != null && diff !== 0 && (
        <span className={`ml-1 text-xs ${neutral ? "text-slate-500" : good ? "text-emerald-600" : "text-red-600"}`}>
          {diff > 0 ? "+" : ""}
          {diff}
        </span>
      )}
    </span>
  );
}
