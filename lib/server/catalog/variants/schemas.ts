import "server-only";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { nullableMoney, optionalText, uuidField } from "../schema-helpers";

const sku = z.string().trim().min(1).max(64).transform((value) => value.toUpperCase());
const stock = z.coerce.number().int().min(0, ERROR_MESSAGES.inventory.negativeStock);
const threshold = z.coerce.number().int().min(0);

/** POST /products/:id/variants */
export const variantCreateSchema = z.strictObject({
  colorId: uuidField("colorId"),
  sizeId: uuidField("sizeId"),
  sku: sku.optional(),
  barcode: optionalText,
  price: nullableMoney,
  compareAtPrice: nullableMoney,
  costPrice: nullableMoney,
  stock: stock.optional(),
  lowStockThreshold: threshold.optional(),
  weightGrams: z.coerce.number().int().min(0).nullable().optional(),
  position: z.coerce.number().int().min(0).optional(),
  isDefault: z.boolean().optional(),
});

/** PATCH /variants/:id — stock changes go through inventory. */
export const variantUpdateSchema = variantCreateSchema
  .omit({ stock: true })
  .partial()
  .extend({ sku: sku.optional(), isActive: z.boolean().optional() });

/** POST /products/:id/variants/generate */
export const variantMatrixSchema = z.strictObject({
  colorIds: z.array(uuidField("colorIds")),
  sizeIds: z.array(uuidField("sizeIds")),
  skuPattern: z.string().trim().min(1).max(64).optional(),
  price: nullableMoney,
  compareAtPrice: nullableMoney,
  stock: stock.optional(),
  lowStockThreshold: threshold.optional(),
  dryRun: z.boolean().optional(),
});

/** PATCH /variants/bulk */
export const variantBulkSchema = z.strictObject({
  items: z
    .array(
      z.strictObject({
        id: uuidField("id"),
        price: nullableMoney,
        compareAtPrice: nullableMoney,
        costPrice: nullableMoney,
        stock: stock.optional(),
        lowStockThreshold: threshold.optional(),
        isActive: z.boolean().optional(),
        barcode: optionalText,
        sku: sku.optional(),
      }),
    )
    .min(1, ERROR_MESSAGES.variant.bulkEmpty),
  reason: optionalText,
});

export type VariantCreateInput = z.output<typeof variantCreateSchema>;
export type VariantUpdateInput = z.output<typeof variantUpdateSchema>;
export type VariantMatrixInput = z.output<typeof variantMatrixSchema>;
export type VariantBulkInput = z.output<typeof variantBulkSchema>;
