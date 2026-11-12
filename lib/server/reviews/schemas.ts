import "server-only";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { REVIEW_SORTS } from "@/lib/constants/content";
import { FitFeedback, ReviewStatus } from "@/lib/generated/prisma/enums";
import { paginationQuery, queryBoolean } from "../validation";

const v = ERROR_MESSAGES.validation;
const rating = z.coerce
  .number({ error: ERROR_MESSAGES.review.ratingRange })
  .int(ERROR_MESSAGES.review.ratingRange)
  .min(1, ERROR_MESSAGES.review.ratingRange)
  .max(5, ERROR_MESSAGES.review.ratingRange);
const optionalText = z.string().trim().max(5000).optional();
const fitFeedback = z.enum(FitFeedback);
const uuid = (field: string) => z.uuid({ error: v.invalidUuid(field) });
/** Multipart sends "" for an unset select. */
const emptyToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);

/** POST /products/:id/reviews — CreateReviewDto + fashion fields (JSON or multipart fields). */
export const createReviewSchema = z.strictObject({
  rating,
  title: z.string().trim().max(200).optional(),
  comment: optionalText,
  fitFeedback: z.preprocess(emptyToUndefined, fitFeedback.optional()),
  variantId: z.preprocess(emptyToUndefined, uuid("variantId").optional()),
});
export type CreateReviewInput = z.output<typeof createReviewSchema>;

/** POST /reviews — AdminCreateReviewDto: on behalf of a user (defaults to the admin). */
export const adminCreateReviewSchema = createReviewSchema.extend({
  productId: uuid("productId"),
  userId: uuid("userId").optional(),
  status: z.enum(ReviewStatus).optional(),
  isApproved: z.boolean().optional(),
  isVerifiedPurchase: z.boolean().optional(),
});
export type AdminCreateReviewInput = z.output<typeof adminCreateReviewSchema>;

/** PATCH /reviews/:id — owner: content fields; staff: also status / isApproved. */
export const updateReviewSchema = z.strictObject({
  rating: rating.optional(),
  title: z.string().trim().max(200).nullable().optional(),
  comment: z.string().trim().max(5000).nullable().optional(),
  fitFeedback: fitFeedback.nullable().optional(),
  status: z.enum(ReviewStatus).optional(),
  isApproved: z.boolean().optional(),
});
export type UpdateReviewInput = z.output<typeof updateReviewSchema>;

/** GET /reviews, /reviews/pending — ListReviewsQueryDto + status/productId/rating. */
export const listReviewsQuery = z.strictObject({
  ...paginationQuery,
  search: z.string().trim().optional(),
  isApproved: queryBoolean.optional(),
  status: z.enum(ReviewStatus).optional(),
  productId: uuid("productId").optional(),
  rating: rating.optional(),
});
export type ListReviewsQuery = z.output<typeof listReviewsQuery>;

/** GET /products/:id/reviews */
export const productReviewsQuery = z.strictObject({
  ...paginationQuery,
  sort: z.enum(REVIEW_SORTS).optional(),
  rating: rating.optional(),
  withPhotos: queryBoolean.optional(),
});
export type ProductReviewsQuery = z.output<typeof productReviewsQuery>;
