import "server-only";
import type { NextRequest } from "next/server";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/constants/media";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { badRequest, payloadTooLarge, unsupportedMediaType } from "../http-error";

/** Reads multipart form data, or 400s when the request is not multipart. */
export async function readFormData(request: NextRequest): Promise<FormData> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("multipart/form-data")) throw badRequest(ERROR_MESSAGES.upload.multipartRequired);
  try {
    return await request.formData();
  } catch {
    throw badRequest(ERROR_MESSAGES.upload.multipartRequired);
  }
}

/** Checks a File against the 5 MB limit and the allowed image types. */
export function assertImageFile(value: FormDataEntryValue | null): File {
  if (!value || typeof value === "string") throw badRequest(ERROR_MESSAGES.upload.fileRequired);
  if (value.size > MAX_UPLOAD_BYTES) throw payloadTooLarge(ERROR_MESSAGES.upload.tooLarge(MAX_UPLOAD_MB));
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(value.type)) {
    throw unsupportedMediaType(ERROR_MESSAGES.upload.unsupportedType(ALLOWED_IMAGE_MIME_TYPES.join(", ")));
  }
  return value;
}

/** File → Buffer for sharp. */
export async function fileToBuffer(file: File): Promise<Buffer> {
  return Buffer.from(await file.arrayBuffer());
}

/** Every image file under `field` (e.g. multiple review photos). */
export function imageFiles(form: FormData, field: string): File[] {
  return form.getAll(field).map((entry) => assertImageFile(entry));
}
