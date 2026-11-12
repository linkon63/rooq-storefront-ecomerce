import { mediaSrc, type MediaRef } from "@/utils/media-url";
import { toImages, type ImageResponse, type MediaImageRow } from "./content-image";
import type { FitFeedbackValue } from "./review-summary";

export type ReviewStatusValue = "PENDING" | "APPROVED" | "REJECTED";

/** Row produced by `reviewSelect` / `adminReviewSelect` (lib/server/reviews/select.ts). */
export type ReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  fitFeedback: FitFeedbackValue | null;
  status: ReviewStatusValue;
  isVerifiedPurchase: boolean;
  productId: string;
  userId: string;
  variantId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; email?: string | null; avatarMedia: MediaRef | null };
  variant: { color: { name: string }; size: { label: string } } | null;
  media: { position: number; media: MediaImageRow }[];
  product?: { id: string; name: string; slug: string };
};

export type ReviewResponse = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  fitFeedback: FitFeedbackValue | null;
  status: ReviewStatusValue;
  /** Kept for the admin UI that predates `status`. */
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  productId: string;
  userId: string;
  variantId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; avatar: string | null; email?: string | null };
  /** "Wears M" — the colour and size the reviewer bought. */
  variant: { color: string; size: string } | null;
  photos: ImageResponse[];
  product?: { id: string; name: string; slug: string };
};

export function toReviewResponse(row: ReviewRow): ReviewResponse {
  const user: ReviewResponse["user"] = { id: row.user.id, name: row.user.name, avatar: mediaSrc(row.user.avatarMedia) };
  if (row.user.email !== undefined) user.email = row.user.email;
  return {
    id: row.id,
    rating: row.rating,
    title: row.title,
    comment: row.comment,
    fitFeedback: row.fitFeedback,
    status: row.status,
    isApproved: row.status === "APPROVED",
    isVerifiedPurchase: row.isVerifiedPurchase,
    productId: row.productId,
    userId: row.userId,
    variantId: row.variantId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    user,
    variant: row.variant ? { color: row.variant.color.name, size: row.variant.size.label } : null,
    photos: toImages(row.media),
    ...(row.product ? { product: row.product } : {}),
  };
}

/** `isApproved` (old admin UI) → `status`; an explicit `status` wins. */
export function resolveReviewStatus(input: {
  status?: ReviewStatusValue;
  isApproved?: boolean;
}): ReviewStatusValue | undefined {
  if (input.status) return input.status;
  if (input.isApproved === undefined) return undefined;
  return input.isApproved ? "APPROVED" : "PENDING";
}
