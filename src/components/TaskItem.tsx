"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { ContactType } from "@/generated/prisma/enums";
import { CONTACT_TYPES, CONTACT_TYPE_ICONS, CONTACT_TYPE_LABELS } from "@/lib/domain";
import { completeTask, deleteScheduledTask, reopenTask } from "@/app/(app)/klanten/[id]/actions";

export interface TaskItemData {
  id: string;
  note: string;
  dueLabel: string;
  overdue: boolean;
  completed: boolean;
  completedLabel?: string | null;
  trainerName?: string | null;
  client?: { id: string; name: string; phone?: string | null } | null;
}

/**
 * Een geplande taak. "Afronden" klapt een paneel open waarmee de taak direct
 * kan worden omgezet in een gelogd contactmoment (of alleen afgerond).
 */
export default function TaskItem({ task }: { task: TaskItemData }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(task.note);
  const [pending, startTransition] = useTransition();

  function finish(type: ContactType | null) {
    startTransition(async () => {
      await completeTask(task.id, type, notes);
      setOpen(false);
    });
  }

  return (
    <li
      className={`rounded-xl border bg-white p-3 text-sm shadow-sm ${
        task.completed ? "border-slate-200 opacity-70" : task.overdue ? "border-red-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {task.client && (
              <Link href={`/klanten/${task.client.id}`} className="font-semibold text-slate-900 hover:underline">
                {task.client.name}
              </Link>
            )}
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${
                task.completed
                  ? "bg-slate-100 text-slate-500"
                  : task.overdue
                    ? "bg-red-100 text-red-700"
                    : "bg-sky-100 text-sky-700"
              }`}
            >
              {task.completed ? `Afgerond ${task.completedLabel ?? ""}` : task.dueLabel}
            </span>
            {task.trainerName && <span className="text-slate-500">· {task.trainerName}</span>}
          </div>
          <p className={`mt-1 text-slate-800 ${task.completed ? "line-through" : ""}`}>{task.note}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {task.completed ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => reopenTask(task.id))}
              className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
            >
              Heropenen
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="rounded-lg border border-emerald-600 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              ✓ Afronden
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm("Taak verwijderen?")) startTransition(() => deleteScheduledTask(task.id));
            }}
            aria-label="Taak verwijderen"
            className="rounded-lg px-1.5 py-1 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      </div>

      {open && !task.completed && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-600">Afronden en direct loggen als contactmoment:</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-2 block w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {CONTACT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                disabled={pending}
                onClick={() => finish(type)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50"
              >
                <span aria-hidden>{CONTACT_TYPE_ICONS[type]}</span>
                {CONTACT_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => finish(null)}
            className="mt-2 text-xs text-slate-500 hover:underline"
          >
            Alleen afronden, zonder contactmoment te loggen
          </button>
        </div>
      )}
    </li>
  );
}
