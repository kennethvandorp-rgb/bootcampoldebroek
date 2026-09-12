import type { ActionItem, Goal } from "@/generated/prisma/client";
import { formatDate } from "@/lib/domain";
import { deleteActionItem } from "../actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { SectionHeader, EmptyState } from "./ContactMomentsSection";
import ActionItemToggle from "./ActionItemToggle";

type ActionItemWithGoal = ActionItem & { goal: Goal | null };

export default function ActionItemsSection({
  clientId,
  actionItems,
}: {
  clientId: string;
  actionItems: ActionItemWithGoal[];
  goals: Goal[];
}) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Actiepunten"
        addHref={`/klanten/${clientId}/actiepunten/nieuw`}
        addLabel="Nieuw actiepunt"
      />

      {actionItems.length === 0 ? (
        <EmptyState text="Nog geen actiepunten vastgelegd." />
      ) : (
        <ul className="space-y-2">
          {actionItems.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <ActionItemToggle clientId={clientId} actionItemId={item.id} status={item.status} />
                  <div>
                    <p className={`font-medium text-slate-900 ${item.status === "AFGEROND" ? "line-through text-slate-400" : ""}`}>
                      {item.description}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.dueDate && <>Deadline: {formatDate(item.dueDate)} &middot; </>}
                      {item.goal && <>Doel: {item.goal.description}</>}
                    </p>
                  </div>
                </div>
                <form action={deleteActionItem.bind(null, clientId, item.id)}>
                  <ConfirmSubmitButton confirmMessage="Actiepunt verwijderen?">Verwijderen</ConfirmSubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
