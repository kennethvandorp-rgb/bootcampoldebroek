import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FormCard from "@/components/FormCard";
import { TextField, TextAreaField, SelectField, SubmitButton } from "@/components/fields";
import { createActionItem } from "../../actions";

export default async function NewActionItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: { goals: { orderBy: { createdAt: "desc" } } },
  });
  if (!client) notFound();

  return (
    <FormCard title="Nieuw actiepunt" description="Leg een actiepunt vast voor deze klant." backHref={`/klanten/${id}`}>
      <form action={createActionItem.bind(null, id)} className="space-y-4">
        <TextAreaField label="Omschrijving" name="description" required placeholder="Bijv. dagelijks eiwitinname bijhouden" />
        <TextField label="Deadline" name="dueDate" type="date" />
        {client.goals.length > 0 && (
          <SelectField
            label="Gekoppeld doel (optioneel)"
            name="goalId"
            options={[{ value: "", label: "Geen" }, ...client.goals.map((g) => ({ value: g.id, label: g.description }))]}
          />
        )}
        <SubmitButton label="Opslaan" />
      </form>
    </FormCard>
  );
}
