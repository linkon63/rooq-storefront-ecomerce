import "server-only";
import { after } from "next/server";
import type { StockMovementType } from "@/lib/generated/prisma/enums";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { badRequest, notFound } from "@/lib/server/http-error";
import type { Tx } from "../selects";
import { notifyBackInStock } from "../back-in-stock/notify";

export type MoveStockInput = {
  variantId: string;
  /** Signed delta: +10 restock, -1 sale. */
  quantity: number;
  type: StockMovementType;
  reason?: string | null;
  orderId?: string | null;
  returnRequestId?: string | null;
  userId?: string | null;
};

export type MoveStockResult = {
  movementId: string;
  variantId: string;
  stockBefore: number;
  stockAfter: number;
};

/** Sends back-in-stock mail once the response (and the transaction) is done. */
function scheduleRestockNotice(variantId: string): void {
  const run = () => notifyBackInStock(variantId).catch((error) => console.error("[back-in-stock] notify failed", error));
  try {
    after(run);
  } catch {
    // Outside a request (scripts, seed): nothing to wait for.
    void run();
  }
}

/**
 * THE way to change stock. Updates ProductVariant.stock atomically and
 * appends a StockMovement with stockAfter, inside the caller's transaction.
 * Stock never goes below 0. When a variant comes back from 0, pending
 * back-in-stock requests are emailed after the response.
 *
 *   await prisma.$transaction((tx) => moveStock(tx, { variantId, quantity: -2, type: "SALE", orderId }));
 */
export async function moveStock(tx: Tx, input: MoveStockInput): Promise<MoveStockResult> {
  const quantity = Math.trunc(input.quantity);
  let stockAfter: number;

  if (quantity < 0) {
    const updated = await tx.productVariant.updateMany({
      where: { id: input.variantId, stock: { gte: -quantity } },
      data: { stock: { increment: quantity } },
    });
    const row = await tx.productVariant.findUnique({ where: { id: input.variantId }, select: { stock: true, sku: true } });
    if (!row) throw notFound(ERROR_MESSAGES.variant.notFound(input.variantId));
    if (updated.count === 0) throw badRequest(ERROR_MESSAGES.inventory.insufficientStockForSku(row.sku));
    stockAfter = row.stock;
  } else {
    const row = await tx.productVariant
      .update({ where: { id: input.variantId }, data: { stock: { increment: quantity } }, select: { stock: true } })
      .catch(() => null);
    if (!row) throw notFound(ERROR_MESSAGES.variant.notFound(input.variantId));
    stockAfter = row.stock;
  }

  const movement = await tx.stockMovement.create({
    data: {
      type: input.type,
      quantity,
      stockAfter,
      reason: input.reason ?? null,
      variantId: input.variantId,
      orderId: input.orderId ?? null,
      returnRequestId: input.returnRequestId ?? null,
      createdById: input.userId ?? null,
    },
    select: { id: true },
  });

  const stockBefore = stockAfter - quantity;
  if (stockBefore <= 0 && stockAfter > 0) scheduleRestockNotice(input.variantId);
  return { movementId: movement.id, variantId: input.variantId, stockBefore, stockAfter };
}

/** Sets an absolute level (bulk edit / stock take). No-op when unchanged. */
export async function setStock(
  tx: Tx,
  input: Omit<MoveStockInput, "quantity"> & { stock: number },
): Promise<MoveStockResult | null> {
  if (input.stock < 0) throw badRequest(ERROR_MESSAGES.inventory.negativeStock);
  const row = await tx.productVariant.findUnique({ where: { id: input.variantId }, select: { stock: true } });
  if (!row) throw notFound(ERROR_MESSAGES.variant.notFound(input.variantId));
  const delta = input.stock - row.stock;
  if (delta === 0) return null;
  return moveStock(tx, { ...input, quantity: delta });
}
