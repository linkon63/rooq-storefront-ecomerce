/** Pure list helpers for the Contact page's email / phone rows. */

export type ContactRow = { title: string; value: string };

export const BLANK_CONTACT: ContactRow = { title: "", value: "" };

export function updateRow(rows: readonly ContactRow[], index: number, field: keyof ContactRow, value: string): ContactRow[] {
  return rows.map((row, i) => (i === index ? { ...row, [field]: value } : row));
}

export function addRow(rows: readonly ContactRow[], max: number): ContactRow[] {
  return rows.length >= max ? [...rows] : [...rows, BLANK_CONTACT];
}

export function removeRow(rows: readonly ContactRow[], index: number): ContactRow[] {
  const next = rows.filter((_, i) => i !== index);
  return next.length ? next : [BLANK_CONTACT];
}
