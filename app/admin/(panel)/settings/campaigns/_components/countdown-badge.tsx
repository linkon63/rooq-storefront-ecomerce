"use client";

import { useEffect, useState } from "react";
import { formatTimeLeft, timeLeft } from "@/utils/storefront/countdown";

/** Live "Ends in 2d 04h 15m" for a countdown campaign (or a note when the end date is missing). */
export function CountdownBadge({ endAt }: { endAt?: string | null }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!endAt) return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [endAt]);

  if (!endAt) {
    return <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">No end date</span>;
  }
  const left = now === null ? null : timeLeft(endAt, now);
  const ended = left !== null && left.totalMs <= 0;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
        ended ? "bg-slate-100 text-slate-500" : "bg-rose-50 text-rose-700"
      }`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${ended ? "bg-slate-400" : "animate-pulse bg-rose-500"}`} />
      {left === null ? "…" : ended ? "Ended" : `Ends in ${formatTimeLeft(left)}`}
    </span>
  );
}
