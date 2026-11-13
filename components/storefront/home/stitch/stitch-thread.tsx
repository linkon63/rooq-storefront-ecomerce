"use client";

import { useEffect, useRef, useState } from "react";
import { stitchPathD, stitchPoints } from "@/utils/storefront/stitch-path";
import { Needle } from "./needle";
import { useStitchScroll } from "./use-stitch-scroll";

const MASK_ID = "rooq-home-stitch";

/**
 * A needle that sews a meandering running stitch (kantha-style) down the home
 * page as the shopper scrolls. The path is laid out in pixels from the page's
 * own size (re-measured as images load), so the stitches keep their length.
 */
export default function StitchThread() {
  const box = useRef<HTMLDivElement>(null);
  const thread = useRef<SVGPathElement>(null);
  const reveal = useRef<SVGPathElement>(null);
  const needle = useRef<SVGGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const d = size.width && size.height ? stitchPathD(stitchPoints(size.width, size.height)) : "";
  useStitchScroll({ box, thread, reveal, needle }, d);

  return (
    <div ref={box} aria-hidden className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {d ? (
        <svg width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`} className="absolute inset-0" focusable="false">
          <defs>
            <mask id={MASK_ID} maskUnits="userSpaceOnUse" x={0} y={0} width={size.width} height={size.height}>
              <path ref={reveal} d={d} fill="none" stroke="white" strokeWidth={10} strokeDasharray="0 999999" />
            </mask>
          </defs>
          <path
            ref={thread}
            d={d}
            fill="none"
            mask={`url(#${MASK_ID})`}
            className="stroke-dye/75"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeDasharray="13 9"
          />
          <Needle ref={needle} />
        </svg>
      ) : null}
    </div>
  );
}
