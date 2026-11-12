import type { ProductCard as ProductCardData } from "@/types/storefront/catalog";
import { SectionHeading } from "../shared/section-heading";
import { ProductCard } from "./product-card";

type ProductRailProps = {
  title: string;
  products: ProductCardData[];
  link?: { label: string; href: string };
};

/** Horizontal, swipeable shelf of cards. Hidden when empty. */
export function ProductRail({ title, products, link }: ProductRailProps) {
  if (products.length === 0) return null;
  const headingId = `rail-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={headingId} className="page-gutter">
      <SectionHeading id={headingId} title={title} link={link} />
      <ul className="rail-scroll -mx-4 flex gap-3 overflow-x-auto px-4 md:-mx-6 md:gap-5 md:px-6 xl:mx-0 xl:px-0">
        {products.map((product) => (
          <li key={product.id} className="w-[44%] shrink-0 sm:w-[30%] lg:w-[22%] xl:w-[18.5%]">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
