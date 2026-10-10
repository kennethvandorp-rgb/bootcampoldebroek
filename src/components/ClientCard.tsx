import Link from "next/link";
import type { ClientWithStatus } from "@/lib/queries";
import { CONTACT_TYPE_ICONS, CONTACT_TYPE_LABELS, describeDaysSince, formatDueDate } from "@/lib/domain";
import ClientStatusBadge, { STATUS_STYLES } from "@/components/ClientStatusBadge";
import QuickLog from "@/components/QuickLog";

export default function ClientCard({ client }: { client: ClientWithStatus }) {
  const { contactStatus } = client;
  const last = client.contactMoments[0];
  const nextTask = client.scheduledTasks[0];
  const name = `${client.firstName} ${client.lastName}`;

  return (
    <li
      className={`flex flex-col justify-between gap-3 rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm ${STATUS_STYLES[contactStatus.status].border}`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <Link href={`/klanten/${client.id}`} className="min-w-0 font-semibold text-slate-900 hover:underline">
            <span className="block truncate">{name}</span>
          </Link>
          <ClientStatusBadge status={contactStatus.status} />
        </div>

        <p className={`mt-1 text-sm font-medium ${STATUS_STYLES[contactStatus.status].text}`}>
          {describeDaysSince(contactStatus.daysSinceContact)}
          {last && (
            <span className="font-normal text-slate-500">
              {" "}
              · {CONTACT_TYPE_ICONS[last.type]} {CONTACT_TYPE_LABELS[last.type]}
            </span>
          )}
        </p>

        {nextTask && (
          <p className="mt-1 truncate text-xs text-slate-500" title={nextTask.note}>
            📅 {formatDueDate(nextTask.dueDate)}: {nextTask.note}
          </p>
        )}

        <p className="mt-2 truncate text-xs text-slate-400">
          {client.trainers.length > 0 ? client.trainers.map((t) => t.trainer.name).join(", ") : "Geen trainer gekoppeld"}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {client.phone && (
            <a
              href={`https://wa.me/${client.phone.replace(/[^\d]/g, "").replace(/^0/, "31")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100"
              aria-label={`WhatsApp ${name}`}
              title="Open WhatsApp"
            >
              💬
            </a>
          )}
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100"
              aria-label={`Bel ${name}`}
              title="Bellen"
            >
              📞
            </a>
          )}
        </div>
        <QuickLog clientId={client.id} clientName={client.firstName} />
      </div>
    </li>
  );
}
