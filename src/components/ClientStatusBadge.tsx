import { CLIENT_STATUS_LABELS, type ClientStatus } from "@/lib/domain";

export const STATUS_STYLES: Record<ClientStatus, { badge: string; dot: string; border: string; text: string }> = {
  groen: {
    badge: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
    dot: "bg-emerald-500",
    border: "border-l-emerald-500",
    text: "text-emerald-700",
  },
  oranje: {
    badge: "bg-amber-100 text-amber-800 ring-amber-600/20",
    dot: "bg-amber-500",
    border: "border-l-amber-500",
    text: "text-amber-700",
  },
  rood: {
    badge: "bg-red-100 text-red-800 ring-red-600/20",
    dot: "bg-red-500",
    border: "border-l-red-500",
    text: "text-red-700",
  },
};

export default function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status].badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[status].dot}`} />
      {CLIENT_STATUS_LABELS[status]}
    </span>
  );
}
