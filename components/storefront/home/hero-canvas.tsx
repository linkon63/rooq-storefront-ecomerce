"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { canRunWebGL, prefersLowPower } from "@/lib/storefront/device";

const ClothScene = dynamic(() => import("./cloth-scene"), { ssr: false });

/**
 * Hosts the three.js cloth behind the hero copy. The static gradient below is
 * always painted first (and is all that shows for reduced motion, data saver,
 * low-power devices or no WebGL); the canvas fades in over it on its first
 * frame, so nothing shifts.
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

  return (
    <div ref={host} aria-hidden className="absolute inset-0">
      <div className="hero-fabric-fallback absolute inset-0" />
      {enabled ? (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          <ClothScene active={visible} onReady={() => setReady(true)} />
        </div>
      ) : null}
    </div>
  );
}
