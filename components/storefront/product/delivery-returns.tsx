import { STORE_CURRENCY } from "@/lib/constants/store";
import type { DeliveryInfo } from "@/types/storefront/catalog";
import { formatMoney } from "@/utils/storefront/money";

/** Delivery rates by zone, free-delivery threshold and the return window (from Settings). */
export function DeliveryReturns({ delivery, currency = STORE_CURRENCY }: { delivery: DeliveryInfo; currency?: string }) {
  const money = (amount: number) => (amount > 0 ? formatMoney(amount, currency) : "Free");
  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-[1fr_auto] gap-y-1.5">
        <dt className="text-stone">Inside Dhaka city</dt>
        <dd className="tabular-nums">{money(delivery.chargeInside)}</dd>
        <dt className="text-stone">Near Dhaka</dt>
        <dd className="tabular-nums">{money(delivery.chargeNearCity)}</dd>
        <dt className="text-stone">Rest of Bangladesh</dt>
        <dd className="tabular-nums">{money(delivery.chargeOutside)}</dd>
      </dl>
      {delivery.freeShippingThreshold !== null ? (
        <p>Free delivery on orders over {formatMoney(delivery.freeShippingThreshold, currency)}.</p>
      ) : null}
      <p>
        Changed your mind? Return or exchange within {delivery.returnWindowDays} days of delivery from your account.
      </p>
    </div>
  );
}
