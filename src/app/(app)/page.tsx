import Link from "next/link";
import { getClientsWithStatus, sortByUrgency } from "@/lib/queries";
import { formatDate } from "@/lib/domain";
import UrgencyBadge from "@/components/UrgencyBadge";

export default async function DashboardPage() {
  const clients = await getClientsWithStatus({ activeOnly: true });
  const sorted = sortByUrgency(clients);

  const overdue = sorted.filter((c) => c.contactStatus.urgency === "achterstallig");
  const never = sorted.filter((c) => c.contactStatus.urgency === "nooit");
  const dueSoon = sorted.filter((c) => c.contactStatus.urgency === "binnenkort");
  const onTrack = sorted.filter((c) => c.contactStatus.urgency === "op-schema");

  const attention = [...overdue, ...never, ...dueSoon];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overzicht van contactmomenten met klanten (streefinterval elke 4-6 weken).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Actieve klanten" value={clients.length} />
        <StatCard label="Achterstallig" value={overdue.length} accent="text-red-600" />
        <StatCard label="Binnenkort" value={dueSoon.length} accent="text-amber-600" />
        <StatCard label="Op schema" value={onTrack.length} accent="text-green-600" />
      </div>

      <section>
        <h2 className="text-lg font-medium text-slate-900">Vraagt aandacht</h2>
        <p className="text-sm text-slate-500">
          Klanten die achterstallig zijn, binnenkort een contactmoment nodig hebben, of nog nooit zijn benaderd.
        </p>

        {attention.length === 0 ? (
          <p className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Niemand vraagt op dit moment aandacht. Goed bezig!
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Klant</th>
                  <th className="px-4 py-2">Laatste contact</th>
                  <th className="px-4 py-2">Streefdatum</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attention.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <Link href={`/klanten/${client.id}`} className="font-medium text-slate-900 hover:underline">
                        {client.firstName} {client.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {formatDate(client.contactStatus.lastContactDate)}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{formatDate(client.contactStatus.dueDate)}</td>
                    <td className="px-4 py-2">
                      <UrgencyBadge urgency={client.contactStatus.urgency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${accent ?? "text-slate-900"}`}>{value}</p>
    </div>
  );
}
