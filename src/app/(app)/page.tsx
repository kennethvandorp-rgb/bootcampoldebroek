import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  countByStatus,
  effectiveTrainerId,
  getActiveTrainers,
  getClientsWithStatus,
  getDueTasks,
  getUpcomingTaskCount,
  parseClientFilters,
} from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { formatDateTime, GREEN_MAX_DAYS, ORANGE_MAX_DAYS, type ClientStatus } from "@/lib/domain";
import { toTaskItemData } from "@/lib/tasks";
import FilterBar from "@/components/FilterBar";
import ClientCard from "@/components/ClientCard";
import TaskItem from "@/components/TaskItem";
import { STATUS_STYLES } from "@/components/ClientStatusBadge";
import { triggerContactCheck } from "./actions";

export default async function DashboardPage({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  const filters = parseClientFilters(await searchParams);
  const trainerId = effectiveTrainerId(filters, user);

  const [clients, dueTasks, upcomingCount, trainers, lastRun] = await Promise.all([
    getClientsWithStatus({ trainerId, activeOnly: true }),
    getDueTasks(trainerId),
    getUpcomingTaskCount(trainerId),
    getActiveTrainers(),
    prisma.automationRun.findFirst({ orderBy: { runAt: "desc" } }),
  ]);

  const counts = countByStatus(clients);
  const attentionCount = counts.oranje + counts.rood;
  const shown = filters.status
    ? clients.filter((c) => c.contactStatus.status === filters.status)
    : clients.filter((c) => c.contactStatus.status !== "groen");
  const selectedTrainer = trainers.find((t) => t.id === trainerId);
  const scopeLabel = selectedTrainer
    ? trainerId === user.id
      ? "jouw klanten"
      : `klanten van ${selectedTrainer.name}`
    : "alle klanten";

  const todayLabel = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Amsterdam",
  }).format(new Date());

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">{todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)}</p>
        <h1 className="text-2xl font-semibold text-slate-900">Hoi {user.name.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">
          {attentionCount === 0
            ? `Alle ${scopeLabel} zijn recent gesproken. Goed bezig!`
            : `${attentionCount} van ${clients.length} ${scopeLabel} ${attentionCount === 1 ? "heeft" : "hebben"} aandacht nodig.`}
        </p>
      </div>

      <FilterBar trainers={trainers} counts={counts} />

      <div className="grid grid-cols-3 gap-3">
        <StatTile
          status="groen"
          label="Actief"
          hint={`< ${GREEN_MAX_DAYS} dagen`}
          value={counts.groen}
          active={filters.status === "groen"}
        />
        <StatTile
          status="oranje"
          label="Aandacht nodig"
          hint={`${GREEN_MAX_DAYS}–${ORANGE_MAX_DAYS} dagen`}
          value={counts.oranje}
          active={filters.status === "oranje"}
        />
        <StatTile
          status="rood"
          label="Actie vereist"
          hint={`> ${ORANGE_MAX_DAYS} dagen`}
          value={counts.rood}
          active={filters.status === "rood"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Vandaag te doen</h2>
            <span className="text-xs text-slate-500">
              {dueTasks.length} open{upcomingCount > 0 && ` · ${upcomingCount} gepland`}
            </span>
          </div>
          {dueTasks.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
              Geen taken voor vandaag. Plan vervolgcontacten in via de klantpagina.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {dueTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={toTaskItemData(task, { showClient: true, showTrainer: trainerId !== user.id })}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {filters.status ? `Status: ${STATUS_TITLES[filters.status]}` : "Klanten die aandacht nodig hebben"}
            </h2>
            <Link href="/klanten" className="text-xs font-medium text-emerald-700 hover:underline">
              Alle klanten →
            </Link>
          </div>
          {shown.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
              {clients.length === 0
                ? "Er zijn (nog) geen klanten in deze selectie."
                : "Niemand in deze selectie. 🎉"}
            </p>
          ) : (
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {shown.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-slate-900">Automatische controle</h2>
            {lastRun ? (
              <p className="mt-1 text-sm text-slate-500">
                Laatst gecontroleerd op {formatDateTime(lastRun.runAt)} — {lastRun.overdueCount} rood,{" "}
                {lastRun.dueSoonCount} oranje. {lastRun.notifiedByEmail ? "Waarschuwingsmail verzonden." : "Geen mail verzonden."}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">Nog niet eerder automatisch gecontroleerd.</p>
            )}
          </div>
          <form action={triggerContactCheck}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Controleer nu
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

const STATUS_TITLES: Record<ClientStatus, string> = {
  groen: "Actief (groen)",
  oranje: "Aandacht nodig (oranje)",
  rood: "Actie vereist (rood)",
};

function StatTile({
  status,
  label,
  hint,
  value,
  active,
}: {
  status: ClientStatus;
  label: string;
  hint: string;
  value: number;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-l-4 bg-white p-3 shadow-sm sm:p-4 ${STATUS_STYLES[status].border} ${
        active ? "border-slate-200 ring-2 ring-slate-900" : "border-slate-200"
      }`}
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold sm:text-3xl ${STATUS_STYLES[status].text}`}>{value}</p>
      <p className="text-[11px] text-slate-400">{hint}</p>
    </div>
  );
}
