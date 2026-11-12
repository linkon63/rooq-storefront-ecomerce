import "server-only";
import { prisma } from "@/lib/server/prisma";
import { badRequest, conflict } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { CATALOG_TX_OPTIONS } from "@/lib/constants/catalog";
import { setStock } from "../inventory/stock";
import type { VariantBulkInput } from "./schemas";

/**
 * PATCH /variants/bulk — prices, thresholds, active flag and absolute stock
 * for many variants in one transaction. Stock differences are written as
 * ADJUSTMENT movements.
 */
export async function bulkUpdateVariants(input: VariantBulkInput, userId: string | null): Promise<{ updated: number }> {
  const ids = [...new Set(input.items.map((item) => item.id))];
  const found = await prisma.productVariant.findMany({ where: { id: { in: ids } }, select: { id: true } });
  if (found.length !== ids.length) {
    const have = new Set(found.map((row) => row.id));
    throw badRequest(ERROR_MESSAGES.variant.notFound(ids.find((id) => !have.has(id)) ?? ""));
  }
  const skus = input.items.flatMap((item) => (item.sku ? [item.sku] : []));
  if (skus.length) {
    const clashes = await prisma.productVariant.findMany({ where: { sku: { in: skus } }, select: { id: true, sku: true } });
    const owner = new Map(input.items.map((item) => [item.sku, item.id]));
    const clash = clashes.find((row) => owner.get(row.sku) !== row.id);
    if (clash) throw conflict(ERROR_MESSAGES.variant.skuExists(clash.sku));
  }

  await prisma.$transaction(async (tx) => {
    for (const item of input.items) {
      const { id, stock, ...fields } = item;
      const data = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
      if (fields.isActive === false) Object.assign(data, { isDefault: false });
      if (Object.keys(data).length) await tx.productVariant.update({ where: { id }, data });
      if (stock !== undefined) {
        await setStock(tx, { variantId: id, stock, type: "ADJUSTMENT", reason: input.reason ?? null, userId });
      }
    }
  }, CATALOG_TX_OPTIONS);
  return { updated: ids.length };
}
