"use client";

import clsx from "clsx";

export type StatusState =
  | { type: "idle"; message?: string; lockHint?: string }
  | { type: "info"; message: string; lockHint?: string }
  | { type: "error"; message: string; lockHint?: string }
  | { type: "success"; message: string; lockHint?: string };

type StatusToastProps = {
  status: StatusState;
};

export function StatusToast({ status }: StatusToastProps) {
  if (status.type === "idle") return null;

  const tone =
    status.type === "success"
      ? "border-oasis-accent-strong text-oasis-accent-strong"
      : status.type === "error"
        ? "border-oasis-error text-oasis-error"
        : "border-oasis-border text-oasis-text";

  return (
    <div
      className={clsx(
        "fixed bottom-6 right-6 max-w-sm glass-card p-4 border-l-4 space-y-2",
        tone
      )}
      role="status"
      aria-live="polite"
    >
      <p className="text-sm leading-6">{status.message}</p>
      {status.lockHint ? <p className="text-xs text-oasis-muted">{status.lockHint}</p> : null}
    </div>
  );
}
