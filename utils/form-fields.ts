/**
 * Text fields of a multipart body as a plain object, ready for a zod schema.
 * File entries and the listed keys (the file fields) are left out. A key
 * sent twice keeps its last value, like Nest's body parser.
 */
export function formFields(form: FormData, fileKeys: readonly string[] = []): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (fileKeys.includes(key) || typeof value !== "string") continue;
    fields[key] = value;
  }
  return fields;
}

/** Multipart booleans arrive as strings: "true" / "1" / "on" / "yes" → true. */
export function formBoolean(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const normalised = value.trim().toLowerCase();
  if (["true", "1", "on", "yes"].includes(normalised)) return true;
  if (["false", "0", "off", "no", ""].includes(normalised)) return false;
  return value;
}

/** True when the request body is multipart/form-data. */
export function isMultipart(contentType: string | null): boolean {
  return (contentType ?? "").includes("multipart/form-data");
}
