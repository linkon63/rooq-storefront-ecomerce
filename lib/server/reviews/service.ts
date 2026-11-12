import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { isStaffRole } from "@/utils/roles";
import { pageWindow, buildPaginationMeta, type PaginationMeta } from "@/utils/pagination";
import { resolveReviewStatus, toReviewResponse, type ReviewResponse } from "@/utils/mappers/review";
import type { ReviewSummary } from "@/utils/mappers/review-summary";
import { forbidden, notFound } from "../http-error";
import { prisma } from "../prisma";
import { releaseMedia } from "../media/release";
import type { CurrentUser } from "../auth/current-user";
import { getReviewSummary, recomputeProductRating } from "./aggregates";
import { ensureNotReviewed, ensureProduct, ensureVariant, hasDeliveredPurchase, savePhotos } from "./guards";
import { adminReviewSelect, reviewSelect } from "./select";
import type {
  AdminCreateReviewInput,
  CreateReviewInput,
  ListReviewsQuery,
  ProductReviewsQuery,
  UpdateReviewInput,
} from "./schemas";

export type ReviewList = { data: ReviewResponse[]; meta: PaginationMeta };
export type ProductReviewList = ReviewList & { summary: ReviewSummary };

type NewReview = Omit<Prisma.ReviewUncheckedCreateInput, "media"> & { mediaIds: string[] };

async function insertReview({ mediaIds, ...data }: NewReview): Promise<ReviewResponse> {
  try {
    const row = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: { ...data, media: { create: mediaIds.map((mediaId, position) => ({ mediaId, position })) } },
        select: { id: true },
      });
      await recomputeProductRating(tx, data.productId);
      return tx.review.findUniqueOrThrow({ where: { id: created.id }, select: reviewSelect });
    });
    return toReviewResponse(row);
  } catch (error) {
    await releaseMedia(mediaIds);
    throw error;
  }
}

/** POST /products/:id/reviews — a signed-in shopper reviews a product. */
export async function createReview(
  user: CurrentUser,
  productId: string,
  input: CreateReviewInput,
  photos: readonly File[] = [],
): Promise<ReviewResponse> {
  await ensureProduct(productId);
  await Promise.all([ensureVariant(productId, input.variantId), ensureNotReviewed(productId, user.id)]);
  const [isVerifiedPurchase, mediaIds] = await Promise.all([
    hasDeliveredPurchase(productId, user.id),
    savePhotos(photos, user.id),
  ]);
  return insertReview({
    ...input,
    productId,
    userId: user.id,
    status: "APPROVED",
    isVerifiedPurchase,
    mediaIds,
  });
}

/** POST /reviews — staff create a review on behalf of a user (themselves by default). */
export async function createAdminReview(admin: CurrentUser, input: AdminCreateReviewInput): Promise<ReviewResponse> {
  const { productId, userId = admin.id, status, isApproved, isVerifiedPurchase, ...fields } = input;
  await ensureProduct(productId);
  if (userId !== admin.id) {
    const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null }, select: { id: true } });
    if (!user) throw notFound(ERROR_MESSAGES.review.userNotFound(userId));
  }
  await Promise.all([ensureVariant(productId, fields.variantId), ensureNotReviewed(productId, userId)]);
  return insertReview({
    ...fields,
    productId,
    userId,
    status: resolveReviewStatus({ status, isApproved }) ?? "APPROVED",
    isVerifiedPurchase: isVerifiedPurchase ?? (await hasDeliveredPurchase(productId, userId)),
    mediaIds: [],
  });
}

function listWhere(query: ListReviewsQuery): Prisma.ReviewWhereInput {
  const where: Prisma.ReviewWhereInput = {};
  const status = resolveReviewStatus(query);
  if (query.status) where.status = query.status;
  else if (query.isApproved === false) where.status = { not: "APPROVED" };
  else if (status) where.status = status;
  if (query.productId) where.productId = query.productId;
  if (query.rating) where.rating = query.rating;
  if (query.search) {
    where.OR = [
      { comment: { contains: query.search, mode: "insensitive" } },
      { title: { contains: query.search, mode: "insensitive" } },
      { product: { name: { contains: query.search, mode: "insensitive" } } },
      { user: { name: { contains: query.search, mode: "insensitive" } } },
    ];
  }
  return where;
}

