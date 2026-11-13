/** One stroke of the stitched thread. */
type StitchKind = "curve" | "straight" | "sweep" | "loop";

/** The order the strokes come in: irregular on purpose, like stitching by hand. */
const PATTERN: readonly StitchKind[] = ["curve", "loop", "straight", "sweep", "curve", "straight", "loop", "curve", "sweep", "straight"];

/** Repeatable 0–1 jitter per index (no Math.random, so the path is stable across renders). */
function wobble(index: number): number {
  const s = Math.sin(index * 12.9898 + 4.1414) * 43758.5453;
  return s - Math.floor(s);
}

const between = (min: number, max: number, t: number) => Math.round(min + (max - min) * t);

type Point = { x: number; y: number };

/** Points around a small circle beside `from` (toward the page centre), starting downward and ending a little lower. */
function loopPoints(from: Point, radius: number, towardRight: boolean): Point[] {
  const centre = { x: from.x + (towardRight ? radius : -radius), y: from.y };
  const start = towardRight ? Math.PI : 0;
  const step = (towardRight ? -1 : 1) * (Math.PI / 4);
  return Array.from({ length: 8 }, (_, i) => {
    const angle = start + step * (i + 1);
    return {
      x: Math.round(centre.x + Math.cos(angle) * radius),
      y: Math.round(centre.y + Math.sin(angle) * radius + (i + 1) * 3),
    };
  });
}

/**
 * Smooth curve through every point (Catmull-Rom as cubic Béziers): no corners
 * anywhere. `lead` is a point before the first one that only sets the
 * starting direction (so the curve continues a straight line smoothly).
 */
function smoothPath(points: readonly Point[], lead?: Point): string {
  const at = (i: number) => (i < 0 && lead ? lead : points[Math.max(0, Math.min(points.length - 1, i))]) ?? { x: 0, y: 0 };
  let d = "";
  for (let i = 0; i < points.length - 1; i += 1) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${Math.round(c1.x)} ${Math.round(c1.y)} ${Math.round(c2.x)} ${Math.round(c2.y)} ${p2.x} ${p2.y}`;
  }
  return d;
}

/**
 * The thread down the storefront as an SVG path (px, in the page's box): it
 * starts at (`startX`, `startY`), the top of the hero in line with the
 * logo, runs straight down to the bottom of the hero (`heroBottom`), then mixes S-curves, gentle near-straight drops, left-to-right
 * swoops and small circles, all joined as one smooth curve, and ends at
 * `endY` on the right, in the footer, by the WhatsApp button.
 */
export function stitchPathD(width: number, startX: number, startY: number, heroBottom: number, endY: number): string {
  const [minX, maxX] = [Math.round(width * 0.08), Math.round(width * 0.92)];
  const x0 = Math.round(startX);
  const straightTo = Math.min(endY, Math.max(startY, heroBottom));
  const points: Point[] = [
    { x: x0, y: straightTo },
    { x: x0, y: Math.min(endY, straightTo + 160) },
  ];
  const last = () => points[points.length - 1] ?? { x: startX, y: startY };

  for (let index = 0; last().y < endY - 480; index += 1) {
    const kind = PATTERN[index % PATTERN.length] ?? "curve";
    const t = wobble(index);
    const { x, y } = last();
    const onLeft = x < width / 2;
    if (kind === "curve") {
      points.push({ x: onLeft ? between(width * 0.62, maxX, t) : between(minX, width * 0.38, t), y: y + between(340, 520, t) });
    } else if (kind === "straight") {
      points.push({ x: x + between(-18, 18, t), y: y + between(220, 340, t) });
    } else if (kind === "sweep") {
      points.push({ x: onLeft ? maxX : minX, y: y + between(90, 140, t) });
    } else {
      points.push(...loopPoints({ x, y }, Math.min(between(40, 64, t), Math.round(width * 0.11)), onLeft));
      points.push({ x: last().x, y: last().y + 90 });
    }
  }

  points.push({ x: maxX, y: endY });
  return `M${x0} ${startY} L${x0} ${straightTo}${smoothPath(points, { x: x0, y: straightTo - 200 })}`;
}

/** Running maximum of the sampled y values, so a loop or sweep never sends the needle back up. */
export function runningMax(values: readonly number[]): number[] {
  let max = -Infinity;
  return values.map((value) => (max = Math.max(max, value)));
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
