"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";
import { FRAME, SHUTTLE, WEAVER_MIRROR } from "./loom-geometry";
import { LoomFrame } from "./loom-frame";
import { ShuttleBeater } from "./shuttle-beater";
import { WeaverFigure } from "./weaver-figure";
import { clothAt, weaveTimeline } from "./weave-timeline";
import { SPINNER_PIVOTS, SpinnerFigure } from "./spinner-figure";
import { WovenCloth } from "./woven-cloth";
import { WovenWordmark } from "./woven-wordmark";

gsap.registerPlugin(useGSAP);

/** One turn of the charkha wheel. */
const WHEEL_SECONDS = 2.4;

const VIEW_BOX = `${FRAME.x} ${FRAME.y} ${FRAME.width} ${FRAME.height}`;
/** Both layers cover the box exactly, so the whole scene (weaver, loom, spinner) is always in view. */
const LAYER = "absolute inset-0";

/**
 * The footer's handloom, centred: on its left a weaver throws the shuttle
 * across the warp and beats the weft in, on its right a man spins yarn at a
 * charkha; on the loom the tant sharee grows one beat at a time, weaving
 * "ROOQ" and then a thank-you (see weave-timeline.ts). Plays only while on
 * screen; with reduced motion it is a still frame of the finished "ROOQ".
 *
 * `children` (the green wash) sits between the loom and a top layer that
 * holds only the woven messages, so the letters stay pure white. Both layers
 * share one viewBox and one animation, so they line up and grow together.
 */
export default function LoomScene({ children }: { children?: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);
      const targets = {
        clip: q("[data-cloth-clip]"),
        fell: q("[data-fell]"),
        beater: q("[data-beater]"),
        shuttle: q("[data-shuttle]"),
        arm: q("[data-weaver-arm]"),
        treadle: q("[data-treadle]"),
        heddles: q("[data-heddle]"),
        cloth: q("[data-cloth-layer]"),
        messages: q("[data-woven-message]"),
      };
      const [wheel, spinnerArm] = [q("[data-charkha-wheel]"), q("[data-spinner-arm]")];
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: reduce)", () => {
        const still = clothAt(1);
        gsap.set(targets.clip, still.clip);
        gsap.set(targets.fell, still.fell);
        gsap.set(targets.shuttle, { x: SHUTTLE.travel * 0.6 });
        gsap.set(targets.messages, { autoAlpha: (i: number) => (i === 0 ? 1 : 0) });
      });

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const weaving = weaveTimeline(targets);

        const spinning = gsap
          .timeline({ repeat: -1 })
          .to(wheel, { rotation: 360, svgOrigin: SPINNER_PIVOTS.wheel, duration: WHEEL_SECONDS, ease: "none" })
          .to(spinnerArm, { rotation: 10, svgOrigin: SPINNER_PIVOTS.shoulder, duration: WHEEL_SECONDS / 2, ease: "sine.inOut" }, 0)
          .to(spinnerArm, { rotation: 0, svgOrigin: SPINNER_PIVOTS.shoulder, duration: WHEEL_SECONDS / 2, ease: "sine.inOut" });

        const timelines = [weaving, spinning];
        const root = scope.current;
        const observer = new IntersectionObserver(([entry]) => {
          timelines.forEach((timeline) => (entry?.isIntersecting ? timeline.play() : timeline.pause()));
        });
        if (root) observer.observe(root);
        return () => observer.disconnect();
      });

      return () => media.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className="absolute inset-0">
      <div className={`${LAYER} opacity-95`}>
        <svg viewBox={VIEW_BOX} preserveAspectRatio="xMidYMid meet" className="h-full w-full" focusable="false" aria-hidden>
          <LoomFrame />
          <g data-cloth-layer>
            <WovenCloth />
            <ShuttleBeater />
          </g>
          <g transform={WEAVER_MIRROR}>
            <WeaverFigure />
          </g>
          <SpinnerFigure />
        </svg>
      </div>
      {children}
      <div className={LAYER}>
        <svg viewBox={VIEW_BOX} preserveAspectRatio="xMidYMid meet" className="h-full w-full" focusable="false" aria-hidden>
          <g data-cloth-layer>
            <WovenWordmark />
          </g>
        </svg>
      </div>
    </div>
  );
}
