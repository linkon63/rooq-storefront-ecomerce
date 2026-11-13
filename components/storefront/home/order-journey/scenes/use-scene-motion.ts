"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

type Build = (q: (selector: string) => Element[], intro: gsap.core.Timeline, loop: gsap.core.Timeline) => void;

/**
 * Plays a scene's intro once it mounts, then its ambient loop. With reduced
 * motion the intro jumps straight to its final frame and nothing loops.
 */
export function useSceneMotion(build: Build, animate: boolean) {
  const scope = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const q = (selector: string) => gsap.utils.toArray<Element>(selector, root);
      const intro = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.6 }, paused: true });
      const loop = gsap.timeline({ repeat: -1, paused: true });
      build(q, intro, loop);
      if (!animate) {
        intro.progress(1);
        loop.revert();
        return;
      }
      intro.eventCallback("onComplete", () => {
        loop.play();
      });
      intro.play();
    },
    { scope, dependencies: [animate] },
  );

  return scope;
}

/** Shared tween for a hotspot ring: grow and fade, forever. Renders nothing until the loop plays. */
export function pulse(loop: gsap.core.Timeline, target: Element[], at = 0) {
  loop.fromTo(target, { scale: 0.8, opacity: 0.9, transformOrigin: "50% 50%" }, { scale: 1.5, opacity: 0, duration: 1.4, ease: "power1.out", immediateRender: false }, at);
}
