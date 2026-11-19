import "server-only";
import { prisma } from "@/lib/server/prisma";
import type { HomeStats } from "@/types/storefront/content";

/** Live shop numbers for the home "made by hand" line: pieces on sale, delivered orders, review average. */
export async function getHomeStats(): Promise<HomeStats> {
  const [pieces, delivered, reviews] = await Promise.all([
    prisma.product.count({ where: { status: "active", archivedAt: null } }),
    prisma.order.count({ where: { status: "delivered" } }),
    prisma.review.aggregate({
      where: { status: "APPROVED", product: { status: "active" } },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);
  return { pieces, delivered, reviewCount: reviews._count._all, averageRating: reviews._avg.rating ?? null };
}
