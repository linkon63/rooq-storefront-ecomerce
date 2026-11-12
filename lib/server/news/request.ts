import "server-only";
import type { NextRequest } from "next/server";
import type { ZodType, z } from "zod";
import { formFields, isMultipart } from "@/utils/form-fields";
import { assertImageFile, readFormData } from "../media/upload";
import { parseBody, parseValue } from "../validation";

/** A news body: multipart (fields + optional `image` file) or JSON. */
export async function readNewsRequest<S extends ZodType>(
  request: NextRequest,
  schema: S,
): Promise<{ input: z.output<S>; file: File | null }> {
  if (!isMultipart(request.headers.get("content-type"))) {
    return { input: await parseBody(request, schema), file: null };
  }
  const form = await readFormData(request);
  const image = form.get("image");
  const file = image && typeof image !== "string" && image.size > 0 ? assertImageFile(image) : null;
  return { input: parseValue(formFields(form, ["image"]), schema), file };
}
