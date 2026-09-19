"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useMemo, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getItemKey, useCart } from "@/app/_providers/cart-provider";
import { variantText } from "@/lib/cart-variant";
import { useAuth } from "@/app/_providers/auth-provider";
import { useCurrency } from "@/lib/currency-context";
import { usePlaceOrder } from "@/app/_hooks/use-place-order";
import { LuLoader, LuArrowLeft, LuLock, LuPlus, LuFileText, LuEye, LuMapPin, LuX, LuCircleCheck, LuPencil, LuTruck, LuCheck } from "react-icons/lu";
import type { AddressForm } from "@/lib/types";
import { fetchShopPolicies, type ShopPolicy } from "@/lib/shop-api";
import { COUPONS_ENABLED } from "@/components/storefront/checkout/OrderSummary";
import { cartTotals, isDiscounted, lineSaving, unitListPrice } from "@/lib/cart-pricing";
import { useDeliveryZone } from "@/app/_hooks/use-delivery-zone";
import {
  BANGLADESH_DISTRICTS,
  COUNTRY,
  DHAKA_AREAS,
  ZONE_LABELS,
  isDhakaDistrict,
  resolveDeliveryZone,
} from "@/lib/delivery-zone";
import { fetchMyAddresses, formatAddress, updateAddress, type CustomerAddress } from "@/lib/address-api";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/utils";
import PolicyModal from "@/components/storefront/shared/policy-modal";

/** The two policies a shopper is asked to accept before paying. */
const CHECKOUT_POLICY_IDS = ["return", "refund"] as const;

const emptyAddress: AddressForm = {
  email: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "Dhaka",
  postalCode: "",
  country: COUNTRY,
};

const INPUT_CLASS =
  "w-full p-3 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-300 font-gotham text-sm text-[#222222] placeholder:text-zinc-300 placeholder:text-xs placeholder:font-medium placeholder:font-['Gotham'] leading-4 focus:outline-stone-500";

