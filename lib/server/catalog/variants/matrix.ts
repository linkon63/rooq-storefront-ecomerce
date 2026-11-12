import "server-only";
import { prisma } from "@/lib/server/prisma";
import { badRequest } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { CATALOG_TX_OPTIONS } from "@/lib/constants/catalog";
import { buildSku } from "@/utils/catalog/sku";
import { planMatrix } from "@/utils/catalog/matrix";
import { toVariantAdmin, type VariantAdmin } from "@/utils/mappers/variant";
import { variantAdminSelect, variantOrderBy } from "../selects";
import { loadProductForVariants } from "./context";
import { takenSkus } from "./sku";
import { defaultLowStockThreshold } from "./service";
import type { VariantMatrixInput } from "./schemas";

export type MatrixSkip = { colorId: string; sizeId: string; reason: "exists" | "sku_taken" };
export type MatrixPlanItem = { sku: string; colorId: string; sizeId: string };
export type MatrixResult =
  | { dryRun: true; planned: MatrixPlanItem[]; skipped: MatrixSkip[] }
  | { dryRun: false; created: VariantAdmin[]; skipped: MatrixSkip[] };

async function loadAxes(colorIds: string[], sizeIds: string[]) {
  const [colors, sizes] = await Promise.all([
    prisma.color.findMany({ where: { id: { in: colorIds } }, select: { id: true, slug: true } }),
    prisma.size.findMany({ where: { id: { in: sizeIds } }, select: { id: true, label: true } }),
  ]);
  if (colors.length !== new Set(colorIds).size) throw badRequest(ERROR_MESSAGES.color.someNotFound);
  if (sizes.length !== new Set(sizeIds).size) throw badRequest(ERROR_MESSAGES.size.someNotFound);
  return { colorSlug: new Map(colors.map((c) => [c.id, c.slug])), sizeLabel: new Map(sizes.map((s) => [s.id, s.label])) };
}

/**
 * Sizes × colours → variants. Existing pairs are skipped ("exists"); a SKU the
 * pattern produces that is already used (or repeats within the batch) is
 * skipped as "sku_taken". With dryRun nothing is written.
 */
export async function generateVariantMatrix(productId: string, input: VariantMatrixInput, userId: string | null): Promise<MatrixResult> {
  if (!input.colorIds.length || !input.sizeIds.length) throw badRequest(ERROR_MESSAGES.variant.matrixEmpty);
  const product = await loadProductForVariants(productId);
  const axes = await loadAxes(input.colorIds, input.sizeIds);
  const existing = await prisma.productVariant.findMany({ where: { productId }, select: { colorId: true, sizeId: true } });
  const plan = planMatrix(input.colorIds, input.sizeIds, existing);

  const candidates = plan.toCreate.map((pair) => ({
    ...pair,
    sku: buildSku(
      { styleCode: product.styleCode, productSlug: product.slug, colorSlug: axes.colorSlug.get(pair.colorId) ?? "", sizeLabel: axes.sizeLabel.get(pair.sizeId) ?? "" },
      input.skuPattern,
    ),
  }));
  const taken = await takenSkus(prisma, candidates.map((c) => c.sku));
  const skipped: MatrixSkip[] = plan.existing.map((pair) => ({ ...pair, reason: "exists" }));
  const planned: MatrixPlanItem[] = [];
  for (const candidate of candidates) {
    if (taken.has(candidate.sku)) skipped.push({ colorId: candidate.colorId, sizeId: candidate.sizeId, reason: "sku_taken" });
    else {
      taken.add(candidate.sku);
      planned.push(candidate);
    }
  }
  if (input.dryRun) return { dryRun: true, planned, skipped };
  if (!planned.length) return { dryRun: false, created: [], skipped };

  const threshold = input.lowStockThreshold ?? (await defaultLowStockThreshold());
  const stock = input.stock ?? 0;
  const rows = await prisma.$transaction(async (tx) => {
    const [last, defaults] = await Promise.all([
      tx.productVariant.aggregate({ where: { productId }, _max: { position: true } }),
      tx.productVariant.count({ where: { productId, isDefault: true } }),
    ]);
    const start = (last._max.position ?? -1) + 1;
    await tx.productVariant.createMany({
      data: planned.map((item, index) => ({
        productId,
        colorId: item.colorId,
        sizeId: item.sizeId,
        sku: item.sku,
        price: input.price ?? null,
        compareAtPrice: input.compareAtPrice ?? null,
        stock,
        lowStockThreshold: threshold,
        position: start + index,
        isDefault: defaults === 0 && index === 0,
      })),
    });
    const created = await tx.productVariant.findMany({
      where: { productId, sku: { in: planned.map((item) => item.sku) } },
      select: variantAdminSelect,
      orderBy: variantOrderBy,
    });
    if (stock > 0) {
      await tx.stockMovement.createMany({
        data: created.map((variant) => ({ variantId: variant.id, type: "INITIAL" as const, quantity: stock, stockAfter: stock, createdById: userId })),
      });
    }
    return created;
  }, CATALOG_TX_OPTIONS);
  return { dryRun: false, created: rows.map((row) => toVariantAdmin(row, product.priceCtx)), skipped };
}
