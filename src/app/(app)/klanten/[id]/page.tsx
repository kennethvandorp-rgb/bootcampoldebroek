import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getClientDetail } from "@/lib/queries";
import { getContactStatus, formatDate, describeDaysSince } from "@/lib/domain";
import ClientStatusBadge, { STATUS_STYLES } from "@/components/ClientStatusBadge";
import QuickLog from "@/components/QuickLog";
import { toggleMyClient } from "../actions";
import ContactMomentsSection from "./_components/ContactMomentsSection";
import InBodySection from "./_components/InBodySection";
import NutritionSection from "./_components/NutritionSection";
import GoalsSection from "./_components/GoalsSection";
import ActionItemsSection from "./_components/ActionItemsSection";
import TasksSection from "./_components/TasksSection";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, client] = await Promise.all([requireUser(), getClientDetail(id)]);
  if (!client) notFound();

  const status = getContactStatus(client.lastContactDate);
  const isMine = client.trainers.some((t) => t.trainerId === user.id);
  const waNumber = client.phone?.replace(/[^\d]/g, "").replace(/^0/, "31");

  return (
    <div className="space-y-6">
      <Link href="/klanten" className="text-sm text-slate-500 hover:underline">
        &larr; Klanten
      </Link>

      <div
        className={`rounded-2xl border border-l-4 border-slate-200 bg-white p-5 shadow-sm ${STATUS_STYLES[status.status].border}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">
                {client.firstName} {client.lastName}
              </h1>
              <ClientStatusBadge status={status.status} />
              {!client.active && (
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  Inactief
                </span>
              )}
            </div>
            <p className={`mt-1 text-sm font-medium ${STATUS_STYLES[status.status].text}`}>
              Laatste contact: {describeDaysSince(status.daysSinceContact).toLowerCase()}
              {status.lastContactDate && (
                <span className="font-normal text-slate-500"> ({formatDate(status.lastContactDate)})</span>
              )}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              {client.phone && (
                <a href={`tel:${client.phone}`} className="hover:underline">
                  📞 {client.phone}
                </a>
              )}
              {waNumber && (
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  💬 WhatsApp
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`} className="hover:underline">
                  ✉️ {client.email}
                </a>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {client.trainers.length === 0 ? (
                <span className="text-xs text-slate-400">Geen trainer gekoppeld</span>
              ) : (
                client.trainers.map((t) => (
                  <span
                    key={t.trainerId}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      t.trainerId === user.id ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {t.trainer.name}
                  </span>
                ))
              )}
              <form action={toggleMyClient.bind(null, client.id)}>
                <button type="submit" className="px-1 text-xs font-medium text-emerald-700 hover:underline">
                  {isMine ? "Mij ontkoppelen" : "+ Mijn klant maken"}
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <QuickLog clientId={client.id} clientName={client.firstName} size="md" />
            <Link
              href={`/klanten/${client.id}/taken/nieuw`}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              📅 Inplannen
            </Link>
            <Link
              href={`/klanten/${client.id}/bewerken`}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Bewerken
            </Link>
          </div>
        </div>

        {(client.notes || client.ptSessionsPerWeek != null) && (
          <div className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
            {client.ptSessionsPerWeek != null && (
              <p className="text-xs text-slate-500">
                Traint {client.ptSessionsPerWeek}x per week
                {client.ptSessionMinutes ? ` à ${client.ptSessionMinutes} min` : ""} · klant sinds{" "}
                {formatDate(client.startDate)}
              </p>
            )}
            {client.notes && <p className="mt-1 whitespace-pre-wrap">{client.notes}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ContactMomentsSection clientId={client.id} contactMoments={client.contactMoments} />
        </div>
        <div className="space-y-8 lg:col-span-2">
          <TasksSection clientId={client.id} tasks={client.scheduledTasks} />
          <InBodySection clientId={client.id} measurements={client.inBodyMeasurements} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 border-t border-slate-200 pt-6 lg:grid-cols-3">
        <NutritionSection clientId={client.id} analyses={client.nutritionAnalyses} />
        <GoalsSection clientId={client.id} goals={client.goals} />
        <ActionItemsSection clientId={client.id} actionItems={client.actionItems} goals={client.goals} />
      </div>
    </div>
  );
}
