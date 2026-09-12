import type { Goal, ActionItem } from "@/generated/prisma/client";
import { formatDate } from "@/lib/domain";
import { deleteGoal } from "../actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { SectionHeader, EmptyState } from "./ContactMomentsSection";
import GoalStatusSelect from "./GoalStatusSelect";

type GoalWithActionItems = Goal & { actionItems: ActionItem[] };

export default function GoalsSection({ clientId, goals }: { clientId: string; goals: GoalWithActionItems[] }) {
  return (
    <section className="space-y-3">
      <SectionHeader title="Doelen" addHref={`/klanten/${clientId}/doelen/nieuw`} addLabel="Nieuw doel" />

      {goals.length === 0 ? (
        <EmptyState text="Nog geen doelen vastgelegd." />
      ) : (
        <ul className="space-y-2">
          {goals.map((goal) => (
            <li key={goal.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{goal.description}</p>
                  {goal.targetDate && (
                    <p className="mt-0.5 text-xs text-slate-500">Streefdatum: {formatDate(goal.targetDate)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <GoalStatusSelect clientId={clientId} goalId={goal.id} status={goal.status} />
                  <form action={deleteGoal.bind(null, clientId, goal.id)}>
                    <ConfirmSubmitButton confirmMessage="Doel verwijderen?">Verwijderen</ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
