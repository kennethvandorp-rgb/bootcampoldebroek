import type { ContactType, GoalStatus, ActionItemStatus, UserRole } from "@/generated/prisma/enums";

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  TELEFONISCH: "Telefonisch",
  INBODY: "InBody-meting",
  PT_SESSIE: "PT-sessie",
  OVERIG: "Overig",
};

export const CONTACT_TYPE_ICONS: Record<ContactType, string> = {
  WHATSAPP: "💬",
  EMAIL: "✉️",
  TELEFONISCH: "📞",
  INBODY: "📊",
  PT_SESSIE: "🏋️",
  OVERIG: "📝",
};

export const CONTACT_TYPES = Object.keys(CONTACT_TYPE_LABELS) as ContactType[];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Beheerder",
  TRAINER: "Trainer",
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

// ---- Klantstatus (automatisch berekend) ----

export type ClientStatus = "groen" | "oranje" | "rood";

export const CLIENT_STATUSES: ClientStatus[] = ["groen", "oranje", "rood"];

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  groen: "Actief",
  oranje: "Aandacht nodig",
  rood: "Actie vereist",
};

/** Contact minder dan zoveel dagen geleden = groen. */
export const GREEN_MAX_DAYS = 7;
/** Contact tot en met zoveel dagen geleden = oranje; daarna rood. */
export const ORANGE_MAX_DAYS = 14;

export interface ContactStatus {
  status: ClientStatus;
  lastContactDate: Date | null;
  /** Hele dagen sinds het laatste contact, of null als er nooit contact is geweest. */
  daysSinceContact: number | null;
}

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Berekent de status van een klant op basis van het laatste contactmoment:
 * - groen: contact < 7 dagen geleden
 * - oranje: contact 7 t/m 14 dagen geleden
 * - rood: contact > 14 dagen geleden, of nog nooit contact
 */
export function getContactStatus(lastContactDate: Date | null, now: Date = new Date()): ContactStatus {
  if (!lastContactDate) {
    return { status: "rood", lastContactDate: null, daysSinceContact: null };
  }

  const daysSinceContact = Math.max(0, Math.floor((now.getTime() - lastContactDate.getTime()) / DAY_MS));

  let status: ClientStatus;
  if (daysSinceContact < GREEN_MAX_DAYS) {
    status = "groen";
  } else if (daysSinceContact <= ORANGE_MAX_DAYS) {
    status = "oranje";
  } else {
    status = "rood";
  }

  return { status, lastContactDate, daysSinceContact };
}

export function describeDaysSince(days: number | null): string {
  if (days == null) return "Nog nooit contact";
  if (days === 0) return "Vandaag";
  if (days === 1) return "Gisteren";
  return `${days} dagen geleden`;
}

// ---- Datum- en tijdhulpjes ----
//
// Alle weergave en invoer gebeurt in de tijdzone van de studio, ongeacht de
// tijdzone van de server (die in productie vaak UTC is).

export const APP_TIME_ZONE = "Europe/Amsterdam";

function zonedParts(date: Date): Record<string, number> {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const out: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== "literal") out[p.type] = Number(p.value);
  }
  return out;
}

/** Kalenderdag (YYYY-MM-DD) in de studio-tijdzone. */
export function dayKey(date: Date = new Date()): string {
  const p = zonedParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Kalenderdag over `days` dagen (YYYY-MM-DD), in de studio-tijdzone. */
export function dayKeyInDays(days: number, now: Date = new Date()): string {
  return dayKey(new Date(now.getTime() + days * DAY_MS));
}

/**
 * Streefdatums van taken worden opgeslagen als middernacht UTC van de
 * kalenderdag, zodat de dag zelf eenduidig is. Dit geeft die waarde voor "vandaag".
 */
export function todayAsDueDate(now: Date = new Date()): Date {
  return new Date(`${dayKey(now)}T00:00:00Z`);
}

export function dueDateKey(dueDate: Date): string {
  return dueDate.toISOString().slice(0, 10);
}

export function parseDueDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Ongeldige datum");
  return new Date(`${value}T00:00:00Z`);
}

/** Zet een `datetime-local`-waarde (wandkloktijd in de studio-tijdzone) om naar een Date. */
export function parseLocalDateTime(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(value);
  if (!match) throw new Error("Ongeldige datum/tijd");
  const [, y, mo, d, h = "12", mi = "00"] = match;
  const asUtc = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
  // Bepaal de tijdzone-offset op dat moment en corrigeer ervoor
  const p = zonedParts(new Date(asUtc));
  const zonedAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return new Date(asUtc - (zonedAsUtc - asUtc));
}

/** Waarde voor een `datetime-local`-veld, in de studio-tijdzone. */
export function toDateTimeInputValue(date: Date = new Date()): string {
  const p = zonedParts(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  }).format(d);
}

/** Voor streefdatums (middernacht UTC): toon de opgeslagen kalenderdag. */
export function formatDueDate(date: Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
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
    timeZone: APP_TIME_ZONE,
  }).format(d);
}

export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}
