export type ChartFormState = {
  columns: string[];
  sizeIds: string[];
  /** sizeId → column label → raw input (cm). */
  values: Record<string, Record<string, string>>;
};

type ChartLike = { columns: string[]; rows: { sizeId: string; values: Record<string, number> }[] };

export const DEFAULT_CHART_COLUMNS = ["Chest", "Waist", "Length"];

export function chartToFormState(chart: ChartLike | null): ChartFormState {
  if (!chart) return { columns: [...DEFAULT_CHART_COLUMNS], sizeIds: [], values: {} };
  return {
    columns: chart.columns.length ? [...chart.columns] : [...DEFAULT_CHART_COLUMNS],
    sizeIds: chart.rows.map((row) => row.sizeId),
    values: Object.fromEntries(chart.rows.map((row) => [row.sizeId, Object.fromEntries(Object.entries(row.values).map(([k, v]) => [k, String(v)]))])),
  };
}

/** Form grid → API rows; blank cells and unnamed columns are skipped, labels trimmed. */
export function formStateToRows(state: ChartFormState): { sizeId: string; measurements: { label: string; valueCm: number }[] }[] {
  return state.sizeIds.map((sizeId) => ({
    sizeId,
    measurements: state.columns.flatMap((column) => {
      const label = column.trim();
      const raw = state.values[sizeId]?.[column] ?? "";
      const value = Number(raw);
      return label && raw.trim() !== "" && Number.isFinite(value) ? [{ label, valueCm: value }] : [];
    }),
  }));
}

/** Renaming a column carries its cell values across. */
export function renameColumn(state: ChartFormState, index: number, label: string): ChartFormState {
  const previous = state.columns[index];
  const columns = state.columns.map((column, i) => (i === index ? label : column));
  const values = Object.fromEntries(
    Object.entries(state.values).map(([sizeId, cells]) => {
      const { [previous]: moved, ...rest } = cells;
      return [sizeId, moved === undefined ? rest : { ...rest, [label]: moved }];
    }),
  );
  return { ...state, columns, values };
}
