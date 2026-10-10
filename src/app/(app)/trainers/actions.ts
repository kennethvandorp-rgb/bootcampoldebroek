"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin, requireUser, verifyPassword } from "@/lib/auth";
import type { UserRole } from "@/generated/prisma/enums";

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createTrainer(formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name");
  const email = str(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role: UserRole = str(formData, "role") === "ADMIN" ? "ADMIN" : "TRAINER";

  if (!name || !email || password.length < 8) {
    redirect("/trainers?error=invalid");
  }
  if (await prisma.user.findUnique({ where: { email } })) {
    redirect("/trainers?error=exists");
  }

  await prisma.user.create({ data: { name, email, role, passwordHash: await hashPassword(password) } });
  revalidatePath("/", "layout");
  redirect("/trainers?ok=created");
}

export async function setTrainerActive(userId: string, active: boolean) {
  const admin = await requireAdmin();
  if (userId === admin.id && !active) throw new Error("Je kunt jezelf niet deactiveren");
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { active } }),
    // Gedeactiveerde trainers worden direct uitgelogd
    ...(active ? [] : [prisma.session.deleteMany({ where: { userId } })]),
  ]);
  revalidatePath("/", "layout");
}

export async function resetTrainerPassword(userId: string, formData: FormData) {
  await requireAdmin();
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) redirect("/trainers?error=invalid");
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(password) } });
  redirect("/trainers?ok=password");
}

export async function changeOwnPassword(formData: FormData) {
  const user = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("password") ?? "");
  const record = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });

  if (!(await verifyPassword(current, record.passwordHash))) redirect("/trainers?error=current");
  if (next.length < 8) redirect("/trainers?error=invalid");

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  redirect("/trainers?ok=password");
}
