import { FELL, LOOM, ROW_HEIGHT } from "./loom-geometry";
import { WordmarkPallu } from "./woven-wordmark";

const CLIP_ID = "rooq-footer-cloth";
const BORDER = 46;

/** Weft rows of the cloth, one per ROW_HEIGHT from the breast beam up to the finished fell. */
const ROWS: readonly number[] = Array.from(
  { length: Math.floor((LOOM.breastBeam - FELL.end) / ROW_HEIGHT) },
  (_, i) => LOOM.breastBeam - ROW_HEIGHT / 2 - i * ROW_HEIGHT,
);

/** Small diamonds of the zari border, stacked along the selvedge. */
const MOTIFS: readonly number[] = Array.from(
  { length: Math.floor((LOOM.breastBeam - FELL.end) / 22) },
  (_, i) => LOOM.breastBeam - 14 - i * 22,
);

function Diamond({ cx, cy }: { cx: number; cy: number }) {
  return <path d={`M${cx} ${cy - 7}L${cx + 7} ${cy}L${cx} ${cy + 7}L${cx - 7} ${cy}Z`} className="fill-gold/80" />;
}

/**
 * The tant sharee on the loom: cotton body with weft rows, the pallu lines
 * framing the woven "ROOQ" (drawn on its own top layer), and zari borders down both selvedges. It is revealed by
 * `data-cloth-clip`, which the scene grows upward as the fell rises.
 */
export function WovenCloth() {
  const left = LOOM.warpLeft - 4;
  const right = LOOM.warpRight + 4;
  const width = right - left;
  const height = LOOM.breastBeam - FELL.end;
  return (
    <g>
      <defs>
        <clipPath id={CLIP_ID}>
          <rect data-cloth-clip x={left} y={FELL.start} width={width} height={LOOM.breastBeam - FELL.start} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${CLIP_ID})`}>
        <rect x={left} y={FELL.end} width={width} height={height} className="fill-selvedge/30" />
        <g className="stroke-chalk/20" strokeWidth={1}>
          {ROWS.map((y) => (
            <line key={y} x1={left} y1={y} x2={right} y2={y} />
          ))}
        </g>
        <WordmarkPallu />
        {/* Zari borders */}
        {[left, right - BORDER].map((x) => (
          <g key={x}>
            <rect x={x} y={FELL.end} width={BORDER} height={height} className="fill-dye/55" />
            <line x1={x + 4} y1={FELL.end} x2={x + 4} y2={LOOM.breastBeam} className="stroke-gold" strokeWidth={2} />
            <line x1={x + BORDER - 4} y1={FELL.end} x2={x + BORDER - 4} y2={LOOM.breastBeam} className="stroke-gold" strokeWidth={2} />
            {MOTIFS.map((y) => (
              <Diamond key={y} cx={x + BORDER / 2} cy={y} />
            ))}
          </g>
        ))}
      </g>
    </g>
  );
}
