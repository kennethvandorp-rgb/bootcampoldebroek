import { prisma } from "@/lib/prisma";
import { getContactStatus, type ContactStatus } from "@/lib/domain";
import type { Client } from "@/generated/prisma/client";

export type ClientWithStatus = Client & { contactStatus: ContactStatus };

export async function getClientsWithStatus(options?: { activeOnly?: boolean }): Promise<ClientWithStatus[]> {
  const clients = await prisma.client.findMany({
    where: options?.activeOnly ? { active: true } : undefined,
    include: {
      contactMoments: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
    orderBy: { lastName: "asc" },
  });

  return clients.map((client) => {
    const lastMoment = client.contactMoments[0] ?? null;
    return {
      ...client,
      contactStatus: getContactStatus(
        lastMoment?.date ?? null,
        client.contactIntervalWeeks,
        new Date(),
        lastMoment?.type ?? null
      ),
    };
  });
}

const URGENCY_ORDER: Record<ContactStatus["urgency"], number> = {
  achterstallig: 0,
  nooit: 1,
  binnenkort: 2,
  "op-schema": 3,
};

export function sortByUrgency(clients: ClientWithStatus[]): ClientWithStatus[] {
  return [...clients].sort((a, b) => {
    const orderDiff = URGENCY_ORDER[a.contactStatus.urgency] - URGENCY_ORDER[b.contactStatus.urgency];
    if (orderDiff !== 0) return orderDiff;
    const aDays = a.contactStatus.daysUntilDue ?? -Infinity;
    const bDays = b.contactStatus.daysUntilDue ?? -Infinity;
    return aDays - bDays;
  });
}

export interface ContactWarningSummary {
  overdue: ClientWithStatus[];
  dueSoon: ClientWithStatus[];
  never: ClientWithStatus[];
}

/** Actieve klanten die aandacht nodig hebben, gegroepeerd per urgentie. Gebruikt door zowel het dashboard als de automatische controle. */
export async function getContactWarnings(): Promise<ContactWarningSummary> {
  const clients = await getClientsWithStatus({ activeOnly: true });
  return {
    overdue: clients.filter((c) => c.contactStatus.urgency === "achterstallig"),
    dueSoon: clients.filter((c) => c.contactStatus.urgency === "binnenkort"),
    never: clients.filter((c) => c.contactStatus.urgency === "nooit"),
  };
}

export async function getClientDetail(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      contactMoments: { orderBy: { date: "desc" }, include: { inBodyMeasurement: true } },
      inBodyMeasurements: { orderBy: { date: "desc" } },
      nutritionAnalyses: { orderBy: { date: "desc" } },
      goals: { orderBy: { createdAt: "desc" }, include: { actionItems: true } },
      actionItems: { orderBy: { createdAt: "desc" }, include: { goal: true } },
    },
  });
}
