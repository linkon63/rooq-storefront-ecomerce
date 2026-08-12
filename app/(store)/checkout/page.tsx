"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/app/_providers/cart-provider";
import { useAuth } from "@/app/_providers/auth-provider";
import { useCurrency } from "@/lib/currency-context";
import { usePlaceOrder } from "@/app/_hooks/use-place-order";
import { LuLoader, LuArrowLeft, LuLock, LuTruck, LuPlus, LuFileText } from "react-icons/lu";
import type { AddressForm, DeliveryZone } from "@/lib/types";
import { fetchShopSettings, fetchShopPolicies, type ShopPolicy } from "@/lib/shop-api";
import { COUPONS_ENABLED } from "@/components/storefront/checkout/OrderSummary";
import { fetchMyAddresses, formatAddress, type CustomerAddress } from "@/lib/address-api";
import PolicyModal from "./_components/policy-modal";

/** Rates come from Admin → Settings → General; only the label lives here. */
const DELIVERY_ZONES: { value: DeliveryZone; label: string; hint: string }[] = [
  { value: "inside", label: "Inside Dhaka", hint: "Within Dhaka city" },
  { value: "near_city", label: "Near Dhaka", hint: "Savar, Gazipur, Narayanganj and nearby" },
  { value: "outside", label: "Outside Dhaka", hint: "Anywhere else in Bangladesh" },
];

/** Organishi ships within Bangladesh only, so the country is not a choice. */
const COUNTRY = "Bangladesh";

/** The two policies a shopper is asked to accept before paying. */
const CHECKOUT_POLICY_IDS = ["return", "refund"] as const;

const emptyAddress: AddressForm = {
  email: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: COUNTRY,
};

const INPUT_CLASS =
  "w-full p-3 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-300 font-gotham text-sm text-[#222222] placeholder:text-zinc-300 placeholder:text-xs placeholder:font-medium placeholder:font-['Gotham'] leading-4 focus:outline-stone-500";

