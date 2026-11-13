"use client";

import { ORDER_JOURNEY_STEPS } from "@/lib/constants/storefront";

type JourneyStepsProps = { active: number; onPick: (index: number) => void };

/** The six steps as a segmented bar; each segment shows its scene when picked. */
export function JourneySteps({ active, onPick }: JourneyStepsProps) {
  return (
    <ol className="grid w-full grid-cols-6 gap-1.5">
      {ORDER_JOURNEY_STEPS.map((step, index) => {
        const current = index === active;
        const reached = index <= active;
        return (
          <li key={step.key}>
            <button
              type="button"
              onClick={() => onPick(index)}
              aria-current={current ? "step" : undefined}
              title={step.title}
              className="group flex w-full flex-col gap-2 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk"
            >
              <span className={`h-1 w-full rounded-full transition-colors duration-500 ${reached ? "bg-dye" : "bg-chalk/20 group-hover:bg-chalk/40"}`} />
              <span className={`type-meta tabular-nums transition-opacity duration-500 ${current ? "opacity-100" : "opacity-50 group-hover:opacity-80"}`}>
                {index + 1}
                <span className="sr-only">. {step.title}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
