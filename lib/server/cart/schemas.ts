import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

const uuid = (field: string) => z.uuid({ error: ERROR_MESSAGES.validation.invalidUuid(field) });

/** POST /cart/items — AddCartItemDto */
export const addCartItemSchema = z.strictObject({ variantId: uuid("variantId"), quantity: z.coerce.number().int().min(1) });

/** PATCH /cart/items/:id — UpdateCartItemDto */
export const updateCartItemSchema = z.strictObject({ quantity: z.coerce.number().int().min(1) });

export type AddCartItemInput = z.output<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.output<typeof updateCartItemSchema>;
