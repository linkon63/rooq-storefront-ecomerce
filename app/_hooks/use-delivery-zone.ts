"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchShopSettings } from "@/lib/shop-api";
import type { DeliveryZone } from "@/lib/types";

const STORAGE_KEY = "delivery-zone";

const EMPTY_RATES: Record<DeliveryZone, number> = {
  inside: 0,
  near_city: 0,
  outside: 0,
};

function readStoredZone(): DeliveryZone {
  if (typeof window === "undefined") return "inside";
  const stored = sessionStorage.getItem(STORAGE_KEY);
  return stored === "inside" || stored === "near_city" || stored === "outside" ? stored : "inside";
}

/**
 * The delivery zone and its price, shared by the cart and the checkout.
 *
 * Rates are read from Admin → Settings → General on mount rather than baked
 * into the bundle, and the picked zone is kept in sessionStorage so the charge
 * shown in the cart is the one already selected at checkout. Only the zone ever
 * travels to the API — the amount is resolved server-side from the same
 * settings row, so a tampered client cannot change what it pays.
 */
export function useDeliveryZone() {
  const [zone, setZoneState] = useState<DeliveryZone>("inside");
  const [rates, setRates] = useState<Record<DeliveryZone, number>>(EMPTY_RATES);
  const [loadingRates, setLoadingRates] = useState(true);

  // sessionStorage is read after mount so the server and client render alike.
  useEffect(() => {
    setZoneState(readStoredZone());
  }, []);

  useEffect(() => {
    let active = true;
    fetchShopSettings()
      .then((settings) => {
        if (!active) return;
        if (settings) {
          setRates({
            inside: Number(settings.deliveryChargeInside ?? 0) || 0,
            near_city: Number(settings.deliveryChargeNearCity ?? 0) || 0,
            outside: Number(settings.deliveryChargeOutside ?? 0) || 0,
          });
        }
      })
      .finally(() => {
        if (active) setLoadingRates(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const setZone = useCallback((next: DeliveryZone) => {
    setZoneState(next);
    if (typeof window !== "undefined") sessionStorage.setItem(STORAGE_KEY, next);
  }, []);

  return { zone, setZone, rates, charge: rates[zone], loadingRates };
}
