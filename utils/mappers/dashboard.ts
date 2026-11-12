import { mediaSrc, type MediaRef } from "@/utils/media-url";

export type LowStockVariantRow = {
  id: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  product: { id: string; name: string; slug: string; media: { media: MediaRef }[] };
  color: { name: string; hex: string };
  size: { label: string };
};

/** One row of the dashboard's low-stock alert card. */
export type LowStockAlert = {
  variantId: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  isOutOfStock: boolean;
  product: { id: string; name: string; slug: string };
  color: { name: string; hex: string };
  size: { label: string };
  imageUrl: string | null;
};

export function toLowStockAlert(row: LowStockVariantRow): LowStockAlert {
  return {
    variantId: row.id,
    sku: row.sku,
    stock: row.stock,
    lowStockThreshold: row.lowStockThreshold,
    isOutOfStock: row.stock <= 0,
    product: { id: row.product.id, name: row.product.name, slug: row.product.slug },
    color: row.color,
    size: row.size,
    imageUrl: mediaSrc(row.product.media[0]?.media),
  };
}
