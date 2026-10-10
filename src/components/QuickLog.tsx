"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { ContactType } from "@/generated/prisma/enums";
import { CONTACT_TYPES, CONTACT_TYPE_ICONS, CONTACT_TYPE_LABELS } from "@/lib/domain";
import { quickLog } from "@/app/(app)/klanten/[id]/actions";

/**
 * Quick Log: klik 1 opent het menu, klik 2 op een contacttype registreert
 * direct een contactmoment van nu door de ingelogde trainer.
 */
export default function QuickLog({
  clientId,
  clientName,
  align = "right",
  size = "sm",
}: {
  clientId: string;
  clientName: string;
  align?: "left" | "right";
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(null), 2500);
    return () => clearTimeout(t);
  }, [done]);

  function log(type: ContactType) {
    startTransition(async () => {
      await quickLog(clientId, type, note);
      setOpen(false);
      setNote("");
      setDone(CONTACT_TYPE_LABELS[type]);
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Quick log voor ${clientName}`}
        className={`inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-700 ${
          size === "md" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs"
        }`}
      >
        <span aria-hidden>⚡</span> {done ? `${done} gelogd ✓` : "Quick log"}
      </button>

      {open && (
        <div
          className={`absolute z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <p className="text-xs font-medium text-slate-500">Log contact met {clientName} (nu)</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {CONTACT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                disabled={pending}
                onClick={() => log(type)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-2 text-left text-xs font-medium text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50"
              >
                <span aria-hidden>{CONTACT_TYPE_ICONS[type]}</span>
                {CONTACT_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notitie (optioneel)"
            className="mt-2 block w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
          {pending && <p className="mt-2 text-xs text-slate-400">Opslaan…</p>}
        </div>
      )}
    </div>
  );
}
