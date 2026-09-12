"use server";

import { revalidatePath } from "next/cache";
import { runContactCheck } from "@/lib/notify";

export async function triggerContactCheck() {
  await runContactCheck();
  revalidatePath("/");
}
