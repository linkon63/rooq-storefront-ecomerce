"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { LuTruck } from "react-icons/lu";
import type { DeliveryZone } from "@/lib/types";

/** Rates come from Admin → Settings → General; only the label lives here. */
export const DELIVERY_ZONES: { value: DeliveryZone; label: string; hint: string }[] = [
  { value: "inside", label: "Inside Dhaka", hint: "Within Dhaka city" },
  { value: "near_city", label: "Near Dhaka", hint: "Savar, Gazipur, Narayanganj and nearby" },
  { value: "outside", label: "Outside Dhaka", hint: "Anywhere else in Bangladesh" },
];

/**
 * The delivery area dropdown, shown identically on the cart and the checkout so
 * the charge a shopper sees in the cart is the one they confirm at checkout.
 * The zone is all the customer picks — the rate behind it is the shop's.
 */
export default function DeliveryZonePicker({
  value,
  onChange,
  rates,
  format,
}: {
  value: DeliveryZone;
  onChange: (zone: DeliveryZone) => void;
  rates: Record<DeliveryZone, number>;
  format: (amount: number) => string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click-away and Escape close the list, the way a select would.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = DELIVERY_ZONES.find((zone) => zone.value === value) ?? DELIVERY_ZONES[0];
  const priceOf = (zone: DeliveryZone) => (rates[zone] > 0 ? format(rates[zone]) : "Free");

  return (
    <div ref={containerRef} className="relative">
      <p className="font-gotham text-xs uppercase tracking-wider text-[#999999] mb-2 flex items-center gap-1.5">
        <LuTruck className="w-3.5 h-3.5" />
        Delivery Area
      </p>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-3 text-left transition-colors ${
          open ? "border-brand" : "border-zinc-300 hover:border-zinc-400"
        }`}
      >
        <span className="min-w-0">
          <span className="block font-gotham text-sm font-medium text-[#222222]">
            {selected.label}
          </span>
          <span className="block font-gotham text-[11px] text-zinc-500">{selected.hint}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="font-gotham text-sm font-semibold text-[#222222]">
            {priceOf(selected.value)}
          </span>
          <FiChevronDown
            size={16}
            className={`text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg"
        >
          {DELIVERY_ZONES.map((zone) => (
            <li key={zone.value}>
              <button
                type="button"
                role="option"
                aria-selected={value === zone.value}
                onClick={() => {
                  onChange(zone.value);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors ${
                  value === zone.value ? "bg-brand-mist" : "hover:bg-stone-50"
                }`}
              >
                <span className="min-w-0">
                  <span className="block font-gotham text-sm font-medium text-[#222222]">
                    {zone.label}
                  </span>
                  <span className="block font-gotham text-[11px] text-zinc-500">{zone.hint}</span>
                </span>
                <span className="shrink-0 font-gotham text-sm font-semibold text-[#222222]">
                  {priceOf(zone.value)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
