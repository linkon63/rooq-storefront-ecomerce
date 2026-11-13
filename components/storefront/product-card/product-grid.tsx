import type { ProductCard as ProductCardData } from "@/types/storefront/catalog";
import { isFeatureTile } from "@/utils/storefront/grid-rhythm";
import { GridReveal } from "./grid-reveal";
import { ProductCard } from "./product-card";

type ProductGridProps = {
  products: ProductCardData[];
  /** Cards before this index load eagerly. */
  eagerCount?: number;
  /** Position of the first product in the whole result, so the 2×2 rhythm survives paging. */
  offset?: number;
};

/**
 * Tight mosaic: 2 columns on phones, 3 at lg, 4 at xl, 3 px between columns.
 * Two cards in every 24 are 2×2 feature tiles from lg up.
 */
export function ProductGrid({ products, eagerCount = 4, offset = 0 }: ProductGridProps) {
  return (
    <GridReveal className="grid grid-flow-row-dense grid-cols-2 gap-x-[3px] gap-y-4 lg:grid-cols-3 lg:gap-y-5 xl:grid-cols-4">
      {products.map((product, index) => {
        const feature = isFeatureTile(offset + index);
        return (
          <li key={product.id} data-grid-item className={feature ? "lg:col-span-2 lg:row-span-2" : undefined}>
            <ProductCard product={product} priority={index < eagerCount} feature={feature} />
          </li>
        );
      })}
    </GridReveal>
  );
}
