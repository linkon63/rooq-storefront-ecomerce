import { messageFromErrorBody } from "@/utils/api-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

const SUBMIT_TIMEOUT_MS = 60_000;

/** POST /api/v1/gallery (public multipart). Resolves with the server's thank-you message. */
export async function submitGalleryEntry(form: FormData): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);
  try {
    const response = await fetch("/api/v1/gallery", { method: "POST", body: form, signal: controller.signal });
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new Error(messageFromErrorBody(body, response.status));
    const message = typeof body === "object" && body !== null && "message" in body ? (body as { message: unknown }).message : null;
    return typeof message === "string" ? message : "";
  } catch (error) {
    if (error instanceof Error && error.name !== "AbortError") throw error;
    throw new Error(ERROR_MESSAGES.gallery.submitFailed);
  } finally {
    clearTimeout(timer);
  }
}
