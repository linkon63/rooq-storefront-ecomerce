"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { ORDER_JOURNEY_STEPS } from "@/lib/constants/storefront";
import { canRunWebGL, prefersLowPower } from "@/lib/storefront/device";
import { useJourneyProgress } from "./use-journey-progress";

const JourneyScene = dynamic(() => import("./journey-scene"), { ssr: false });

const STEPS = ORDER_JOURNEY_STEPS.length;

/**
 * How an order reaches the shopper, as a 3D road a parcel travels along
 * (three.js, timed by GSAP). The numbered list below is the real content and
 * the whole story without motion: reduced motion, low-power devices and
 * browsers without WebGL see only the list.
 */
export function OrderJourney() {
  const section = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [capable, setCapable] = useState(false);
  const [ready, setReady] = useState(false);
  const animate = capable && !reduced;
  const { progress, active } = useJourneyProgress(section, STEPS, animate);

  useEffect(() => {
    setCapable(canRunWebGL() && !prefersLowPower());
  }, []);

  return (
    <section ref={section} aria-labelledby="journey-title" className="bg-ink text-chalk">
      <div className="page-gutter section-y flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h2 id="journey-title" className="type-h2">
            From our hands to yours
          </h2>
          <p className="type-lead max-w-[52ch] text-chalk/75">Every order follows the same six steps. You pay only when the parcel is in your hands.</p>
        </div>
        {animate ? (
          <div aria-hidden className={`h-56 transition-opacity duration-700 md:h-72 ${ready ? "opacity-100" : "opacity-0"}`}>
            <JourneyScene steps={STEPS} progress={progress} active onReady={() => setReady(true)} />
          </div>
        ) : null}
        <ol className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3 lg:grid-cols-6">
          {ORDER_JOURNEY_STEPS.map((step, index) => {
            const lit = !animate || index <= active;
            return (
              <li key={step.key} aria-current={animate && index === active ? "step" : undefined} className="flex flex-col gap-2">
                <span className={`h-px w-full transition-colors duration-500 ${lit ? "bg-dye" : "bg-chalk/20"}`} />
                <span className={`type-label transition-opacity duration-500 ${lit ? "opacity-100" : "opacity-50"}`}>
                  {index + 1}. {step.title}
                </span>
                <span className="type-body text-chalk/70">{step.body}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
