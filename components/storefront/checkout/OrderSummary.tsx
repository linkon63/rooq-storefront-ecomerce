"use client";

import { useState } from "react";
import { FiChevronDown, FiRefreshCw, FiShield } from "react-icons/fi";

import { FALLBACK_DELIVERY_RATES, type DeliveryRates } from "@/lib/shop-contact";

export const money = (value: number) =>
  `৳${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export type DeliveryZone = {
  id: string;
  label: string;
  charge: number;
};

/** The three zones the shop charges for, priced from Admin → Settings. */
export function zonesFromRates(rates: DeliveryRates): DeliveryZone[] {
  return [
    { id: "inside", label: "Inside Dhaka", charge: rates.inside },
    { id: "near", label: "Near City", charge: rates.nearCity },
    { id: "outside", label: "Outside Of Dhaka", charge: rates.outside },
  ];
}

/** Stand-in prices until the settings row has been fetched. */
export const DEFAULT_ZONES: DeliveryZone[] = zonesFromRates(FALLBACK_DELIVERY_RATES);

/**
 * Coupons are switched off across the storefront for now — the admin coupon
 * screen is not live yet, so an Apply Coupon box that always failed was worse
 * than none. Flip this to bring the row (and the checkout discount line) back.
 */
export const COUPONS_ENABLED = false;

const PAYMENT_MARKS = ["AMEX", "bKash", "Nagad", "Rocket", "Mastercard", "VISA", "SureCash", "Upay"];

/**
 * Right-hand money panel shared by the cart and checkout pages: subtotal,
 * coupon, delivery zone, total and the assurance strip beneath it.
 */
export default function OrderSummary({
  subtotal,
  itemCount,
  zone,
  zones = DEFAULT_ZONES,
  onZoneChange,
  discount = 0,
  onApplyCoupon,
  action,
  showPaymentMarks = false,
  children,
}: {
  subtotal: number;
  itemCount?: number;
  zone: DeliveryZone;
  zones?: DeliveryZone[];
  onZoneChange: (zone: DeliveryZone) => void;
  discount?: number;
  onApplyCoupon?: (code: string) => void;
  action?: React.ReactNode;
  showPaymentMarks?: boolean;
  children?: React.ReactNode;
}) {
  const [couponOpen, setCouponOpen] = useState(false);
  const [code, setCode] = useState("");
  const [zoneOpen, setZoneOpen] = useState(false);

  const total = Math.max(0, subtotal - discount) + zone.charge;

  return (
    <aside className="lg:sticky lg:top-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="font-display text-xl font-semibold text-[#1f2a17]">Summary</h2>
        {itemCount !== undefined && (
          <span className="text-sm text-gray-500">{itemCount} Items</span>
        )}
      </div>

      <dl className="divide-y divide-gray-100 text-sm">
        <div className="flex items-center justify-between py-4">
          <dt className="font-semibold text-[#1f2a17]">Subtotal</dt>
          <dd className="font-display font-semibold text-[#1f2a17]">{money(subtotal)}</dd>
        </div>

        {COUPONS_ENABLED && (
        <div className="py-4">
          <div className="flex items-center justify-between">
            <dt className="font-semibold text-[#1f2a17]">Coupon Discount</dt>
            <dd>
              {discount > 0 ? (
                <span className="font-display font-semibold text-[#4a9e2f]">−{money(discount)}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setCouponOpen((open) => !open)}
                  className="text-sm font-medium text-[#1f2a17] underline hover:text-[#4a9e2f]"
                >
                  Apply Coupon
                </button>
              )}
            </dd>
          </div>

          {couponOpen && discount === 0 && (
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                onApplyCoupon?.(code.trim());
              }}
            >
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Coupon code"
                aria-label="Coupon code"
                className="h-10 flex-1 border border-gray-200 px-3 text-sm outline-none focus:border-[#4a9e2f]"
              />
              <button
                type="submit"
                className="h-10 bg-[#1f2a17] px-4 text-sm text-white transition-colors hover:bg-black"
              >
                Apply
              </button>
            </form>
          )}
        </div>
        )}

        {/* Delivery zone — charges come from Admin → Settings. */}
        <div className="relative py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setZoneOpen((open) => !open)}
              aria-expanded={zoneOpen}
              className="flex items-center gap-1.5 font-semibold text-[#1f2a17]"
            >
              {zone.label}
              <FiChevronDown size={15} className={zoneOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
            <span className="font-display font-semibold text-[#1f2a17]">{money(zone.charge)}</span>
          </div>

          {zoneOpen && (
            <ul className="absolute z-10 mt-2 w-56 border border-gray-200 bg-white shadow-lg">
              {zones.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onZoneChange(option);
                      setZoneOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-[#f4f7ee]"
                  >
                    <span>{option.label}</span>
                    <span className="text-gray-500">{money(option.charge)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-dashed border-gray-300 py-4">
          <dt className="font-display text-lg font-semibold text-[#1f2a17]">Total Cost</dt>
          <dd className="font-display text-lg font-semibold text-[#1f2a17]">{money(total)}</dd>
        </div>
      </dl>

      {children}
      {action}

      {showPaymentMarks && (
        <div className="mt-6 border-b border-dashed border-gray-200 pb-6">
          <p className="mb-3 text-sm font-semibold text-[#1f2a17]">We Using Safe Payment For</p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_MARKS.map((mark) => (
              <span
                key={mark}
                className="flex h-6 items-center border border-gray-200 px-2 text-[10px] font-semibold text-gray-500"
              >
                {mark}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4 text-sm">
        <div className="flex gap-3">
          <FiRefreshCw className="mt-0.5 shrink-0 text-gray-500" size={16} />
          <div>
            <p className="font-semibold text-[#1f2a17]">Return &amp; Refund Policy:</p>
            <p className="text-gray-500">Within 45 Days of Purchase</p>
          </div>
        </div>
        <div className="flex gap-3">
          <FiShield className="mt-0.5 shrink-0 text-gray-500" size={16} />
          <div>
            <p className="font-semibold text-[#1f2a17]">Security &amp; Privacy</p>
            <p className="text-gray-500">
              We protect your privacy and keep your personal details safe and secure.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
