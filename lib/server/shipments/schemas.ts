import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

const uuid = (field: string) => z.uuid({ error: ERROR_MESSAGES.validation.invalidUuid(field) });

/** POST /shipments — CreateShipmentDto */
export const createShipmentSchema = z.strictObject({
  orderId: uuid("orderId"),
  courierName: z.string({ error: ERROR_MESSAGES.shipment.courierRequired }).trim().min(1, ERROR_MESSAGES.shipment.courierRequired),
  trackingNumber: z.string().trim().optional(),
});

/** PATCH /shipments/:id — UpdateShipmentDto (PartialType). */
export const updateShipmentSchema = createShipmentSchema.partial();

export type CreateShipmentInput = z.output<typeof createShipmentSchema>;
export type UpdateShipmentInput = z.output<typeof updateShipmentSchema>;
