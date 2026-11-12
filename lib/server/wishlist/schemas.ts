import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

/** POST /wishlist — AddWishlistDto */
export const addWishlistSchema = z.strictObject({
  productId: z.uuid({ error: ERROR_MESSAGES.validation.invalidUuid("productId") }),
});

/** DELETE /wishlist/:productId */
export const productIdParam = z.strictObject({ productId: z.uuid({ error: ERROR_MESSAGES.common.invalidId }) });

export type AddWishlistInput = z.output<typeof addWishlistSchema>;
