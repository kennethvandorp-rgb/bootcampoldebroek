import type { ClientDetail } from "@/lib/queries";
import { toTaskItemData } from "@/lib/tasks";
import TaskItem from "@/components/TaskItem";
import { SectionHeader, EmptyState } from "./ContactMomentsSection";

/** Geplande vervolgcontacten en taken voor deze klant. */
export default function TasksSection({ clientId, tasks }: { clientId: string; tasks: ClientDetail["scheduledTasks"] }) {
  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed).sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0));

  return (
    <section className="space-y-3">
      <SectionHeader title="Geplande acties" addHref={`/klanten/${clientId}/taken/nieuw`} addLabel="Inplannen" />

      {open.length === 0 ? (
        <EmptyState text="Geen openstaande acties. Plan een vervolgcontact in zodat deze klant niet uit beeld raakt." />
      ) : (
        <ul className="space-y-2">
          {open.map((task) => (
            <TaskItem key={task.id} task={toTaskItemData(task, { showTrainer: true })} />
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">
            {done.length} afgeronde actie{done.length === 1 ? "" : "s"} tonen
          </summary>
          <ul className="mt-2 space-y-2">
            {done.map((task) => (
              <TaskItem key={task.id} task={toTaskItemData(task, { showTrainer: true })} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
