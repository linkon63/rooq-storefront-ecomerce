"use client";

import { SIZE_GROUP_LABELS } from "@/lib/constants/catalog";
import type { ProductFacets } from "@/types/storefront/catalog";
import { groupSizes } from "@/utils/storefront/facets";

type Props = {
  sizes: ProductFacets["sizes"];
  selected: readonly string[];
  onToggle: (slug: string) => void;
};

/** Size chips grouped by size system (letters, numbers, shoes). */
export function SizeFacet({ sizes, selected, onToggle }: Props) {
  const groups = groupSizes(sizes);
  return (
    <div className="flex flex-col gap-4">
      {groups.map(([group, list]) => (
        <div key={group}>
          {groups.length > 1 ? <p className="mb-2 text-xs text-stone">{SIZE_GROUP_LABELS[group]}</p> : null}
          <ul className="flex flex-wrap gap-1.5">
            {list.map((size) => {
              const active = selected.includes(size.slug);
              return (
                <li key={size.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-label={`${size.label}, ${size.count} products`}
                    onClick={() => onToggle(size.slug)}
                    className={`h-10 min-w-11 rounded border px-2.5 text-sm tabular-nums ${
                      active ? "border-ink bg-ink text-chalk" : size.count === 0 ? "border-line text-stone" : "border-line bg-paper hover:border-ink"
                    }`}
                  >
                    {size.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
