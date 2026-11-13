import "server-only";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { paginationQuery } from "@/lib/server/validation";
import { isValidPhone } from "@/utils/storefront/forms";

const text = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  text(max)
    .optional()
    .transform((value) => value || undefined);

const itemSchema = z.strictObject({
  variantId: z.uuid(),
  name: text(200).min(1),
  sku: text(80),
  image: text(500).nullable(),
  color: text(60).nullable(),
  size: text(40).nullable(),
  price: z.number().min(0).max(10_000_000),
  quantity: z.number().int().min(1).max(99),
});

/** POST /abandoned-carts — the checkout form so far, sent once a name and a valid phone are in. */
export const abandonedCartSchema = z.strictObject({
  token: z.uuid(),
  fullName: text(120).min(1),
  phone: text(20).refine(isValidPhone, ERROR_MESSAGES.abandonedCart.invalidPhone),
  email: optionalText(160),
  city: optionalText(80),
  items: z.array(itemSchema).min(1).max(50),
});

export const abandonedCartListQuery = z.object({
  ...paginationQuery,
  status: z.enum(["OPEN", "RECOVERED"]).optional(),
  search: z.string().trim().optional(),
});

export type AbandonedCartListQuery = z.output<typeof abandonedCartListQuery>;
