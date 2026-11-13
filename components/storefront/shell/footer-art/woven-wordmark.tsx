import { FELL, LOOM, WORDMARK } from "./loom-geometry";

const CLIP_ID = "rooq-footer-wordmark";
const LEFT = LOOM.warpLeft + 50;
const RIGHT = LOOM.warpRight - 50;
const TOP = WORDMARK.baseline - WORDMARK.size * 0.82;

/** The two pallu bands above and below the woven letters (part of the cloth), in the sharee's colours. */
export function WordmarkPallu({ line, band }: { line: string; band: string }) {
  const width = RIGHT - LEFT;
  return (
    <g>
      <rect x={LEFT} y={WORDMARK.baseline + 14} width={width} height={3} className={line} />
      <rect x={LEFT} y={WORDMARK.baseline + 20} width={width} height={8} className={band} />
      <rect x={LEFT} y={TOP - 14} width={width} height={3} className={line} />
      <rect x={LEFT} y={Math.max(FELL.end, TOP - 24)} width={width} height={6} className={band} />
    </g>
  );
}

/** The thank-you woven after "ROOQ", line by line (baselines in SVG units). */
const THANKS = { lines: ["Thank you for", "completing your", "journey with us"], baselines: [238, 272, 306], size: 34 } as const;
const CENTRE = (LOOM.warpLeft + LOOM.warpRight) / 2;

/**
 * The messages woven into the sharee, in pure white on the top layer (above
 * the green wash): "ROOQ", then the thank-you. Each is a `data-woven-message`
 * the timeline shows in turn; the second starts hidden. Their own
 * `data-cloth-clip` grows with the cloth's, so they appear row by row as the
 * weaver beats in each weft.
 */
export function WovenWordmark() {
  const left = LOOM.warpLeft - 4;
  const width = LOOM.warpRight + 4 - left;
  return (
    <g>
      <defs>
        <clipPath id={CLIP_ID}>
          <rect data-cloth-clip x={left} y={FELL.start} width={width} height={LOOM.breastBeam - FELL.start} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${CLIP_ID})`} className="fill-white font-display">
        <text
          data-woven-message
          x={CENTRE}
          y={WORDMARK.baseline}
          textAnchor="middle"
          fontSize={WORDMARK.size}
          letterSpacing={WORDMARK.size * 0.04}
          className="font-expanded font-extrabold"
        >
          ROOQ
        </text>
        <text data-woven-message textAnchor="middle" fontSize={THANKS.size} className="font-bold" style={{ opacity: 0, visibility: "hidden" }}>
          {THANKS.lines.map((line, index) => (
            <tspan key={line} x={CENTRE} y={THANKS.baselines[index]}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    </g>
  );
}
