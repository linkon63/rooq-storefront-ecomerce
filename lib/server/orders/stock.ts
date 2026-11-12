import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { moveStock } from "@/lib/server/catalog/inventory/stock";

type Tx = Prisma.TransactionClient;

export type OrderStockLine = { variantId: string | null; productId: string | null; quantity: number };

/**
 * Takes the ordered units out of stock (SALE movement per line) and bumps
 * Product.soldCount. Runs inside the order's transaction; the inventory
 * helper refuses to go below zero, which rolls the whole order back.
 */
export async function takeOrderStock(
  tx: Tx,
  lines: readonly OrderStockLine[],
  ref: { orderId: string; reason: string; userId?: string | null },
): Promise<void> {
  for (const line of lines) {
    if (!line.variantId) continue;
    await moveStock(tx, {
      variantId: line.variantId,
      quantity: -line.quantity,
      type: "SALE",
      reason: ref.reason,
      orderId: ref.orderId,
      userId: ref.userId ?? undefined,
    });
    if (line.productId) {
      await tx.product.update({ where: { id: line.productId }, data: { soldCount: { increment: line.quantity } } });
    }
  }
}

/**
 * Puts units back (CANCELLATION when an order is cancelled, RETURN when it is
 * returned) and takes them off Product.soldCount, never below zero.
 */
export async function restockOrderLines(
  tx: Tx,
  lines: readonly OrderStockLine[],
  ref: { orderId: string; type: "CANCELLATION" | "RETURN"; reason: string; userId?: string | null; returnRequestId?: string },
): Promise<void> {
  for (const line of lines) {
    if (!line.variantId || line.quantity <= 0) continue;
    await moveStock(tx, {
      variantId: line.variantId,
      quantity: line.quantity,
      type: ref.type,
      reason: ref.reason,
      orderId: ref.orderId,
      returnRequestId: ref.returnRequestId,
      userId: ref.userId ?? undefined,
    });
    if (line.productId) {
      await tx.product.updateMany({
        where: { id: line.productId, soldCount: { gte: line.quantity } },
        data: { soldCount: { decrement: line.quantity } },
      });
    }
  }
}
