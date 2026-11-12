import type { BackInStockStatus } from "@/lib/generated/prisma/enums";
import { toColorRef, toSizeRef, type ColorRef, type SizeRef } from "./catalog-refs";

export type BackInStockRow = {
  id: string; email: string; status: BackInStockStatus; createdAt: Date; notifiedAt: Date | null;
  user: { id: string; name: string } | null;
  variant: { id: string; sku: string; stock: number; color: ColorRef; size: SizeRef; product: { id: string; name: string; slug: string } };
};

export function toBackInStock(row: BackInStockRow) {
  return {
    id: row.id,
    email: row.email,
    status: row.status,
    createdAt: row.createdAt,
    notifiedAt: row.notifiedAt,
    user: row.user,
    variant: { ...row.variant, color: toColorRef(row.variant.color), size: toSizeRef(row.variant.size) },
  };
}

export type BackInStockSummaryRow = {
  variantId: string; sku: string; productName: string; productId: string; colorName: string; sizeLabel: string; stock: number; pending: number;
};

export type BackInStockResponse = ReturnType<typeof toBackInStock>;
