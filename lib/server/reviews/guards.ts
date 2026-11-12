import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { REVIEW_MAX_PHOTOS } from "@/lib/constants/content";
import { badRequest, conflict, notFound } from "../http-error";
import { prisma } from "../prisma";
import { saveImage } from "../media/save-image";
import { fileToBuffer } from "../media/upload";

/** Checks and side inputs used when a review is created. */

export async function ensureProduct(productId: string): Promise<void> {
  const product = await prisma.product.findFirst({ where: { id: productId, archivedAt: null }, select: { id: true } });
  if (!product) throw notFound(ERROR_MESSAGES.product.notFound(productId));
}

export async function ensureVariant(productId: string, variantId: string | undefined): Promise<void> {
  if (!variantId) return;
  const variant = await prisma.productVariant.findFirst({ where: { id: variantId, productId }, select: { id: true } });
  if (!variant) throw badRequest(ERROR_MESSAGES.review.variantMismatch);
}

export async function ensureNotReviewed(productId: string, userId: string): Promise<void> {
  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
    select: { id: true },
  });
  if (existing) throw conflict(ERROR_MESSAGES.review.alreadyReviewed);
}

/** True when the user has a delivered order containing this product. */
export async function hasDeliveredPurchase(productId: string, userId: string): Promise<boolean> {
  const item = await prisma.orderItem.findFirst({
    where: { productId, order: { userId, status: "delivered" } },
    select: { id: true },
  });
  return Boolean(item);
}

export async function savePhotos(photos: readonly File[], uploadedById: string): Promise<string[]> {
  if (photos.length > REVIEW_MAX_PHOTOS) throw badRequest(ERROR_MESSAGES.review.tooManyPhotos(REVIEW_MAX_PHOTOS));
  const saved = await Promise.all(
    photos.map(async (photo) => saveImage(await fileToBuffer(photo), { uploadedById, alt: null })),
  );
  return [...new Set(saved.map((media) => media.id))];
}

