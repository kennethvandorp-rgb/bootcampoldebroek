"use client";

import { useState } from "react";
import { INPUT_CLASS } from "@/components/fields";

/** Datumveld met snelkeuzes (morgen, over een week, ...). `options` komen van de server, in de studio-tijdzone. */
export function DueDateField({ defaultValue, options }: { defaultValue: string; options: { label: string; value: string }[] }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div>
      <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700">
        Streefdatum<span className="text-red-500"> *</span>
      </label>
      <input
        id="dueDate"
        name="dueDate"
        type="date"
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={INPUT_CLASS}
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setValue(o.value)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
              value === o.value
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : "border-slate-300 text-slate-600 hover:border-slate-400"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Tekstveld met klikbare voorbeeldinstructies. */
export function NoteWithSuggestions({ suggestions }: { suggestions: string[] }) {
  const [value, setValue] = useState("");
  return (
    <div>
      <label htmlFor="note" className="block text-sm font-medium text-slate-700">
        Instructie / notitie<span className="text-red-500"> *</span>
      </label>
      <textarea
        id="note"
        name="note"
        required
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={INPUT_CLASS}
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setValue(s)}
            className="rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-emerald-600 hover:text-emerald-800"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
