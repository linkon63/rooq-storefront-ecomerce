import type { ProductCard as ProductCardData } from "@/types/storefront/catalog";
import { ProductCard } from "./product-card";

/** 2 columns on phones, 3 at md, 4 at xl. The first row loads eagerly. */
export function ProductGrid({ products, eagerCount = 4 }: { products: ProductCardData[]; eagerCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-10 xl:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < eagerCount} />
        </li>
      ))}
    </ul>
  );
}
