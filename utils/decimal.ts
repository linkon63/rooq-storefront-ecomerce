/** Anything a Prisma Decimal column may come back as (Decimal, number, null). */
export type DecimalLike = { toNumber(): number } | number | string | null | undefined;

/** Decimal → number (null/undefined → 0). Use in mappers, never on the client. */
export function toNumber(value: DecimalLike): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return value.toNumber();
}

/** Decimal → number, keeping null. */
export function toNumberOrNull(value: DecimalLike): number | null {
  return value === null || value === undefined ? null : toNumber(value);
}
