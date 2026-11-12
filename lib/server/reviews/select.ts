import "server-only";
import { mediaRefSelect } from "../media/select";

/** Public review fields (storefront). Feed rows to utils/mappers/review.toReviewResponse(). */
export const reviewSelect = {
  id: true,
  rating: true,
  title: true,
  comment: true,
  fitFeedback: true,
  status: true,
  isVerifiedPurchase: true,
  productId: true,
  userId: true,
  variantId: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, avatarMedia: { select: mediaRefSelect } } },
  variant: { select: { color: { select: { name: true } }, size: { select: { label: true } } } },
  media: { select: { position: true, media: { select: mediaRefSelect } }, orderBy: { position: "asc" } },
} as const;

/** Admin lists add the product and the reviewer's email. */
export const adminReviewSelect = {
  ...reviewSelect,
  user: { select: { id: true, name: true, email: true, avatarMedia: { select: mediaRefSelect } } },
  product: { select: { id: true, name: true, slug: true } },
} as const;
