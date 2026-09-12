import type { ContactUrgency } from "@/lib/domain";

const STYLES: Record<ContactUrgency, string> = {
  achterstallig: "bg-red-100 text-red-800",
  binnenkort: "bg-amber-100 text-amber-800",
  nooit: "bg-slate-200 text-slate-700",
  "op-schema": "bg-green-100 text-green-800",
};

const LABELS: Record<ContactUrgency, string> = {
  achterstallig: "Achterstallig",
  binnenkort: "Binnenkort",
  nooit: "Nog geen contact",
  "op-schema": "Op schema",
};

export default function UrgencyBadge({ urgency }: { urgency: ContactUrgency }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[urgency]}`}>
      {LABELS[urgency]}
    </span>
  );
}
