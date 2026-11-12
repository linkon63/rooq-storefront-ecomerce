import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

/**
 * Pure port of the old AllExceptionsFilter's Prisma mapping: turns a Prisma
 * known-request error (code + meta) into the status and sentence an admin can
 * act on. No Prisma import — callers pass the plain fields.
 */

export type PrismaErrorShape = {
  code: string;
  meta?: Record<string, unknown>;
};

export type DescribedError = {
  status: number;
  error: string;
  message: string;
};

const FIELD_LABELS: Record<string, string> = { sku: "SKU", id: "ID", url: "URL" };
const PREFIX_SEGMENT = /^(api|v\d+)$/;
const ID_SEGMENT = /^[0-9a-f-]{16,}$/i;
const CAMEL_BOUNDARY = /([a-z0-9])([A-Z])/g;
const CONSTRAINT_SUFFIX = /_(key|fkey|unique|pkey|idx)$/;

const statusText = (status: number) =>
  ERROR_MESSAGES.httpStatus[status] ?? ERROR_MESSAGES.httpStatus[500];

export function sentenceCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Model name when Prisma reports one, otherwise the first URL segment ("/api/v1/units/:id" → "unit"). */
export function subjectOf(meta: Record<string, unknown> | undefined, pathname: string): string {
  const model = meta?.modelName;
  if (typeof model === "string" && model) {
    return model.replace(CAMEL_BOUNDARY, "$1 $2").toLowerCase();
  }
  const segment = pathname
    .split("?")[0]
    .split("/")
    .filter(Boolean)
    .filter((part) => !PREFIX_SEGMENT.test(part) && !ID_SEGMENT.test(part))
    .shift();
  if (!segment) return "record";
  return segment.replace(/-/g, " ").replace(/s$/, "");
}

/** `meta.driverAdapterError.cause.constraint` → ["sku"] or "units_code_key". */
function driverConstraint(meta: Record<string, unknown> | undefined): unknown {
  const adapterError = meta?.driverAdapterError as { cause?: unknown } | undefined;
  const cause = adapterError?.cause as { constraint?: unknown } | undefined;
  const constraint = cause?.constraint;
  if (typeof constraint === "string") return constraint;
  if (constraint && typeof constraint === "object") {
    const fields = (constraint as { fields?: unknown }).fields;
    if (Array.isArray(fields)) return fields.map(String);
    const index = (constraint as { index?: unknown }).index;
    if (typeof index === "string") return index;
  }
  return undefined;
}

/** "units_code_key" + subject "unit" → "code". */
export function stripConstraintName(constraint: string, subject: string): string {
  const withoutSuffix = constraint.replace(CONSTRAINT_SUFFIX, "");
  const table = subject.replace(/\s+/g, "_");
  // snake_case plural table names: product_variants, categories, addresses, media
  const prefixes = [`${table.replace(/y$/, "ies")}_`, `${table}es_`, `${table}s_`, `${table}_`];
  for (const prefix of prefixes) {
    if (withoutSuffix.startsWith(prefix)) return withoutSuffix.slice(prefix.length);
  }
  return withoutSuffix;
}

function fieldLabel(field: string): string {
  return FIELD_LABELS[field.toLowerCase()] ?? field;
}

/** The offending column(s), readable ("code", "SKU and barcode"), or null. */
export function fieldsOf(meta: Record<string, unknown> | undefined, subject: string): string | null {
  const target = meta?.target ?? meta?.field_name ?? driverConstraint(meta);
  const names = Array.isArray(target)
    ? target.map(String)
    : typeof target === "string"
      ? [stripConstraintName(target, subject)]
      : [];
  const cleaned = names.map((name) => fieldLabel(name.replace(/_/g, " ").trim())).filter(Boolean);
  return cleaned.length ? cleaned.join(" and ") : null;
}

export function describePrismaKnownError(
  error: PrismaErrorShape,
  method: string,
  pathname: string,
): DescribedError {
  const m = ERROR_MESSAGES.database;
  const subject = subjectOf(error.meta, pathname);
  const fields = fieldsOf(error.meta, subject);
  const sentenceFields = fields ? sentenceCase(fields) : null;

  switch (error.code) {
    case "P2002":
      return {
        status: 409,
        error: statusText(409),
        message: fields ? m.uniqueField(subject, fields, sentenceCase(fields)) : m.uniqueGeneric(subject),
      };
    case "P2003":
      return {
        status: 409,
        error: statusText(409),
        message: method === "DELETE" ? m.foreignKeyDelete(subject) : m.foreignKeyMissing(subject, fields),
      };
    case "P2014":
      return { status: 409, error: statusText(409), message: m.requiredRelation(subject) };
    case "P2000":
      return { status: 400, error: statusText(400), message: m.valueTooLong(subject, fields) };
    case "P2011":
      return { status: 400, error: statusText(400), message: m.nullViolation(subject, sentenceFields) };
    case "P2005":
    case "P2006":
    case "P2007":
      return { status: 400, error: statusText(400), message: m.invalidValue(subject, fields) };
    case "P2001":
    case "P2015":
    case "P2018":
    case "P2025":
      return { status: 404, error: statusText(404), message: m.recordGone(subject) };
    default:
      return { status: 400, error: statusText(400), message: m.rejected(error.code) };
  }
}
