import "server-only";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { formBoolean, uuidList } from "../catalog/schema-helpers";

const productId = z.uuid({ error: ERROR_MESSAGES.reel.productRequired });

/** POST /reels — multipart: a `video` file and the product it shows. */
export const reelCreateSchema = z.strictObject({ productId });

/** PATCH /reels/:id — change the product, show or hide the reel. */
export const reelUpdateSchema = z.strictObject({
  productId: productId.optional(),
  isActive: formBoolean.optional(),
});

/** PUT /reels/reorder — every reel id, in the new order. */
export const reelReorderSchema = z.strictObject({ ids: uuidList("ids").min(1) });

export type ReelUpdateInput = z.output<typeof reelUpdateSchema>;
