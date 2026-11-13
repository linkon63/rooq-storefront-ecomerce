"use client";

import { useAppDispatch } from "@/lib/store/hooks";
import { openSizeGuide } from "@/lib/store/slices/ui-slice";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { useProductSelection } from "./selection-context";

/**
 * Size chips for the chosen colour. Sold-out sizes render disabled-looking
 * but stay focusable so the shopper can pick one and ask to be notified.
 */
export function SizePicker() {
  const dispatch = useAppDispatch();
  const { state, actions, meta } = useProductSelection();
  const { product, sizes } = meta;
  if (sizes.length === 0) return null;
  const selected = sizes.find((size) => size.id === state.sizeId);
  const showPrompt = state.attempted && meta.problem === "size";

  return (
    <fieldset aria-describedby={showPrompt ? "size-prompt" : undefined}>
      <div className="mb-2.5 flex items-baseline justify-between gap-4">
        <legend className="text-sm">
          <span className="font-semibold">Size</span>
          {selected ? <span className="text-stone">: {selected.label}</span> : null}
        </legend>
        {product.sizeChart ? (
          <button
            type="button"
            onClick={() => dispatch(openSizeGuide(product.id))}
            className="text-sm underline underline-offset-4 hover:text-dye-deep"
          >
            Size guide
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
        {sizes.map((size) => {
          const isSelected = size.id === state.sizeId;
          return (
            <button
              key={size.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={size.available ? size.label : `${size.label}, sold out`}
              onClick={() => actions.selectSize(size.id)}
              className={`relative h-11 min-w-13 whitespace-nowrap rounded border px-3.5 text-sm font-medium tabular-nums transition-colors ${
                isSelected
                  ? "border-ink bg-ink text-chalk"
                  : size.available
                    ? "border-line bg-paper hover:border-ink"
                    : "border-dashed border-line bg-chalk text-stone line-through"
              }`}
            >
              {size.label}
            </button>
          );
        })}
      </div>
      {showPrompt ? (
        <p id="size-prompt" role="alert" className="mt-2 text-sm font-medium text-dye-deep">
          {ERROR_MESSAGES.variant.selectSize}
        </p>
      ) : null}
    </fieldset>
  );
}
