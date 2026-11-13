"use client";

import { useRef } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/use-media-query";
import { ORDER_JOURNEY_STEPS } from "@/lib/constants/storefront";
import type { Messages } from "@/lib/i18n/messages";
import { JourneyCopy } from "./journey-copy";
import { JourneyStage } from "./journey-stage";
import { JourneySteps } from "./journey-steps";
import { useJourneyProgress } from "./use-journey-progress";

const STEPS = ORDER_JOURNEY_STEPS.length;

/**
 * How an order reaches the shopper. The illustrated scene for each step runs
 * full width behind the copy (above it on small screens) and loops through
 * all six; the copy changes with it, and clicking the scene or the button
 * moves the story on. With reduced motion the scenes are still pictures.
 */
export function OrderJourney({ t }: { t: Messages["home"] }) {
  const section = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const animate = !reduced;
  const wide = useMediaQuery("(min-width: 64rem)");
  const { active, playing, goTo, setPlayback } = useJourneyProgress(section, STEPS, animate);

  const advance = () => goTo(active >= STEPS - 1 ? 0 : active + 1);

  return (
    <section ref={section} aria-labelledby="journey-title" className="relative isolate overflow-hidden bg-ink text-chalk">
      <div className="aspect-[4/3] w-full sm:aspect-[16/9] lg:absolute lg:inset-0 lg:-z-10 lg:aspect-auto">
        <JourneyStage active={active} animate={animate} wide={wide} onAction={advance} />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 -z-10 hidden w-[62%] bg-gradient-to-r from-ink from-35% via-ink/85 via-55% to-transparent lg:block" />
      <div className="page-gutter pointer-events-none flex flex-col justify-center py-8 lg:min-h-[calc(100svh-var(--header-h))] lg:py-14">
        <div className="pointer-events-auto flex w-full max-w-md flex-col gap-8 lg:gap-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h2 id="journey-title" className="type-h2">
                {t.journeyTitle}
              </h2>
              <p className="type-body text-chalk/70">{t.journeyLead}</p>
            </div>
            {animate ? (
              <button
                type="button"
                onClick={() => setPlayback(!playing)}
                aria-label={playing ? t.journeyPause : t.journeyPlay}
                className="grid size-10 shrink-0 place-items-center rounded-full ring-1 ring-chalk/30 transition-colors hover:bg-chalk hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk"
              >
                {playing ? <FiPause aria-hidden className="size-4" /> : <FiPlay aria-hidden className="size-4" />}
              </button>
            ) : null}
          </div>
          <JourneyCopy active={active} animate={animate} onAdvance={advance} t={t} />
          <JourneySteps active={active} onPick={goTo} steps={t.journey} />
        </div>
      </div>
    </section>
  );
}
