"use client";

import { useState, type FormEvent } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { selectCurrencySymbol } from "@/lib/store/slices/session-slice";

type Props = {
  bounds: { min: number; max: number };
  min: number | null;
  max: number | null;
  onApply: (range: { minPrice: number | null; maxPrice: number | null }) => void;
};

/** Min / max price inputs; applies on submit (Enter or the button) to avoid a request per keystroke. */
export function PriceFacet({ bounds, min, max, onApply }: Props) {
  const symbol = useAppSelector(selectCurrencySymbol);
  const [low, setLow] = useState(min?.toString() ?? "");
  const [high, setHigh] = useState(max?.toString() ?? "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parse = (value: string) => (value.trim() === "" ? null : Math.max(0, Number(value)) || null);
    onApply({ minPrice: parse(low), maxPrice: parse(high) });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label className="flex-1 text-xs text-stone">
          Min ({symbol})
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={String(Math.floor(bounds.min))}
            value={low}
            onChange={(event) => setLow(event.target.value)}
            className="mt-1 h-10 w-full rounded border border-line bg-paper px-2 text-base text-ink"
          />
        </label>
        <span aria-hidden className="pt-5 text-stone">
          –
        </span>
        <label className="flex-1 text-xs text-stone">
          Max ({symbol})
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={String(Math.ceil(bounds.max))}
            value={high}
            onChange={(event) => setHigh(event.target.value)}
            className="mt-1 h-10 w-full rounded border border-line bg-paper px-2 text-base text-ink"
          />
        </label>
      </div>
      <button type="submit" className="h-10 rounded border border-ink text-sm font-semibold hover:bg-ink hover:text-chalk">
        Apply price
      </button>
    </form>
  );
}
