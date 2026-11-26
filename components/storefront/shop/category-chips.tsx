"use client";

import { toggleListValue } from "@/utils/storefront/shop-query";
import { useShopNavigation } from "./shop-navigation";

/** Phones: swipeable category chips above the grid. */
export function CategoryChips() {
  const { state, actions } = useShopNavigation();
  const categories = state.facets?.categories ?? [];
  if (categories.length < 2) return null;
  const selected = state.filters.category;
  const chip = (on: boolean) =>
    `press h-11 whitespace-nowrap rounded-full border px-4 text-sm ${on ? "border-ink bg-ink text-chalk" : "border-line bg-paper"}`;

  return (
    <ul aria-label="Category" className="rail-scroll -mx-4 flex gap-2 overflow-x-auto px-4 md:hidden">
      <li>
        <button type="button" aria-pressed={selected.length === 0} onClick={() => actions.apply({ category: [] })} className={chip(selected.length === 0)}>
          All
        </button>
      </li>
      {categories.map((category) => {
        const on = selected.includes(category.slug);
        return (
          <li key={category.slug}>
            <button type="button" aria-pressed={on} onClick={() => actions.apply({ category: toggleListValue(selected, category.slug) })} className={chip(on)}>
              {category.name}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
