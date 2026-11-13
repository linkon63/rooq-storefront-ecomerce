"use client";

import { useRef } from "react";
import { stitchPathD } from "@/utils/storefront/stitch-path";
import { Needle } from "./needle";
import { useStitchLayout } from "./use-stitch-layout";
import { useStitchScroll } from "./use-stitch-scroll";

const IDS = { mask: "rooq-stitch-reveal", page: "rooq-stitch-page", footer: "rooq-stitch-footer" } as const;
const STITCH = { strokeWidth: 1.8, strokeLinecap: "round", strokeDasharray: "7 5", fill: "none" } as const;

/**
 * A needle that sews a running stitch (kantha-style) down the home page and
 * on through the footer as the shopper scrolls, under the sticky header:
 * from the top of the hero (in line with the logo), over the hero,
 * through straight runs, sweeps and circles, ending in the footer by the
 * WhatsApp button, which it points to. The thread is magenta over the page
 * and gold over the dark footer. Laid out in pixels from the measured page,
 * so the stitches keep their length.
 */
export default function StitchThread() {
  const box = useRef<HTMLDivElement>(null);
  const thread = useRef<SVGPathElement>(null);
  const reveal = useRef<SVGPathElement>(null);
  const needle = useRef<SVGGElement>(null);
  const { width, height, startX, startY, heroBottom, footerY, endY } = useStitchLayout(box);

  const d = width && endY > startY ? stitchPathD(width, startX, startY, heroBottom, endY) : "";
  useStitchScroll({ box, thread, reveal, needle }, d);

  return (
    <div ref={box} aria-hidden className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {d ? (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="absolute inset-0" focusable="false">
          <defs>
            <mask id={IDS.mask} maskUnits="userSpaceOnUse" x={0} y={0} width={width} height={height}>
              <path ref={reveal} d={d} fill="none" stroke="white" strokeWidth={10} strokeDasharray="0 999999" />
            </mask>
            <clipPath id={IDS.page}>
              <rect x={0} y={0} width={width} height={footerY} />
            </clipPath>
            <clipPath id={IDS.footer}>
              <rect x={0} y={footerY} width={width} height={Math.max(0, height - footerY)} />
            </clipPath>
          </defs>
          <g mask={`url(#${IDS.mask})`}>
            <path ref={thread} d={d} clipPath={`url(#${IDS.page})`} className="stroke-dye/75" {...STITCH} />
            <path d={d} clipPath={`url(#${IDS.footer})`} className="stroke-gold" {...STITCH} />
          </g>
          <Needle ref={needle} />
        </svg>
      ) : null}
    </div>
  );
}
