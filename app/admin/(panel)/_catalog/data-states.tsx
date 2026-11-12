import type { ReactNode } from "react";
import { AdminIcon } from "../../_components/admin-icons";
import { Button } from "./button";

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="grid gap-3 p-5">
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((row) => (
        <div key={row} className="h-10 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />
      ))}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <span className="flex items-center gap-2">
        <AdminIcon className="h-4 w-4" name="info" />
        {message}
      </span>
      {onRetry ? (
        <Button tone="secondary" className="h-8" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyBlock({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="grid justify-items-center gap-2 px-6 py-12 text-center">
      <p className="text-base font-semibold text-slate-800">{title}</p>
      <p className="max-w-md text-sm text-slate-500">{body}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
