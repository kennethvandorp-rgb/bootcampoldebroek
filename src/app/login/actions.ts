"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "pt_session";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/");
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword || password !== appPassword) {
    redirect(`/login?from=${encodeURIComponent(from)}&error=1`);
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  redirect(from && from !== "/login" ? from : "/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
