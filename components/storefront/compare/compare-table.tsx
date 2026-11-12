"use client";

import { useCompareList } from "@/hooks/use-compare";
import { useMoney } from "@/hooks/use-money";
import { COMPARE_MAX_ITEMS } from "@/lib/constants/storefront";
import { useAppSelector } from "@/lib/store/hooks";
import { selectListsHydrated } from "@/lib/store/slices/product-lists-slice";
import { EmptyState } from "../shared/empty-state";
import { SnapshotCard } from "../wishlist/snapshot-card";

/** Side-by-side: price, colours, sizes and stock for up to four pieces. Scrolls sideways on phones. */
export function CompareTable() {
  const { items, remove, clear } = useCompareList();
  const hydrated = useAppSelector(selectListsHydrated);
  const format = useMoney();

  if (!hydrated) return <div className="h-64 animate-pulse rounded bg-selvedge" aria-busy="true" aria-label="Loading comparison" />;
  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing to compare"
        body={`Tick "Compare" on up to ${COMPARE_MAX_ITEMS} product pages to see them side by side.`}
        action={{ label: "Shop all", href: "/shop" }}
      />
    );
  }

  const rows: { label: string; value: (index: number) => string }[] = [
    { label: "Price", value: (index) => format(items[index].price) },
    { label: "Colours", value: (index) => items[index].colors.map((color) => color.name).join(", ") || "–" },
    { label: "Sizes", value: (index) => items[index].sizes.join(", ") || "–" },
    { label: "Availability", value: (index) => (items[index].inStock ? "In stock" : "Sold out") },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] table-fixed border-collapse text-left text-sm">
          <caption className="sr-only">Product comparison</caption>
          <thead>
            <tr>
              <th scope="col" className="w-28 align-bottom">
                <span className="sr-only">Attribute</span>
              </th>
              {items.map((item) => (
                <th key={item.id} scope="col" className="px-2 pb-4 align-top font-normal">
                  <SnapshotCard
                    item={item}
                    actions={
                      <button type="button" onClick={() => remove(item)} className="w-fit text-xs underline underline-offset-4">
                        Remove
                      </button>
                    }
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-selvedge">
                <th scope="row" className="py-3 pr-2 font-semibold">
                  {row.label}
                </th>
                {items.map((item, index) => (
                  <td key={item.id} className="px-2 py-3">
                    {row.value(index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={clear} className="w-fit text-sm underline underline-offset-4">
        Clear comparison
      </button>
    </div>
  );
}
