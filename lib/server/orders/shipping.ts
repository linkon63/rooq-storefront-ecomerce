import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";
import { toNumber, toNumberOrNull } from "@/utils/decimal";
import type { DeliveryRates } from "@/utils/orders/pricing";

type Db = Pick<Prisma.TransactionClient, "setting">;

/** Schema default for Setting.returnWindowDays, used before Settings exist. */
const DEFAULT_RETURN_WINDOW_DAYS = 14;

export type DeliverySettings = {
  rates: DeliveryRates;
  freeShippingThreshold: number | null;
  returnWindowDays: number;
  branchName: string | null;
};

/** Delivery rates, free-shipping threshold and return window from Admin → Settings. */
export async function loadDeliverySettings(db: Db = prisma): Promise<DeliverySettings> {
  const row = await db.setting.findFirst({
    select: {
      deliveryChargeInside: true,
      deliveryChargeNearCity: true,
      deliveryChargeOutside: true,
      freeShippingThreshold: true,
      returnWindowDays: true,
      branchName: true,
    },
  });
  return {
    rates: {
      inside: toNumber(row?.deliveryChargeInside),
      near_city: toNumber(row?.deliveryChargeNearCity),
      outside: toNumber(row?.deliveryChargeOutside),
    },
    freeShippingThreshold: toNumberOrNull(row?.freeShippingThreshold),
    returnWindowDays: row?.returnWindowDays ?? DEFAULT_RETURN_WINDOW_DAYS,
    branchName: row?.branchName ?? null,
  };
}
