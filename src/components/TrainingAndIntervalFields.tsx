"use client";

import { useState } from "react";
import { suggestContactIntervalWeeks } from "@/lib/domain";

export default function TrainingAndIntervalFields({
  initialSessionsPerWeek,
  initialSessionMinutes,
  initialIntervalWeeks,
}: {
  initialSessionsPerWeek?: number | null;
  initialSessionMinutes?: number | null;
  initialIntervalWeeks?: number;
}) {
  const [sessionsPerWeek, setSessionsPerWeek] = useState<string>(
    initialSessionsPerWeek != null ? String(initialSessionsPerWeek) : ""
  );
  const [interval, setInterval] = useState(String(initialIntervalWeeks ?? 5));

  const suggested = suggestContactIntervalWeeks(sessionsPerWeek === "" ? null : Number(sessionsPerWeek));
  const suggestionApplied = Number(interval) === suggested;

  return (
    <>
      <div>
        <label htmlFor="ptSessionsPerWeek" className="block text-sm font-medium text-slate-700">
          PT-sessies per week
        </label>
        <input
          id="ptSessionsPerWeek"
          name="ptSessionsPerWeek"
          type="number"
          min={0}
          max={14}
          value={sessionsPerWeek}
          onChange={(e) => setSessionsPerWeek(e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>
      <div>
        <label htmlFor="ptSessionMinutes" className="block text-sm font-medium text-slate-700">
          Minuten per sessie
        </label>
        <input
          id="ptSessionMinutes"
          name="ptSessionMinutes"
          type="number"
          min={0}
          step={5}
          defaultValue={initialSessionMinutes ?? undefined}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div>
        <label htmlFor="contactIntervalWeeks" className="block text-sm font-medium text-slate-700">
          Contactinterval (weken)
        </label>
        <select
          id="contactIntervalWeeks"
          name="contactIntervalWeeks"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          {[4, 5, 6].map((n) => (
            <option key={n} value={n}>
              Elke {n} weken
            </option>
          ))}
        </select>
        {!suggestionApplied && (
          <p className="mt-1 text-xs text-slate-500">
            Slim voorstel op basis van trainingsfrequentie: elke {suggested} weken.{" "}
            <button
              type="button"
              onClick={() => setInterval(String(suggested))}
              className="font-medium text-slate-700 hover:underline"
            >
              Overnemen
            </button>
          </p>
        )}
      </div>
    </>
  );
}
