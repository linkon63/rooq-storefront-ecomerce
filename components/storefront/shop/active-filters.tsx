"use client";

import { FiX } from "react-icons/fi";
import { DEPARTMENT_LABELS, FIT_LABELS } from "@/lib/constants/catalog";
import { useMoney } from "@/hooks/use-money";
import { facetLabels } from "@/utils/storefront/facets";
import { clearedFilters, type ShopFilters } from "@/utils/storefront/shop-query";
import { useShopNavigation } from "./shop-navigation";

type Chip = { key: string; label: string; next: Partial<ShopFilters> };

/** Removable chips for every refinement in the URL, plus "Clear all". */
export function ActiveFilters() {
  const { state, actions } = useShopNavigation();
  const format = useMoney();
  const { filters, facets, preset } = state;
  const labels = facetLabels(facets);
  const without = <K extends "category" | "size" | "color" | "brand" | "material">(key: K, value: string) => ({
    [key]: filters[key].filter((entry) => entry !== value),
  });

  const chips: Chip[] = [
    ...("department" in preset ? [] : filters.department).map((value) => ({
      key: `department:${value}`,
      label: DEPARTMENT_LABELS[value],
      next: { department: filters.department.filter((entry) => entry !== value) },
    })),
    ...(["category", "size", "color", "brand", "material"] as const).flatMap((key) =>
      filters[key].map((value) => ({ key: `${key}:${value}`, label: labels.get(`${key}:${value}`) ?? value, next: without(key, value) })),
    ),
    ...filters.fit.map((value) => ({ key: `fit:${value}`, label: `${FIT_LABELS[value]} fit`, next: { fit: filters.fit.filter((entry) => entry !== value) } })),
    ...(filters.minPrice !== null || filters.maxPrice !== null
      ? [{ key: "price", label: `${filters.minPrice !== null ? format(filters.minPrice) : "Any"} to ${filters.maxPrice !== null ? format(filters.maxPrice) : "any"}`, next: { minPrice: null, maxPrice: null } }]
      : []),
    ...(filters.inStock ? [{ key: "inStock", label: "In stock", next: { inStock: false } }] : []),
    ...(filters.onSale && !("onSale" in preset) ? [{ key: "onSale", label: "On sale", next: { onSale: false } }] : []),
  ];

  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={() => actions.apply(chip.next)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-selvedge pl-3 pr-2 text-xs font-semibold hover:bg-line"
            aria-label={`Remove filter: ${chip.label}`}
          >
            {chip.label}
            <FiX aria-hidden className="size-3.5" />
          </button>
        </li>
      ))}
      <li>
        <button type="button" onClick={() => actions.apply(clearedFilters(filters, preset))} className="px-2 text-xs font-semibold underline underline-offset-4">
          Clear all
        </button>
      </li>
    </ul>
  );
}
