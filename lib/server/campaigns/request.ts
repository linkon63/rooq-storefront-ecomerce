import "server-only";
import type { NextRequest } from "next/server";
import type { ZodType, z } from "zod";
import { formFields, isMultipart } from "@/utils/form-fields";
import { assertImageFile, readFormData } from "../media/upload";
import { parseBody, parseValue } from "../validation";

/** A campaign body: multipart (fields + `images` files) or JSON. */
export async function readCampaignRequest<S extends ZodType>(
  request: NextRequest,
  schema: S,
): Promise<{ input: z.output<S>; files: File[] }> {
  if (!isMultipart(request.headers.get("content-type"))) {
    return { input: await parseBody(request, schema), files: [] };
  }
  const form = await readFormData(request);
  const files = form
    .getAll("images")
    .filter((entry): entry is File => typeof entry !== "string" && entry.size > 0)
    .map((file) => assertImageFile(file));
  return { input: parseValue(formFields(form, ["images"]), schema), files };
}
