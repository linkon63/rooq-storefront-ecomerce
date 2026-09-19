"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiHeart, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";

import CheckoutSteps from "./CheckoutSteps";
import OrderSummary, { money } from "./OrderSummary";
import { useCart, getItemKey } from "@/app/_providers/cart-provider";
import { useWishlist } from "@/app/_providers/wishlist-provider";
import { cartTotals, isDiscounted, lineSaving, unitListPrice } from "@/lib/cart-pricing";
import { variantParts } from "@/lib/cart-variant";

export default function CartView() {
  const router = useRouter();
  const {
    items,
    selectedItems,
    selectedKeys,
    updateQuantity,
    removeItem,
    toggleSelectItem,
    selectAllItems,
  } = useCart();
  const { toggleWishlist } = useWishlist();

  const [discount, setDiscount] = useState(0);

  const isSelected = (item: Parameters<typeof getItemKey>[0]) =>
    selectedKeys.includes(getItemKey(item));

  const allSelected = items.length > 0 && selectedKeys.length === items.length;

  const toggleAll = () => selectAllItems(!allSelected);

  // Only the ticked lines are being bought, so only they are priced.
  const totals = useMemo(() => cartTotals(selectedItems), [selectedItems]);

  const proceedToCheckout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("selectedCartSlugs", JSON.stringify(selectedKeys));
    }
    router.push("/checkout");
  };

  const applyCoupon = (code: string) => {
    // Coupon validation lives on the backend; until it is wired up the two
    // seeded codes are honoured locally so the flow can be exercised.
    const codes: Record<string, number> = { ORGANIC10: totals.subtotal * 0.1, FRESH100: 100 };
    const value = codes[code.toUpperCase()];
    if (!value) {
      toast.error("That coupon code is not valid");
      return;
    }
    setDiscount(Math.round(value));
    toast.success(`Coupon ${code.toUpperCase()} applied`);
  };

  const moveSelectedToWishlist = () => {
    for (const item of selectedItems) {
      toggleWishlist({
        id: item.productId ?? item.slug,
        name: item.name,
        slug: item.slug,
        price: item.price,
        image: item.image,
      } as Parameters<typeof toggleWishlist>[0]);
    }
    toast.success("Moved to wishlist");
  };

  if (!items.length) {
    return (
      <>
        <CheckoutSteps current="cart" />
        <div className="py-24 text-center">
          <h1 className="font-display text-2xl font-semibold text-[#1f2a17]">Your cart is empty</h1>
          <p className="mt-2 text-sm text-gray-500">
            Browse the shop and add something wholesome.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block bg-brand px-8 py-3 text-sm text-white transition-colors hover:bg-brand-dark"
          >
            Continue Shopping
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <CheckoutSteps current="cart" />

      {/* Extra bottom padding on phones clears the docked checkout bar. */}
      <div className="mx-auto max-w-[1400px] px-4 py-12 pb-32 md:px-8 md:pb-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
          {/* ── Items ─────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-5 w-5 accent-[#1f2a17]"
                />
                <span className="font-display text-lg text-[#1f2a17]">
                  Select {selectedKeys.length}/{items.length}
                </span>
              </label>

              <button
                type="button"
                onClick={moveSelectedToWishlist}
                disabled={!selectedItems.length}
                className="font-display text-lg text-[#1f2a17] transition-colors hover:text-brand disabled:text-gray-300"
              >
                Add to Wishlist
              </button>
            </div>

            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={getItemKey(item)} className="flex gap-4 py-6">
                  <input
                    type="checkbox"
                    checked={isSelected(item)}
                    onChange={() => toggleSelectItem(getItemKey(item))}
                    aria-label={`Select ${item.name}`}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#1f2a17]"
                  />

                  <Link
                    href={item.productId ? `/product/${item.productId}` : "/shop"}
                    className="relative h-24 w-24 shrink-0 overflow-hidden bg-gray-50"
                  >
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link
                          href={item.productId ? `/product/${item.productId}` : "/shop"}
                          className="text-sm font-semibold text-[#1f2a17] hover:text-brand"
                        >
                          {item.name}
                        </Link>
                        {/* The variant picked — "Weight: 500 g" — as small tags. */}
                        {variantParts(item).length > 0 && (
                          <p className="mt-1.5 flex flex-wrap gap-1.5">
                            {variantParts(item).map(({ label, value }) => (
                              <span
                                key={label}
                                className="rounded-full bg-brand-mist px-2.5 py-0.5 text-[11px] text-gray-600"
                              >
                                {label}: <span className="font-semibold text-brand">{value}</span>
                              </span>
                            ))}
                          </p>
                        )}
                        <p className="mt-1 flex flex-wrap items-baseline gap-1.5 text-xs">
                          {isDiscounted(item) && (
                            <span className="text-gray-400 line-through">
                              {money(unitListPrice(item))}
                            </span>
                          )}
                          <span className="font-semibold text-[#1f2a17]">{money(item.price)}</span>
                          <span className="text-gray-400">each</span>
                        </p>
                      </div>

                      <div className="flex items-center border border-gray-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(getItemKey(item), item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center text-gray-600 hover:text-brand"
                        >
                          <FiPlus size={13} />
                        </button>
                        <span className="w-9 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            item.quantity > 1
                              ? updateQuantity(getItemKey(item), item.quantity - 1)
                              : removeItem(getItemKey(item))
                          }
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center text-gray-600 hover:text-brand"
                        >
                          <FiMinus size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="flex items-center gap-3 text-gray-400">
                        <button
                          type="button"
                          onClick={() =>
                            toggleWishlist({
                              id: item.productId ?? item.slug,
                              name: item.name,
                              slug: item.slug,
                              price: item.price,
                              image: item.image,
                            } as Parameters<typeof toggleWishlist>[0])
                          }
                          aria-label={`Save ${item.name} for later`}
                          className="hover:text-brand"
                        >
                          <FiHeart size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(getItemKey(item))}
                          aria-label={`Remove ${item.name}`}
                          className="hover:text-red-500"
                        >
                          <FiTrash2 size={17} />
                        </button>
                      </div>

                      <div className="text-right">
                        {isDiscounted(item) && (
                          <span className="mr-2 font-display text-sm text-gray-400 line-through">
                            {money(unitListPrice(item) * item.quantity)}
                          </span>
                        )}
                        <span className="font-display text-lg font-semibold text-[#1f2a17]">
                          {money(item.price * item.quantity)}
                        </span>
                        {isDiscounted(item) && (
                          <span className="mt-0.5 block text-xs font-semibold text-[#2f7d1f]">
                            You save {money(lineSaving(item))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Summary ───────────────────────────────────────────────── */}
          <OrderSummary
            subtotal={totals.listSubtotal}
            itemCount={totals.itemCount}
            productDiscount={totals.productDiscount}
            discount={discount}
            onApplyCoupon={applyCoupon}
            action={
              // Phones get this button in the bar docked to the bottom instead.
              <div className="relative mt-6 hidden md:block">
                {selectedItems.length > 0 && <PulseRings />}
                <button
                  type="button"
                  onClick={proceedToCheckout}
                  disabled={!selectedItems.length}
                  className="relative w-full rounded-full bg-brand py-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Proceed To Checkout
                </button>
              </div>
            }
          />
        </div>
      </div>

      {/* ── Docked checkout bar (phones) ─────────────────────────────────
          Stays on screen however long the cart is. The price is before
          delivery — the charge is settled at checkout. The safe-area inset
          keeps the button clear of the iOS home bar. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-gray-200 bg-white px-4 py-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] md:hidden">
        <div className="min-w-0">
          <p className="text-[11px] text-gray-500">
            {totals.itemCount} item{totals.itemCount === 1 ? "" : "s"} · excl. delivery
          </p>
          <p className="font-display text-[18px] font-bold leading-tight text-[#1f2a17]">
            {money(Math.max(0, totals.listSubtotal - totals.productDiscount - discount))}
          </p>
        </div>
        <div className="relative flex-1">
          {selectedItems.length > 0 && <PulseRings />}
          <button
            type="button"
            onClick={proceedToCheckout}
            disabled={!selectedItems.length}
            className="relative h-12 w-full rounded-full bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Proceed To Checkout
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * The checkout nudge shared with Place Order: two soft rings pulse out from
 * behind the button, staggered so the beat never pauses. Hidden for anyone
 * who has asked for reduced motion.
 */
function PulseRings() {
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-brand animate-cta-pulse motion-reduce:hidden" />
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-brand animate-cta-pulse [animation-delay:0.9s] motion-reduce:hidden" />
    </>
  );
}
