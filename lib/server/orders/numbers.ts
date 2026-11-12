import "server-only";
import { randomInt } from "node:crypto";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  REFERENCE_ALPHABET,
  REFERENCE_CODE_LENGTH,
  codeFromIndexes,
  formatInvoiceNumber,
  formatOrderNumber,
  formatReturnNumber,
  formatWholesaleNumber,
  yearIn,
} from "@/utils/orders/numbers";

/** Cryptographically random reference suffix ("4F7K2Q"). */
export function randomReferenceCode(length: number = REFERENCE_CODE_LENGTH): string {
  return codeFromIndexes(Array.from({ length }, () => randomInt(REFERENCE_ALPHABET.length)));
}

export const newOrderNumber = (at: Date = new Date()) => formatOrderNumber(at, randomReferenceCode());
export const newReturnNumber = (at: Date = new Date()) => formatReturnNumber(at, randomReferenceCode());
export const newWholesaleNumber = (at: Date = new Date()) => formatWholesaleNumber(at, randomReferenceCode());

/**
 * The next invoice number for an order created inside `tx` ("INV-2026-000123").
 * The yearly counter is bumped with a native upsert, so two orders placed at
 * the same moment never draw the same number, and a rolled-back order gives
 * its number back with the rest of the transaction.
 */
export async function issueInvoiceNumber(tx: Prisma.TransactionClient, at: Date = new Date()): Promise<string> {
  const year = yearIn(at);
  const { lastNumber } = await tx.invoiceCounter.upsert({
    where: { year },
    create: { year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  return formatInvoiceNumber(year, lastNumber);
}
