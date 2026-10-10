import ClientForm from "@/components/ClientForm";
import FormCard from "@/components/FormCard";
import { requireUser } from "@/lib/auth";
import { getActiveTrainers } from "@/lib/queries";
import { createClient } from "../actions";

export default async function NewClientPage() {
  const user = await requireUser();
  const trainers = await getActiveTrainers();

  return (
    <FormCard title="Nieuwe klant" description="Voeg een nieuwe klant toe en wijs één of meer trainers toe." backHref="/klanten">
      <ClientForm action={createClient} trainers={trainers} selectedTrainerIds={[user.id]} submitLabel="Klant toevoegen" />
    </FormCard>
  );
}
