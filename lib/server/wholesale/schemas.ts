import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

const uuid = (field: string) => z.uuid({ error: ERROR_MESSAGES.validation.invalidUuid(field) });
const money = z.coerce.number().min(0);

/** POST /wholesale-requests — CreateWholesaleOrderRequestDto */
export const createWholesaleSchema = z.strictObject({
  customerNote: z.string().trim().optional(),
  contactPhone: z.string().trim().optional(),
  items: z
    .array(
      z.strictObject({
        productId: uuid("productId"),
        variantId: uuid("variantId").optional(),
        requestedQuantity: z.coerce.number().int().min(1),
        targetPrice: money.optional(),
        note: z.string().trim().optional(),
      }),
    )
    .min(1, ERROR_MESSAGES.wholesale.itemRequired),
});

/** PATCH /wholesale-requests/:id/status — UpdateWholesaleRequestStatusDto */
export const updateWholesaleStatusSchema = z.strictObject({
  status: z.enum(["approved", "rejected", "info_requested"]),
  note: z.string().trim().optional(),
});

/** POST /wholesale-requests/:id/convert — ConvertToOrderDto */
export const convertWholesaleSchema = z.strictObject({
  addressId: uuid("addressId"),
  items: z
    .array(
      z.strictObject({
        requestItemId: uuid("requestItemId").optional(),
        productId: uuid("productId").optional(),
        variantId: uuid("variantId").optional(),
        quantity: z.coerce.number().int().min(1),
        unitPrice: money,
      }),
    )
    .min(1, ERROR_MESSAGES.wholesale.itemRequired),
  discount: money.optional(),
  shippingCost: money.optional(),
  tax: money.optional(),
  paymentStatus: z.enum(["unpaid", "paid", "refunded"]).optional(),
});

/** GET /wholesale-requests — ListWholesaleRequestsQueryDto */
export const listWholesaleQuery = z.object({
  status: z.enum(["pending", "info_requested", "approved", "rejected", "converted"]).optional(),
});

export type CreateWholesaleInput = z.output<typeof createWholesaleSchema>;
export type UpdateWholesaleStatusInput = z.output<typeof updateWholesaleStatusSchema>;
export type ConvertWholesaleInput = z.output<typeof convertWholesaleSchema>;
export type ListWholesaleQuery = z.output<typeof listWholesaleQuery>;
