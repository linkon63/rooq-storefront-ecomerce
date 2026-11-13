import type { Ref } from "react";

/** The needle is drawn ~50px long; this shrinks it to sit with the small stitches. */
const NEEDLE_SCALE = 0.6;

/**
 * The sewing needle, drawn with its eye at the origin and its point along +x;
 * the stitch hook moves and turns it (`transform`) to the end of the thread.
 */
export function Needle({ ref }: { ref: Ref<SVGGElement> }) {
  return (
    <g ref={ref}>
      <g className="drop-shadow-sm" transform={`scale(${NEEDLE_SCALE})`}>
        <path d="M-4 0 Q-4 -3.2 0 -3.2 L46 -0.4 Q48 0 46 0.4 L0 3.2 Q-4 3.2 -4 0 Z" className="fill-gold stroke-ink/40" strokeWidth={0.6} />
        <ellipse cx={1} cy={0} rx={3} ry={1.2} className="fill-chalk" />
        <path d="M8 -1.6 L40 -0.3" className="stroke-chalk/70" strokeWidth={0.8} strokeLinecap="round" />
      </g>
    </g>
  );
}
