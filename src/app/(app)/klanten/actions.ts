"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

function dateOrNull(formData: FormData, key: string): Date | null {
  const value = str(formData, key);
  return value ? new Date(value) : null;
}

export async function createClient(formData: FormData) {
  const firstName = str(formData, "firstName");
  const lastName = str(formData, "lastName");
  if (!firstName || !lastName) {
    throw new Error("Voor- en achternaam zijn verplicht");
  }

  const client = await prisma.client.create({
    data: {
      firstName,
      lastName,
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      birthDate: dateOrNull(formData, "birthDate"),
      startDate: dateOrNull(formData, "startDate") ?? new Date(),
      contactIntervalWeeks: Number(str(formData, "contactIntervalWeeks") ?? "5"),
      notes: str(formData, "notes"),
    },
  });

  revalidatePath("/klanten");
  revalidatePath("/");
  redirect(`/klanten/${client.id}`);
}

export async function updateClient(clientId: string, formData: FormData) {
  const firstName = str(formData, "firstName");
  const lastName = str(formData, "lastName");
  if (!firstName || !lastName) {
    throw new Error("Voor- en achternaam zijn verplicht");
  }

  await prisma.client.update({
    where: { id: clientId },
    data: {
      firstName,
      lastName,
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      birthDate: dateOrNull(formData, "birthDate"),
      contactIntervalWeeks: Number(str(formData, "contactIntervalWeeks") ?? "5"),
      notes: str(formData, "notes"),
      active: formData.get("active") === "on",
    },
  });

  revalidatePath(`/klanten/${clientId}`);
  revalidatePath("/klanten");
  revalidatePath("/");
  redirect(`/klanten/${clientId}`);
}
