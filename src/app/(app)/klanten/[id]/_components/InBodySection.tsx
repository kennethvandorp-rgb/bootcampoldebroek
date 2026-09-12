import type { InBodyMeasurement } from "@/generated/prisma/client";
import { formatDate } from "@/lib/domain";
import { deleteInBodyMeasurement } from "../actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { SectionHeader, EmptyState } from "./ContactMomentsSection";

export default function InBodySection({
  clientId,
  measurements,
}: {
  clientId: string;
  measurements: InBodyMeasurement[];
}) {
  return (
    <section className="space-y-3">
      <SectionHeader title="InBody-metingen" addHref={`/klanten/${clientId}/inbody/nieuw`} addLabel="Nieuwe meting" />

      {measurements.length === 0 ? (
        <EmptyState text="Nog geen InBody-metingen geregistreerd." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Datum</th>
                <th className="px-3 py-2">Gewicht</th>
                <th className="px-3 py-2">Spiermassa</th>
                <th className="px-3 py-2">Vet %</th>
                <th className="px-3 py-2">BMI</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {measurements.map((m) => (
                <tr key={m.id}>
                  <td className="px-3 py-2 text-slate-600">{formatDate(m.date)}</td>
                  <td className="px-3 py-2">{m.weightKg != null ? `${m.weightKg} kg` : "-"}</td>
                  <td className="px-3 py-2">{m.skeletalMuscleMassKg != null ? `${m.skeletalMuscleMassKg} kg` : "-"}</td>
                  <td className="px-3 py-2">{m.bodyFatPercent != null ? `${m.bodyFatPercent}%` : "-"}</td>
                  <td className="px-3 py-2">{m.bmi != null ? m.bmi : "-"}</td>
                  <td className="px-3 py-2 text-right">
                    <form action={deleteInBodyMeasurement.bind(null, clientId, m.id)}>
                      <ConfirmSubmitButton confirmMessage="Meting verwijderen?">Verwijderen</ConfirmSubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
