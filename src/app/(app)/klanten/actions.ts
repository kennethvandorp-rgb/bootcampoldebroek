"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

function dateOrNull(formData: FormData, key: string): Date | null {
  const value = str(formData, key);
  return value ? new Date(value) : null;
}

function intOrNull(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  return value ? Number(value) : null;
}

/** Geselecteerde trainers uit het formulier (checkboxes `trainerIds`), alleen actieve accounts. */
async function trainerIds(formData: FormData): Promise<string[]> {
  const ids = formData.getAll("trainerIds").filter((v): v is string => typeof v === "string" && v !== "");
  if (ids.length === 0) return [];
  const trainers = await prisma.user.findMany({ where: { id: { in: ids }, active: true }, select: { id: true } });
  return trainers.map((t) => t.id);
}

function clientFields(formData: FormData) {
  const firstName = str(formData, "firstName");
  const lastName = str(formData, "lastName");
  if (!firstName || !lastName) {
    throw new Error("Voor- en achternaam zijn verplicht");
  }
  return {
    firstName,
    lastName,
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    birthDate: dateOrNull(formData, "birthDate"),
    ptSessionsPerWeek: intOrNull(formData, "ptSessionsPerWeek"),
    ptSessionMinutes: intOrNull(formData, "ptSessionMinutes"),
    notes: str(formData, "notes"),
  };
}

export async function createClient(formData: FormData) {
  const user = await requireUser();
  const assigned = await trainerIds(formData);

  const client = await prisma.client.create({
    data: {
      ...clientFields(formData),
      startDate: dateOrNull(formData, "startDate") ?? new Date(),
      // Zonder selectie wordt de klant aan de aanmakende trainer gekoppeld
      trainers: { create: (assigned.length > 0 ? assigned : [user.id]).map((trainerId) => ({ trainerId })) },
    },
  });

  revalidatePath("/", "layout");
  redirect(`/klanten/${client.id}`);
}

export async function updateClient(clientId: string, formData: FormData) {
  await requireUser();
  const assigned = await trainerIds(formData);

  await prisma.$transaction([
    prisma.client.update({
      where: { id: clientId },
      data: { ...clientFields(formData), active: formData.get("active") === "on" },
    }),
    prisma.clientTrainer.deleteMany({ where: { clientId, trainerId: { notIn: assigned } } }),
    ...assigned.map((trainerId) =>
      prisma.clientTrainer.upsert({
        where: { clientId_trainerId: { clientId, trainerId } },
        create: { clientId, trainerId },
        update: {},
      })
    ),
  ]);

  revalidatePath("/", "layout");
  redirect(`/klanten/${clientId}`);
}

/** "Mijn klant maken": koppelt de ingelogde trainer aan een klant (of ontkoppelt). */
export async function toggleMyClient(clientId: string) {
  const user = await requireUser();
  const key = { clientId_trainerId: { clientId, trainerId: user.id } };
  const existing = await prisma.clientTrainer.findUnique({ where: key });
  if (existing) {
    await prisma.clientTrainer.delete({ where: key });
  } else {
    await prisma.clientTrainer.create({ data: { clientId, trainerId: user.id } });
  }
  revalidatePath("/", "layout");
}
