import { ContactType, GoalStatus, ActionItemStatus } from "@/generated/prisma/client";

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  INBODY: "InBody-meting",
  BELAFSPRAAK: "Belafspraak",
  PERSOONLIJK: "Persoonlijk gesprek",
  OVERIG: "Overig",
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  OPEN: "Open",
  BEZIG: "Bezig",
  BEHAALD: "Behaald",
  GESTOPT: "Gestopt",
};

export const ACTION_ITEM_STATUS_LABELS: Record<ActionItemStatus, string> = {
  OPEN: "Open",
  AFGEROND: "Afgerond",
};

export type ContactUrgency = "nooit" | "achterstallig" | "binnenkort" | "op-schema";

export interface ContactStatus {
  urgency: ContactUrgency;
  lastContactDate: Date | null;
  dueDate: Date | null;
  daysUntilDue: number | null;
}

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Bepaalt of een klant toe is aan een nieuw contactmoment, op basis van het
 * laatste contactmoment en het gewenste interval (studio-afspraak: 4-6 weken).
 */
export function getContactStatus(
  lastContactDate: Date | null,
  contactIntervalWeeks: number,
  now: Date = new Date()
): ContactStatus {
  if (!lastContactDate) {
    return { urgency: "nooit", lastContactDate: null, dueDate: null, daysUntilDue: null };
  }

  const dueDate = new Date(lastContactDate.getTime() + contactIntervalWeeks * 7 * DAY_MS);
  const daysUntilDue = Math.round((dueDate.getTime() - now.getTime()) / DAY_MS);

  let urgency: ContactUrgency;
  if (daysUntilDue < 0) {
    urgency = "achterstallig";
  } else if (daysUntilDue <= 7) {
    urgency = "binnenkort";
  } else {
    urgency = "op-schema";
  }

  return { urgency, lastContactDate, dueDate, daysUntilDue };
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}
