import "server-only";
import { z } from "zod";
import { StockMovementType } from "@/lib/generated/prisma/enums";
import { MANUAL_MOVEMENT_TYPES, LOW_STOCK_LIST_LIMIT } from "@/lib/constants/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { paginationQuery, queryBoolean } from "@/lib/server/validation";
import { optionalText, uuidField } from "../schema-helpers";

export const inventoryListQuery = z.object({
  ...paginationQuery,
  search: z.string().trim().optional(),
  productId: z.uuid().optional(),
  lowStock: queryBoolean.optional(),
  outOfStock: queryBoolean.optional(),
  includeInactive: queryBoolean.optional(),
  /** Old client: ?sort=lowStock */
  sort: z.enum(["lowStock", "stock_asc", "stock_desc", "newest"]).optional(),
});

export const inventoryAdjustSchema = z
  .strictObject({
    variantId: uuidField("variantId"),
    change: z.coerce.number().int().optional(),
    setTo: z.coerce.number().int().min(0, ERROR_MESSAGES.inventory.negativeStock).optional(),
    type: z.enum(MANUAL_MOVEMENT_TYPES).optional(),
    reason: optionalText,
    /** Old client field, folded into `reason`. */
    note: optionalText,
  })
  .refine((body) => (body.change === undefined) !== (body.setTo === undefined), { message: ERROR_MESSAGES.inventory.changeOrSetTo, path: ["change"] })
  .refine((body) => body.change !== 0, { message: ERROR_MESSAGES.inventory.zeroChange, path: ["change"] });

export const movementListQuery = z.object({
  ...paginationQuery,
  variantId: z.uuid().optional(),
  productId: z.uuid().optional(),
  type: z.enum(StockMovementType).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const lowStockQuery = z.object({ limit: z.coerce.number().int().min(1).max(200).default(LOW_STOCK_LIST_LIMIT) });

export type InventoryListQuery = z.output<typeof inventoryListQuery>;
export type InventoryAdjustInput = z.output<typeof inventoryAdjustSchema>;
export type MovementListQuery = z.output<typeof movementListQuery>;
