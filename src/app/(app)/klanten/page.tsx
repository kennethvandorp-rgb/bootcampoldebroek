import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  countByStatus,
  effectiveTrainerId,
  getActiveTrainers,
  getClientsWithStatus,
  parseClientFilters,
  type ClientWithStatus,
} from "@/lib/queries";
import { CONTACT_TYPE_ICONS, CONTACT_TYPE_LABELS, describeDaysSince, formatDateTime } from "@/lib/domain";
import FilterBar from "@/components/FilterBar";
import ClientStatusBadge, { STATUS_STYLES } from "@/components/ClientStatusBadge";
import QuickLog from "@/components/QuickLog";

export default async function ClientsPage({ searchParams }: PageProps<"/klanten">) {
  const user = await requireUser();
  const filters = parseClientFilters(await searchParams);
  const trainerId = effectiveTrainerId(filters, user);

  const [clients, trainers] = await Promise.all([
    getClientsWithStatus({ trainerId, q: filters.q }),
    getActiveTrainers(),
  ]);

  const active = clients.filter((c) => c.active);
  const inactive = clients.filter((c) => !c.active);
  const shown = filters.status ? active.filter((c) => c.contactStatus.status === filters.status) : active;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Klanten</h1>
          <p className="mt-1 text-sm text-slate-500">
            {shown.length} van {active.length} actieve klanten in deze selectie
          </p>
        </div>
        <Link
          href="/klanten/nieuw"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          + Nieuwe klant
        </Link>
      </div>

      <FilterBar trainers={trainers} counts={countByStatus(active)} showSearch />

      <ClientList clients={shown} emptyText="Geen klanten gevonden in deze selectie." />

      {inactive.length > 0 && !filters.status && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-slate-900">Inactieve klanten</h2>
          <ClientList clients={inactive} emptyText="" />
        </section>
      )}
    </div>
  );
}

function ClientList({ clients, emptyText }: { clients: ClientWithStatus[]; emptyText: string }) {
  if (clients.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">{emptyText}</p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
      {clients.map((client) => {
        const last = client.contactMoments[0];
        return (
          <li key={client.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_STYLES[client.contactStatus.status].dot}`}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <Link href={`/klanten/${client.id}`} className="font-medium text-slate-900 hover:underline">
                {client.firstName} {client.lastName}
              </Link>
              <p className="truncate text-xs text-slate-500">
                <span className={STATUS_STYLES[client.contactStatus.status].text}>
                  {describeDaysSince(client.contactStatus.daysSinceContact)}
                </span>
                {last && (
                  <span title={formatDateTime(last.date)}>
                    {" "}
                    · {CONTACT_TYPE_ICONS[last.type]} {CONTACT_TYPE_LABELS[last.type]}
                  </span>
                )}
                <span className="hidden sm:inline">
                  {" "}
                  · {client.trainers.map((t) => t.trainer.name).join(", ") || "geen trainer"}
                </span>
              </p>
            </div>
            <div className="hidden md:block">
              <ClientStatusBadge status={client.contactStatus.status} />
            </div>
            <QuickLog clientId={client.id} clientName={client.firstName} />
          </li>
        );
      })}
    </ul>
  );
}
