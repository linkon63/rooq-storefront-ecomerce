import "server-only";
import { prisma } from "@/lib/server/prisma";
import { badRequest } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { createsCycle } from "@/utils/catalog/category-tree";
import type { CategoryReorderInput } from "./schemas";

/**
 * Persist a new tree layout (full flat list with parentId + sortOrder),
 * rejecting duplicates, unknown ids/parents and cycles, in one transaction.
 */
export async function applyCategoryReorder(input: CategoryReorderInput): Promise<void> {
  const c = ERROR_MESSAGES.category;
  const ids = new Set<string>();
  for (const item of input.items) {
    if (ids.has(item.id)) throw badRequest(c.duplicateInPayload(item.id));
    ids.add(item.id);
  }
  const existing = await prisma.category.findMany({ where: { id: { in: [...ids] } }, select: { id: true } });
  if (existing.length !== ids.size) {
    const found = new Set(existing.map((row) => row.id));
    throw badRequest(c.unknownIds([...ids].filter((id) => !found.has(id))));
  }
  const nodes = input.items.map((item) => ({ id: item.id, parentId: item.parentId || null }));
  for (const node of nodes) {
    if (node.parentId === node.id) throw badRequest(c.ownParent(node.id));
    if (node.parentId && !ids.has(node.parentId)) throw badRequest(c.parentMissingFromPayload(node.parentId));
  }
  if (nodes.some((node) => createsCycle(nodes, node.id, node.parentId))) throw badRequest(c.cycle);

  await prisma.$transaction(
    input.items.map((item) =>
      prisma.category.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder, parentId: item.parentId || null } }),
    ),
  );
}
