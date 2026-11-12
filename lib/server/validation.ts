import "server-only";
import type { NextRequest } from "next/server";
import { z, type ZodType } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { formatZodIssues } from "@/utils/zod-messages";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/constants/pagination";
import { HttpError } from "./http-error";

/**
 * zod parsing for route handlers. Failures throw HttpError(400) whose
 * `message` is an array, like Nest's ValidationPipe.
 *
 * Use `z.strictObject({...})` for bodies — unknown keys are rejected with
 * "property x should not exist" (= whitelist + forbidNonWhitelisted).
 */

function parseWith<S extends ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new HttpError(400, formatZodIssues(result.error.issues));
  }
  return result.data;
}

/** Validate a JSON body. An empty body is treated as `{}`. */
export async function parseBody<S extends ZodType>(request: Request, schema: S): Promise<z.output<S>> {
  const text = await request.text();
  let json: unknown = {};
  if (text.trim()) {
    try {
      json = JSON.parse(text);
    } catch {
      throw new HttpError(400, ERROR_MESSAGES.common.invalidJson);
    }
  }
  return parseWith(schema, json);
}

/** searchParams → object (repeated keys become arrays). Use z.coerce for numbers/booleans. */
export function searchParamsToObject(params: URLSearchParams): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    out[key] = values.length > 1 ? values : values[0];
  }
  return out;
}

export function parseQuery<S extends ZodType>(request: NextRequest, schema: S): z.output<S> {
  return parseWith(schema, searchParamsToObject(request.nextUrl.searchParams));
}

/** Validate already-awaited route params (route() awaits them for you). */
export function parseParams<S extends ZodType>(params: unknown, schema: S): z.output<S> {
  return parseWith(schema, params);
}

/** Validate any value (e.g. fields pulled out of multipart FormData). */
export function parseValue<S extends ZodType>(value: unknown, schema: S): z.output<S> {
  return parseWith(schema, value);
}

// ---- reusable schema pieces --------------------------------------------

export const idParam = z.strictObject({ id: z.uuid({ error: ERROR_MESSAGES.common.invalidId }) });

/** `?page=&limit=` with the UI's defaults; spread into a list query schema. */
export const paginationQuery = {
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE).optional(),
};

/** Query-string boolean: "true"/"1" → true, "false"/"0" → false. */
export const queryBoolean = z
  .enum(["true", "false", "1", "0"])
  .transform((value) => value === "true" || value === "1");

/** A value that may arrive once (`?size=M`) or repeated / comma-joined (`?size=M&size=L`, `?size=M,L`). */
export const queryList = z
  .union([z.string(), z.array(z.string())])
  .transform((value) =>
    (Array.isArray(value) ? value : [value])
      .flatMap((item) => item.split(","))
      .map((item) => item.trim())
      .filter(Boolean),
  );
