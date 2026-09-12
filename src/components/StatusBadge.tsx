const STYLES: Record<string, string> = {
  OPEN: "bg-slate-200 text-slate-700",
  BEZIG: "bg-amber-100 text-amber-800",
  BEHAALD: "bg-green-100 text-green-800",
  GESTOPT: "bg-slate-100 text-slate-500 line-through",
  AFGEROND: "bg-green-100 text-green-800",
};

export default function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status] ?? "bg-slate-200 text-slate-700"}`}>
      {label}
    </span>
  );
}
