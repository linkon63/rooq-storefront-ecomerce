"use client";

import { useEffect, useState } from "react";
import { FiRefreshCw, FiShield } from "react-icons/fi";

import DeliveryZonePicker from "./DeliveryZonePicker";
import PolicyModal from "@/components/storefront/shared/policy-modal";
import { useDeliveryZone } from "@/app/_hooks/use-delivery-zone";
import { fetchShopPolicies, type ShopPolicy } from "@/lib/shop-api";

export const money = (value: number) =>
  `৳${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/**
 * Coupons are switched off across the storefront for now — the admin coupon
 * screen is not live yet, so an Apply Coupon box that always failed was worse
 * than none. Flip this to bring the row (and the checkout discount line) back.
 */
export const COUPONS_ENABLED = false;

/** The policies the cart offers to read, in the order they are shown. */
const CART_POLICY_IDS = ["return", "refund"] as const;

/**
 * Right-hand money panel on the cart: subtotal, total and the assurance strip.
 * The delivery charge is deliberately not decided here — the zone is picked at
 * checkout, where the address that determines it is being entered.
 */
export default function OrderSummary({
  subtotal,
  itemCount,
  discount = 0,
  onApplyCoupon,
  action,
  children,
}: {
  subtotal: number;
  itemCount?: number;
  discount?: number;
  onApplyCoupon?: (code: string) => void;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const [couponOpen, setCouponOpen] = useState(false);
  const [code, setCode] = useState("");

  // The same zone the checkout will use — the choice carries over.
  const { zone, setZone, rates, charge } = useDeliveryZone();

  // Return and refund text is written by the shop in Admin → Settings → Policy.
  const [policies, setPolicies] = useState<ShopPolicy[]>([]);
  const [openPolicy, setOpenPolicy] = useState<ShopPolicy | null>(null);

  useEffect(() => {
    let active = true;
    fetchShopPolicies().then((all) => {
      if (active) setPolicies(all);
    });
    return () => {
      active = false;
    };
  }, []);

  const readablePolicies = CART_POLICY_IDS.map((id) =>
    policies.find((policy) => policy.id === id),
  ).filter((policy): policy is ShopPolicy => Boolean(policy));

  const total = Math.max(0, subtotal - discount) + charge;

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

        <div className="py-4">
          <DeliveryZonePicker value={zone} onChange={setZone} rates={rates} format={money} />
        </div>

        <div className="flex items-center justify-between py-4">
          <dt className="font-semibold text-[#1f2a17]">Delivery Charge</dt>
          <dd className="font-display font-semibold text-[#1f2a17]">
            {charge > 0 ? money(charge) : "Free"}
          </dd>
        </div>

        <div className="flex items-center justify-between border-t border-dashed border-gray-300 py-4">
          <dt className="font-display text-lg font-semibold text-[#1f2a17]">Total Cost</dt>
          <dd className="font-display text-lg font-semibold text-[#1f2a17]">{money(total)}</dd>
        </div>
      </dl>

      {children}
      {action}

      <div className="mt-6 space-y-4 text-sm">
        <div className="flex gap-3">
          <FiRefreshCw className="mt-0.5 shrink-0 text-gray-500" size={16} />
          <div>
            <p className="font-semibold text-[#1f2a17]">Return &amp; Refund Policy</p>
            {readablePolicies.length > 0 ? (
              <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1">
                {readablePolicies.map((policy) => (
                  <button
                    key={policy.id}
                    type="button"
                    onClick={() => setOpenPolicy(policy)}
                    className="cursor-pointer text-sm font-medium text-[#4a9e2f] underline underline-offset-2 hover:text-[#3d8626]"
                  >
                    Read {policy.title}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Contact us within 48 hours of delivery.</p>
            )}
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

      <PolicyModal policy={openPolicy} onClose={() => setOpenPolicy(null)} />
    </aside>
  );
}
