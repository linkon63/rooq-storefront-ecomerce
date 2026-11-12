import "server-only";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { DiscountType, ActiveStatus } from "@/lib/generated/prisma/enums";
import { paginationQuery } from "../validation";

const v = ERROR_MESSAGES.validation;

/** IsDateString: any value Date can parse ("2026-06-01" or a full ISO timestamp). */
export const dateString = (field: string) =>
  z
    .string({ error: v.invalidDate(field) })
    .refine((value) => !Number.isNaN(Date.parse(value)), v.invalidDate(field))
    .transform((value) => new Date(value));

/** POST /product-discounts — CreateProductDiscountDto */
export const createProductDiscountSchema = z.strictObject({
  name: z.string({ error: v.required("name") }).trim().min(1, v.required("name")),
  type: z.enum(DiscountType),
  value: z.coerce.number({ error: v.required("value") }).min(0),
  productIds: z.array(z.uuid({ error: v.invalidUuid("productIds") })),
  startDate: dateString("startDate").nullable().optional(),
  endDate: dateString("endDate").nullable().optional(),
  status: z.enum(ActiveStatus).optional(),
});
export type CreateProductDiscountInput = z.output<typeof createProductDiscountSchema>;

/** PATCH /product-discounts/:id — PartialType; `null` clears a date. */
export const updateProductDiscountSchema = createProductDiscountSchema.partial();
export type UpdateProductDiscountInput = z.output<typeof updateProductDiscountSchema>;

/** GET /product-discounts — ListProductDiscountsQueryDto (+ status filter). */
export const listProductDiscountsQuery = z.strictObject({
  ...paginationQuery,
  search: z.string().trim().optional(),
  status: z.enum(ActiveStatus).optional(),
});
export type ListProductDiscountsQuery = z.output<typeof listProductDiscountsQuery>;
