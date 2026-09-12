"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ContactType, GoalStatus, ActionItemStatus } from "@/generated/prisma/client";

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

function revalidateClient(clientId: string) {
  revalidatePath(`/klanten/${clientId}`);
  revalidatePath("/klanten");
  revalidatePath("/");
}

// ---- Contactmomenten ----

export async function createContactMoment(clientId: string, formData: FormData) {
  await prisma.contactMoment.create({
    data: {
      clientId,
      type: required(formData, "type") as ContactType,
      date: dateOrNull(formData, "date") ?? new Date(),
      summary: required(formData, "summary"),
      notes: str(formData, "notes"),
    },
  });
  revalidateClient(clientId);
  redirect(`/klanten/${clientId}`);
}

export async function deleteContactMoment(clientId: string, id: string) {
  await prisma.contactMoment.delete({ where: { id } });
  revalidateClient(clientId);
}

// ---- InBody metingen ----

export async function createInBodyMeasurement(clientId: string, formData: FormData) {
  const date = dateOrNull(formData, "date") ?? new Date();
  const linkContactMoment = formData.get("createContactMoment") === "on";

  await prisma.$transaction(async (tx) => {
    let contactMomentId: string | undefined;
    if (linkContactMoment) {
      const cm = await tx.contactMoment.create({
        data: {
          clientId,
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
  });

  revalidateClient(clientId);
  redirect(`/klanten/${clientId}`);
}

export async function deleteInBodyMeasurement(clientId: string, id: string) {
  await prisma.inBodyMeasurement.delete({ where: { id } });
  revalidateClient(clientId);
}

// ---- Voedingsanalyses ----

export async function createNutritionAnalysis(clientId: string, formData: FormData) {
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
  revalidateClient(clientId);
  redirect(`/klanten/${clientId}`);
}

export async function deleteNutritionAnalysis(clientId: string, id: string) {
  await prisma.nutritionAnalysis.delete({ where: { id } });
  revalidateClient(clientId);
}

// ---- Doelen ----

export async function createGoal(clientId: string, formData: FormData) {
  await prisma.goal.create({
    data: {
      clientId,
      description: required(formData, "description"),
      targetDate: dateOrNull(formData, "targetDate"),
    },
  });
  revalidateClient(clientId);
  redirect(`/klanten/${clientId}`);
}

export async function updateGoalStatus(clientId: string, goalId: string, status: GoalStatus) {
  await prisma.goal.update({ where: { id: goalId }, data: { status } });
  revalidateClient(clientId);
}

export async function deleteGoal(clientId: string, id: string) {
  await prisma.goal.delete({ where: { id } });
  revalidateClient(clientId);
}

// ---- Actiepunten ----

export async function createActionItem(clientId: string, formData: FormData) {
  const goalId = str(formData, "goalId");
  await prisma.actionItem.create({
    data: {
      clientId,
      goalId: goalId ?? undefined,
      description: required(formData, "description"),
      dueDate: dateOrNull(formData, "dueDate"),
    },
  });
  revalidateClient(clientId);
  redirect(`/klanten/${clientId}`);
}

export async function toggleActionItem(clientId: string, id: string, currentStatus: ActionItemStatus) {
  await prisma.actionItem.update({
    where: { id },
    data: { status: currentStatus === ActionItemStatus.OPEN ? ActionItemStatus.AFGEROND : ActionItemStatus.OPEN },
  });
  revalidateClient(clientId);
}

export async function deleteActionItem(clientId: string, id: string) {
  await prisma.actionItem.delete({ where: { id } });
  revalidateClient(clientId);
}
