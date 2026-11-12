import { SIZE_GROUP_ORDER } from "@/lib/constants/catalog";
import type { SizeGroup } from "@/lib/generated/prisma/enums";

export type SortableSize = { sizeGroup: SizeGroup; sortOrder: number; label: string };

/** Letter sizes, then numeric, then shoe, then one-size; sortOrder inside a group. */
export function compareSizes(a: SortableSize, b: SortableSize): number {
  return (
    SIZE_GROUP_ORDER[a.sizeGroup] - SIZE_GROUP_ORDER[b.sizeGroup] ||
    a.sortOrder - b.sortOrder ||
    a.label.localeCompare(b.label, undefined, { numeric: true })
  );
}

export function sortSizes<T extends SortableSize>(sizes: readonly T[]): T[] {
  return [...sizes].sort(compareSizes);
}
