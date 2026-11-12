"use client";

import { isLightColor } from "@/utils/color";
import { colorHasStock } from "@/utils/storefront/variant-selection";
import { useProductSelection } from "./selection-context";

/** Round fabric swatches; sold-out colours stay pickable but are struck through. */
export function ColorPicker() {
  const { state, actions, meta } = useProductSelection();
  const { product, color } = meta;
  if (product.colors.length === 0) return null;

  return (
    <fieldset>
      <legend className="mb-2.5 text-sm">
        <span className="font-semibold">Colour</span>
        {color ? <span className="text-stone">: {color.name}</span> : null}
      </legend>
      <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Colour">
        {product.colors.map((entry) => {
          const selected = entry.id === state.colorId;
          const soldOut = !colorHasStock(product.variants, entry.id);
          return (
            <button
              key={entry.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={soldOut ? `${entry.name}, sold out` : entry.name}
              onClick={() => actions.selectColor(entry.id)}
              className={`relative grid size-11 place-items-center rounded-full transition-shadow ${
                selected ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : "hover:ring-1 hover:ring-stone hover:ring-offset-2"
              }`}
            >
              <span
                aria-hidden
                className={`size-9 rounded-full ${isLightColor(entry.hex) ? "ring-1 ring-inset ring-line" : ""}`}
                style={{ backgroundColor: entry.hex }}
              />
              {soldOut ? (
                <span aria-hidden className="absolute h-px w-10 rotate-45 bg-ink/70" />
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
