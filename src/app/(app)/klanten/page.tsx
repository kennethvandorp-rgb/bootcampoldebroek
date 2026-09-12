import Link from "next/link";
import { getClientsWithStatus, sortByUrgency } from "@/lib/queries";
import { formatDate } from "@/lib/domain";
import UrgencyBadge from "@/components/UrgencyBadge";

export default async function ClientsPage() {
  const clients = await getClientsWithStatus();
  const active = sortByUrgency(clients.filter((c) => c.active));
  const inactive = clients.filter((c) => !c.active);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Klanten</h1>
          <p className="mt-1 text-sm text-slate-500">{active.length} actieve klanten</p>
        </div>
        <Link
          href="/klanten/nieuw"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Nieuwe klant
        </Link>
      </div>

      <ClientTable clients={active} />

      {inactive.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-slate-900">Inactieve klanten</h2>
          <ClientTable clients={inactive} />
        </section>
      )}
    </div>
  );
}

function ClientTable({ clients }: { clients: Awaited<ReturnType<typeof getClientsWithStatus>> }) {
  if (clients.length === 0) {
    return <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">Geen klanten.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2">Naam</th>
            <th className="px-4 py-2">Laatste contact</th>
            <th className="px-4 py-2">Interval</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-slate-50">
              <td className="px-4 py-2">
                <Link href={`/klanten/${client.id}`} className="font-medium text-slate-900 hover:underline">
                  {client.firstName} {client.lastName}
                </Link>
              </td>
              <td className="px-4 py-2 text-slate-600">{formatDate(client.contactStatus.lastContactDate)}</td>
              <td className="px-4 py-2 text-slate-600">elke {client.contactIntervalWeeks} weken</td>
              <td className="px-4 py-2">
                <UrgencyBadge urgency={client.contactStatus.urgency} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
