export type CategoryNode = { id: string; slug: string; name: string; parentId: string | null };

/** The given roots plus every category below them. */
export function descendantIds(nodes: readonly CategoryNode[], rootIds: readonly string[]): string[] {
  const children = new Map<string, string[]>();
  for (const node of nodes) {
    if (!node.parentId) continue;
    const list = children.get(node.parentId) ?? [];
    list.push(node.id);
    children.set(node.parentId, list);
  }
  const out = new Set<string>();
  const stack = [...rootIds];
  while (stack.length) {
    const id = stack.pop() as string;
    if (out.has(id)) continue;
    out.add(id);
    stack.push(...(children.get(id) ?? []));
  }
  return [...out];
}

/** Root → leaf chain for a category (stops on a broken or cyclic parent link). */
export function categoryChain<T extends CategoryNode>(nodes: readonly T[], leafId: string): T[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const chain: T[] = [];
  const seen = new Set<string>();
  let current = byId.get(leafId);
  while (current && !seen.has(current.id)) {
    chain.unshift(current);
    seen.add(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return chain;
}

/** Would making `parentId` the parent of `id` create a loop? */
export function createsCycle(nodes: readonly Pick<CategoryNode, "id" | "parentId">[], id: string, parentId: string | null): boolean {
  if (!parentId) return false;
  if (parentId === id) return true;
  const parentOf = new Map(nodes.map((node) => [node.id, node.parentId]));
  const seen = new Set<string>([id]);
  let cursor: string | null | undefined = parentId;
  while (cursor) {
    if (seen.has(cursor)) return true;
    seen.add(cursor);
    cursor = parentOf.get(cursor) ?? null;
  }
  return false;
}

type ActiveTreeNode = { isActive?: boolean; children?: ActiveTreeNode[] };

/** The tree without switched-off categories (an off parent hides its whole branch). */
export function activeTree<T extends ActiveTreeNode>(nodes: readonly T[]): T[] {
  return nodes
    .filter((node) => node.isActive !== false)
    .map((node) => (node.children ? { ...node, children: activeTree(node.children) } : node));
}

/** Flat nodes minus switched-off categories and everything below them. */
export function visibleNodes<T extends CategoryNode & { isActive: boolean }>(nodes: readonly T[]): T[] {
  const hidden = new Set(descendantIds(nodes, nodes.filter((node) => !node.isActive).map((node) => node.id)));
  return nodes.filter((node) => !hidden.has(node.id));
}
