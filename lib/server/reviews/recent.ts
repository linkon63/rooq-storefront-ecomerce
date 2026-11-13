import "server-only";
import { prisma } from "@/lib/server/prisma";
import { toReviewResponse } from "@/utils/mappers/review";
import { reviewSelect } from "./select";

const recentSelect = { ...reviewSelect, product: { select: { id: true, name: true, slug: true } } } as const;

/** Newest approved reviews across the catalogue, with their product (home-page showcase). */
export async function listRecentReviews(limit: number) {
  const rows = await prisma.review.findMany({
    where: { status: "APPROVED", product: { status: "active" } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: recentSelect,
  });
  return rows.map(toReviewResponse);
}
