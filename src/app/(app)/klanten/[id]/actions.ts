"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ContactType, GoalStatus, ActionItemStatus } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth";
import { CONTACT_TYPES, parseDueDate, parseLocalDateTime } from "@/lib/domain";
import { refreshLastContactDate } from "@/lib/queries";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

function required(formData: FormData, key: string): string {
  const value = str(formData, key);
  if (!value) throw new Error(`${key} is verplicht`);
  return value;
}

function dateOrNull(formData: FormData, key: string): Date | null {
  const value = str(formData, key);
  return value ? new Date(value) : null;
}

function intOrNull(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  return value ? Number(value) : null;
}

function floatOrNull(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  return value ? Number(value) : null;
}

function contactType(value: string | null): ContactType {
  if (!value || !CONTACT_TYPES.includes(value as ContactType)) throw new Error("Ongeldig contacttype");
  return value as ContactType;
}

async function trainerIdOrDefault(formData: FormData, fallback: string): Promise<string> {
  const id = str(formData, "trainerId");
  if (!id) return fallback;
  const trainer = await prisma.user.findFirst({ where: { id, active: true }, select: { id: true } });
  if (!trainer) throw new Error("Onbekende trainer");
  return trainer.id;
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

// ---- Contactmomenten (interactielog) ----

export async function createContactMoment(clientId: string, formData: FormData) {
  const user = await requireUser();
  const dateValue = str(formData, "date");
  // Buiten de transactie: SQLite heeft één schrijfverbinding
  const trainerId = await trainerIdOrDefault(formData, user.id);

  await prisma.$transaction(async (tx) => {
    await tx.contactMoment.create({
      data: {
        clientId,
        trainerId,
        type: contactType(str(formData, "type")),
        date: dateValue ? parseLocalDateTime(dateValue) : new Date(),
        notes: str(formData, "notes"),
      },
    });
    await refreshLastContactDate(clientId, tx);
  });

  revalidateAll();
  redirect(`/klanten/${clientId}`);
}

/**
 * Quick Log: registreert direct een contactmoment van nu, door de ingelogde
 * trainer. Optioneel met een korte notitie.
 */
export async function quickLog(clientId: string, type: ContactType, notes?: string) {
  const user = await requireUser();

  await prisma.$transaction(async (tx) => {
    await tx.contactMoment.create({
      data: {
        clientId,
        trainerId: user.id,
        type: contactType(type),
        date: new Date(),
        notes: notes?.trim() || null,
      },
    });
    await refreshLastContactDate(clientId, tx);
  });

  revalidateAll();
}

export async function deleteContactMoment(clientId: string, id: string) {
  await requireUser();
  await prisma.$transaction(async (tx) => {
    await tx.contactMoment.delete({ where: { id } });
    await refreshLastContactDate(clientId, tx);
  });
  revalidateAll();
}

// ---- Geplande taken / vervolgcontacten ----

export async function createScheduledTask(clientId: string, formData: FormData) {
  const user = await requireUser();

  await prisma.scheduledTask.create({
    data: {
      clientId,
      trainerId: await trainerIdOrDefault(formData, user.id),
      dueDate: parseDueDate(required(formData, "dueDate")),
      note: required(formData, "note"),
    },
  });

  revalidateAll();
  redirect(`/klanten/${clientId}`);
}

/**
 * Rondt een taak af. Met `logAs` wordt de taak direct omgezet in een gelogd
 * contactmoment (nu, door de ingelogde trainer), gekoppeld aan de taak.
 */
export async function completeTask(taskId: string, logAs: ContactType | null, notes?: string) {
  const user = await requireUser();

  await prisma.$transaction(async (tx) => {
    const task = await tx.scheduledTask.findUniqueOrThrow({ where: { id: taskId } });
    if (task.completed) return;

    let contactMomentId: string | null = null;
    if (logAs) {
      const cm = await tx.contactMoment.create({
        data: {
          clientId: task.clientId,
          trainerId: user.id,
          type: contactType(logAs),
          date: new Date(),
          notes: notes?.trim() || task.note,
        },
      });
      contactMomentId = cm.id;
    }

    await tx.scheduledTask.update({
      where: { id: taskId },
      data: { completed: true, completedAt: new Date(), contactMomentId },
    });

    if (logAs) await refreshLastContactDate(task.clientId, tx);
  });

  revalidateAll();
}

export async function reopenTask(taskId: string) {
  await requireUser();
  await prisma.scheduledTask.update({
    where: { id: taskId },
    data: { completed: false, completedAt: null },
  });
  revalidateAll();
}

export async function deleteScheduledTask(taskId: string) {
  await requireUser();
  await prisma.scheduledTask.delete({ where: { id: taskId } });
  revalidateAll();
}

// ---- InBody metingen ----

export async function createInBodyMeasurement(clientId: string, formData: FormData) {
  const user = await requireUser();
  const dateValue = str(formData, "date");
  const date = dateValue ? parseLocalDateTime(dateValue) : new Date();
  const linkContactMoment = formData.get("createContactMoment") === "on";

  await prisma.$transaction(async (tx) => {
    let contactMomentId: string | undefined;
    if (linkContactMoment) {
      const cm = await tx.contactMoment.create({
        data: {
          clientId,
          trainerId: user.id,
          type: ContactType.INBODY,
          date,
          summary: "InBody-meting",
        },
      });
      contactMomentId = cm.id;
    }

    await tx.inBodyMeasurement.create({
      data: {
        clientId,
        contactMomentId,
        date,
        weightKg: floatOrNull(formData, "weightKg"),
        skeletalMuscleMassKg: floatOrNull(formData, "skeletalMuscleMassKg"),
        bodyFatPercent: floatOrNull(formData, "bodyFatPercent"),
        bodyFatMassKg: floatOrNull(formData, "bodyFatMassKg"),
        bmi: floatOrNull(formData, "bmi"),
        visceralFatLevel: floatOrNull(formData, "visceralFatLevel"),
        totalBodyWaterL: floatOrNull(formData, "totalBodyWaterL"),
        bmrKcal: intOrNull(formData, "bmrKcal"),
        notes: str(formData, "notes"),
      },
    });

    if (linkContactMoment) await refreshLastContactDate(clientId, tx);
  });

  revalidateAll();
  redirect(`/klanten/${clientId}`);
}

export async function deleteInBodyMeasurement(clientId: string, id: string) {
  await requireUser();
  await prisma.inBodyMeasurement.delete({ where: { id } });
  revalidateAll();
}

// ---- Voedingsanalyses ----

export async function createNutritionAnalysis(clientId: string, formData: FormData) {
  await requireUser();
  await prisma.nutritionAnalysis.create({
    data: {
      clientId,
      date: dateOrNull(formData, "date") ?? new Date(),
      kcalTarget: intOrNull(formData, "kcalTarget"),
      proteinGrams: intOrNull(formData, "proteinGrams"),
      carbsGrams: intOrNull(formData, "carbsGrams"),
      fatGrams: intOrNull(formData, "fatGrams"),
      summary: required(formData, "summary"),
      advice: str(formData, "advice"),
    },
  });
  revalidateAll();
  redirect(`/klanten/${clientId}`);
}

export async function deleteNutritionAnalysis(clientId: string, id: string) {
  await requireUser();
  await prisma.nutritionAnalysis.delete({ where: { id } });
  revalidateAll();
}

// ---- Doelen ----

export async function createGoal(clientId: string, formData: FormData) {
  await requireUser();
  await prisma.goal.create({
    data: {
      clientId,
      description: required(formData, "description"),
      targetDate: dateOrNull(formData, "targetDate"),
    },
  });
  revalidateAll();
  redirect(`/klanten/${clientId}`);
}

export async function updateGoalStatus(clientId: string, goalId: string, status: GoalStatus) {
  await requireUser();
  await prisma.goal.update({ where: { id: goalId }, data: { status } });
  revalidateAll();
}

export async function deleteGoal(clientId: string, id: string) {
  await requireUser();
  await prisma.goal.delete({ where: { id } });
  revalidateAll();
}

// ---- Actiepunten ----

export async function createActionItem(clientId: string, formData: FormData) {
  await requireUser();
  const goalId = str(formData, "goalId");
  await prisma.actionItem.create({
    data: {
      clientId,
      goalId: goalId ?? undefined,
      description: required(formData, "description"),
      dueDate: dateOrNull(formData, "dueDate"),
    },
  });
  revalidateAll();
  redirect(`/klanten/${clientId}`);
}

export async function toggleActionItem(clientId: string, id: string, currentStatus: ActionItemStatus) {
  await requireUser();
  await prisma.actionItem.update({
    where: { id },
    data: { status: currentStatus === ActionItemStatus.OPEN ? ActionItemStatus.AFGEROND : ActionItemStatus.OPEN },
  });
  revalidateAll();
}

export async function deleteActionItem(clientId: string, id: string) {
  await requireUser();
  await prisma.actionItem.delete({ where: { id } });
  revalidateAll();
}
