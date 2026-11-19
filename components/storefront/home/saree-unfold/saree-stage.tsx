"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SareeCanvas = dynamic(() => import("./saree-canvas"), { ssr: false });

function supportsWebGL(): boolean {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

/**
 * Holds the 3D saree. A woven-look CSS fallback shows first (and stays when
 * WebGL is missing); three.js loads only once the stage is near the screen.
 * Scrolling the stage into view drives the unfold (0 → 1).
 */
export function SareeStage({ label, className = "" }: { label: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const reduced = usePrefersReducedMotion();
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const nearby = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setWebgl(supportsWebGL());
      setNear(true);
      nearby.disconnect();
    }, { rootMargin: "400px 0px" });
    const visible = new IntersectionObserver(([entry]) => setOnScreen(Boolean(entry?.isIntersecting)));
    nearby.observe(element);
    visible.observe(element);
    return () => {
      nearby.disconnect();
      visible.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      if (reduced) return;
      const trigger = ScrollTrigger.create({
        trigger: box.current,
        start: "top 85%",
        end: "center 40%",
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
      progress.current = trigger.progress;
      return () => trigger.kill();
    },
    { dependencies: [reduced] },
  );

  return (
    <div ref={box} role="img" aria-label={label} className={`relative aspect-[4/3] w-full lg:aspect-[16/10] ${className}`}>
      <div aria-hidden className="absolute inset-x-[14%] bottom-[8%] h-10 rounded-[50%] bg-black/40 blur-2xl" />
      <div
        aria-hidden
        className={`saree-fallback absolute inset-x-[4%] inset-y-[26%] -skew-y-3 transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
      />
      {near && webgl ? (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <SareeCanvas progress={progress} animate={!reduced} running={onScreen} onReady={() => setReady(true)} />
        </div>
      ) : null}
    </div>
  );
}
