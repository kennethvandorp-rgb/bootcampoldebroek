"use client";

import { useState, useTransition } from "react";
import type { ActionItemStatus } from "@/generated/prisma/client";
import { toggleActionItem } from "../actions";

export default function ActionItemToggle({
  clientId,
  actionItemId,
  status,
}: {
  clientId: string;
  actionItemId: string;
  status: ActionItemStatus;
}) {
  const [prevStatus, setPrevStatus] = useState(status);
  const [checked, setChecked] = useState(status === "AFGEROND");
  const [, startTransition] = useTransition();

  if (status !== prevStatus) {
    setPrevStatus(status);
    setChecked(status === "AFGEROND");
  }

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={() => {
        setChecked((prev) => !prev);
        startTransition(() => {
          toggleActionItem(clientId, actionItemId, status);
        });
      }}
      className="h-4 w-4 rounded border-slate-300"
    />
  );
}
