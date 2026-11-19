"use client";

import { useMoney } from "@/hooks/use-money";

type PriceProps = {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
  /** "from" prefix when the product has several variant prices. */
  from?: boolean;
  /** Listing cards: the old price is struck through as the card scrolls in, and the new one settles. */
  cut?: boolean;
};

/** Price with the struck-through compare-at price when on sale. */
export function Price({ price, compareAtPrice, className = "", from = false, cut = false }: PriceProps) {
  const format = useMoney();
  const onSale = compareAtPrice != null && compareAtPrice > price;
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 tabular-nums ${className}`}>
      <span className={`${onSale ? "font-semibold text-dye-deep" : "font-semibold"} ${onSale && cut ? "price-now" : ""}`}>
        {from ? <span className="font-normal text-stone">From </span> : null}
        {format(price)}
      </span>
      {onSale ? (
        <s className={`text-[0.85em] text-stone ${cut ? "price-cut" : ""}`}>
          <span className="sr-only">Was </span>
          {format(compareAtPrice)}
        </s>
      ) : null}
    </span>
  );
}
