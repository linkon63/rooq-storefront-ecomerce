import "server-only";
import { prisma } from "@/lib/server/prisma";
import { badRequest, conflict, notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { DEFAULT_LOW_STOCK_THRESHOLD } from "@/lib/constants/catalog";
import { toVariantAdmin, toVariantPublic } from "@/utils/mappers/variant";
import { variantAdminSelect, variantOrderBy, type Tx } from "../selects";
import { moveStock } from "../inventory/stock";
import { loadProductForVariants } from "./context";
import { nextSku } from "./sku";
import type { VariantCreateInput, VariantUpdateInput } from "./schemas";

export async function defaultLowStockThreshold(db: Tx = prisma): Promise<number> {
  const setting = await db.setting.findFirst({ select: { lowStockThreshold: true }, orderBy: { createdAt: "asc" } });
  return setting?.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
}

async function assertColorAndSize(db: Tx, colorId?: string, sizeId?: string) {
  const [color, size] = await Promise.all([
    colorId ? db.color.findUnique({ where: { id: colorId }, select: { slug: true } }) : null,
    sizeId ? db.size.findUnique({ where: { id: sizeId }, select: { label: true } }) : null,
  ]);
  if (colorId && !color) throw badRequest(ERROR_MESSAGES.color.notFound(colorId));
  if (sizeId && !size) throw badRequest(ERROR_MESSAGES.size.notFound(sizeId));
  return { color, size };
}

async function assertSkuFree(db: Tx, sku: string | undefined, exceptId?: string) {
  if (!sku) return;
  const clash = await db.productVariant.findUnique({ where: { sku }, select: { id: true } });
  if (clash && clash.id !== exceptId) throw conflict(ERROR_MESSAGES.variant.skuExists(sku));
}

export async function listVariants(productId: string, admin: boolean) {
  const product = await loadProductForVariants(productId);
  const rows = await prisma.productVariant.findMany({
    where: { productId, ...(admin ? {} : { isActive: true }) },
    select: variantAdminSelect,
    orderBy: variantOrderBy,
  });
  return rows.map((row) => (admin ? toVariantAdmin(row, product.priceCtx) : toVariantPublic(row, product.priceCtx)));
}

export async function createVariant(productId: string, input: VariantCreateInput, userId: string | null) {
  const product = await loadProductForVariants(productId);
  const { color, size } = await assertColorAndSize(prisma, input.colorId, input.sizeId);
  const combo = await prisma.productVariant.findUnique({
    where: { productId_colorId_sizeId: { productId, colorId: input.colorId, sizeId: input.sizeId } },
    select: { id: true },
  });
  if (combo) throw conflict(ERROR_MESSAGES.variant.comboExists);
  await assertSkuFree(prisma, input.sku);

  const row = await prisma.$transaction(async (tx) => {
    const sku =
      input.sku ??
      (await nextSku(tx, { styleCode: product.styleCode, productSlug: product.slug, colorSlug: color?.slug ?? "", sizeLabel: size?.label ?? "" }));
    const hasDefault = await tx.productVariant.count({ where: { productId, isDefault: true } });
    const isDefault = input.isDefault ?? hasDefault === 0;
    if (isDefault) await tx.productVariant.updateMany({ where: { productId }, data: { isDefault: false } });
    const last = await tx.productVariant.aggregate({ where: { productId }, _max: { position: true } });
    const variant = await tx.productVariant.create({
      data: {
        productId,
        colorId: input.colorId,
        sizeId: input.sizeId,
        sku,
        barcode: input.barcode ?? null,
        price: input.price ?? null,
        compareAtPrice: input.compareAtPrice ?? null,
        costPrice: input.costPrice ?? null,
        weightGrams: input.weightGrams ?? null,
        lowStockThreshold: input.lowStockThreshold ?? (await defaultLowStockThreshold(tx)),
        position: input.position ?? (last._max.position ?? -1) + 1,
        isDefault,
      },
      select: { id: true },
    });
    if (input.stock && input.stock > 0) {
      await moveStock(tx, { variantId: variant.id, quantity: input.stock, type: "INITIAL", userId });
    }
    return tx.productVariant.findUniqueOrThrow({ where: { id: variant.id }, select: variantAdminSelect });
  });
  return toVariantAdmin(row, product.priceCtx);
}

export async function getVariant(id: string) {
  const row = await prisma.productVariant.findUnique({
    where: { id },
    select: { ...variantAdminSelect, productId: true, product: { select: { id: true, slug: true, name: true } } },
  });
  if (!row) throw notFound(ERROR_MESSAGES.variant.notFound(id));
  const { priceCtx } = await loadProductForVariants(row.productId);
  return { ...toVariantPublic(row, priceCtx), product: row.product, color: row.color, size: row.size, isActive: row.isActive };
}

export async function updateVariant(id: string, input: VariantUpdateInput) {
  const existing = await prisma.productVariant.findUnique({ where: { id }, select: { productId: true, colorId: true, sizeId: true } });
  if (!existing) throw notFound(ERROR_MESSAGES.variant.notFound(id));
  await assertColorAndSize(prisma, input.colorId, input.sizeId);
  await assertSkuFree(prisma, input.sku, id);
  const colorId = input.colorId ?? existing.colorId;
  const sizeId = input.sizeId ?? existing.sizeId;
  if (colorId !== existing.colorId || sizeId !== existing.sizeId) {
    const combo = await prisma.productVariant.findUnique({
      where: { productId_colorId_sizeId: { productId: existing.productId, colorId, sizeId } },
      select: { id: true },
    });
    if (combo && combo.id !== id) throw conflict(ERROR_MESSAGES.variant.comboExists);
  }

  const row = await prisma.$transaction(async (tx) => {
    if (input.isDefault) await tx.productVariant.updateMany({ where: { productId: existing.productId, id: { not: id } }, data: { isDefault: false } });
    return tx.productVariant.update({
      where: { id },
      data: { ...input, ...(input.isActive === false ? { isDefault: false } : {}) },
      select: variantAdminSelect,
    });
  });
  const { priceCtx } = await loadProductForVariants(existing.productId);
  return toVariantAdmin(row, priceCtx);
}

/**
 * Hard delete when nothing remembers the variant; otherwise archive it
 * (isActive=false) so orders, returns and the stock ledger stay intact.
 * Cart lines for it are removed either way.
 */
export async function removeVariant(id: string) {
  const variant = await prisma.productVariant.findUnique({
    where: { id },
    select: { _count: { select: { orderItems: true, wholesaleItems: true, stockMovements: true, exchangeRequests: true, reviews: true } } },
  });
  if (!variant) throw notFound(ERROR_MESSAGES.variant.notFound(id));
  const hasHistory = Object.values(variant._count).some((count) => count > 0);

  await prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { variantId: id } });
    if (hasHistory) await tx.productVariant.update({ where: { id }, data: { isActive: false, isDefault: false } });
    else await tx.productVariant.delete({ where: { id } });
  });
  return hasHistory
    ? { archived: true, message: SUCCESS_MESSAGES.catalog.variantArchived }
    : { archived: false, message: SUCCESS_MESSAGES.common.deleted("Variant") };
}
