"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState, type RefObject } from "react";
import { journeyAt } from "@/utils/storefront/journey";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LOOP_SECONDS = 12;

/**
 * Drives the journey with a looping GSAP tween that plays only while the
 * section is on screen. `progress` is read every frame by the 3D scene; the
 * lit step is React state, updated only when it changes.
 */
export function useJourneyProgress(scope: RefObject<HTMLElement | null>, steps: number, enabled: boolean) {
  const progress = useRef(0);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      if (!enabled || !scope.current) return;
      const state = { value: 0 };
      const tween = gsap.to(state, {
        value: 1,
        duration: LOOP_SECONDS,
        ease: "none",
        repeat: -1,
        repeatDelay: 1,
        paused: true,
        onUpdate: () => {
          progress.current = state.value;
          const next = journeyAt(state.value, steps).active;
          setActive((current) => (current === next ? current : next));
        },
      });
      const trigger = ScrollTrigger.create({
        trigger: scope.current,
        start: "top 85%",
        end: "bottom 15%",
        onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
      });
      return () => {
        trigger.kill();
        tween.kill();
      };
    },
    { scope, dependencies: [enabled, steps] },
  );

  return { progress, active };
}
