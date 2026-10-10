import { prisma } from "@/lib/prisma";
import {
  CLIENT_STATUSES,
  getContactStatus,
  todayAsDueDate,
  type ClientStatus,
  type ContactStatus,
} from "@/lib/domain";
import type { Prisma } from "@/generated/prisma/client";
import type { CurrentUser } from "@/lib/auth";

// ---- Filters (dashboard en klantenlijst) ----

export type ClientScope = "mijn" | "alle";

export interface ClientFilters {
  scope: ClientScope;
  trainerId: string | null;
  status: ClientStatus | null;
  q: string | null;
}

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | null {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.trim() !== "" ? v.trim() : null;
}

export function parseClientFilters(params: RawSearchParams): ClientFilters {
  const status = first(params.status);
  return {
    scope: first(params.scope) === "alle" ? "alle" : "mijn",
    trainerId: first(params.trainer),
    status: CLIENT_STATUSES.includes(status as ClientStatus) ? (status as ClientStatus) : null,
    q: first(params.q),
  };
}

/**
 * Welke trainer de filters betreffen: een expliciet gekozen trainer, de
 * ingelogde trainer bij "Mijn klanten", of null (= alle trainers).
 */
export function effectiveTrainerId(filters: ClientFilters, user: CurrentUser): string | null {
  if (filters.trainerId) return filters.trainerId;
  return filters.scope === "mijn" ? user.id : null;
}

// ---- Klanten met status ----

const clientListInclude = {
  trainers: {
    include: { trainer: { select: { id: true, name: true } } },
    orderBy: { assignedAt: "asc" },
  },
  contactMoments: {
    orderBy: { date: "desc" },
    take: 1,
    select: { type: true, date: true },
  },
  scheduledTasks: {
    where: { completed: false },
    orderBy: { dueDate: "asc" },
    take: 1,
    select: { id: true, dueDate: true, note: true },
  },
} satisfies Prisma.ClientInclude;

type ClientListRow = Prisma.ClientGetPayload<{ include: typeof clientListInclude }>;

export type ClientWithStatus = ClientListRow & { contactStatus: ContactStatus };

const STATUS_ORDER: Record<ClientStatus, number> = { rood: 0, oranje: 1, groen: 2 };

/** Meest urgente klanten eerst; binnen een status wie het langst geen contact had. */
export function sortByUrgency(clients: ClientWithStatus[]): ClientWithStatus[] {
  return [...clients].sort((a, b) => {
    const diff = STATUS_ORDER[a.contactStatus.status] - STATUS_ORDER[b.contactStatus.status];
    if (diff !== 0) return diff;
    const aDays = a.contactStatus.daysSinceContact ?? Infinity;
    const bDays = b.contactStatus.daysSinceContact ?? Infinity;
    return bDays - aDays;
  });
}

export async function getClientsWithStatus(options: {
  trainerId?: string | null;
  activeOnly?: boolean;
  q?: string | null;
}): Promise<ClientWithStatus[]> {
  const where: Prisma.ClientWhereInput = {};
  if (options.activeOnly) where.active = true;
  if (options.trainerId) where.trainers = { some: { trainerId: options.trainerId } };
  if (options.q) {
    where.OR = [
      { firstName: { contains: options.q } },
      { lastName: { contains: options.q } },
      { email: { contains: options.q } },
      { phone: { contains: options.q } },
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    include: clientListInclude,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const now = new Date();
  return sortByUrgency(
    clients.map((client) => ({ ...client, contactStatus: getContactStatus(client.lastContactDate, now) }))
  );
}

export function countByStatus(clients: ClientWithStatus[]): Record<ClientStatus, number> {
  const counts: Record<ClientStatus, number> = { groen: 0, oranje: 0, rood: 0 };
  for (const c of clients) counts[c.contactStatus.status]++;
  return counts;
}

export interface ContactWarningSummary {
  red: ClientWithStatus[];
  orange: ClientWithStatus[];
  never: ClientWithStatus[];
}

/** Actieve klanten die aandacht nodig hebben. Gebruikt door de automatische controle. */
export async function getContactWarnings(): Promise<ContactWarningSummary> {
  const clients = await getClientsWithStatus({ activeOnly: true });
  return {
    red: clients.filter((c) => c.contactStatus.status === "rood"),
    orange: clients.filter((c) => c.contactStatus.status === "oranje"),
    never: clients.filter((c) => c.contactStatus.lastContactDate === null),
  };
}

// ---- Taken ----

/** Openstaande taken met streefdatum vandaag of eerder (te laat). */
export async function getDueTasks(trainerId: string | null) {
  return prisma.scheduledTask.findMany({
    where: {
      completed: false,
      dueDate: { lte: todayAsDueDate() },
      ...(trainerId ? { trainerId } : {}),
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, phone: true } },
      trainer: { select: { id: true, name: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
  });
}

export type DueTask = Awaited<ReturnType<typeof getDueTasks>>[number];

export async function getUpcomingTaskCount(trainerId: string | null) {
  return prisma.scheduledTask.count({
    where: {
      completed: false,
      dueDate: { gt: todayAsDueDate() },
      ...(trainerId ? { trainerId } : {}),
    },
  });
}

// ---- Trainers ----

export async function getActiveTrainers() {
  return prisma.user.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export type TrainerOption = Awaited<ReturnType<typeof getActiveTrainers>>[number];

// ---- Klantdetail ----

export async function getClientDetail(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      trainers: { include: { trainer: { select: { id: true, name: true } } }, orderBy: { assignedAt: "asc" } },
      contactMoments: {
        orderBy: { date: "desc" },
        include: { inBodyMeasurement: true, trainer: { select: { id: true, name: true } } },
      },
      inBodyMeasurements: { orderBy: { date: "desc" } },
      nutritionAnalyses: { orderBy: { date: "desc" } },
      goals: { orderBy: { createdAt: "desc" }, include: { actionItems: true } },
      actionItems: { orderBy: { createdAt: "desc" }, include: { goal: true } },
      scheduledTasks: {
        orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
        include: { trainer: { select: { id: true, name: true } } },
      },
    },
  });
}

export type ClientDetail = NonNullable<Awaited<ReturnType<typeof getClientDetail>>>;

/** Herberekent de gedenormaliseerde `lastContactDate` van een klant. */
export async function refreshLastContactDate(clientId: string, tx: Prisma.TransactionClient = prisma) {
  const latest = await tx.contactMoment.findFirst({
    where: { clientId },
    orderBy: { date: "desc" },
    select: { date: true },
  });
  await tx.client.update({ where: { id: clientId }, data: { lastContactDate: latest?.date ?? null } });
}
