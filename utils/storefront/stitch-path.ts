/** A point the stitched thread passes through (px, in the home page's own box). */
export type StitchPoint = { x: number; y: number };

/** Vertical distance between two turns of the thread (px). */
export const STITCH_TURN_PX = 520;

/** Repeatable 0–1 jitter per index (no Math.random, so the path is stable across renders). */
function wobble(index: number): number {
  const s = Math.sin(index * 12.9898 + 4.1414) * 43758.5453;
  return s - Math.floor(s);
}

/** Turning points down the page, swinging from one side to the other with a little irregularity, like hand stitching. */
export function stitchPoints(width: number, height: number, turn = STITCH_TURN_PX): StitchPoint[] {
  const count = Math.max(2, Math.ceil(height / turn) + 1);
  return Array.from({ length: count }, (_, index) => {
    const side = index % 2 === 0 ? 0.1 : 0.9;
    return {
      x: Math.round(width * (side + (wobble(index) - 0.5) * 0.14)),
      y: Math.round((index / (count - 1)) * height),
    };
  });
}

/**
 * SVG path through the points. Each control point keeps the curve vertical at
 * the turns, so y only ever grows along the path (the scroll maps to it).
 */
export function stitchPathD(points: readonly StitchPoint[]): string {
  return points.reduce((d, point, index) => {
    if (index === 0) return `M${point.x} ${point.y}`;
    const prev = points[index - 1] ?? point;
    const pull = (point.y - prev.y) * 0.55;
    return `${d} C${prev.x} ${prev.y + pull} ${point.x} ${point.y - pull} ${point.x} ${point.y}`;
  }, "");
}

/** Index of the last sample at or above `y` in an ascending list (binary search). */
export function sampleIndexAtY(ys: readonly number[], y: number): number {
  let low = 0;
  let high = ys.length - 1;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if ((ys[mid] ?? 0) <= y) low = mid;
    else high = mid - 1;
  }
  return low;
}
