"use client";

import { useState, useTransition } from "react";
import type { GoalStatus } from "@/generated/prisma/client";
import { GOAL_STATUS_LABELS } from "@/lib/domain";
import { updateGoalStatus } from "../actions";

const OPTIONS: GoalStatus[] = ["OPEN", "BEZIG", "BEHAALD", "GESTOPT"];

export default function GoalStatusSelect({
  clientId,
  goalId,
  status,
}: {
  clientId: string;
  goalId: string;
  status: GoalStatus;
}) {
  const [prevStatus, setPrevStatus] = useState(status);
  const [value, setValue] = useState(status);
  const [, startTransition] = useTransition();

  if (status !== prevStatus) {
    setPrevStatus(status);
    setValue(status);
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        const next = e.target.value as GoalStatus;
        setValue(next);
        startTransition(() => {
          updateGoalStatus(clientId, goalId, next);
        });
      }}
      className="rounded-full border-0 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
    >
      {OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {GOAL_STATUS_LABELS[opt]}
        </option>
      ))}
    </select>
  );
}
