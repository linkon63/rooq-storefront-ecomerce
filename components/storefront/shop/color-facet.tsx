"use client";

import type { ProductFacets } from "@/types/storefront/catalog";
import { isLightColor } from "@/utils/color";

type Props = {
  colors: ProductFacets["colors"];
  selected: readonly string[];
  onToggle: (slug: string) => void;
};

export function ColorFacet({ colors, selected, onToggle }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-1">
      {colors.map((color) => {
        const active = selected.includes(color.slug);
        return (
          <li key={color.id}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(color.slug)}
              className={`flex min-h-10 w-full items-center gap-2 rounded px-1.5 text-left text-sm hover:bg-selvedge/60 ${color.count === 0 && !active ? "text-stone" : ""}`}
            >
              <span
                aria-hidden
                className={`size-5 shrink-0 rounded-full ${active ? "ring-2 ring-ink ring-offset-2 ring-offset-chalk" : isLightColor(color.hex) ? "ring-1 ring-line" : ""}`}
                style={{ backgroundColor: color.hex }}
              />
              <span className="flex-1 truncate">{color.name}</span>
              <span className="text-xs text-stone tabular-nums">{color.count}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
