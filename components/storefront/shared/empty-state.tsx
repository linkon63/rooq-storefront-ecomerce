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
      <h2 className="type-h2">{title}</h2>
      {body ? <p className="type-body max-w-[52ch] text-stone">{body}</p> : null}
      {children}
      {action ? (
        <Link
          href={action.href}
          className="type-ui mt-2 inline-flex h-11 items-center rounded bg-ink px-5 text-chalk transition-colors hover:bg-ink/80"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
