import Link from "next/link";
import { getClientsWithStatus, sortByUrgency } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { CONTACT_TYPE_LABELS, formatDate, formatDateTime } from "@/lib/domain";
import UrgencyBadge from "@/components/UrgencyBadge";
import { triggerContactCheck } from "./actions";

export default async function DashboardPage() {
  const clients = await getClientsWithStatus({ activeOnly: true });
  const sorted = sortByUrgency(clients);

  const overdue = sorted.filter((c) => c.contactStatus.urgency === "achterstallig");
  const never = sorted.filter((c) => c.contactStatus.urgency === "nooit");
  const dueSoon = sorted.filter((c) => c.contactStatus.urgency === "binnenkort");
  const onTrack = sorted.filter((c) => c.contactStatus.urgency === "op-schema");

  const attention = [...overdue, ...never, ...dueSoon];
  const lastRun = await prisma.automationRun.findFirst({ orderBy: { runAt: "desc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overzicht van contactmomenten met klanten (streefinterval elke 4-6 weken).
        </p>
      </div>

      {(overdue.length > 0 || never.length > 0) && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-800">
            ⚠ {overdue.length + never.length} klant{overdue.length + never.length === 1 ? "" : "en"} vraagt/vragen
            nu aandacht
          </p>
          <p className="mt-1 text-sm text-red-700">
            {overdue.length > 0 && `${overdue.length} achterstallig`}
            {overdue.length > 0 && never.length > 0 && " · "}
            {never.length > 0 && `${never.length} nog nooit benaderd`}
            . Bekijk de tabel hieronder om te zien wie er aan de beurt is.
          </p>
        </div>
      )}

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
                  <th className="px-4 py-2">Laatste contactmoment</th>
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
                      {client.contactStatus.lastContactType
                        ? `${CONTACT_TYPE_LABELS[client.contactStatus.lastContactType]} · ${formatDate(client.contactStatus.lastContactDate)}`
                        : "Nog geen contact"}
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

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-slate-900">Automatische controle</h2>
            {lastRun ? (
              <p className="mt-1 text-sm text-slate-500">
                Laatst gecontroleerd op {formatDateTime(lastRun.runAt)} — {lastRun.overdueCount} achterstallig,{" "}
                {lastRun.dueSoonCount} binnenkort, {lastRun.neverCount} nog nooit benaderd.{" "}
                {lastRun.notifiedByEmail ? "Waarschuwingsmail verzonden." : "Geen waarschuwingsmail verzonden."}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">Nog niet eerder automatisch gecontroleerd.</p>
            )}
          </div>
          <form action={triggerContactCheck}>
            <button
              type="submit"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Controleer nu
            </button>
          </form>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Koppel de endpoint <code>/api/cron/contact-check</code> aan een externe scheduler (bijv. cron-job.org of
          Vercel Cron) om dit dagelijks automatisch te laten lopen en een waarschuwingsmail te ontvangen. Zie de
          README voor instructies.
        </p>
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
