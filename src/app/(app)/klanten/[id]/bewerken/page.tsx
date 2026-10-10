import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveTrainers } from "@/lib/queries";
import ClientForm from "@/components/ClientForm";
import FormCard from "@/components/FormCard";
import { updateClient } from "../../actions";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [client, trainers] = await Promise.all([
    prisma.client.findUnique({ where: { id }, include: { trainers: true } }),
    getActiveTrainers(),
  ]);
  if (!client) notFound();

  return (
    <FormCard title="Klant bewerken" backHref={`/klanten/${id}`}>
      <ClientForm
        action={updateClient.bind(null, id)}
        initial={client}
        trainers={trainers}
        selectedTrainerIds={client.trainers.map((t) => t.trainerId)}
        submitLabel="Opslaan"
        showActiveToggle
      />
    </FormCard>
  );
}
