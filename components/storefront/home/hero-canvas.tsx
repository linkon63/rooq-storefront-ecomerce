"use client";

import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { canRunWebGL, prefersLowPower } from "@/lib/storefront/device";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ClothScene = dynamic(() => import("./cloth-scene"), { ssr: false });

/**
 * Hosts the three.js cloth behind the hero copy. The static gradient below is
 * always painted first (and is all that shows for reduced motion, data saver,
 * low-power devices or no WebGL); the canvas fades in over it on its first
 * frame, so nothing shifts. A GSAP ScrollTrigger scrubs `progress` (0 → 1 as
 * the hero scrolls away) and the cloth lifts and turns with it.
 */
export function HeroCanvas() {
  const reduced = usePrefersReducedMotion();
  const host = useRef<HTMLDivElement>(null);
  const [capable, setCapable] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCapable(canRunWebGL() && !prefersLowPower());
  }, []);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const enabled = capable && !reduced;
  const progress = useRef(0);

  useGSAP(
    () => {
      if (!enabled || !host.current) return;
      const trigger = ScrollTrigger.create({
        trigger: host.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
      return () => trigger.kill();
    },
    { scope: host, dependencies: [enabled] },
  );

  return (
    <div ref={host} aria-hidden className="absolute inset-0">
      <div className="hero-fabric-fallback absolute inset-0" />
      {enabled ? (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <ClothScene active={visible} progress={progress} onReady={() => setReady(true)} />
        </div>
      ) : null}
    </div>
  );
}
