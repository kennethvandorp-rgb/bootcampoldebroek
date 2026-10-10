"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

function safeRedirectTarget(from: string): string {
  // Alleen interne paden, om open redirects te voorkomen
  return from.startsWith("/") && !from.startsWith("//") && from !== "/login" ? from : "/";
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const from = safeRedirectTarget(String(formData.get("from") ?? "/"));

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
    redirect(`/login?from=${encodeURIComponent(from)}&error=1`);
  }

  await createSession(user.id);
  redirect(from);
}

/** Eerste installatie: maakt de eerste beheerder aan zolang er nog geen accounts zijn. */
export async function setupFirstAdmin(formData: FormData) {
  if ((await prisma.user.count()) > 0) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!name || !email || password.length < 8) {
    redirect("/login?error=setup");
  }

  const user = await prisma.user.create({
    data: { name, email, role: "ADMIN", passwordHash: await hashPassword(password) },
  });

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
