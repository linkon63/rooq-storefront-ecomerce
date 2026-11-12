import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { badRequest } from "@/lib/server/http-error";
import type { Tx } from "./selects";

type Refs = {
  brandId?: string | null;
  categoryId?: string | null;
  unitId?: string | null;
  supplierId?: string | null;
  sizeChartId?: string | null;
};

/** 400s with the old "X with ID … not found" wording when a linked row is missing. */
export async function assertProductRefs(db: Tx, refs: Refs): Promise<void> {
  const [brand, category, unit, supplier, sizeChart] = await Promise.all([
    refs.brandId ? db.brand.findUnique({ where: { id: refs.brandId }, select: { id: true } }) : true,
    refs.categoryId ? db.category.findUnique({ where: { id: refs.categoryId }, select: { id: true } }) : true,
    refs.unitId ? db.unit.findUnique({ where: { id: refs.unitId }, select: { id: true } }) : true,
    refs.supplierId ? db.supplier.findUnique({ where: { id: refs.supplierId }, select: { id: true } }) : true,
    refs.sizeChartId ? db.sizeChart.findUnique({ where: { id: refs.sizeChartId }, select: { id: true } }) : true,
  ]);
  const p = ERROR_MESSAGES.product;
  if (!brand && refs.brandId) throw badRequest(p.brandMissing(refs.brandId));
  if (!category && refs.categoryId) throw badRequest(p.categoryMissing(refs.categoryId));
  if (!unit && refs.unitId) throw badRequest(p.unitMissing(refs.unitId));
  if (!supplier && refs.supplierId) throw badRequest(p.supplierMissing(refs.supplierId));
  if (!sizeChart && refs.sizeChartId) throw badRequest(p.sizeChartMissing(refs.sizeChartId));
}

/** Throws 400 when any id in `ids` is not a row of `model`. */
export async function assertIdsExist(
  count: (ids: string[]) => Promise<number>,
  ids: readonly string[] | undefined,
  message: string,
): Promise<void> {
  if (!ids?.length) return;
  const unique = [...new Set(ids)];
  if ((await count(unique)) !== unique.length) throw badRequest(message);
}
