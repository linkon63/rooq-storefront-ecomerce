import type { Category, ReorderCategoryItem } from "@/types/admin/catalog";

/** Pure helpers for the admin category tree (flattening, drag-and-drop moves). */

export type CategoryRow = Category & {
  depth: number;
  parentName: string;
};

export function flattenCategories(
  categories: Category[],
  depth = 0,
  parentName = "Root",
): CategoryRow[] {
  return categories.flatMap((category) => [
    { ...category, depth, parentName },
    ...flattenCategories(category.children ?? [], depth + 1, category.name),
  ]);
}

// ─── Drag-and-drop tree helpers ──────────────────────────────────────────────

export type DropMode = "before" | "after" | "inside";

/** Flatten the tree into the {id, parentId, sortOrder} list the API expects. */
export function flattenForReorder(
  categories: Category[],
  parentId: string | null = null,
): ReorderCategoryItem[] {
  return categories.flatMap((category, index) => [
    { id: category.id, parentId, sortOrder: index },
    ...flattenForReorder(category.children ?? [], category.id),
  ]);
}

/** Find a node anywhere in the tree by id. */
export function findNode(categories: Category[], id: string): Category | null {
  for (const category of categories) {
    if (category.id === id) return category;
    const found = findNode(category.children ?? [], id);
    if (found) return found;
  }
  return null;
}

/** True when `id` is `node` itself or one of its descendants. */
export function containsId(node: Category, id: string): boolean {
  if (node.id === id) return true;
  return (node.children ?? []).some((child) => containsId(child, id));
}

/** Return a new tree with `id` removed, plus the removed node (immutably). */
export function removeNode(
  categories: Category[],
  id: string,
): { tree: Category[]; node: Category | null } {
  let removed: Category | null = null;

  const walk = (nodes: Category[]): Category[] => {
    const result: Category[] = [];
    for (const node of nodes) {
      if (node.id === id) {
        removed = node;
        continue;
      }
      result.push({ ...node, children: walk(node.children ?? []) });
    }
    return result;
  };

  return { tree: walk(categories), node: removed };
}

/** Insert `node` relative to `targetId` per the drop mode (immutably). */
export function insertNode(
  categories: Category[],
  node: Category,
  targetId: string,
  mode: DropMode,
): Category[] {
  const walk = (nodes: Category[]): Category[] => {
    const result: Category[] = [];
    for (const current of nodes) {
      if (current.id === targetId) {
        if (mode === "before") result.push(node);
        if (mode === "inside") {
          result.push({
            ...current,
            children: [...(current.children ?? []), node],
          });
        } else {
          result.push({ ...current, children: walk(current.children ?? []) });
        }
        if (mode === "after") result.push(node);
        continue;
      }
      result.push({ ...current, children: walk(current.children ?? []) });
    }
    return result;
  };

  return walk(categories);
}
