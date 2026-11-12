"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMoney } from "@/hooks/use-money";
import type { CartSummary as Summary } from "@/utils/storefront/cart";

type Row = { label: string; amount: number; tone?: "saving" };

type CartSummaryProps = {
  summary: Summary;
  extraRows?: Row[];
  total: number;
  children?: ReactNode;
  checkoutHref?: string;
  blocked?: boolean;
};

/** Money breakdown. The cart page links on to checkout; checkout passes its own action as children. */
export function CartSummary({ summary, extraRows = [], total, children, checkoutHref, blocked = false }: CartSummaryProps) {
  const format = useMoney();
  const rows: Row[] = [
    { label: `Items (${summary.count})`, amount: summary.listSubtotal },
    ...(summary.savings > 0 ? [{ label: "Sale savings", amount: -summary.savings, tone: "saving" as const }] : []),
    ...extraRows,
  ];
  return (
    <div className="flex flex-col gap-4 rounded bg-paper p-5">
      <h2 className="font-wide text-lg font-bold">Summary</h2>
      <dl className="flex flex-col gap-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <dt className="text-stone">{row.label}</dt>
            <dd className={`tabular-nums ${row.tone === "saving" ? "text-dye-deep" : ""}`}>
              {row.amount < 0 ? `−${format(-row.amount)}` : format(row.amount)}
            </dd>
          </div>
        ))}
        <div className="mt-2 flex justify-between gap-4 border-t border-selvedge pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{format(total)}</dd>
        </div>
      </dl>
      {children}
      {checkoutHref ? (
        <Link
          href={checkoutHref}
          aria-disabled={blocked}
          className={`inline-flex h-12 items-center justify-center rounded text-sm font-semibold ${
            blocked ? "pointer-events-none bg-selvedge text-stone" : "bg-ink text-chalk hover:bg-ink-soft"
          }`}
        >
          Check out
        </Link>
      ) : null}
    </div>
  );
}
