"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import type { Messages } from "@/lib/i18n/messages";

gsap.registerPlugin(useGSAP);

type JourneyCopyProps = { active: number; animate: boolean; onAdvance: () => void; t: Messages["home"] };

/** The current step in words, swapped in as the scene behind it changes. */
export function JourneyCopy({ active, animate, onAdvance, t }: JourneyCopyProps) {
  const scope = useRef<HTMLDivElement>(null);
  const step = t.journey[active] ?? t.journey[0];

  useGSAP(
    () => {
      if (!animate) return;
      gsap.from("[data-copy]", { y: 14, opacity: 0, duration: 0.5, stagger: 0.07, ease: "power2.out" });
    },
    { scope, dependencies: [active, animate], revertOnUpdate: true },
  );

  return (
    <div ref={scope} className="flex flex-col items-start gap-3">
      <p data-copy className="type-meta tabular-nums text-chalk/60">
        {t.step(active + 1, t.journey.length)}
      </p>
      <h3 data-copy className="type-display flex items-end text-chalk lg:min-h-[2em]">
        {step.title}
      </h3>
      <p data-copy className="type-lead max-w-[36ch] text-chalk/80">
        {step.body}
      </p>
      <button
        data-copy
        type="button"
        onClick={onAdvance}
        className="type-ui mt-2 rounded-full bg-dye px-5 py-2.5 text-chalk transition-colors hover:bg-dye-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk"
      >
        {step.action}
      </button>
    </div>
  );
}
