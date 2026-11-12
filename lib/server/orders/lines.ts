import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { activeDiscountWhere } from "@/lib/server/catalog/selects";
import { badRequest, notFound } from "@/lib/server/http-error";
import { effectivePrice } from "@/utils/catalog/price";
import { toNumberOrNull, toNumber } from "@/utils/decimal";
import { pickDiscount } from "@/utils/mappers/product-card";
import { lineImageMediaId, mergeLines } from "@/utils/orders/line-image";
import { fixedPriceLine, priceLine, type PricedLine } from "@/utils/orders/pricing";

type Db = Pick<Prisma.TransactionClient, "productVariant">;

/** What a caller asks for: a variant, a quantity and (wholesale/POS) a negotiated price. */
export type LineRequest = { variantId: string; quantity: number; unitPrice?: number };

/** A validated, priced order line with its snapshot — ready for `order.items.create`. */
export type OrderLineDraft = PricedLine & {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  colorName: string;
  colorHex: string;
  sizeLabel: string;
  imageMediaId: string | null;
};

export function sellableVariantSelect(now: Date) {
  return {
    id: true,
    sku: true,
    isActive: true,
    stock: true,
    price: true,
    compareAtPrice: true,
    colorId: true,
    productId: true,
    color: { select: { name: true, hex: true } },
    size: { select: { label: true } },
    product: {
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        archivedAt: true,
        price: true,
        compareAtPrice: true,
        discounts: {
          where: { discount: activeDiscountWhere(now) },
          select: { discount: { select: { id: true, type: true, value: true } } },
        },
        media: { select: { colorId: true, isPrimary: true, position: true, mediaId: true } },
      },
    },
  } as const satisfies Prisma.ProductVariantSelect;
}

export type SellableVariantRow = Prisma.ProductVariantGetPayload<{ select: ReturnType<typeof sellableVariantSelect> }>;

export function isSellable(variant: SellableVariantRow): boolean {
  return variant.isActive && variant.product.status === "active" && variant.product.archivedAt === null;
}

/** Catalogue price of a variant before offers, and the offer that applies. */
export function variantListPrice(variant: SellableVariantRow) {
  const productPrice = toNumber(variant.product.price);
  const listPrice = effectivePrice(
    { price: toNumberOrNull(variant.price), compareAtPrice: toNumberOrNull(variant.compareAtPrice) },
    { price: productPrice },
  );
  return { listPrice, rule: pickDiscount(productPrice, variant.product.discounts) };
}

export function toLineDraft(variant: SellableVariantRow, request: LineRequest): OrderLineDraft {
  const { listPrice, rule } = variantListPrice(variant);
  const priced =
    request.unitPrice !== undefined
      ? fixedPriceLine(request.unitPrice, request.quantity)
      : priceLine(listPrice, rule, request.quantity);
  return {
    ...priced,
    variantId: variant.id,
    productId: variant.productId,
    productName: variant.product.name,
    productSlug: variant.product.slug,
    sku: variant.sku,
    colorName: variant.color.name,
    colorHex: variant.color.hex,
    sizeLabel: variant.size.label,
    imageMediaId: lineImageMediaId(variant.product.media, variant.colorId),
  };
}

/**
 * Loads, validates and prices order lines. Same variant twice is merged.
 * `requireSellable` (retail, POS) rejects archived/inactive products; a
 * wholesale conversion only needs the variant to exist. Stock is checked here
 * for a friendly message and enforced again, atomically, by moveStock().
 */
export async function buildOrderLines(
  db: Db,
  requests: readonly LineRequest[],
  options: { requireSellable: boolean; now?: Date },
): Promise<OrderLineDraft[]> {
  const merged = mergeLines(requests);
  if (!merged.length) throw badRequest(ERROR_MESSAGES.order.itemsRequired);

  const rows = await db.productVariant.findMany({
    where: { id: { in: merged.map((line) => line.variantId) } },
    select: sellableVariantSelect(options.now ?? new Date()),
  });
  const byId = new Map(rows.map((row) => [row.id, row]));

  return merged.map((request) => {
    const variant = byId.get(request.variantId);
    if (!variant) throw notFound(ERROR_MESSAGES.variant.notFound(request.variantId));
    if (options.requireSellable && !isSellable(variant)) throw badRequest(ERROR_MESSAGES.variant.skuNoLongerSold(variant.sku));
    if (variant.stock < request.quantity) throw badRequest(ERROR_MESSAGES.inventory.insufficientStockForSku(variant.sku));
    return toLineDraft(variant, request);
  });
}
