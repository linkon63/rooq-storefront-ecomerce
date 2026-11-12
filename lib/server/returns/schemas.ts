import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { paginationQuery } from "@/lib/server/validation";

const v = ERROR_MESSAGES.validation;
const uuid = (field: string) => z.uuid({ error: v.invalidUuid(field) });

export const RETURN_STATUS_VALUES = ["REQUESTED", "APPROVED", "REJECTED", "REFUNDED", "EXCHANGED", "CANCELLED"] as const;
export const RETURN_REASON_VALUES = [
  "TOO_SMALL",
  "TOO_LARGE",
  "NOT_AS_DESCRIBED",
  "DAMAGED",
  "WRONG_ITEM",
  "QUALITY",
  "CHANGED_MIND",
  "OTHER",
] as const;

/** POST /returns */
export const createReturnSchema = z.strictObject({
  orderId: uuid("orderId"),
  resolution: z.enum(["REFUND", "EXCHANGE"]),
  customerNote: z.string().trim().max(2000).optional(),
  items: z
    .array(
      z.strictObject({
        orderItemId: uuid("orderItemId"),
        quantity: z.coerce.number().int().min(1),
        reason: z.enum(RETURN_REASON_VALUES),
        note: z.string().trim().max(1000).optional(),
        exchangeVariantId: uuid("exchangeVariantId").optional(),
      }),
    )
    .min(1, ERROR_MESSAGES.returns.itemRequired),
});

/** PATCH /returns/:id/status (staff) */
export const updateReturnStatusSchema = z.strictObject({
  status: z.enum(RETURN_STATUS_VALUES),
  adminNote: z.string().trim().max(2000).optional(),
  refundAmount: z.coerce.number().min(0).optional(),
  restock: z.boolean().default(true),
});

/** GET /returns (staff) */
export const listReturnsQuery = z.object({
  status: z.enum(RETURN_STATUS_VALUES).optional(),
  search: z.string().trim().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  ...paginationQuery,
});

/** GET /returns/my */
export const myReturnsQuery = z.object({ ...paginationQuery });

export type CreateReturnInput = z.output<typeof createReturnSchema>;
export type UpdateReturnStatusInput = z.output<typeof updateReturnStatusSchema>;
export type ListReturnsQuery = z.output<typeof listReturnsQuery>;
