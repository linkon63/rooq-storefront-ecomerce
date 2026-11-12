export type CategoryTreeNode = { id: string; name: string; slug: string; children?: CategoryTreeNode[] };
export type CategoryOption = { id: string; name: string; slug: string; depth: number; label: string };

/** Depth-first flattening for pickers: "Women › Tops › Shirts". */
export function flattenCategoryTree(nodes: readonly CategoryTreeNode[], depth = 0, trail: string[] = []): CategoryOption[] {
  return nodes.flatMap((node) => {
    const path = [...trail, node.name];
    return [
      { id: node.id, name: node.name, slug: node.slug, depth, label: path.join(" › ") },
      ...flattenCategoryTree(node.children ?? [], depth + 1, path),
    ];
  });
}
