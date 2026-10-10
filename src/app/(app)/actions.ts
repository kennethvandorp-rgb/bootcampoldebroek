"use server";

import { revalidatePath } from "next/cache";
import { runContactCheck } from "@/lib/notify";
import { requireUser } from "@/lib/auth";

export async function triggerContactCheck() {
  await requireUser();
  await runContactCheck();
  revalidatePath("/");
}
