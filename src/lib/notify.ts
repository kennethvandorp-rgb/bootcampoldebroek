import { prisma } from "@/lib/prisma";
import { getContactWarnings, type ContactWarningSummary } from "@/lib/queries";
import { describeDaysSince } from "@/lib/domain";

export interface ContactCheckResult {
  summary: ContactWarningSummary;
  emailSent: boolean;
  emailError: string | null;
}

/**
 * Voert de automatische contactmoment-controle uit: bepaalt welke klanten
 * aandacht nodig hebben, legt dit vast in AutomationRun, en verstuurt (indien
 * geconfigureerd) een waarschuwingsmail naar de studio.
 *
 * Wordt aangeroepen vanuit de cron-API-route (voor een externe scheduler) en
 * vanuit de "Controleer nu"-knop op het dashboard.
 */
export async function runContactCheck(): Promise<ContactCheckResult> {
  const summary = await getContactWarnings();

  let emailSent = false;
  let emailError: string | null = null;

  const needsAttention = summary.red.length + summary.orange.length;
  if (needsAttention > 0) {
    const result = await sendWarningEmail(summary);
    emailSent = result.sent;
    emailError = result.error;
  }

  await prisma.automationRun.create({
    data: {
      overdueCount: summary.red.length,
      dueSoonCount: summary.orange.length,
      neverCount: summary.never.length,
      notifiedByEmail: emailSent,
    },
  });

  return { summary, emailSent, emailError };
}

async function sendWarningEmail(
  summary: ContactWarningSummary
): Promise<{ sent: boolean; error: string | null }> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.NOTIFY_EMAIL;
  const fromEmail = process.env.NOTIFY_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    return { sent: false, error: null };
  }

  const lines: string[] = [];
  if (summary.red.length > 0) {
    lines.push(`Rood – actie vereist, > 14 dagen geen contact (${summary.red.length}):`);
    for (const c of summary.red) lines.push(`  - ${describeClient(c)}`);
  }
  if (summary.orange.length > 0) {
    lines.push(`Oranje – aandacht nodig, 7-14 dagen geen contact (${summary.orange.length}):`);
    for (const c of summary.orange) lines.push(`  - ${describeClient(c)}`);
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        subject: `PT Studio Oldebroek: ${summary.red.length + summary.orange.length} klant(en) vragen aandacht`,
        text: lines.join("\n"),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { sent: false, error: `Resend gaf status ${response.status}: ${body}` };
    }

    return { sent: true, error: null };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "Onbekende fout bij verzenden" };
  }
}

function describeClient(c: ContactWarningSummary["red"][number]): string {
  const trainers = c.trainers.map((t) => t.trainer.name).join(", ") || "geen trainer";
  return `${c.firstName} ${c.lastName} (${trainers}) — laatste contact: ${describeDaysSince(c.contactStatus.daysSinceContact).toLowerCase()}`;
}
