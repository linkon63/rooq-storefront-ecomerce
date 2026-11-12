"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useSession } from "@/hooks/use-session";
import { listAddresses } from "@/lib/address-api";
import { resolveDeliveryZone, ZONE_LABELS } from "@/utils/delivery-zone";
import { useAppSelector } from "@/lib/store/hooks";
import { selectCouponCode, selectCouponDiscount } from "@/lib/store/slices/cart-slice";
import type { SavedAddress, ShippingAddressInput } from "@/types/storefront/commerce";
import type { StoreSettings } from "@/types/storefront/content";
import { shippingFor } from "@/utils/storefront/cart";
import { EMPTY_ADDRESS } from "@/utils/storefront/forms";
import { CartSummary } from "../cart/cart-summary";
import { EmptyState } from "../shared/empty-state";
import { AddressFields } from "./address-fields";
import { CheckoutLines } from "./checkout-lines";
import { CouponField } from "./coupon-field";
import { NEW_ADDRESS, SavedAddressPicker } from "./saved-address-picker";
import { usePlaceOrder } from "./use-place-order";

/** One page: who and where, delivery (zone from the district), payment, review, place order. */
export function CheckoutView({ delivery }: { delivery: StoreSettings["delivery"] }) {
  const { lines, summary, hydrated } = useCart();
  const { isSignedIn, status, user, openAuth } = useSession();
  const couponCode = useAppSelector(selectCouponCode);
  const couponDiscount = useAppSelector(selectCouponDiscount);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId] = useState(NEW_ADDRESS);
  const [address, setAddress] = useState<ShippingAddressInput>(EMPTY_ADDRESS);
  const { submit, error, placing } = usePlaceOrder();

  useEffect(() => {
    if (!isSignedIn) return;
    listAddresses()
      .then((list) => {
        setAddresses(list);
        const preferred = list.find((entry) => entry.isDefault) ?? list[0];
        if (preferred) setSelectedId(preferred.id);
      })
      .catch(() => setAddresses([]));
    setAddress((current) => ({ ...current, fullName: current.fullName || user?.name || "", phone: current.phone || user?.phone || "" }));
  }, [isSignedIn, user?.name, user?.phone]);

  if (!hydrated || status === "unknown") {
    return <div className="h-96 animate-pulse rounded bg-selvedge" aria-busy="true" aria-label="Loading checkout" />;
  }
  if (lines.length === 0) {
    return <EmptyState title="Your bag is empty" body="Add something before checking out." action={{ label: "Shop new in", href: "/new" }} />;
  }

  const saved = addresses.find((entry) => entry.id === selectedId) ?? null;
  const target = saved ?? address;
  const zone = resolveDeliveryZone(target.city, target.state);
  const shipping = shippingFor(zone, summary.subtotal, delivery);
  const discount = couponCode ? Math.min(couponDiscount, summary.subtotal) : 0;
  const total = Math.max(0, summary.subtotal - discount) + shipping;
  const blocked = lines.some((line) => !line.inStock);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="flex flex-col gap-10">
        <section aria-labelledby="checkout-address" className="flex flex-col gap-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="checkout-address" className="font-wide text-xl font-bold">
              Delivery address
            </h2>
            {!isSignedIn ? (
              <button type="button" onClick={() => openAuth("login")} className="text-sm underline underline-offset-4">
                Have an account? Sign in
              </button>
            ) : null}
          </div>
          {isSignedIn && addresses.length ? <SavedAddressPicker addresses={addresses} selectedId={selectedId} onSelect={setSelectedId} /> : null}
          {!saved ? <AddressFields value={address} onChange={setAddress} withEmail={!isSignedIn} /> : null}
          <p className="text-sm text-stone">
            Delivery zone: <strong className="text-ink">{ZONE_LABELS[zone]}</strong>
          </p>
        </section>
        <section aria-labelledby="checkout-payment" className="flex flex-col gap-3">
          <h2 id="checkout-payment" className="font-wide text-xl font-bold">
            Payment
          </h2>
          <p className="rounded border border-ink bg-paper p-4 text-sm">
            <strong>Cash on delivery.</strong> Pay the rider when your parcel arrives. You can check the items at the door first.
          </p>
        </section>
        <section aria-labelledby="checkout-items">
          <h2 id="checkout-items" className="mb-3 font-wide text-xl font-bold">
            Your items
          </h2>
          <CheckoutLines lines={lines} />
        </section>
      </div>
      <div className="lg:sticky lg:top-20 lg:self-start">
        <CartSummary
          summary={summary}
          total={total}
          extraRows={[
            ...(discount > 0 ? [{ label: `Coupon ${couponCode}`, amount: -discount, tone: "saving" as const }] : []),
            { label: `Delivery (${ZONE_LABELS[zone]})`, amount: shipping },
          ]}
        >
          <CouponField subtotal={summary.subtotal} />
          {error ? (
            <p role="alert" className="text-sm font-medium text-dye-deep">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={placing || blocked}
            onClick={() => void submit({ lines, zone, couponCode, signedIn: isSignedIn, addressId: saved?.id ?? null, address })}
            className="h-12 rounded bg-ink text-sm font-semibold text-chalk hover:bg-ink-soft disabled:opacity-60"
          >
            {placing ? "Placing order…" : "Place order"}
          </button>
          <p className="text-xs text-stone">The final total is confirmed by our system when you place the order.</p>
        </CartSummary>
      </div>
    </div>
  );
}
