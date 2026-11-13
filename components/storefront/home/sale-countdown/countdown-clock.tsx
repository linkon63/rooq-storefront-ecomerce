"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import type { Messages } from "@/lib/i18n/messages";
import { pad2, timeLeft, type TimeLeft } from "@/utils/storefront/countdown";

gsap.registerPlugin(useGSAP);

const UNITS = ["days", "hours", "minutes", "seconds"] as const satisfies readonly (keyof Omit<TimeLeft, "totalMs">)[];

/**
 * Days / hours / minutes / seconds until `endAt`, ticking every second.
 * Each changed digit drops in (GSAP); with reduced motion it just updates.
 * The first render waits for the client clock so server and client agree.
 */
export function CountdownClock({ endAt, labels }: { endAt: string; labels: Messages["home"]["clock"] }) {
  const [left, setLeft] = useState<TimeLeft | null>(null);
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setLeft(timeLeft(endAt, Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [endAt]);

  const ended = left !== null && left.totalMs <= 0;

  useGSAP(
    () => {
      if (!left || ended) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo("[data-tick='seconds']", { yPercent: -40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: "power2.out" });
      });
      return () => media.revert();
    },
    { scope, dependencies: [left?.seconds, ended] },
  );

  if (ended) {
    return (
      <p role="status" className="type-h3 text-selvedge">
        This sale has ended.
      </p>
    );
  }

  return (
    <div ref={scope} role="timer" aria-live="off" aria-label={labels.aria} className="flex flex-col gap-2">
      <p className="type-label text-chalk/70">{labels.endsIn}</p>
      <ol className="grid max-w-md grid-cols-4 gap-2 sm:gap-3">
        {UNITS.map((unit) => (
          <li key={unit} className="flex flex-col items-center gap-1 border border-chalk/20 bg-chalk/5 px-2 py-3 backdrop-blur-sm">
            <span className="overflow-hidden">
              <span
                data-tick={unit}
                className="block font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-none tabular-nums"
              >
                {left ? pad2(left[unit]) : "--"}
              </span>
            </span>
            <span className="type-meta text-chalk/60">{labels[unit]}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
