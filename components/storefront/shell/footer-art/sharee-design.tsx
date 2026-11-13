import { FELL, LOOM, ROW_HEIGHT } from "./loom-geometry";
import { WordmarkPallu } from "./woven-wordmark";

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

/** The colours of one sharee (Tailwind fill/stroke classes). */
export type ShareePalette = {
  body: string;
  weft: string;
  border: string;
  borderLine: string;
  motif: string;
  pallu: { line: string; band: string };
};

/** The sharees the loom weaves, in turn with the messages: off-white cotton for "ROOQ", red for the thank-you. */
export const SHAREES: readonly ShareePalette[] = [
  {
    body: "fill-selvedge/30",
    weft: "stroke-chalk/20",
    border: "fill-dye/55",
    borderLine: "stroke-gold",
    motif: "fill-gold/80",
    pallu: { line: "fill-gold/80", band: "fill-dye/55" },
  },
  {
    body: "fill-red-700/75",
    weft: "stroke-ink/25",
    border: "fill-gold/60",
    borderLine: "stroke-chalk/80",
    motif: "fill-chalk/85",
    pallu: { line: "fill-chalk/80", band: "fill-gold/65" },
  },
];

/** One sharee's cloth: body with weft rows, pallu bands and zari borders down both selvedges. */
export function ShareeDesign({ palette, hidden = false }: { palette: ShareePalette; hidden?: boolean }) {
  const left = LOOM.warpLeft - 4;
  const right = LOOM.warpRight + 4;
  const width = right - left;
  const height = LOOM.breastBeam - FELL.end;
  return (
    <g data-sharee style={hidden ? { opacity: 0, visibility: "hidden" } : undefined}>
      <rect x={left} y={FELL.end} width={width} height={height} className={palette.body} />
      <g className={palette.weft} strokeWidth={1}>
        {ROWS.map((y) => (
          <line key={y} x1={left} y1={y} x2={right} y2={y} />
        ))}
      </g>
      <WordmarkPallu line={palette.pallu.line} band={palette.pallu.band} />
      {[left, right - BORDER].map((x) => (
        <g key={x}>
          <rect x={x} y={FELL.end} width={BORDER} height={height} className={palette.border} />
          <line x1={x + 4} y1={FELL.end} x2={x + 4} y2={LOOM.breastBeam} className={palette.borderLine} strokeWidth={2} />
          <line x1={x + BORDER - 4} y1={FELL.end} x2={x + BORDER - 4} y2={LOOM.breastBeam} className={palette.borderLine} strokeWidth={2} />
          {MOTIFS.map((y) => {
            const cx = x + BORDER / 2;
            return <path key={y} d={`M${cx} ${y - 7}L${cx + 7} ${y}L${cx} ${y + 7}L${cx - 7} ${y}Z`} className={palette.motif} />;
          })}
        </g>
      ))}
    </g>
  );
}
