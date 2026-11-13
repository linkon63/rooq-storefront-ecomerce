"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useRef, useState, type RefObject } from "react";
import { journeyAt } from "@/utils/storefront/journey";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SECONDS_PER_STEP = 6;
/** After the shopper picks a step, how long it stays before the loop carries on. */
const HOLD_SECONDS = 7;

/**
 * Drives the journey. With motion, a looping GSAP timeline steps through the
 * scenes while the section is on screen; picking a step jumps there, holds
 * it, then the loop carries on unless the shopper paused it. Without motion,
 * steps change only when picked.
 */
export function useJourneyProgress(scope: RefObject<HTMLElement | null>, steps: number, enabled: boolean) {
  const legs = Math.max(1, steps - 1);
  const progress = useRef(0);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const onScreen = useRef(false);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(true);
  const manual = useRef(false);
  const resume = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      if (!enabled || !scope.current) return;
      const state = { value: progress.current };
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5, paused: true });
      tl.to(state, {
        value: 1,
        duration: SECONDS_PER_STEP * legs,
        ease: "none",
        onUpdate: () => {
          progress.current = state.value;
          if (manual.current) return;
          const next = journeyAt(state.value, steps).active;
          setActive((current) => (current === next ? current : next));
        },
      });
      timeline.current = tl;
      const trigger = ScrollTrigger.create({
        trigger: scope.current,
        start: "top 80%",
        end: "bottom 20%",
        onToggle: (self) => {
          onScreen.current = self.isActive;
          if (self.isActive && playingRef.current && !manual.current) tl.play();
          else tl.pause();
        },
      });
      return () => {
        resume.current?.kill();
        trigger.kill();
        tl.kill();
        timeline.current = null;
      };
    },
    { scope, dependencies: [enabled, steps] },
  );

  const setPlayback = useCallback((next: boolean) => {
    resume.current?.kill();
    playingRef.current = next;
    setPlaying(next);
    const tl = timeline.current;
    if (!tl) return;
    if (next) {
      manual.current = false;
      if (onScreen.current) tl.play();
    } else tl.pause();
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const target = Math.min(legs, Math.max(0, index));
      setActive(target);
      const tl = timeline.current;
      if (!tl) return;
      resume.current?.kill();
      manual.current = true;
      // Stop a hair before the end of the last leg so the repeating timeline does not wrap to 0.
      const time = Math.min((target / legs) * tl.duration(), tl.duration() - 0.001);
      tl.tweenTo(time, {
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          if (!playingRef.current) return;
          resume.current = gsap.delayedCall(HOLD_SECONDS, () => {
            manual.current = false;
            if (onScreen.current) tl.play();
          });
        },
      });
    },
    [legs],
  );

  return { active, playing, goTo, setPlayback };
}
