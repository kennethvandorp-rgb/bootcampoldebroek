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
    const lastContact = client.contactMoments[0]?.date ?? null;
    return {
      ...client,
      contactStatus: getContactStatus(lastContact, client.contactIntervalWeeks),
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
