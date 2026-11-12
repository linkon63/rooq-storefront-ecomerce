import "server-only";
import { z } from "zod";
import { BackInStockStatus } from "@/lib/generated/prisma/enums";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { paginationQuery } from "@/lib/server/validation";
import { uuidField } from "../schema-helpers";

export const backInStockCreateSchema = z.strictObject({
  variantId: uuidField("variantId"),
  email: z.email({ error: ERROR_MESSAGES.validation.invalidEmail }).trim().toLowerCase(),
});

export const backInStockListQuery = z.object({
  ...paginationQuery,
  status: z.enum(BackInStockStatus).optional(),
  productId: z.uuid().optional(),
  variantId: z.uuid().optional(),
  search: z.string().trim().optional(),
});

export const backInStockNotifySchema = z.strictObject({ variantId: uuidField("variantId") });

export type BackInStockListQuery = z.output<typeof backInStockListQuery>;
