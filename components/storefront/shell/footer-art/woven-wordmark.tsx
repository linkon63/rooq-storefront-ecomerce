import { FELL, LOOM } from "./loom-geometry";

const CLIP_ID = "rooq-footer-wordmark";
const LEFT = LOOM.warpLeft + 50;
const RIGHT = LOOM.warpRight - 50;

/** The two pallu bands above and below the woven artwork (part of the cloth), in the sharee's colours. */
export function WordmarkPallu({ line, band }: { line: string; band: string }) {
  const width = RIGHT - LEFT;
  return (
    <g>
      <rect x={LEFT} y={334} width={width} height={2.5} className={line} />
      <rect x={LEFT} y={339} width={width} height={6} className={band} />
      <rect x={LEFT} y={188} width={width} height={2.5} className={line} />
      <rect x={LEFT} y={Math.max(FELL.end, 180)} width={width} height={5} className={band} />
    </g>
  );
}

/** The exact white Rooq kechi logo (832x559), framed between the pallu bands. */
const LOGO = {
  href: "/images/logo-kechi-clear-white.png",
  width: 202,
  height: 136,
  y: 194,
} as const;

/** The thank-you woven after the logo, line by line (baselines in SVG units). */
const THANKS = { lines: ["Thank you for", "completing your", "journey with us"], baselines: [238, 272, 306], size: 34 } as const;
const CENTRE = (LOOM.warpLeft + LOOM.warpRight) / 2;

/**
 * The artwork woven into the sharee, in pure white on the top layer (above
 * the green wash): the exact Rooq logo, then the thank-you. Each is a
 * `data-woven-message` the timeline shows in turn; the second starts hidden.
 * Their own `data-cloth-clip` grows with the cloth's, so they appear row by
 * row as the weaver beats in each weft.
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
        <g data-woven-message>
          <image
            href={LOGO.href}
            x={CENTRE - LOGO.width / 2}
            y={LOGO.y}
            width={LOGO.width}
            height={LOGO.height}
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
        <g data-woven-message style={{ opacity: 0, visibility: "hidden" }}>
          <text textAnchor="middle" fontSize={THANKS.size} className="font-bold">
            {THANKS.lines.map((line, index) => (
              <tspan key={line} x={CENTRE} y={THANKS.baselines[index]}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      </g>
    </g>
  );
}
