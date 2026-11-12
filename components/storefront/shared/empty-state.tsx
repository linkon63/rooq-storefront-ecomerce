import Link from "next/link";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  body?: string;
  action?: { label: string; href: string };
  children?: ReactNode;
  tone?: "empty" | "error";
};

/** Empty and error states: say what happened and offer the next step. */
export function EmptyState({ title, body, action, children, tone = "empty" }: EmptyStateProps) {
  return (
    <div role={tone === "error" ? "alert" : undefined} className="flex flex-col items-start gap-3 py-16">
      <h2 className="font-wide text-xl font-bold md:text-2xl">{title}</h2>
      {body ? <p className="max-w-[52ch] text-stone">{body}</p> : null}
      {children}
      {action ? (
        <Link
          href={action.href}
          className="mt-2 inline-flex h-11 items-center rounded bg-ink px-5 text-sm font-semibold text-chalk hover:bg-ink-soft"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
