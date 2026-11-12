import type { ProductCard } from "@/types/storefront/catalog";
import { LabelTag } from "../shared/label-tag";

/** One woven label per card, most important first: sold out, sale, low stock, new. */
export function CardLabel({ product }: { product: ProductCard }) {
  if (!product.inStock) return <LabelTag tone="paper">Sold out</LabelTag>;
  if (product.isOnSale && product.discountPercent > 0) return <LabelTag tone="dye">−{product.discountPercent}%</LabelTag>;
  if (product.lowStockCount !== null) return <LabelTag tone="warn">Only {product.lowStockCount} left</LabelTag>;
  if (product.isNew) return <LabelTag>New</LabelTag>;
  return null;
}
