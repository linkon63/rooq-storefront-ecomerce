"use client";

import { useState } from "react";
import { FiCheck, FiSliders } from "react-icons/fi";
import { LuArrowUpDown } from "react-icons/lu";
import { SORT_OPTIONS } from "@/lib/constants/storefront";
import { Modal } from "../shared/modal";
import { useShopNavigation } from "./shop-navigation";

const barButton = "press flex h-11 flex-1 items-center justify-center gap-2 text-sm font-semibold";

/** Phones: Sort and Filter stay in thumb reach above the tab bar. */
export function ShopPhoneBar({ filterCount, onFilter }: { filterCount: number; onFilter: () => void }) {
  const { state, actions } = useShopNavigation();
  const [sorting, setSorting] = useState(false);

  return (
    <>
      <div data-action-bar="stacked" className="mobile-action-bar flex divide-x divide-selvedge md:hidden">
        <button type="button" onClick={() => setSorting(true)} className={barButton}>
          <LuArrowUpDown aria-hidden className="size-4" /> Sort
        </button>
        <button type="button" onClick={onFilter} className={barButton}>
          <FiSliders aria-hidden className="size-4" /> Filter{filterCount > 0 ? ` (${filterCount})` : ""}
        </button>
      </div>
      <Modal open={sorting} onOpenChange={setSorting} title="Sort by" placement="bottom">
        <ul className="pb-[env(safe-area-inset-bottom)]">
          {SORT_OPTIONS.map((option) => {
            const on = option.value === state.filters.sort;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    actions.apply({ sort: option.value });
                    setSorting(false);
                  }}
                  className={`press flex h-12 w-full items-center justify-between px-4 text-left text-sm ${on ? "font-semibold" : ""}`}
                >
                  {option.label}
                  {on ? <FiCheck aria-hidden className="size-4" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </>
  );
}
