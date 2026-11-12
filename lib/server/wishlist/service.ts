import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { productCardSelect } from "@/lib/server/catalog/selects";
import { notFound } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import { toProductCard } from "@/utils/mappers/product-card";
import type { WishlistItemResponse } from "@/types/commerce/wishlist";
import type { AddWishlistInput } from "./schemas";

function wishlistInclude(now: Date) {
  return { product: { select: productCardSelect(now) } } as const;
}

type WishlistRow = {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  product: Parameters<typeof toProductCard>[0];
};

function toWishlistItem(row: WishlistRow, now: Date): WishlistItemResponse {
  return {
    id: row.id,
    userId: row.userId,
    productId: row.productId,
    createdAt: row.createdAt.toISOString(),
    product: toProductCard(row.product, now),
  };
}

/** POST /wishlist — idempotent; archived products cannot be saved. */
export async function addToWishlist(userId: string, input: AddWishlistInput): Promise<WishlistItemResponse> {
  const product = await prisma.product.findFirst({ where: { id: input.productId, archivedAt: null }, select: { id: true } });
  if (!product) throw notFound(ERROR_MESSAGES.product.notFound(input.productId));
  const now = new Date();
  const row = await prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId: product.id } },
    update: {},
    create: { userId, productId: product.id },
    include: wishlistInclude(now),
  });
  return toWishlistItem(row, now);
}

/** GET /wishlist — newest first. */
export async function listWishlist(userId: string): Promise<WishlistItemResponse[]> {
  const now = new Date();
  const rows = await prisma.wishlist.findMany({ where: { userId }, include: wishlistInclude(now), orderBy: { createdAt: "desc" } });
  return rows.map((row) => toWishlistItem(row, now));
}

/** DELETE /wishlist/:productId */
export async function removeFromWishlist(userId: string, productId: string) {
  const removed = await prisma.wishlist.deleteMany({ where: { userId, productId } });
  if (removed.count === 0) throw notFound(ERROR_MESSAGES.wishlist.itemNotFound);
  return { message: SUCCESS_MESSAGES.commerce.wishlistRemoved };
}
