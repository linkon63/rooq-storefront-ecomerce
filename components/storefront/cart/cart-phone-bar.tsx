"use client";

import Link from "next/link";
import { useMoney } from "@/hooks/use-money";

/** Phones: total and Check out stay above the tab bar. */
export function CartPhoneBar({ total, blocked }: { total: number; blocked: boolean }) {
  const format = useMoney();
  return (
    <div data-action-bar="stacked" className="mobile-action-bar flex items-center gap-4 md:hidden">
      <p className="flex-1 text-sm text-stone">
        Total <strong className="block text-base text-ink tabular-nums">{format(total)}</strong>
      </p>
      <Link
        href="/checkout"
        aria-disabled={blocked}
        className={`press inline-flex h-11 w-44 items-center justify-center rounded text-sm font-semibold ${blocked ? "pointer-events-none bg-selvedge text-stone" : "bg-ink text-chalk"}`}
      >
        Check out
      </Link>
    </div>
  );
}
