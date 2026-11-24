import type { ProductCard as ProductCardData } from "@/types/storefront/catalog";
import { chunk } from "@/utils/chunk";
import { SectionHeading } from "../shared/section-heading";
import { SnapSlider } from "../shared/snap-slider";
import { ProductCard } from "./product-card";

const CARDS_PER_PAGE = 4;
const RAIL_ITEM = "w-[44%] shrink-0 sm:w-[30%] lg:w-[22%] xl:w-[18.5%]";

type ProductRailProps = {
  title: string;
  products: ProductCardData[];
  link?: { label: string; href: string };
  /**
   * `grid`: a few large cards (2 per row on phones, 4 from lg) instead of the swipeable shelf.
   * `pages`: on phones, slides of four cards in two columns; the shelf from md.
   */
  layout?: "rail" | "grid" | "pages";
  /** Dot label (`{n}` = slide number) for the `pages` layout. */
  dotLabel?: string;
};

/** Horizontal, swipeable shelf of cards. Hidden when empty. */
export function ProductRail({ title, products, link, layout = "rail", dotLabel = "{n}" }: ProductRailProps) {
  if (products.length === 0) return null;
  const headingId = `rail-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const paged = layout === "pages";
  return (
    <section aria-labelledby={headingId} className="page-gutter">
      <SectionHeading id={headingId} title={title} link={link} />
      {paged ? (
        <SnapSlider label={title} dotLabel={dotLabel} className="md:hidden">
          {chunk(products, CARDS_PER_PAGE).map((page) => (
            <ul key={page[0]?.id} className="grid w-full grid-cols-2 gap-x-3 gap-y-6">
              {page.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          ))}
        </SnapSlider>
      ) : null}
      <ul
        className={
          layout === "grid"
            ? "grid grid-cols-2 gap-x-3 gap-y-6 md:gap-x-5 lg:grid-cols-4"
            : `rail-scroll -mx-4 gap-3 overflow-x-auto px-4 md:-mx-6 md:gap-5 md:px-6 xl:mx-0 xl:px-0 ${paged ? "hidden md:flex" : "flex"}`
        }
      >
        {products.map((product) => (
          <li key={product.id} className={layout === "grid" ? undefined : RAIL_ITEM}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
