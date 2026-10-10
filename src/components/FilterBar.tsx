"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CLIENT_STATUS_LABELS, CLIENT_STATUSES, type ClientStatus } from "@/lib/domain";
import { STATUS_STYLES } from "@/components/ClientStatusBadge";

/**
 * Filters voor dashboard en klantenlijst, opgeslagen in de URL zodat een
 * gefilterde weergave te bookmarken en te delen is.
 */
export default function FilterBar({
  trainers,
  counts,
  showSearch,
}: {
  trainers: { id: string; name: string }[];
  counts?: Record<ClientStatus, number>;
  showSearch?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const scope = params.get("scope") === "alle" ? "alle" : "mijn";
  const trainer = params.get("trainer") ?? "";
  const status = params.get("status") ?? "";

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg bg-slate-200/70 p-1" role="tablist">
          {(["mijn", "alle"] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={scope === s && !trainer}
              onClick={() => update({ scope: s === "alle" ? "alle" : null, trainer: null })}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                scope === s && !trainer ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {s === "mijn" ? "Mijn klanten" : "Alle klanten"}
            </button>
          ))}
        </div>

        <select
          value={trainer}
          onChange={(e) => update({ trainer: e.target.value || null, scope: e.target.value ? "alle" : null })}
          aria-label="Filter op trainer"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        >
          <option value="">Alle trainers</option>
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {showSearch && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q");
              update({ q: typeof q === "string" && q.trim() ? q.trim() : null });
            }}
            className="flex-1 sm:max-w-xs"
          >
            <input
              name="q"
              type="search"
              defaultValue={params.get("q") ?? ""}
              placeholder="Zoek op naam, e-mail, telefoon…"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </form>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusChip active={!status} onClick={() => update({ status: null })} label="Alle statussen" />
        {CLIENT_STATUSES.map((s) => (
          <StatusChip
            key={s}
            active={status === s}
            onClick={() => update({ status: status === s ? null : s })}
            label={CLIENT_STATUS_LABELS[s]}
            dot={STATUS_STYLES[s].dot}
            count={counts?.[s]}
          />
        ))}
      </div>
    </div>
  );
}

function StatusChip({
  active,
  onClick,
  label,
  dot,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dot?: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
      }`}
    >
      {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
      {label}
      {count != null && <span className={active ? "text-slate-300" : "text-slate-400"}>{count}</span>}
    </button>
  );
}
