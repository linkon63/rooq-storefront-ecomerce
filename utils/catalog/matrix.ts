export type MatrixPair = { colorId: string; sizeId: string };

export const pairKey = (colorId: string, sizeId: string) => `${colorId}:${sizeId}`;

/** Every colour × size pair, colours outer (so variants group by colour). */
export function matrixPairs(colorIds: readonly string[], sizeIds: readonly string[]): MatrixPair[] {
  const colors = [...new Set(colorIds)];
  const sizes = [...new Set(sizeIds)];
  return colors.flatMap((colorId) => sizes.map((sizeId) => ({ colorId, sizeId })));
}

/** Splits the matrix into pairs to create and pairs that already exist. */
export function planMatrix(
  colorIds: readonly string[],
  sizeIds: readonly string[],
  existing: readonly MatrixPair[],
): { toCreate: MatrixPair[]; existing: MatrixPair[] } {
  const have = new Set(existing.map((pair) => pairKey(pair.colorId, pair.sizeId)));
  const toCreate: MatrixPair[] = [];
  const skipped: MatrixPair[] = [];
  for (const pair of matrixPairs(colorIds, sizeIds)) {
    (have.has(pairKey(pair.colorId, pair.sizeId)) ? skipped : toCreate).push(pair);
  }
  return { toCreate, existing: skipped };
}
