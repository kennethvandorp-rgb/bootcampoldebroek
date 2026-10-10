import { NextRequest, NextResponse } from "next/server";
import { runContactCheck } from "@/lib/notify";

/**
 * Bedoeld om periodiek (bijv. dagelijks) te worden aangeroepen door een externe
 * scheduler (Vercel Cron, cron-job.org, een GitHub Action, ...). Zie README
 * voor hoe je dit koppelt. Beveiligd met CRON_SECRET, niet met de app-login,
 * omdat een externe scheduler niet kan inloggen.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is niet geconfigureerd" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const provided = authHeader?.replace(/^Bearer\s+/i, "") ?? querySecret;

  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { summary, emailSent, emailError } = await runContactCheck();

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    red: summary.red.map((c) => `${c.firstName} ${c.lastName}`),
    orange: summary.orange.map((c) => `${c.firstName} ${c.lastName}`),
    never: summary.never.map((c) => `${c.firstName} ${c.lastName}`),
    emailSent,
    emailError,
  });
}
