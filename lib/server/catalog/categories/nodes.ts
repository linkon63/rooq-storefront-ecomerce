import "server-only";
import { prisma } from "@/lib/server/prisma";

export type CategoryNodeRow = { id: string; slug: string; name: string; parentId: string | null; sizeChartId: string | null };

/** The whole (small) category table as flat nodes — tree walks happen in utils. */
export function loadCategoryNodes(): Promise<CategoryNodeRow[]> {
  return prisma.category.findMany({
    select: { id: true, slug: true, name: true, parentId: true, sizeChartId: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}