/** GET /reviews (admin) — every review, newest first. */
export async function listReviews(query: ListReviewsQuery): Promise<ReviewList> {
  const { page, limit, skip, take } = pageWindow(query.page, query.limit);
  const where = listWhere(query);
  const [rows, total] = await prisma.$transaction([
    prisma.review.findMany({ where, skip, take, select: adminReviewSelect, orderBy: { createdAt: "desc" } }),
    prisma.review.count({ where }),
  ]);
  return { data: rows.map(toReviewResponse), meta: buildPaginationMeta({ page, limit, total }) };
}

/** GET /reviews/pending (admin) — the moderation queue. */
export function listPendingReviews(query: ListReviewsQuery): Promise<ReviewList> {
  return listReviews({ ...query, status: "PENDING", isApproved: undefined });
}

const PRODUCT_SORTS: Record<NonNullable<ProductReviewsQuery["sort"]>, Prisma.ReviewOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }],
  rating_desc: [{ rating: "desc" }, { createdAt: "desc" }],
  rating_asc: [{ rating: "asc" }, { createdAt: "desc" }],
};

/** GET /products/:id/reviews — approved reviews with the rating + fit summary. */
export async function listProductReviews(productId: string, query: ProductReviewsQuery): Promise<ProductReviewList> {
  const { page, limit, skip, take } = pageWindow(query.page, query.limit);
  const where: Prisma.ReviewWhereInput = { productId, status: "APPROVED" };
  if (query.rating) where.rating = query.rating;
  if (query.withPhotos) where.media = { some: {} };
  const [rows, total, summary] = await Promise.all([
    prisma.review.findMany({ where, skip, take, select: reviewSelect, orderBy: PRODUCT_SORTS[query.sort ?? "newest"] }),
    prisma.review.count({ where }),
    getReviewSummary(productId),
  ]);
  return { data: rows.map(toReviewResponse), meta: buildPaginationMeta({ page, limit, total }), summary };
}

async function findOwnedReview(user: CurrentUser, id: string) {
  const review = await prisma.review.findUnique({ where: { id }, select: { id: true, userId: true, productId: true } });
  if (!review) throw notFound(ERROR_MESSAGES.review.notFound(id));
  const isStaff = isStaffRole(user.role?.name);
  if (!isStaff && review.userId !== user.id) throw forbidden(ERROR_MESSAGES.review.notOwner);
  return { review, isStaff };
}

/** PATCH /reviews/:id — the author edits content; staff may also moderate. */
export async function updateReview(user: CurrentUser, id: string, input: UpdateReviewInput): Promise<ReviewResponse> {
  const { review, isStaff } = await findOwnedReview(user, id);
  const { status, isApproved, ...fields } = input;
  const nextStatus = resolveReviewStatus({ status, isApproved });
  if (nextStatus && !isStaff) throw forbidden(ERROR_MESSAGES.review.moderationStaffOnly);

  const row = await prisma.$transaction(async (tx) => {
    await tx.review.update({ where: { id }, data: { ...fields, ...(nextStatus ? { status: nextStatus } : {}) } });
    if (nextStatus || fields.rating !== undefined) await recomputeProductRating(tx, review.productId);
    return tx.review.findUniqueOrThrow({ where: { id }, select: adminReviewSelect });
  });
  return toReviewResponse(row);
}

/** DELETE /reviews/:id — author or staff; photos are released when unused. */
export async function deleteReview(user: CurrentUser, id: string): Promise<{ message: string }> {
  const { review } = await findOwnedReview(user, id);
  const photos = await prisma.reviewMedia.findMany({ where: { reviewId: id }, select: { mediaId: true } });
  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id } });
    await recomputeProductRating(tx, review.productId);
  });
  await releaseMedia(photos.map((photo) => photo.mediaId));
  return { message: SUCCESS_MESSAGES.common.deleted("Review") };
}
