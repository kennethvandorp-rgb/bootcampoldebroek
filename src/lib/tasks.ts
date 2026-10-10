import { dayKey, dueDateKey, formatDate, formatDueDate } from "@/lib/domain";
import type { TaskItemData } from "@/components/TaskItem";

interface TaskLike {
  id: string;
  note: string;
  dueDate: Date;
  completed: boolean;
  completedAt: Date | null;
  trainer?: { name: string } | null;
  client?: { id: string; firstName: string; lastName: string; phone?: string | null } | null;
}

/** Zet een taak uit de database om naar de props voor <TaskItem>. */
export function toTaskItemData(task: TaskLike, options: { showTrainer?: boolean; showClient?: boolean } = {}): TaskItemData {
  const today = dayKey();
  const due = dueDateKey(task.dueDate);
  const overdue = !task.completed && due < today;

  let dueLabel: string;
  if (due === today) dueLabel = "Vandaag";
  else if (overdue) dueLabel = `Te laat · ${formatDueDate(task.dueDate)}`;
  else dueLabel = formatDueDate(task.dueDate);

  return {
    id: task.id,
    note: task.note,
    dueLabel,
    overdue,
    completed: task.completed,
    completedLabel: task.completedAt ? formatDate(task.completedAt) : null,
    trainerName: options.showTrainer ? (task.trainer?.name ?? null) : null,
    client:
      options.showClient && task.client
        ? { id: task.client.id, name: `${task.client.firstName} ${task.client.lastName}`, phone: task.client.phone }
        : null,
  };
}
