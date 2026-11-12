"use client";

import { useMoney } from "@/hooks/use-money";

type PriceProps = {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
  /** "from" prefix when the product has several variant prices. */
  from?: boolean;
};

/** Price with the struck-through compare-at price when on sale. */
export function Price({ price, compareAtPrice, className = "", from = false }: PriceProps) {
  const format = useMoney();
  const onSale = compareAtPrice != null && compareAtPrice > price;
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 tabular-nums ${className}`}>
      <span className={onSale ? "font-semibold text-dye-deep" : "font-semibold"}>
        {from ? <span className="font-normal text-stone">From </span> : null}
        {format(price)}
      </span>
      {onSale ? (
        <s className="text-[0.85em] text-stone">
          <span className="sr-only">Was </span>
          {format(compareAtPrice)}
        </s>
      ) : null}
    </span>
  );
}
