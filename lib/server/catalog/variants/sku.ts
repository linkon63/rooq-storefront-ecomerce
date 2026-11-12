import "server-only";
import { buildSku, uniqueSku, type SkuParts } from "@/utils/catalog/sku";
import type { Tx } from "../selects";

/** SKUs already in use that start with any of the given bases. */
export async function takenSkus(db: Tx, bases: readonly string[]): Promise<Set<string>> {
  if (!bases.length) return new Set();
  const rows = await db.productVariant.findMany({
    where: { OR: [...new Set(bases)].map((base) => ({ sku: { startsWith: base } })) },
    select: { sku: true },
  });
  return new Set(rows.map((row) => row.sku));
}

/** Generated SKU, suffixed -2, -3… when the pattern collides. */
export async function nextSku(db: Tx, parts: SkuParts, pattern?: string): Promise<string> {
  const base = buildSku(parts, pattern);
  return uniqueSku(base, await takenSkus(db, [base]));
}
