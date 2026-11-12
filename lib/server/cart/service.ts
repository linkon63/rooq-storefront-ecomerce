import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { activeDiscountWhere, colorRefSelect, sizeRefSelect } from "@/lib/server/catalog/selects";
import { mediaRefSelect } from "@/lib/server/media/select";
import { badRequest, notFound } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import { toCartResponse } from "@/utils/mappers/cart";
import type { CartResponse } from "@/types/commerce/cart";
import type { AddCartItemInput, UpdateCartItemInput } from "./schemas";

function cartInclude(now: Date) {
  return {
    items: {
      orderBy: { createdAt: "asc" },
      include: {
        variant: {
          select: {
            id: true,
            sku: true,
            isActive: true,
            stock: true,
            lowStockThreshold: true,
            price: true,
            compareAtPrice: true,
            colorId: true,
            color: { select: colorRefSelect },
            size: { select: sizeRefSelect },
            product: {
              select: {
                id: true,
                slug: true,
                name: true,
                status: true,
                archivedAt: true,
                price: true,
                compareAtPrice: true,
                discounts: {
                  where: { discount: activeDiscountWhere(now) },
                  select: { discount: { select: { id: true, type: true, value: true } } },
                },
                media: { select: { colorId: true, position: true, isPrimary: true, media: { select: mediaRefSelect } } },
              },
            },
          },
        },
      },
    },
  } as const satisfies Prisma.CartInclude;
}

/** GET /cart — the signed-in user's cart (created on first use), priced with today's offers. */
export async function getCart(userId: string): Promise<CartResponse> {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: cartInclude(new Date()),
  });
  return toCartResponse(cart);
}

async function requireBuyableVariant(variantId: string) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, stock: true, isActive: true, product: { select: { status: true, archivedAt: true } } },
  });
  if (!variant) throw notFound(ERROR_MESSAGES.variant.notFound(variantId));
  if (!variant.isActive || variant.product.status !== "active" || variant.product.archivedAt) {
    throw badRequest(ERROR_MESSAGES.variant.noLongerSold);
  }
  return variant;
}

/** POST /cart/items — adds units of a size/colour; the same variant twice adds up. */
export async function addCartItem(userId: string, input: AddCartItemInput): Promise<CartResponse> {
  const variant = await requireBuyableVariant(input.variantId);
  const cart = await prisma.cart.upsert({ where: { userId }, create: { userId }, update: {}, select: { id: true } });
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
    select: { quantity: true },
  });
  const quantity = (existing?.quantity ?? 0) + input.quantity;
  if (variant.stock < quantity) throw badRequest(ERROR_MESSAGES.inventory.insufficientStock);

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
    create: { cartId: cart.id, variantId: variant.id, quantity },
    update: { quantity },
  });
  return getCart(userId);
}

async function requireOwnedItem(userId: string, itemId: string) {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
    select: { id: true, variant: { select: { stock: true } } },
  });
  if (!item) throw notFound(ERROR_MESSAGES.cart.itemNotFound(itemId));
  return item;
}

/** PATCH /cart/items/:id — sets the quantity. */
export async function updateCartItem(userId: string, itemId: string, input: UpdateCartItemInput) {
  const item = await requireOwnedItem(userId, itemId);
  if (item.variant.stock < input.quantity) throw badRequest(ERROR_MESSAGES.inventory.insufficientStock);
  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: input.quantity } });
  return getCart(userId);
}

/** DELETE /cart/items/:id */
export async function removeCartItem(userId: string, itemId: string): Promise<CartResponse> {
  await requireOwnedItem(userId, itemId);
  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCart(userId);
}

/** DELETE /cart/clear */
export async function clearCart(userId: string) {
  await prisma.cartItem.deleteMany({ where: { cart: { userId } } });
  return { message: SUCCESS_MESSAGES.commerce.cartCleared };
}
