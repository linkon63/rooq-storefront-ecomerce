import { PiStarFill } from "react-icons/pi";

import ProductCard from "@/components/storefront/shop/ProductCard";
import type { ShopProduct } from "@/lib/shop-api";

/** A highlight shelf, not a catalogue — four is the most it ever shows. */
export const MAX_LOVED_ITEMS = 4;

/**
 * The shelf lays itself out around however many products are tagged. Each count
 * keeps the cards at a sensible size instead of stretching one card across the
 * page or squeezing four into a third of it: a single product is a centred
 * spotlight, two share a narrow pair, four fill the row.
 *
 * Written out in full because Tailwind only ships classes it can read in the
 * source — a class built from a variable never reaches the stylesheet.
 */
const LAYOUT: Record<number, string> = {
  1: "max-w-sm grid-cols-1",
  2: "max-w-3xl grid-cols-1 sm:grid-cols-2",
  3: "max-w-5xl grid-cols-2 lg:grid-cols-3",
  4: "max-w-none grid-cols-2 lg:grid-cols-4",
};

interface MostLovedFoodsProps {
  products: ShopProduct[];
}

export default function MostLovedFoods({ products }: MostLovedFoodsProps) {
  const items = products.slice(0, MAX_LOVED_ITEMS);

  if (items.length === 0) return null;

  return (
    <section className="bg-brand-mist py-12 md:py-14">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        <p className="font-display mx-auto flex w-fit items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] text-brand shadow-sm">
          <PiStarFill size={14} />
          Best Sellers
        </p>

        <h2 className="font-display mt-4 text-center text-[22px] font-bold leading-tight md:font-semibold text-[#1f2a17] md:text-[38px]">
          Our Most Loved Items
        </h2>

        <div
          className={`mx-auto mt-8 grid gap-4 md:mt-10 md:gap-6 ${LAYOUT[items.length]}`}
        >
          {items.map((product) => (
            /* A white surface lifts each card off the tinted band — on the
               plain page the cards had nothing to sit on. */
            <div
              key={product.id}
              className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-brand/10 transition-shadow duration-300 hover:shadow-lg"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
