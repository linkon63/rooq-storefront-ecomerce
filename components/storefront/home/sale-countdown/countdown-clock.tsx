"use client";

import { useEffect, useState } from "react";
import type { Messages } from "@/lib/i18n/messages";
import { pad2, timeLeft, type TimeLeft } from "@/utils/storefront/countdown";
import { FlipCard } from "./flip-card";

const UNITS = ["days", "hours", "minutes", "seconds"] as const satisfies readonly (keyof Omit<TimeLeft, "totalMs">)[];

type CountdownClockProps = { endAt: string; labels: Messages["home"]["clock"]; endedLabel: string };

/**
 * Days / hours / minutes / seconds until `endAt` on split-flap cards,
 * ticking every second. The first render waits for the client clock so
 * server and client agree.
 */
export function CountdownClock({ endAt, labels, endedLabel }: CountdownClockProps) {
  const [left, setLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const tick = () => setLeft(timeLeft(endAt, Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [endAt]);

  if (left !== null && left.totalMs <= 0) {
    return (
      <p role="status" className="type-h3 text-selvedge">
        {endedLabel}
      </p>
    );
  }

  return (
    <div role="timer" aria-live="off" aria-label={labels.aria} className="flex flex-col gap-2">
      <p className="type-label text-chalk/70">{labels.endsIn}</p>
      <ol className="grid max-w-md grid-cols-4 gap-2 sm:gap-3">
        {UNITS.map((unit) => {
          const value = left ? pad2(left[unit]) : "--";
          return (
            <li key={unit} className="flex flex-col items-center gap-1.5">
              <span className="block w-full overflow-hidden rounded-sm font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold tabular-nums shadow-[0_8px_18px_-8px_rgb(0_0_0/0.6)]">
                <FlipCard value={value} />
                <span className="sr-only">{value}</span>
              </span>
              <span className="type-meta text-chalk/60">{labels[unit]}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
