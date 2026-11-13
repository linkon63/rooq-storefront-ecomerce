import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { PAYMENT_METHOD_ALIASES } from "@/lib/constants/orders";
import { paginationQuery } from "@/lib/server/validation";

const v = ERROR_MESSAGES.validation;

export const ORDER_STATUS_VALUES = ["pending", "processing", "shipped", "delivered", "cancelled", "returned"] as const;
export const PAYMENT_STATUS_VALUES = ["unpaid", "paid", "partially_refunded", "refunded"] as const;
export const DELIVERY_ZONE_VALUES = ["inside", "near_city", "outside"] as const;
export const PAYMENT_METHOD_VALUES = [
  "cash_on_delivery",
  "cash",
  "card",
  "bkash",
  "nagad",
  "rocket",
  "bank_transfer",
  "other",
] as const;

const uuid = (field: string) => z.uuid({ error: v.invalidUuid(field) });
const requiredString = (field: string) => z.string({ error: v.required(field) }).trim().min(1, v.required(field));
const optionalText = z.string().trim().max(2000).optional();

/** Accepts the enum values plus the old free-text aliases ("cod"). */
export const paymentMethod = z
  .string({ error: v.required("method") })
  .trim()
  .toLowerCase()
  .transform((value) => PAYMENT_METHOD_ALIASES[value] ?? value)
  .pipe(z.enum(PAYMENT_METHOD_VALUES, { error: (issue) => ERROR_MESSAGES.payment.invalidMethod(String(issue.input)) }));

export const orderLineSchema = z.strictObject({
  variantId: uuid("variantId"),
  quantity: z.coerce.number().int().min(1),
});

/** POST /orders — CreateOrderDto (+ optional customerNote). */
export const createOrderSchema = z.strictObject({
  addressId: uuid("addressId"),
  couponCode: z.string().trim().optional(),
  deliveryZone: z.enum(DELIVERY_ZONE_VALUES).optional(),
  items: z.array(orderLineSchema).optional(),
  customerNote: optionalText,
});

const guestAddressSchema = z.strictObject({
  email: z.email({ error: v.invalidEmail }).trim().optional().or(z.literal("").transform(() => undefined)),
  fullName: requiredString("fullName"),
  phone: requiredString("phone"),
  addressLine1: requiredString("addressLine1"),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

/** POST /orders/guest — CreateGuestOrderDto (+ optional customerNote). */
export const createGuestOrderSchema = z.strictObject({
  address: guestAddressSchema,
  items: z.array(orderLineSchema).min(1, ERROR_MESSAGES.order.itemsRequired),
  couponCode: z.string().trim().optional(),
  deliveryZone: z.enum(DELIVERY_ZONE_VALUES).optional(),
  customerNote: optionalText,
});

/** POST /orders/pos — in-store sale by staff (new). */
export const createPosOrderSchema = z.strictObject({
  items: z
    .array(orderLineSchema.extend({ unitPrice: z.coerce.number().min(0).optional() }))
    .min(1, ERROR_MESSAGES.pos.cartEmpty),
  paymentMethod: paymentMethod.default("cash"),
  transactionId: z.string().trim().optional(),
  couponCode: z.string().trim().optional(),
  discount: z.coerce.number().min(0).optional(),
  customer: z
    .strictObject({
      name: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      email: z.email({ error: v.invalidEmail }).trim().optional(),
    })
    .optional(),
  note: optionalText,
});

/** GET /orders — ListOrdersQueryDto (+ orderType, from, to). */
export const listOrdersQuery = z.object({
  search: z.string().trim().optional(),
  status: z.enum(ORDER_STATUS_VALUES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUS_VALUES).optional(),
  orderType: z.enum(["retail", "wholesale"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  ...paginationQuery,
});

/** PATCH /orders/:id/status — UpdateOrderStatusDto. */
export const updateOrderStatusSchema = z.strictObject({
  status: z.enum(ORDER_STATUS_VALUES).optional(),
  note: z.string().trim().optional(),
  paymentStatus: z.enum(PAYMENT_STATUS_VALUES).optional(),
});

export type CreateOrderInput = z.output<typeof createOrderSchema>;
export type CreateGuestOrderInput = z.output<typeof createGuestOrderSchema>;
export type CreatePosOrderInput = z.output<typeof createPosOrderSchema>;
export type ListOrdersQuery = z.output<typeof listOrdersQuery>;
export type UpdateOrderStatusInput = z.output<typeof updateOrderStatusSchema>;

/** GET /orders/invoice — the order number and the phone it was placed with. */
export const invoiceQuery = z.strictObject({
  order: z.string().trim().min(1).max(40),
  phone: z.string().trim().min(6).max(20),
});