export default function CheckoutPage() {
  const { items, selectedItems, selectedKeys, toggleSelectItem, setSelectedKeys } = useCart();

  // Below lg the whole cart is listed with checkboxes, so it arrives with every
  // line ticked — once, when the cart first has lines — and the shopper unticks
  // what they skip. Desktop keeps whatever the cart page or Buy Now selected.
  const autoSelected = useRef(false);
  useEffect(() => {
    if (autoSelected.current || items.length === 0) return;
    autoSelected.current = true;
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setSelectedKeys(items.map(getItemKey));
    }
  }, [items, setSelectedKeys]);
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
  // Ticked by default; unticking it disables Place Order until it is ticked again.
  const [agreeToTerms, setAgreeToTerms] = useState(true);
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Zone and rates are shared with the cart, so whatever was picked there is
  // still selected — and priced the same — here.
  const {
    zone: deliveryZone,
    setZone: setDeliveryZone,
    rates: deliveryRates,
    charge: zoneCharge,
  } = useDeliveryZone();

  // Guests pick Inside / Outside Dhaka themselves, and must: until they do, no
  // delivery charge is shown or added, and Place Order points them at the choice.
  const [guestZoneChosen, setGuestZoneChosen] = useState(false);
  const zoneUnset = !isAuthenticated && !guestZoneChosen;
  const shipping = zoneUnset ? 0 : zoneCharge;
  const shippingLabel = zoneUnset
    ? "Select area"
    : shipping > 0
      ? formatCurrency(shipping)
      : "Free";

  // Saved addresses (signed-in shoppers only). `null` selection means the
  // shopper chose "use a different address" and is typing a new one.
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [enteringNewAddress, setEnteringNewAddress] = useState(false);

  const [policies, setPolicies] = useState<ShopPolicy[]>([]);
  const [openPolicy, setOpenPolicy] = useState<ShopPolicy | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Edit Address Modal State & Handlers
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDistrict, setEditDistrict] = useState("Dhaka");
  const [editCity, setEditCity] = useState("");
  const [editPostalCode, setEditPostalCode] = useState("");
  const [editAddressLine1, setEditAddressLine1] = useState("");
  const [editIsDefault, setEditIsDefault] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  function handleOpenEditModal(entry: CustomerAddress) {
    setEditingAddress(entry);
    setEditFullName(entry.fullName);
    setEditPhone(entry.phone);
    setEditDistrict(entry.state || entry.city || "Dhaka");
    setEditCity(entry.city || "");
    setEditPostalCode(entry.postalCode || "");
    setEditAddressLine1(entry.addressLine1 || "");
    setEditIsDefault(entry.isDefault);
  }

  async function handleSaveEditedAddress(e: FormEvent) {
    e.preventDefault();
    if (!editingAddress) return;

    if (!editFullName.trim() || !editPhone.trim() || !editAddressLine1.trim()) {
      toast.error("Full Name, Phone, and Full Address are required.");
      return;
    }

    if (!editCity.trim()) {
      toast.error(
        isDhakaDistrict(editDistrict) ? "Please select your area in Dhaka." : "City is required.",
      );
      return;
    }

    if (!isValidBdPhone(editPhone.trim())) {
      toast.error("Please enter a valid Bangladeshi phone number (e.g. 017XXXXXXXX).");
      return;
    }

    setEditSaving(true);
    try {
      await updateAddress(editingAddress.id, {
        fullName: editFullName.trim(),
        phone: normalizeBdPhone(editPhone.trim()),
        state: editDistrict,
        city: editCity.trim(),
        postalCode: editPostalCode.trim(),
        addressLine1: editAddressLine1.trim(),
        country: COUNTRY,
        isDefault: editIsDefault,
      });

      toast.success("Address updated successfully!");
      setEditingAddress(null);

      // Refresh saved addresses from DB
      const refreshed = await fetchMyAddresses();
      setSavedAddresses(refreshed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update address.");
    } finally {
      setEditSaving(false);
    }
  }

  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        email: user.email || prev.email,
        fullName: user.name || prev.fullName,
      }));
    }
  }, [user]);

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

  // Signed-in shoppers: the delivery charge follows the address and nothing
  // else, so this is the only thing that sets their zone. The area counts too:
  // Savar and Keraniganj are Dhaka district but not Dhaka city, so they are
  // delivered at the Near Dhaka rate. Guests pick their zone in the form.
  useEffect(() => {
    if (!isAuthenticated) return;
    const [currentDistrict, currentArea] = usingSavedAddress && selectedAddress
      ? [selectedAddress.state || "", selectedAddress.city || ""]
      : [address.state || "", address.city || ""];

    if (currentDistrict || currentArea) {
      setDeliveryZone(resolveDeliveryZone(currentDistrict, currentArea));
    }
  }, [isAuthenticated, usingSavedAddress, selectedAddress, enteringNewAddress, address.state, address.city, setDeliveryZone]);

  const checkoutItems = selectedItems;

  // `listSubtotal` is what the items cost before offers, `subtotal` what they
  // cost after — the summary shows both so the saving is spelled out rather
  // than silently baked into one number.
  const { listSubtotal, subtotal, productDiscount } = cartTotals(checkoutItems);
  const total = subtotal + shipping;
  const savedPercent =
    listSubtotal > 0 && productDiscount > 0
      ? Math.round((productDiscount / listSubtotal) * 100)
      : 0;

  /**
   * Why the order cannot go through yet. The button stays clickable for missing
   * address fields so the browser can flag them itself; an unticked agreement
   * disables it outright. Either way the reason is spelled out under the bar.
   */
  const blockingReason =
    checkoutItems.length === 0
      ? "Your cart has no selected products — add a product before placing the order."
      : !agreeToTerms
        ? "Please tick the box to accept the terms, return and refund policies."
        : null;

  function handleDistrictChange(newDistrict: string) {
    setAddress((prev) => {
      // A Dhaka area is not a valid city for Barisal, and a typed city is not in
      // the Dhaka list — so the field starts empty whenever the kind changes.
      const kindChanged = isDhakaDistrict(prev.state) !== isDhakaDistrict(newDistrict);
      return { ...prev, state: newDistrict, city: kindChanged ? "" : prev.city };
    });
    // The zone is not set here: the effect above recomputes it from the address,
    // which keeps one rule for the saved-address and typed-address paths alike.
  }

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

  async function handlePlaceOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // The form is `noValidate`, so missing details are caught here: bring the
    // first empty field to the middle of the screen — clear of the sticky
    // header and the fixed order bar — put the cursor in it and name it.
    const firstInvalid = e.currentTarget.querySelector<HTMLInputElement | HTMLSelectElement>(
      "input:invalid, select:invalid, textarea:invalid",
    );
    if (firstInvalid) {
      setShowFieldErrors(true);
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalid.focus({ preventScroll: true });
      const label =
        firstInvalid.dataset.fieldLabel ??
        firstInvalid
        .closest("div")
        ?.querySelector("label")
        ?.textContent?.replace("*", "")
        .trim();
      const message = label ? `Please fill in your ${label}.` : "Please fill in your delivery details.";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    if (blockingReason) {
      setSubmitError(blockingReason);
      toast.error(blockingReason);
      return;
    }
    setSubmitError(null);

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
      : isAuthenticated
        ? { ...address, country: COUNTRY }
        : // Guests give name, phone and address only. The order still needs a
          // city and district, so they carry the area the guest picked —
          // otherwise the API would file an Outside Dhaka order under "Dhaka".
          {
            ...address,
            state: ZONE_LABELS[deliveryZone],
            city: ZONE_LABELS[deliveryZone],
            postalCode: "",
            country: COUNTRY,
          };

    try {
      const result = await placeOrder(payload, {
        paymentMethod,
        deliveryZone,
        addressId: usingSavedAddress ? selectedAddress?.id : undefined,
        selectedItems: checkoutItems,
      });
      sessionStorage.setItem("orderResult", JSON.stringify(result));
      router.push("/confirmation");
    } catch {
      // error toast handled inside the hook
    }
  }

  const activeName = usingSavedAddress && selectedAddress
    ? selectedAddress.fullName
    : address.fullName || user?.name || "Guest";

  const activePhone = usingSavedAddress && selectedAddress
    ? selectedAddress.phone
    : address.phone || "";

  const activeEmail = usingSavedAddress && selectedAddress
    ? (user?.email || address.email || "")
    : (address.email || user?.email || "");

  const activeDistrict = usingSavedAddress && selectedAddress
    ? (selectedAddress.state || selectedAddress.city || "Dhaka")
    : (address.state || address.city || "Dhaka");

  const activeArea = usingSavedAddress && selectedAddress
    ? (selectedAddress.city || "")
    : (address.city || "");

  // Naming just the district would be misleading for Savar or Keraniganj, where
  // the area is the reason the rate is what it is.
  const zoneSourceLabel =
    activeArea && activeArea !== activeDistrict
      ? `${activeArea}, ${activeDistrict}`
      : activeDistrict;

  const activeFullAddressFormatted = usingSavedAddress && selectedAddress
    ? formatAddress(selectedAddress)
    : isAuthenticated
      ? [address.addressLine1, address.city, address.state, COUNTRY].filter(Boolean).join(", ")
      : [address.addressLine1, COUNTRY].filter(Boolean).join(", ");

  /**
   * The order's lines. On desktop the summary column lists just the selected
   * lines, as before. Below lg the list sits at the top of the page and shows
   * the whole cart, each line with a checkbox: everything arrives ticked and
   * the shopper unticks what they want to leave out. The last ticked line
   * cannot be unticked — checkout always needs something to bill.
   */
  const renderItemsList = (selectable: boolean) => {
    const lines = selectable ? items : checkoutItems;
    if (lines.length === 0) return null;

    return (
      <div className="mb-6 border border-zinc-200 rounded-lg p-3 bg-stone-50/50 space-y-3 max-h-80 overflow-y-auto">
        <div className="flex items-baseline justify-between gap-3 border-b border-zinc-200 pb-2">
          <p className="font-gotham text-xs uppercase tracking-wider text-[#999999] font-semibold">
            Selected Items ({checkoutItems.reduce((acc, i) => acc + i.quantity, 0)})
          </p>
          {selectable && items.length > 1 && (
            <p className="font-gotham text-[11px] text-zinc-500">Untick to leave out</p>
          )}
        </div>
        {lines.map((item) => {
          const key = getItemKey(item);
          const checked = selectedKeys.includes(key);
          const locked = checked && selectedKeys.length === 1;

          const row = (
            <>
              {selectable && (
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                    checked ? "border-brand bg-brand text-white" : "border-zinc-300 bg-white"
                  } ${locked ? "opacity-60" : ""}`}
                >
                  {checked && <LuCheck className="h-3.5 w-3.5" />}
                </span>
              )}
              <span className="relative w-12 h-12 shrink-0 rounded bg-white overflow-hidden border border-zinc-200">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[9px] text-stone-400">No img</span>
                )}
                <span className="absolute top-0 right-0 bg-brand text-white text-[9px] font-bold w-4 h-4 rounded-bl flex items-center justify-center">
                  {item.quantity}
                </span>
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-gotham text-xs font-semibold text-[#222222] truncate">{item.name}</span>
                {variantText(item) && (
                  <span className="block font-gotham text-[11px] font-medium text-brand truncate">
                    {variantText(item)}
                  </span>
                )}
                <span className="block font-gotham text-[11px] text-zinc-500">
                  Qty: {item.quantity} ×{" "}
                  {isDiscounted(item) && (
                    <span className="text-zinc-400 line-through">{formatCurrency(unitListPrice(item))}</span>
                  )}{" "}
                  {formatCurrency(item.price)}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-gotham text-xs font-bold text-[#222222]">
                  {formatCurrency(item.price * item.quantity)}
                </span>
                {isDiscounted(item) && (
                  <span className="block font-gotham text-[10px] font-semibold text-[#2f7d1f]">
                    −{formatCurrency(lineSaving(item))}
                  </span>
                )}
              </span>
            </>
          );

          return selectable ? (
            <button
              key={key}
              type="button"
              role="checkbox"
              aria-checked={checked}
              aria-disabled={locked}
              onClick={() => !locked && toggleSelectItem(key)}
              className={`flex w-full items-center gap-3 py-1.5 border-b border-zinc-100 last:border-b-0 text-left transition-opacity ${
                checked ? "" : "opacity-50"
              }`}
            >
              {row}
            </button>
          ) : (
            <div key={key} className="flex items-center gap-3 py-1.5 border-b border-zinc-100 last:border-b-0">
              {row}
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Phones and tablets: the money side of the order squeezed into a few lines
   * under the item list in "Your Order", instead of the full summary column.
   */
  const compactSummary = (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 font-gotham text-[13px]">
      <div className="space-y-1.5">
        <div className="flex justify-between text-[#555555]">
          <span>Subtotal</span>
          <span className="font-medium text-[#222222]">{formatCurrency(listSubtotal)}</span>
        </div>
        {productDiscount > 0 && (
          <div className="flex justify-between text-[#555555]">
            <span>Product Discount</span>
            <span className="font-medium text-[#2f7d1f]">−{formatCurrency(productDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between gap-3 text-[#555555]">
          <span className="min-w-0 truncate">
            Delivery <span className="text-[11px] text-zinc-400">({ZONE_LABELS[deliveryZone]})</span>
          </span>
          <span className="shrink-0 font-medium text-[#222222]">
            {shippingLabel}
          </span>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-zinc-200 pt-2.5">
        <span className="text-[15px] font-bold text-[#222222]">Total</span>
        <span className="text-[16px] font-bold text-[#222222]">{formatCurrency(total)}</span>
      </div>
      {productDiscount > 0 && (
        <p className="mt-2 rounded bg-brand-mist px-2.5 py-1.5 text-[12px] font-semibold text-[#2f7d1f]">
          You save {formatCurrency(productDiscount)}
          {savedPercent > 0 && ` (${savedPercent}%)`}
        </p>
      )}
      <p className="mt-2 flex items-center gap-1.5 text-[12px] text-zinc-500">
        <LuCircleCheck className="h-3.5 w-3.5 text-brand" aria-hidden />
        Payment: <span className="font-semibold text-[#222222]">Cash on delivery</span>
      </p>
    </div>
  );

  return (
    // min-height, not a fixed height: at a fixed 70vh the site footer paints
    // over the tail of the summary column, hiding the terms checkbox.
    <main className="grow bg-white w-full min-h-[70vh]">
      {/* Bottom padding clears the fixed action bar. */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-5 py-8 sm:py-12 pb-48 sm:pb-40">
        {/* Empty required fields turn red once Place Order has been tried. */}
        <form
          onSubmit={handlePlaceOrder}
          onInput={() => submitError && setSubmitError(null)}
          noValidate
          className={
            showFieldErrors
              ? "[&_input:invalid]:outline-red-500 [&_input:invalid]:bg-red-50/40 [&_select:invalid]:outline-red-500 [&_select:invalid]:bg-red-50/40"
              : undefined
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_384px] gap-8 lg:gap-16 lg:items-start">
            {/* ── Left Column: Billing Details ── */}
            <div>
              {/* ── Your order (phones & tablets) — products before the form. ── */}
              <div className="mb-8 lg:hidden">
                <div className="flex items-center gap-3 mb-4">
                  <Link href="/cart" aria-label="Back to cart" className="text-[#4A4A4A] hover:text-stone-600 transition-colors">
                    <LuArrowLeft className="w-5 sm:w-6 h-5 sm:h-6" />
                  </Link>
                  <h2 className="font-bembo text-3xl sm:text-4xl leading-9 sm:leading-10 text-[#4A4A4A] font-normal">
                    Your Order
                  </h2>
                </div>
                {renderItemsList(true)}
                {compactSummary}
              </div>

              {/* Back Arrow & Title — the arrow moves up to "Your Order" below lg. */}
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <Link href="/cart" aria-label="Back to cart" className="hidden text-[#4A4A4A] hover:text-stone-600 transition-colors lg:block">
                  <LuArrowLeft className="w-5 sm:w-6 h-5 sm:h-6" />
                </Link>
                <h1 className="font-bembo text-3xl sm:text-4xl leading-9 sm:leading-10 text-[#4A4A4A] font-normal">
                  Delivery Details
                </h1>
              </div>

              {/* ── Active Delivery Address Preview & View Option ──
                  Hidden on phones: the form right below already shows the address. */}
              <div className="mb-6 rounded-xl border border-brand/30 bg-brand-mist/70 p-4 hidden md:flex flex-wrap items-center justify-between gap-3 shadow-xs font-gotham">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-full bg-brand/15 flex items-center justify-center text-brand shrink-0 mt-0.5">
                    <LuMapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-gotham text-xs font-bold uppercase tracking-wider text-stone-600">
                        Active Delivery Address
                      </span>
                      <span className="rounded bg-brand/15 px-2 py-0.5 font-gotham text-[10px] font-bold uppercase tracking-wide text-brand">
                        {zoneUnset
                          ? "Area not selected"
                          : `${ZONE_LABELS[deliveryZone]} (৳${deliveryRates[deliveryZone]})`}
                      </span>
                    </div>
                    <p className="font-gotham text-xs font-semibold text-[#222222] mt-1 truncate">
                      {activeName} {activePhone ? `• ${activePhone}` : ""}
                    </p>
                    <p className="font-gotham text-xs text-zinc-600 truncate mt-0.5">
                      {activeFullAddressFormatted || "Fill in your delivery address details below"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="inline-flex cursor-pointer items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-brand text-brand font-gotham text-xs font-bold hover:bg-brand hover:text-white transition-all shadow-xs shrink-0"
                >
                  <LuEye className="w-4 h-4" />
                  View Address Details
                </button>
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
                          ? "border-brand bg-brand-mist/40"
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
                          selectedAddressId === entry.id ? "border-brand" : "border-zinc-300"
                        }`}
                      >
                        {selectedAddressId === entry.id && (
                          <span className="h-2 w-2 rounded-full bg-brand" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-gotham text-sm font-semibold text-[#222222]">
                            {entry.fullName}
                          </span>
                          {entry.isDefault && (
                            <span className="rounded bg-brand/10 px-1.5 py-0.5 font-gotham text-[10px] font-bold uppercase tracking-wide text-brand">
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

                      {/* Right-side Edit Icon Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenEditModal(entry);
                        }}
                        className="p-2 rounded-lg text-stone-400 hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer shrink-0"
                        title="Edit Address"
                        aria-label="Edit Address"
                      >
                        <LuPencil className="w-4 h-4" />
                      </button>
                    </label>
                  ))}

                  <button
                    type="button"
                    onClick={startNewAddress}
                    className="inline-flex cursor-pointer items-center gap-2 font-gotham text-xs font-bold uppercase tracking-wider text-brand hover:underline"
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
                        className="cursor-pointer font-gotham text-xs font-bold uppercase tracking-wider text-brand hover:underline"
                      >
                        Use a saved address
                      </button>
                    </div>
                  )}

                  {/* User Info — name and phone required, email optional for everyone. */}
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
                    <div>
                      <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                        Email <span className="text-xs text-zinc-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        value={address.email}
                        onChange={(e) => setAddress({ ...address, email: e.target.value })}
                        placeholder="Enter email address"
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

                  {/* District, City, Area Row — signed-in shoppers only; it feeds
                      their address book and sets their delivery zone. */}
                  {isAuthenticated && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                        District *
                      </label>
                      <select
                        required
                        value={address.state || "Dhaka"}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className={`${INPUT_CLASS} bg-white cursor-pointer`}
                      >
                        {BANGLADESH_DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                        {isDhakaDistrict(address.state) ? "City / Area *" : "City *"}
                      </label>
                      {/* Inside Dhaka the area is picked from the known list; every
                          other district is typed, because there is no list to offer. */}
                      {isDhakaDistrict(address.state) ? (
                        <select
                          required
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className={`${INPUT_CLASS} bg-white cursor-pointer`}
                        >
                          <option value="">Select your area</option>
                          {DHAKA_AREAS.map((area) => (
                            <option key={area} value={area}>
                              {area}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          required
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          placeholder="Enter city name"
                          className={INPUT_CLASS}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block font-gotham text-sm font-medium text-[#222222] mb-1">
                        Area / Post Code <span className="text-xs text-zinc-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        placeholder="e.g. Uttara / 1230"
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                  )}

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

                  {/* Delivery area — guests choose it themselves. The radios are
                      real (visually hidden) inputs marked required, so Place
                      Order's empty-field check lands here too. */}
                  {!isAuthenticated && (
                    <fieldset>
                      <legend className="block font-gotham text-sm font-medium text-[#222222] mb-2">
                        Delivery Area *
                      </legend>
                      <div className="grid grid-cols-2 gap-3">
                        {(["inside", "outside"] as const).map((zone) => {
                          const active = guestZoneChosen && deliveryZone === zone;
                          return (
                            <label
                              key={zone}
                              className={`relative flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-3 py-3 text-center transition-colors ${
                                active
                                  ? "border-brand bg-brand-mist"
                                  : showFieldErrors && !guestZoneChosen
                                    ? "border-red-400 bg-red-50/40"
                                    : "border-zinc-200 bg-white hover:border-zinc-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="guestDeliveryZone"
                                value={zone}
                                required
                                data-field-label="Delivery Area (Inside or Outside Dhaka)"
                                checked={active}
                                onChange={() => {
                                  setDeliveryZone(zone);
                                  setGuestZoneChosen(true);
                                }}
                                className="sr-only"
                              />
                              <span className={`font-gotham text-sm font-semibold ${active ? "text-brand" : "text-[#222222]"}`}>
                                {ZONE_LABELS[zone]}
                              </span>
                              <span className="font-gotham text-xs text-zinc-500">
                                {deliveryRates[zone] > 0 ? formatCurrency(deliveryRates[zone]) : "Free"}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  )}

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

            {/* ── Right Column: Summary & Payment ──
                The total and Place Order live in the bar fixed to the bottom of
                the viewport, so this column is free to scroll with the page. */}
            <aside className="w-full lg:w-96">
              {/* Heading, delivery area, pricing and payment are desktop-only —
                  below lg the compact summary in "Your Order" covers them. */}
              <div className="hidden lg:block">
              <h2 className="font-bembo text-3xl sm:text-4xl text-[#4A4A4A] font-normal mb-4">
                Summary
              </h2>

              {/* Desktop keeps the item list in the summary; phones and tablets
                  see it at the top of the page instead. */}
              <div className="hidden lg:block">{renderItemsList(false)}</div>

              {/* Delivery Area — read-only. The rate follows the district chosen
                  above, so there is nothing here for the shopper to change. */}
              <div className="mb-6">
                <p className="font-gotham text-xs uppercase tracking-wider text-[#999999] mb-2 flex items-center gap-1.5">
                  <LuTruck className="w-3.5 h-3.5" />
                  Delivery Area
                </p>
                <div
                  aria-live="polite"
                  className="flex w-full items-center justify-between gap-3 rounded-md border border-zinc-200 bg-stone-50 px-3 py-3"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 font-gotham text-sm font-medium text-[#222222]">
                      {ZONE_LABELS[deliveryZone]}
                      <LuLock className="w-3 h-3 text-zinc-400" aria-hidden />
                    </span>
                    <span className="block font-gotham text-[11px] text-zinc-500">
                      {isAuthenticated
                        ? `Set by your delivery address — ${zoneSourceLabel}`
                        : zoneUnset
                          ? "Choose Inside or Outside Dhaka in your delivery details"
                          : "Chosen in your delivery details"}
                    </span>
                  </span>
                  <span className="shrink-0 font-gotham text-sm font-semibold text-[#222222]">
                    {shippingLabel}
                  </span>
                </div>
              </div>

              {/* Pricing Rows */}
              <div className="space-y-5 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bembo text-base text-[#555555]">Subtotal</span>
                  <span className="font-gotham text-base font-medium text-[#222222]">
                    {formatCurrency(listSubtotal)}
                  </span>
                </div>
                {productDiscount > 0 && (
                  <>
                    <div className="h-px bg-zinc-200" />
                    <div className="flex justify-between items-center">
                      <span className="font-bembo text-base text-[#555555]">Product Discount</span>
                      <span className="font-gotham text-base font-medium text-[#2f7d1f]">
                        −{formatCurrency(productDiscount)}
                      </span>
                    </div>
                  </>
                )}
                <div className="h-px bg-zinc-200" />
                <div className="flex justify-between items-center">
                  <span className="font-bembo text-base text-[#555555]">Delivery Charge</span>
                  <span className="font-gotham text-base font-medium text-[#222222]">
                    {shippingLabel}
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
                <div className="flex justify-between items-center">
                  <span className="font-bembo text-2xl text-[#4A4A4A] font-normal">Total</span>
                  <span className="font-bembo text-2xl text-[#4A4A4A] font-normal">
                    {formatCurrency(total)}
                  </span>
                </div>
                {productDiscount > 0 && (
                  <p className="rounded-md bg-brand-mist px-3 py-2.5 font-gotham text-sm font-semibold text-[#2f7d1f]">
                    You save {formatCurrency(productDiscount)}
                    {savedPercent > 0 && ` (${savedPercent}%)`} on this order
                  </p>
                )}
                <div className="border-b border-solid border-zinc-300" />
              </div>

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
                  <label className="flex items-start gap-3 p-4 border rounded-md cursor-pointer transition-colors border-brand bg-brand-mist/30">
                    <div className="mt-0.5 shrink-0">
                      <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
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
              </div>

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
                        className="cursor-pointer font-gotham text-sm font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
                      >
                        Read {policy.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* The agreement checkbox itself sits in the action bar at the
                  bottom of the screen, next to the button it gates. */}

              {/* Security & Privacy */}
              <div className="flex items-start gap-3 mt-6 mb-2">
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
            </aside>
          </div>

          {/* ── Action bar, fixed to the bottom of the viewport on every size.
                 The agreement checkbox rides here too, so nothing has to be
                 scrolled to before the order can be placed. ── */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
            <div className="mx-auto flex max-w-[1200px] flex-col gap-2">
              {/* Agreement + why the order will not go through */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <label
                  htmlFor="terms"
                  className="flex cursor-pointer items-start gap-2.5 select-none"
                >
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeToTerms}
                    onChange={(e) => {
                      setAgreeToTerms(e.target.checked);
                      if (e.target.checked) setSubmitError(null);
                    }}
                    className="sr-only"
                  />
                  <span
                    className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      agreeToTerms
                        ? "border-brand bg-brand"
                        : submitError
                          ? "border-red-500 bg-white"
                          : "border-zinc-400 bg-white"
                    }`}
                  >
                    {agreeToTerms && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="font-gotham text-xs sm:text-sm text-[#222222]">
                    I have read and agree to the terms, return and refund policies
                    <span className="text-brand"> *</span>
                  </span>
                </label>

                {(submitError || blockingReason) && (
                  <p
                    className="font-gotham text-xs text-red-600 sm:text-right"
                    role={submitError ? "alert" : undefined}
                  >
                    {submitError ?? blockingReason}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="min-w-0">
                  <p className="font-gotham text-[11px] uppercase tracking-wider text-[#999999]">
                    Total
                  </p>
                  <p className="font-bembo text-xl sm:text-2xl text-[#4A4A4A] leading-tight">
                    {formatCurrency(total)}
                  </p>
                </div>
                {/* A soft ring pulses out of Place Order while it can be pressed,
                    nudging the shopper to finish. Off while disabled or sending,
                    and for anyone who has asked for reduced motion. */}
                <div className="relative flex-1 sm:flex-none sm:min-w-[280px] sm:ml-auto">
                  {agreeToTerms && !submitting && (
                    <>
                      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-brand animate-cta-pulse motion-reduce:hidden" />
                      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-brand animate-cta-pulse [animation-delay:0.9s] motion-reduce:hidden" />
                    </>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !agreeToTerms}
                    className={`relative w-full py-3.5 px-8 bg-brand text-white font-gotham text-sm font-bold uppercase tracking-wider rounded-full hover:bg-brand-dark transition-colors disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      submitting ? "disabled:opacity-50" : "disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300"
                    }`}
                  >
                    {submitting && <LuLoader className="w-4 h-4 animate-spin" />}
                    {submitting ? "PLACING ORDER..." : "PLACE ORDER"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <PolicyModal policy={openPolicy} onClose={() => setOpenPolicy(null)} />

      {/* ── Address View Modal ── */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn font-gotham">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-stone-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-150 px-6 py-4 bg-brand-mist">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand/15 flex items-center justify-center text-brand">
                  <LuMapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-gotham text-base font-bold text-[#1f2a17]">
                    Delivery Address Details
                  </h3>
                  <p className="font-gotham text-[11px] text-stone-500">
                    {usingSavedAddress ? "Selected Saved Address" : "Current Form Address"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between bg-stone-50 p-3.5 rounded-lg border border-stone-200">
                <span className="font-gotham text-xs font-semibold text-stone-600">
                  Delivery Zone & Rate:
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/10 text-brand font-gotham text-xs font-bold">
                  <LuCircleCheck className="w-3.5 h-3.5" />
                  {`${ZONE_LABELS[deliveryZone]} (৳${deliveryRates[deliveryZone]})`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-150">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">
                    Recipient Name
                  </span>
                  <span className="font-semibold text-stone-800 text-sm">{activeName || "N/A"}</span>
                </div>
                <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-150">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">
                    Phone Number
                  </span>
                  <span className="font-semibold text-stone-800 text-sm">{activePhone || "N/A"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-150">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">
                    District
                  </span>
                  <span className="font-semibold text-stone-800">{activeDistrict || "Dhaka"}</span>
                </div>
                <div className="bg-stone-50/70 p-3 rounded-lg border border-stone-150">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">
                    Email Address
                  </span>
                  <span className="font-semibold text-stone-800 truncate block">{activeEmail || "N/A"}</span>
                </div>
              </div>

              <div className="bg-stone-50/70 p-3.5 rounded-lg border border-stone-150 text-xs">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Full Street Address
                </span>
                <p className="text-stone-800 leading-relaxed font-medium">
                  {activeFullAddressFormatted || "No street address entered yet."}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-3.5 bg-stone-50 border-t border-stone-200">
              {usingSavedAddress && selectedAddress ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressModal(false);
                    handleOpenEditModal(selectedAddress);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-white border border-brand text-brand font-gotham text-xs font-bold hover:bg-brand hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <LuPencil className="w-3.5 h-3.5" />
                  Edit This Address
                </button>
              ) : <div />}
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2 rounded-lg bg-brand text-white font-gotham text-xs font-bold hover:bg-brand-dark transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Address Modal ── */}
      {editingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn font-gotham">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-stone-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-150 px-6 py-4 bg-brand-mist">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand/15 flex items-center justify-center text-brand">
                  <LuPencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-gotham text-base font-bold text-[#1f2a17]">
                    Edit Delivery Address
                  </h3>
                  <p className="font-gotham text-[11px] text-stone-500">
                    Changes will be saved to your address book
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAddress(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEditedAddress}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto font-gotham">
                <div>
                  <label className="block text-xs font-semibold text-[#1f2a17] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Enter full name"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1f2a17] mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1f2a17] mb-1">
                      District *
                    </label>
                    <select
                      required
                      value={editDistrict}
                      onChange={(e) => {
                        const next = e.target.value;
                        // Same rule as the main form: a Dhaka area means nothing
                        // outside Dhaka, so the field clears when the kind changes.
                        if (isDhakaDistrict(editDistrict) !== isDhakaDistrict(next)) setEditCity("");
                        setEditDistrict(next);
                      }}
                      className={`${INPUT_CLASS} bg-white cursor-pointer`}
                    >
                      {BANGLADESH_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1f2a17] mb-1">
                      {isDhakaDistrict(editDistrict) ? "City / Area *" : "City *"}
                    </label>
                    {isDhakaDistrict(editDistrict) ? (
                      <select
                        required
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className={`${INPUT_CLASS} bg-white cursor-pointer`}
                      >
                        <option value="">Select your area</option>
                        {DHAKA_AREAS.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        placeholder="City name"
                        className={INPUT_CLASS}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1f2a17] mb-1">
                    Area / Postal Code <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={editPostalCode}
                    onChange={(e) => setEditPostalCode(e.target.value)}
                    placeholder="e.g. Uttara / 1230"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1f2a17] mb-1">
                    Full Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={editAddressLine1}
                    onChange={(e) => setEditAddressLine1(e.target.value)}
                    placeholder="House, road, block details"
                    className={INPUT_CLASS}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={editIsDefault}
                    onChange={(e) => setEditIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-brand focus:ring-brand"
                  />
                  <span className="text-xs text-stone-700 font-medium">
                    Set as default delivery address
                  </span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-3.5 bg-stone-50 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingAddress(null)}
                  className="px-4 py-2 rounded-lg bg-white border border-stone-300 text-stone-700 font-gotham text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 rounded-lg bg-brand text-white font-gotham text-xs font-bold hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {editSaving && <LuLoader className="w-3.5 h-3.5 animate-spin" />}
                  {editSaving ? "Saving Changes..." : "Save Address Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
