"use client";

import { useShopNavigation } from "./shop-navigation";

/** In stock only / on sale only switches. "On sale" hides on the Sale page, where it is preset. */
export function ToggleFacets() {
  const { state, actions } = useShopNavigation();
  const { filters, preset } = state;
  const toggles = [
    { key: "inStock" as const, label: "In stock only", checked: filters.inStock },
    ...("onSale" in preset ? [] : [{ key: "onSale" as const, label: "On sale", checked: filters.onSale }]),
  ];
  return (
    <ul className="flex flex-col gap-1">
      {toggles.map((toggle) => (
        <li key={toggle.key}>
          <label className="flex min-h-10 items-center justify-between gap-3 text-sm font-medium">
            {toggle.label}
            <input
              type="checkbox"
              role="switch"
              checked={toggle.checked}
              onChange={(event) => actions.apply({ [toggle.key]: event.target.checked })}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="relative h-6 w-10 rounded-full bg-line transition-colors peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-dye after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-paper after:transition-transform peer-checked:after:translate-x-4"
            />
          </label>
        </li>
      ))}
    </ul>
  );
}
