"use client";

import { DEPARTMENT_LABELS, FIT_LABELS } from "@/lib/constants/catalog";
import type { Department, Fit } from "@/types/storefront/catalog";
import { toggleListValue } from "@/utils/storefront/shop-query";
import { Disclosure } from "../shared/disclosure";
import { ColorFacet } from "./color-facet";
import { FacetChecklist } from "./facet-checklist";
import { PriceFacet } from "./price-facet";
import { useShopNavigation } from "./shop-navigation";
import { SizeFacet } from "./size-facet";
import { ToggleFacets } from "./toggle-facets";

/** Every facet the API returned, in shopping order: who, what, size, colour, price, then the rest. */
export function FilterControls() {
  const { state, actions } = useShopNavigation();
  const { filters, facets, preset } = state;
  if (!facets) return <ToggleFacets />;

  return (
    <div className="border-t border-line">
      {!("department" in preset) && facets.departments.length > 1 ? (
        <Disclosure title="Department" open>
          <FacetChecklist
            name="department"
            options={facets.departments.map((entry) => ({ value: entry.value, label: DEPARTMENT_LABELS[entry.value], count: entry.count }))}
            selected={filters.department}
            onToggle={(value) => actions.apply({ department: toggleListValue(filters.department, value as Department) })}
          />
        </Disclosure>
      ) : null}
      {facets.categories.length ? (
        <Disclosure title="Category" open>
          <FacetChecklist
            name="category"
            options={facets.categories.map((entry) => ({ value: entry.slug, label: entry.name, count: entry.count }))}
            selected={filters.category}
            onToggle={(value) => actions.apply({ category: toggleListValue(filters.category, value) })}
          />
        </Disclosure>
      ) : null}
      {facets.sizes.length ? (
        <Disclosure title="Size" open>
          <SizeFacet sizes={facets.sizes} selected={filters.size} onToggle={(slug) => actions.apply({ size: toggleListValue(filters.size, slug) })} />
        </Disclosure>
      ) : null}
      {facets.colors.length ? (
        <Disclosure title="Colour" open>
          <ColorFacet colors={facets.colors} selected={filters.color} onToggle={(slug) => actions.apply({ color: toggleListValue(filters.color, slug) })} />
        </Disclosure>
      ) : null}
      <Disclosure title="Price">
        <PriceFacet
          key={`${filters.minPrice}-${filters.maxPrice}`}
          bounds={facets.price}
          min={filters.minPrice}
          max={filters.maxPrice}
          onApply={(range) => actions.apply(range)}
        />
      </Disclosure>
      {facets.fits.length ? (
        <Disclosure title="Fit">
          <FacetChecklist
            name="fit"
            options={facets.fits.map((entry) => ({ value: entry.value, label: FIT_LABELS[entry.value], count: entry.count }))}
            selected={filters.fit}
            onToggle={(value) => actions.apply({ fit: toggleListValue(filters.fit, value as Fit) })}
          />
        </Disclosure>
      ) : null}
      {facets.materials.length ? (
        <Disclosure title="Material">
          <FacetChecklist
            name="material"
            options={facets.materials.map((entry) => ({ value: entry.value, label: entry.value, count: entry.count }))}
            selected={filters.material}
            onToggle={(value) => actions.apply({ material: toggleListValue(filters.material, value) })}
          />
        </Disclosure>
      ) : null}
      {facets.brands.length > 1 ? (
        <Disclosure title="Brand">
          <FacetChecklist
            name="brand"
            options={facets.brands.map((entry) => ({ value: entry.slug, label: entry.name, count: entry.count }))}
            selected={filters.brand}
            onToggle={(value) => actions.apply({ brand: toggleListValue(filters.brand, value) })}
          />
        </Disclosure>
      ) : null}
      <div className="py-4">
        <ToggleFacets />
      </div>
    </div>
  );
}
