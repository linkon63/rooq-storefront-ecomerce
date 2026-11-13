/**
 * Order-journey animation maths (pure). `progress` runs 0 → 1 across the
 * whole journey; the parcel waits at each station for the first part of
 * every leg, then travels to the next one.
 */

const DWELL = 0.4;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Where the parcel is along the track (0 → 1) and which step is lit. */
export function journeyAt(progress: number, steps: number): { along: number; active: number } {
  const legs = Math.max(1, steps - 1);
  const clamped = Math.min(1, Math.max(0, progress));
  const leg = Math.min(legs - 1, Math.floor(clamped * legs));
  const within = clamped * legs - leg;
  const eased = smoothstep(DWELL, 1, within);
  const along = (leg + eased) / legs;
  const active = clamped >= 1 ? legs : eased > 0.5 ? leg + 1 : leg;
  return { along, active };
}
