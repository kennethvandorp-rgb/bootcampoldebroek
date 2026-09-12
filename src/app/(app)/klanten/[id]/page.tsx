import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientDetail } from "@/lib/queries";
import { getContactStatus, formatDate } from "@/lib/domain";
import UrgencyBadge from "@/components/UrgencyBadge";
import ContactMomentsSection from "./_components/ContactMomentsSection";
import InBodySection from "./_components/InBodySection";
import NutritionSection from "./_components/NutritionSection";
import GoalsSection from "./_components/GoalsSection";
import ActionItemsSection from "./_components/ActionItemsSection";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientDetail(id);
  if (!client) notFound();

  const lastContact = client.contactMoments[0]?.date ?? null;
  const status = getContactStatus(lastContact, client.contactIntervalWeeks);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">
              {client.firstName} {client.lastName}
            </h1>
            {!client.active && (
              <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                Inactief
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Klant sinds {formatDate(client.startDate)} &middot; interval elke {client.contactIntervalWeeks} weken
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            {client.email && <span>{client.email}</span>}
            {client.phone && <span>{client.phone}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <UrgencyBadge urgency={status.urgency} />
          <Link
            href={`/klanten/${client.id}/bewerken`}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Bewerken
          </Link>
        </div>
      </div>

      {client.notes && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <p className="font-medium text-slate-500">Notities</p>
          <p className="mt-1 whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ContactMomentsSection clientId={client.id} contactMoments={client.contactMoments} />
        <InBodySection clientId={client.id} measurements={client.inBodyMeasurements} />
        <NutritionSection clientId={client.id} analyses={client.nutritionAnalyses} />
        <div className="space-y-8">
          <GoalsSection clientId={client.id} goals={client.goals} />
          <ActionItemsSection clientId={client.id} actionItems={client.actionItems} goals={client.goals} />
        </div>
      </div>
    </div>
  );
}
