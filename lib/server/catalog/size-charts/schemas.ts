import "server-only";
import { z } from "zod";
import { Department } from "@/lib/generated/prisma/enums";
import { optionalText, requiredString, slugField, uuidField, uuidList } from "../schema-helpers";

const measurement = z.strictObject({
  label: requiredString("label"),
  valueCm: z.coerce.number().min(0).max(99999),
});

const row = z.strictObject({
  sizeId: uuidField("sizeId"),
  measurements: z.array(measurement),
});

export const sizeChartCreateSchema = z.strictObject({
  name: requiredString("name"),
  slug: slugField.optional(),
  description: optionalText,
  howToMeasure: optionalText,
  department: z.enum(Department).nullable().optional(),
  isActive: z.boolean().optional(),
  rows: z.array(row).default([]),
  categoryIds: uuidList("categoryIds").optional(),
});

export const sizeChartUpdateSchema = sizeChartCreateSchema.partial().extend({ rows: z.array(row).optional() });

export type SizeChartCreateInput = z.output<typeof sizeChartCreateSchema>;
export type SizeChartUpdateInput = z.output<typeof sizeChartUpdateSchema>;
export type SizeChartRowInput = z.output<typeof row>;
