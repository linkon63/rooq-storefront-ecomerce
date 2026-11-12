import "server-only";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SLUG_PATTERN } from "@/utils/slug";
import { isHexColor } from "@/utils/color";
import { queryList } from "@/lib/server/validation";

const v = ERROR_MESSAGES.validation;

/** Trimmed, non-empty string with the old "x is required" wording. */
export const requiredString = (field: string) =>
  z.string({ error: v.required(field) }).trim().min(1, v.required(field));

/** Optional free text: "" and whitespace become null (clears the column). */
export const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

export const slugField = z.string().trim().toLowerCase().regex(SLUG_PATTERN, v.invalidSlug);

export const uuidField = (field: string) => z.uuid({ error: v.invalidUuid(field) });

/** A uuid, or null / "" to clear the link. */
export const nullableUuid = (field: string) =>
  z
    .union([z.uuid({ error: v.invalidUuid(field) }), z.literal(""), z.null()])
    .transform((value) => (value ? value : null))
    .optional();

export const uuidList = (field: string) => z.array(uuidField(field));

export const money = z.coerce.number().min(0).max(9_999_999_999);
export const nullableMoney = z.union([money, z.null()]).optional();

export const hexField = z
  .string()
  .trim()
  .refine(isHexColor, v.invalidHex)
  .transform((value) => `#${value.replace("#", "").toUpperCase()}`);

export const isoDate = z.coerce.date();
export const nullableDate = z.union([z.coerce.date(), z.null(), z.literal("").transform(() => null)]).optional();

/** Query list of enum values (`?fit=SLIM,REGULAR` or repeated keys). */
export const enumList = <T extends Record<string, string>>(values: T) => queryList.pipe(z.array(z.enum(values)));

/** Multipart / form values arrive as strings: "true"/"false" → boolean. */
export const formBoolean = z
  .union([z.boolean(), z.enum(["true", "false", "1", "0"])])
  .transform((value) => value === true || value === "true" || value === "1");
