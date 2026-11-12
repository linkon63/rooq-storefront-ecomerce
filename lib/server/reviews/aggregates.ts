import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { buildReviewSummary, roundRating, type ReviewSummary } from "@/utils/mappers/review-summary";
import { prisma } from "../prisma";

type Db = Prisma.TransactionClient;

/** Keeps Product.ratingAvg / ratingCount in step with its APPROVED reviews. */
export async function recomputeProductRating(db: Db, productId: string): Promise<void> {
  const aggregate = await db.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await db.product.update({
    where: { id: productId },
    data: { ratingAvg: roundRating(aggregate._avg.rating ?? 0), ratingCount: aggregate._count._all },
  });
}

/** Rating distribution + fit verdict over a product's approved reviews. */
export async function getReviewSummary(productId: string): Promise<ReviewSummary> {
  const where = { productId, status: "APPROVED" } as const;
  const [ratings, fits] = await Promise.all([
    prisma.review.groupBy({ by: ["rating"], where, _count: { _all: true }, orderBy: { rating: "asc" } }),
    prisma.review.groupBy({ by: ["fitFeedback"], where, _count: { _all: true }, orderBy: { fitFeedback: "asc" } }),
  ]);
  return buildReviewSummary(
    ratings.map((row) => ({ rating: row.rating, count: row._count._all })),
    fits.map((row) => ({ fitFeedback: row.fitFeedback, count: row._count._all })),
  );
}
