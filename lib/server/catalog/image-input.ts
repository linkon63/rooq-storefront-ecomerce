import "server-only";
import type { NextRequest } from "next/server";
import type { ZodType, z } from "zod";
import { parseBody, parseValue } from "@/lib/server/validation";
import { assertImageFile, fileToBuffer, readFormData } from "@/lib/server/media/upload";
import { saveImage } from "@/lib/server/media/save-image";
import { formFields, isMultipart } from "./access";

/**
 * Old FileInterceptor endpoints (category `image`, brand `logo`): accepts
 * multipart (string fields + optional file) or JSON. A sent file is stored
 * as Media and its id returned.
 */
export async function readBodyWithImage<S extends ZodType>(
  request: NextRequest,
  schema: S,
  fileField: string,
  userId: string,
): Promise<{ body: z.output<S>; uploadedMediaId?: string }> {
  if (!isMultipart(request)) return { body: await parseBody(request, schema) };
  const form = await readFormData(request);
  const fields = formFields(form);
  const body = parseValue(fields, schema);
  const entry = form.get(fileField);
  if (!entry || typeof entry === "string" || entry.size === 0) return { body };
  const file = assertImageFile(entry);
  const saved = await saveImage(await fileToBuffer(file), { uploadedById: userId });
  return { body, uploadedMediaId: saved.id };
}
