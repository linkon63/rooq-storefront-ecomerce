export type MeasurementUnit = "cm" | "in";

const CM_PER_INCH = 2.54;

/** Charts are stored in cm; the size guide toggles to inches. One decimal place. */
export function convertMeasurement(valueCm: number, unit: MeasurementUnit): number {
  const value = unit === "in" ? valueCm / CM_PER_INCH : valueCm;
  return Math.round(value * 10) / 10;
}

/** Ordered, de-duplicated column headers across all rows. */
export function chartColumns(rows: { measurements: { label: string; position: number }[] }[]): string[] {
  const positions = new Map<string, number>();
  for (const row of rows) {
    for (const m of row.measurements) {
      if (!positions.has(m.label) || (positions.get(m.label) ?? 0) > m.position) positions.set(m.label, m.position);
    }
  }
  return [...positions.entries()].sort((a, b) => a[1] - b[1]).map(([label]) => label);
}
