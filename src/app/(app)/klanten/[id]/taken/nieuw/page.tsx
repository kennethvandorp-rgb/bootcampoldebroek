import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getActiveTrainers } from "@/lib/queries";
import FormCard from "@/components/FormCard";
import { SelectField, SubmitButton } from "@/components/fields";
import { DueDateField, NoteWithSuggestions } from "@/components/QuickPickFields";
import { dayKeyInDays as inDays } from "@/lib/domain";
import { createScheduledTask } from "../../actions";

const SUGGESTIONS = [
  "InBody nameting inplannen",
  "Checken hoe de spierpijn is",
  "Voedingsdagboek doornemen",
  "Appje: hoe ging de training?",
];

export default async function NewScheduledTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const [client, trainers] = await Promise.all([
    prisma.client.findUnique({ where: { id }, select: { firstName: true, lastName: true } }),
    getActiveTrainers(),
  ]);
  if (!client) notFound();

  return (
    <FormCard
      title="Vervolgcontact of taak inplannen"
      description={`Op de streefdatum verschijnt dit op de takenlijst van de gekozen trainer (${client.firstName} ${client.lastName}).`}
      backHref={`/klanten/${id}`}
    >
      <form action={createScheduledTask.bind(null, id)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DueDateField
            defaultValue={inDays(7)}
            options={[
              { label: "Morgen", value: inDays(1) },
              { label: "Over 3 dagen", value: inDays(3) },
              { label: "Over 1 week", value: inDays(7) },
              { label: "Over 2 weken", value: inDays(14) },
              { label: "Over 4 weken", value: inDays(28) },
            ]}
          />
          <SelectField
            label="Toegewezen trainer"
            name="trainerId"
            defaultValue={user.id}
            options={trainers.map((t) => ({ value: t.id, label: t.name }))}
          />
        </div>
        <NoteWithSuggestions suggestions={SUGGESTIONS} />
        <SubmitButton label="Inplannen" />
      </form>
    </FormCard>
  );
}
