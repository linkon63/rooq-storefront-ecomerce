"use client";

import { FiMinus, FiPlus } from "react-icons/fi";
import { CART_MAX_QUANTITY } from "@/lib/constants/storefront";

type Props = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label: string;
  disabled?: boolean;
};

export function QuantityStepper({ value, onChange, max = CART_MAX_QUANTITY, label, disabled = false }: Props) {
  return (
    <div className="inline-flex h-9 items-center rounded border border-line" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
        aria-label="Decrease quantity"
        className="grid size-9 place-items-center disabled:text-line"
      >
        <FiMinus aria-hidden className="size-3.5" />
      </button>
      <output aria-live="polite" className="min-w-7 text-center text-sm font-semibold tabular-nums">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className="grid size-9 place-items-center disabled:text-line"
      >
        <FiPlus aria-hidden className="size-3.5" />
      </button>
    </div>
  );
}
