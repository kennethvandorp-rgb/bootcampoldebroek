import FormCard from "@/components/FormCard";
import { TextField, TextAreaField, SubmitButton } from "@/components/fields";
import { createGoal } from "../../actions";

export default async function NewGoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <FormCard title="Nieuw doel" description="Leg een doel vast voor deze klant." backHref={`/klanten/${id}`}>
      <form action={createGoal.bind(null, id)} className="space-y-4">
        <TextAreaField label="Omschrijving" name="description" required placeholder="Bijv. 5 kg vetmassa verliezen" />
        <TextField label="Streefdatum" name="targetDate" type="date" />
        <SubmitButton label="Opslaan" />
      </form>
    </FormCard>
  );
}
