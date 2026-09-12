import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientForm from "@/components/ClientForm";
import FormCard from "@/components/FormCard";
import { updateClient } from "../../actions";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();

  return (
    <FormCard title="Klant bewerken" backHref={`/klanten/${id}`}>
      <ClientForm action={updateClient.bind(null, id)} initial={client} submitLabel="Opslaan" showActiveToggle />
    </FormCard>
  );
}
