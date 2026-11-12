"use client";

import { useState } from "react";
import { FiSliders } from "react-icons/fi";
import { SORT_OPTIONS } from "@/lib/constants/storefront";
import type { ProductSort } from "@/types/storefront/catalog";
import { activeFilterCount } from "@/utils/storefront/shop-query";
import { Modal } from "../shared/modal";
import { ActiveFilters } from "./active-filters";
import { FilterControls } from "./filter-controls";
import { useShopNavigation } from "./shop-navigation";

/** Result count, the phone filter sheet button, sort, and removable filter chips. */
export function ShopToolbar() {
  const { state, actions, meta } = useShopNavigation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const count = activeFilterCount(state.filters, state.preset);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <p className="mr-auto text-sm text-stone" aria-live="polite">
          {meta.isPending ? "Updating…" : `${state.total} ${state.total === 1 ? "piece" : "pieces"}`}
        </p>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded border border-line bg-paper px-3 text-sm font-semibold lg:hidden"
        >
          <FiSliders aria-hidden className="size-4" />
          Filter{count > 0 ? ` (${count})` : ""}
        </button>
        <label htmlFor="shop-sort" className="sr-only">
          Sort by
        </label>
        <select
          id="shop-sort"
          value={state.filters.sort}
          onChange={(event) => actions.apply({ sort: event.target.value as ProductSort })}
          className="h-10 rounded border border-line bg-paper px-2 text-sm font-semibold"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <ActiveFilters />
      <Modal open={sheetOpen} onOpenChange={setSheetOpen} title="Filter" placement="bottom">
        <div className="px-4 pb-24">
          <FilterControls />
        </div>
        <div className="sticky bottom-0 border-t border-selvedge bg-paper p-4">
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="h-12 w-full rounded bg-ink text-sm font-semibold text-chalk"
          >
            {meta.isPending ? "Updating…" : `Show ${state.total} pieces`}
          </button>
        </div>
      </Modal>
    </div>
  );
}
