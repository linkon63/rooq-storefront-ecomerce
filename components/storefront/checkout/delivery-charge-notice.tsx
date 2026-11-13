"use client";

import { useMoney } from "@/hooks/use-money";
import type { StoreSettings } from "@/types/storefront/content";

/**
 * The delivery rates in red above the address form, so the charge is known
 * before the shopper fills anything in. Near Dhaka only shows when it has a
 * rate of its own.
 */
export function DeliveryChargeNotice({ delivery }: { delivery: StoreSettings["delivery"] }) {
  const format = useMoney();
  const rates: [string, number][] = [
    ["Inside Dhaka", delivery.inside],
    ...(delivery.nearCity !== delivery.inside && delivery.nearCity !== delivery.outside ? [["Near Dhaka", delivery.nearCity] as [string, number]] : []),
    ["Outside Dhaka", delivery.outside],
  ];
  return (
    <div role="note" className="rounded border-2 border-red-600 bg-red-50 px-4 py-3 text-red-700">
      <p className="text-xs font-bold uppercase tracking-wider">Delivery charge</p>
      <ul className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-base font-bold">
        {rates.map(([label, amount]) => (
          <li key={label}>
            {label}: <span className="tabular-nums">{format(amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
