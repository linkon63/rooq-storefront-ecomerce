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
            className="mt-6 inline-block bg-[#4a9e2f] px-8 py-3 text-sm text-white transition-colors hover:bg-[#3d8626]"
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

      <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
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
                className="font-display text-lg text-[#1f2a17] transition-colors hover:text-[#4a9e2f] disabled:text-gray-300"
              >
                Add to Wishlist
              </button>
            </div>

            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.slug} className="flex gap-4 py-6">
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
                          className="text-sm font-semibold text-[#1f2a17] hover:text-[#4a9e2f]"
                        >
                          {item.name}
                        </Link>
                        {item.size && (
                          <p className="mt-1 text-xs text-gray-500">
                            <span className="font-medium text-[#1f2a17]">Size:</span> {item.size}
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
                          onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center text-gray-600 hover:text-[#4a9e2f]"
                        >
                          <FiPlus size={13} />
                        </button>
                        <span className="w-9 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            item.quantity > 1
                              ? updateQuantity(item.slug, item.quantity - 1)
                              : removeItem(item.slug)
                          }
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center text-gray-600 hover:text-[#4a9e2f]"
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
                          className="hover:text-[#4a9e2f]"
                        >
                          <FiHeart size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.slug)}
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
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("selectedCartSlugs", JSON.stringify(selectedKeys));
                  }
                  router.push("/checkout");
                }}
                disabled={!selectedItems.length}
                className="mt-6 w-full rounded-full bg-[#4a9e2f] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#3d8626] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Proceed To Checkout
              </button>
            }
          />
        </div>
      </div>
    </>
  );
}
