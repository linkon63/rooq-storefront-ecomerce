import type { Unit } from "@/types/admin/catalog";

/** Decimal columns arrive as strings over JSON; normalise before doing maths. */
export function unitFactor(unit: Pick<Unit, "factor">): number {
  const value = Number(unit.factor);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

/**
 * "1 Kilogram = 1000 Gram", or null for a base unit. Used wherever a unit is
 * picked so the conversion is visible at the point of choosing.
 */
export function unitConversionLabel(unit: Unit): string | null {
  if (!unit.parentUnit) return null;
  const factor = unitFactor(unit);
  return `1 ${unit.name} = ${factor.toLocaleString(undefined, {
    maximumFractionDigits: 6,
  })} ${unit.parentUnit.name}`;
}

/**
 * Walk a unit up to the root of its conversion tree, multiplying as it goes.
 * Kilogram → Gram returns `{ base: Gram, factor: 1000 }`. Guards against a
 * corrupt cycle so a bad row cannot hang the admin.
 */
export function resolveBaseUnit(
  unit: Unit,
  all: Unit[],
): { base: Unit; factor: number } {
  const byId = new Map(all.map((candidate) => [candidate.id, candidate]));
  const seen = new Set<string>([unit.id]);

  let base = unit;
  let factor = 1;

  while (base.parentUnitId) {
    const parent = byId.get(base.parentUnitId);
    if (!parent || seen.has(parent.id)) break;

    seen.add(parent.id);
    factor *= unitFactor(base);
    base = parent;
  }

  return { base, factor };
}

const formatFactor = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 6 });

/**
 * How a unit converts, for the units list. A child shows its direct parent,
 * plus the base it resolves to when the chain runs deeper than one hop —
 * "1 kg = 1000 g" needs no second half, "1 t = 1000 kg = 1000000 g" does.
 */
export function unitChainLabel(unit: Unit, all: Unit[]): string {
  if (!unit.parentUnit) return "—";
  const direct = `1 ${unit.code} = ${formatFactor(unitFactor(unit))} ${unit.parentUnit.code}`;
  const { base, factor } = resolveBaseUnit(unit, all);
  return base.id === unit.parentUnit.id ? direct : `${direct} = ${formatFactor(factor)} ${base.code}`;
}

/**
 * Units `unit` may convert into: never itself nor anything that already
 * converts into it (the server rejects both cycles).
 */
export function allowedParentUnits(unit: Unit | undefined, all: Unit[]): Unit[] {
  if (!unit) return all;
  const descendants = new Set<string>([unit.id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const candidate of all) {
      if (candidate.parentUnitId && descendants.has(candidate.parentUnitId) && !descendants.has(candidate.id)) {
        descendants.add(candidate.id);
        grew = true;
      }
    }
  }
  return all.filter((candidate) => !descendants.has(candidate.id));
}
