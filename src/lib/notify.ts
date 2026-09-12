import { prisma } from "@/lib/prisma";
import { getContactWarnings, type ContactWarningSummary } from "@/lib/queries";
import { CONTACT_TYPE_LABELS, formatDate } from "@/lib/domain";

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

  const needsAttention = summary.overdue.length + summary.dueSoon.length + summary.never.length;
  if (needsAttention > 0) {
    const result = await sendWarningEmail(summary);
    emailSent = result.sent;
    emailError = result.error;
  }

  await prisma.automationRun.create({
    data: {
      overdueCount: summary.overdue.length,
      dueSoonCount: summary.dueSoon.length,
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
  if (summary.overdue.length > 0) {
    lines.push(`Achterstallig (${summary.overdue.length}):`);
    for (const c of summary.overdue) {
      lines.push(`  - ${c.firstName} ${c.lastName} — laatste contact: ${describeLastContact(c.contactStatus)}`);
    }
  }
  if (summary.dueSoon.length > 0) {
    lines.push(`Binnenkort aan de beurt (${summary.dueSoon.length}):`);
    for (const c of summary.dueSoon) {
      lines.push(`  - ${c.firstName} ${c.lastName} — laatste contact: ${describeLastContact(c.contactStatus)}`);
    }
  }
  if (summary.never.length > 0) {
    lines.push(`Nog nooit contact gehad (${summary.never.length}):`);
    for (const c of summary.never) {
      lines.push(`  - ${c.firstName} ${c.lastName}`);
    }
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
        subject: `PT Studio Oldebroek: ${summary.overdue.length + summary.dueSoon.length + summary.never.length} klant(en) vragen aandacht`,
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

function describeLastContact(status: { lastContactDate: Date | null; lastContactType: string | null }): string {
  if (!status.lastContactDate || !status.lastContactType) return "nog geen contact";
  const label = CONTACT_TYPE_LABELS[status.lastContactType as keyof typeof CONTACT_TYPE_LABELS] ?? status.lastContactType;
  return `${label} op ${formatDate(status.lastContactDate)}`;
}
