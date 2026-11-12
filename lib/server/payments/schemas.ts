import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { paymentMethod } from "@/lib/server/orders/schemas";

const uuid = (field: string) => z.uuid({ error: ERROR_MESSAGES.validation.invalidUuid(field) });

/** POST /payments/initiate — InitiatePaymentDto */
export const initiatePaymentSchema = z.strictObject({
  orderId: uuid("orderId"),
  method: paymentMethod,
});

/** POST /payments/confirm — ConfirmPaymentDto */
export const confirmPaymentSchema = z.strictObject({
  paymentId: uuid("paymentId"),
  status: z.enum(["pending", "success", "failed"]),
  transactionId: z.string().trim().optional(),
});

/** POST /payments/manual — CreateManualPaymentDto */
export const manualPaymentSchema = z.strictObject({
  orderId: uuid("orderId"),
  amount: z.coerce.number().positive(),
  method: paymentMethod,
  transactionId: z.string().trim().optional(),
});

/** POST /payments/webhook — provider payloads are opaque until a gateway is wired in. */
export const webhookPayloadSchema = z.unknown();

export type InitiatePaymentInput = z.output<typeof initiatePaymentSchema>;
export type ConfirmPaymentInput = z.output<typeof confirmPaymentSchema>;
export type ManualPaymentInput = z.output<typeof manualPaymentSchema>;