export default function CheckoutPage() {
  const { items } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { formatCurrency } = useCurrency();
  const router = useRouter();
  const { placeOrder, submitting } = usePlaceOrder();

  const [address, setAddress] = useState<AddressForm>(() => ({
    ...emptyAddress,
    email: user?.email || "",
    fullName: user?.name || "",
  }));
  const [paymentMethod] = useState<"online" | "cod">("cod");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("inside");
  const [deliveryRates, setDeliveryRates] = useState<Record<DeliveryZone, number>>({
    inside: 0,
    near_city: 0,
    outside: 0,
  });

  // Saved addresses (signed-in shoppers only). `null` selection means the
  // shopper chose "use a different address" and is typing a new one.
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [enteringNewAddress, setEnteringNewAddress] = useState(false);

  const [policies, setPolicies] = useState<ShopPolicy[]>([]);
  const [openPolicy, setOpenPolicy] = useState<ShopPolicy | null>(null);

  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        email: user.email || prev.email,
        fullName: user.name || prev.fullName,
      }));
    }
  }, [user]);

  // The admin can change delivery rates at any time, so they are read on mount
  // rather than baked into the bundle.
  useEffect(() => {
    let active = true;
    fetchShopSettings().then((settings) => {
      if (!active || !settings) return;
      setDeliveryRates({
        inside: Number(settings.deliveryChargeInside ?? 0) || 0,
        near_city: Number(settings.deliveryChargeNearCity ?? 0) || 0,
        outside: Number(settings.deliveryChargeOutside ?? 0) || 0,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  // Return and refund policies are admin-written; the checkbox links open them.
  useEffect(() => {
    let active = true;
    fetchShopPolicies().then((all) => {
      if (active) setPolicies(all);
    });
    return () => {
      active = false;
    };
  }, []);

  // Saved addresses: the default one is preselected so a returning customer can
  // place an order without retyping anything.
  useEffect(() => {
    if (!isAuthenticated) {
      setSavedAddresses([]);
      setSelectedAddressId(null);
      return;
    }
    let active = true;
    fetchMyAddresses()
      .then((list) => {
        if (!active) return;
        setSavedAddresses(list);
        setSelectedAddressId(list[0]?.id ?? null);
        setEnteringNewAddress(list.length === 0);
      })
      .catch(() => {
        if (active) setEnteringNewAddress(true);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const checkoutPolicies = CHECKOUT_POLICY_IDS.map((id) =>
    policies.find((policy) => policy.id === id),
  ).filter((policy): policy is ShopPolicy => Boolean(policy));

  const selectedAddress = savedAddresses.find((entry) => entry.id === selectedAddressId) ?? null;
  const usingSavedAddress = Boolean(selectedAddress) && !enteringNewAddress;

  const shipping = deliveryRates[deliveryZone];
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + shipping;

  function startNewAddress() {
    setEnteringNewAddress(true);
    setSelectedAddressId(null);
    setAddress({
      ...emptyAddress,
      email: user?.email || "",
      fullName: user?.name || "",
    });
  }

  function useSavedAddresses() {
    setEnteringNewAddress(false);
    setSelectedAddressId(savedAddresses[0]?.id ?? null);
  }

  async function handlePlaceOrder(e: FormEvent) {
    e.preventDefault();
    if (!agreeToTerms) {
      toast.error("Please agree to the terms, return and refund policies.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty. Please add items before placing an order.");
      return;
    }

    // A picked saved address still travels as a form payload — the confirmation
    // page and the invoice print from it.
    const payload: AddressForm = usingSavedAddress && selectedAddress
      ? {
          email: user?.email ?? address.email,
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2 ?? "",
          city: selectedAddress.city,
          state: selectedAddress.state,
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country || COUNTRY,
        }
      : { ...address, country: COUNTRY };

    try {
      const result = await placeOrder(payload, {
        paymentMethod,
        deliveryZone,
        addressId: usingSavedAddress ? selectedAddress?.id : undefined,
      });
      sessionStorage.setItem("orderResult", JSON.stringify(result));
      router.push("/confirmation");
    } catch {
      // error toast handled inside the hook
    }
  }

  return (
    <main className="flex-grow bg-white w-full min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-5 py-8 sm:py-12">
        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_384px] gap-8 lg:gap-16">
            {/* ── Left Column: Billing Details ── */}
            <div>
              {/* Back Arrow & Title */}
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <Link href="/cart" className="text-[#4A4A4A] hover:text-stone-600 transition-colors">
                  <LuArrowLeft className="w-5 sm:w-6 h-5 sm:h-6" />
                </Link>
                <h1 className="font-bembo text-3xl sm:text-4xl leading-9 sm:leading-10 text-[#4A4A4A] font-normal">
                  Delivery Details
                </h1>
              </div>

              {/* ── Saved addresses ── */}
              {isAuthenticated && savedAddresses.length > 0 && !enteringNewAddress && (
                <div className="mb-5 space-y-3">
                  <p className="font-gotham text-xs uppercase tracking-wider text-[#999999]">
                    Deliver to
                  </p>
                  {savedAddresses.map((entry) => (
                    <label
                      key={entry.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors ${
                        selectedAddressId === entry.id
                          ? "border-[#4a9e2f] bg-[#f4f7ee]/40"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        value={entry.id}
                        checked={selectedAddressId === entry.id}
                        onChange={() => setSelectedAddressId(entry.id)}
                        className="sr-only"
                      />
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          selectedAddressId === entry.id ? "border-[#4a9e2f]" : "border-zinc-300"
                        }`}
                      >
                        {selectedAddressId === entry.id && (
                          <span className="h-2 w-2 rounded-full bg-[#4a9e2f]" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-gotham text-sm font-semibold text-[#222222]">
                            {entry.fullName}
                          </span>
                          {entry.isDefault && (
                            <span className="rounded bg-[#4a9e2f]/10 px-1.5 py-0.5 font-gotham text-[10px] font-bold uppercase tracking-wide text-[#4a9e2f]">
                              Default
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block font-gotham text-xs text-zinc-500">
                          {entry.phone}
                        </span>
                        <span className="mt-1 block font-gotham text-xs leading-relaxed text-zinc-600">
                          {formatAddress(entry)}
                        </span>
                      </span>
                    </label>
                  ))}

                  <button
                    type="button"
                    onClick={startNewAddress}
                    className="inline-flex cursor-pointer items-center gap-2 font-gotham text-xs font-bold uppercase tracking-wider text-[#4a9e2f] hover:underline"
                  >
                    <LuPlus className="h-4 w-4" />
                    Use a different address
                  </button>
                </div>
              )}

              {/* ── New / guest address form ── */}
              {(!isAuthenticated || enteringNewAddress || savedAddresses.length === 0) && (
                <div className="border border-dashed border-zinc-300 p-4 rounded-sm space-y-5">
                  {isAuthenticated && savedAddresses.length > 0 && (
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-gotham text-xs uppercase tracking-wider text-[#999999]">
                        New delivery address
                      </p>
                      <button
                        type="button"
                        onClick={useSavedAddresses}
                        className="cursor-pointer font-gotham text-xs font-bold uppercase tracking-wider text-[#4a9e2f] hover:underline"
                      >
                        Use a saved address
                      </button>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                        Full Name *
                      </label>
                      <input
                        required
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        placeholder="Enter full name"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                        Email *
                      </label>
                      <input
                        required
                        type="email"
                        value={address.email}
                        onChange={(e) => setAddress({ ...address, email: e.target.value })}
                        placeholder="Enter email address"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                        Phone *
                      </label>
                      <input
                        required
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="01XXXXXXXXX"
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

                  {/* District, City, Area Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                        District *
                      </label>
                      <input
                        required
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        placeholder="e.g. Dhaka"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                        City *
                      </label>
                      <input
                        required
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="Enter city name"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                        Area / Post Code *
                      </label>
                      <input
                        required
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        placeholder="e.g. Uttara / 1230"
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

                  {/* Full Address */}
                  <div>
                    <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                      Full Address *
                    </label>
                    <input
                      required
                      value={address.addressLine1}
                      onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                      placeholder="House, road, block — where the rider should hand it over"
                      className={INPUT_CLASS}
                    />
                  </div>

                  {/* Country — Organishi delivers inside Bangladesh only */}
                  <div>
                    <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                      Country
                    </label>
                    <div className="w-full rounded-md bg-stone-50 p-3 font-gotham text-sm text-[#555555] outline outline-1 outline-offset-[-1px] outline-zinc-200">
                      {COUNTRY}
                    </div>
                    <p className="mt-1 font-gotham text-[11px] text-zinc-500">
                      We currently deliver within Bangladesh only.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column: Summary & Payment ── */}
            <div className="w-full lg:w-96">
              <h2 className="font-bembo text-3xl sm:text-4xl text-[#4A4A4A] font-normal mb-4">
                Summary
              </h2>

              {/* Product Items List */}
              {items.length > 0 && (
                <div className="mb-6 border border-zinc-200 rounded-lg p-3 bg-stone-50/50 space-y-3 max-h-64 overflow-y-auto">
                  <p className="font-gotham text-xs uppercase tracking-wider text-[#999999] font-semibold border-b border-zinc-200 pb-2">
                    Items in Order ({items.reduce((acc, i) => acc + i.quantity, 0)})
                  </p>
                  {items.map((item) => (
                    <div key={item.slug ?? item.productId} className="flex items-center gap-3 py-1.5 border-b border-zinc-100 last:border-b-0">
                      <div className="relative w-12 h-12 shrink-0 rounded bg-white overflow-hidden border border-zinc-200">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[9px] text-stone-400">No img</div>
                        )}
                        <span className="absolute top-0 right-0 bg-[#4a9e2f] text-white text-[9px] font-bold w-4 h-4 rounded-bl flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-gotham text-xs font-semibold text-[#222222] truncate">{item.name}</p>
                        <p className="font-gotham text-[11px] text-zinc-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                      </div>
                      <div className="font-gotham text-xs font-bold text-[#222222] shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Delivery Area — decides the charge added below */}
              <div className="mb-6 border border-zinc-200 rounded-lg p-3">
                <p className="font-gotham text-xs uppercase tracking-wider text-[#999999] mb-3 flex items-center gap-1.5">
                  <LuTruck className="w-3.5 h-3.5" />
                  Delivery Area
                </p>
                <div className="space-y-2">
                  {DELIVERY_ZONES.map((zone) => (
                    <label
                      key={zone.value}
                      className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                        deliveryZone === zone.value
                          ? "border-[#4a9e2f] bg-[#f4f7ee]/40"
                          : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryZone"
                        value={zone.value}
                        checked={deliveryZone === zone.value}
                        onChange={() => setDeliveryZone(zone.value)}
                        className="sr-only"
                      />
                      <span
                        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          deliveryZone === zone.value ? "border-[#4a9e2f]" : "border-zinc-300"
                        }`}
                      >
                        {deliveryZone === zone.value && (
                          <span className="w-2 h-2 rounded-full bg-[#4a9e2f]" />
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-gotham text-sm font-medium text-[#222222]">
                          {zone.label}
                        </span>
                        <span className="block font-gotham text-[11px] text-zinc-500">{zone.hint}</span>
                      </span>
                      <span className="font-gotham text-sm font-semibold text-[#222222] shrink-0">
                        {deliveryRates[zone.value] > 0 ? formatCurrency(deliveryRates[zone.value]) : "Free"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pricing Rows */}
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="font-bembo text-base text-[#555555]">Subtotal</span>
                  <span className="font-gotham text-base font-medium text-[#222222]">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="h-px bg-zinc-200" />
                <div className="flex justify-between items-center">
                  <span className="font-bembo text-base text-[#555555]">Delivery Charge</span>
                  <span className="font-gotham text-base font-medium text-[#222222]">
                    {shipping > 0 ? formatCurrency(shipping) : "Free"}
                  </span>
                </div>
                {COUPONS_ENABLED && (
                  <>
                    <div className="h-px bg-zinc-200" />
                    <div className="flex justify-between items-center">
                      <span className="font-bembo text-base text-[#555555]">Promo Code Discount</span>
                      <span className="font-gotham text-base font-medium text-[#222222]">--</span>
                    </div>
                  </>
                )}
                <div className="border-t border-dashed border-zinc-200/80" />
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-4">
                <span className="font-bembo text-3xl sm:text-4xl text-[#4A4A4A] font-normal">Total</span>
                <span className="font-bembo text-3xl sm:text-4xl text-[#4A4A4A] font-normal">
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="border-b border-solid border-zinc-300 mb-6" />

              {/* Payment Method */}
              <div className="mb-6">
                <p className="font-gotham text-xs uppercase tracking-wider text-[#999999] mb-1">
                  Payment Method
                </p>
                <p className="font-gotham text-sm text-[#555555] mb-4">
                  Pay securely with cash upon delivery.
                </p>

                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <label className="flex items-start gap-3 p-4 border rounded-md cursor-pointer transition-colors border-[#4a9e2f] bg-[#f4f7ee]/30">
                    <div className="mt-0.5 shrink-0">
                      <div className="w-5 h-5 rounded-full bg-[#4a9e2f] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={true}
                      readOnly
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="font-gotham text-base font-medium text-[#222222]">Cash on delivery</p>
                      <p className="font-gotham text-xs text-[#777777] mt-0.5">Pay with cash when your package arrives.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="border-b border-solid border-zinc-300 mb-6" />

              {/* Return & refund policies — written by the shop, read here */}
              {checkoutPolicies.length > 0 && (
                <div className="mb-6 rounded-md border border-zinc-200 bg-stone-50/60 p-4">
                  <p className="font-gotham text-xs uppercase tracking-wider text-[#999999] mb-2 flex items-center gap-1.5">
                    <LuFileText className="w-3.5 h-3.5" />
                    Before you order
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {checkoutPolicies.map((policy) => (
                      <button
                        key={policy.id}
                        type="button"
                        onClick={() => setOpenPolicy(policy)}
                        className="cursor-pointer font-gotham text-sm font-semibold text-[#4a9e2f] underline underline-offset-2 hover:text-[#3d8626]"
                      >
                        Read {policy.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 mb-6">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor="terms"
                    className="w-5 h-5 border border-zinc-400 rounded cursor-pointer flex items-center justify-center peer-checked:bg-[#4a9e2f] peer-checked:border-[#4a9e2f] transition-colors"
                  >
                    {agreeToTerms && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </label>
                </div>
                <label htmlFor="terms" className="font-gotham text-sm text-[#222222] cursor-pointer select-none">
                  I have read and agree to the terms, return and refund policies
                  <span className="text-[#4a9e2f]"> *</span>
                </label>
              </div>

              <div className="border-t border-dashed border-zinc-200/80 mb-6" />

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={submitting || !agreeToTerms}
                className="w-full py-4 bg-[#4a9e2f] text-white font-gotham text-base font-bold uppercase tracking-wider rounded-full hover:bg-[#3d8626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {submitting && <LuLoader className="w-5 h-5 animate-spin" />}
                {submitting ? "PLACING ORDER..." : "PLACE ORDER"}
              </button>

              {/* Security & Privacy Footer */}
              <div className="flex items-start gap-3 mt-6">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <LuLock className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-gotham text-sm font-medium text-[#222222]">Security & Privacy</p>
                  <p className="font-bembo text-xs text-[#888888] mt-0.5">
                    We protect your privacy and keep your personal details safe and secure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <PolicyModal policy={openPolicy} onClose={() => setOpenPolicy(null)} />
    </main>
  );
}
