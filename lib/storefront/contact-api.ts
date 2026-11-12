import { messageFromErrorBody } from "@/utils/api-error";

type ContactInput = { firstName: string; phoneNumber: string; email?: string; message: string };

/** POST /api/contact (store inbox). Answers `{ success, message }`. */
export async function sendContactMessage(input: ContactInput): Promise<void> {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new Error(messageFromErrorBody(body, response.status));
  }
}
