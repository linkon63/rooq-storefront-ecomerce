import type { ProductStatus, StockMovementType } from "@/lib/generated/prisma/enums";
import { lowStockCount } from "@/utils/catalog/stock";
import { toColorRef, toNum, toNumOrNull, toSizeRef, type ColorRef, type DecimalLike, type SizeRef } from "./catalog-refs";
import { cardImages, type GalleryRow } from "./product-gallery";

export type InventoryVariantRow = {
  id: string; sku: string; barcode: string | null; stock: number; lowStockThreshold: number; isActive: boolean;
  price: DecimalLike | null; colorId: string;
  color: ColorRef; size: SizeRef;
  product: { id: string; name: string; slug: string; status: ProductStatus; price: DecimalLike; media: GalleryRow[] };
};

export function toInventoryRow(row: InventoryVariantRow) {
  return {
    id: row.id,
    sku: row.sku,
    barcode: row.barcode,
    stock: row.stock,
    lowStockThreshold: row.lowStockThreshold,
    isLowStock: lowStockCount(row.stock, row.lowStockThreshold) !== null,
    isOutOfStock: row.stock <= 0,
    isActive: row.isActive,
    price: toNumOrNull(row.price) ?? toNum(row.product.price),
    imageUrl: cardImages(row.product.media, row.colorId).image?.url ?? null,
    product: { id: row.product.id, name: row.product.name, slug: row.product.slug, status: row.product.status },
    color: toColorRef(row.color),
    size: toSizeRef(row.size),
  };
}

export type MovementRow = {
  id: string; type: StockMovementType; quantity: number; stockAfter: number; reason: string | null; createdAt: Date;
  variant: { id: string; sku: string; product: { id: string; name: string }; color: ColorRef; size: SizeRef };
  order: { id: string; orderNumber: string } | null;
  returnRequest: { id: string; requestNumber: string } | null;
  createdBy: { id: string; name: string } | null;
};

export function toMovement(row: MovementRow) {
  return {
    id: row.id,
    type: row.type,
    quantity: row.quantity,
    stockAfter: row.stockAfter,
    reason: row.reason,
    createdAt: row.createdAt,
    variant: { id: row.variant.id, sku: row.variant.sku, product: row.variant.product, color: toColorRef(row.variant.color), size: toSizeRef(row.variant.size) },
    order: row.order,
    returnRequest: row.returnRequest,
    createdBy: row.createdBy,
  };
}

export type InventoryRow = ReturnType<typeof toInventoryRow>;
export type StockMovementResponse = ReturnType<typeof toMovement>;
