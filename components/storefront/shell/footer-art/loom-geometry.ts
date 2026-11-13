/** Shared coordinates of the footer loom scene (SVG viewBox units). */
export const VIEW = { width: 1200, height: 420 } as const;

/**
 * The part of the view the scene occupies, centred on the loom (x 480): the
 * weaver on the left, the man at the charkha on the right.
 */
export const FRAME = { x: -80, y: 20, width: 1120, height: 390 } as const;

/** The weaver is drawn on the right of the loom and mirrored to its left around the loom's centre. */
export const WEAVER_MIRROR = "translate(960 0) scale(-1 1)";

export const LOOM = {
  leftPost: 170,
  rightPost: 790,
  topBeam: 48,
  breastBeam: 352,
  warpLeft: 200,
  warpRight: 760,
  warpGap: 10,
} as const;

/** Where the woven cloth reaches: it starts low and climbs as the weaver works. */
export const FELL = { start: 340, end: 176 } as const;

/** Weft rows the cloth gains with every beat of the reed (one shuttle pass). */
export const ROWS_PER_PASS = 4;
/** Height of one weft row (SVG units). */
export const ROW_HEIGHT = 6;
/** Beats it takes to weave the whole cloth, from the first row to the finished fell. */
export const PASSES = Math.ceil((FELL.start - FELL.end) / (ROW_HEIGHT * ROWS_PER_PASS));

/** The "ROOQ" woven into the cloth body: its baseline and size (SVG units). */
export const WORDMARK = { baseline: 302, size: 104 } as const;

/** Heddle bars that open the shed (lift alternate warp threads). */
export const HEDDLES = [112, 140] as const;

export const SHUTTLE = { width: 64, travel: LOOM.warpRight - LOOM.warpLeft - 64 } as const;

export const WARP_XS: readonly number[] = Array.from(
  { length: Math.floor((LOOM.warpRight - LOOM.warpLeft) / LOOM.warpGap) + 1 },
  (_, i) => LOOM.warpLeft + i * LOOM.warpGap,
);
