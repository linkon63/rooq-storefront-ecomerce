import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

/** The `{ statusCode, message, error, path }` body every API error answers with. */
export type ApiErrorBody = { statusCode?: number; message?: string | string[]; error?: string };

function isErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === "object" && value !== null && "message" in value;
}

/** Human message from an API error body, falling back to a status-based message. */
export function messageFromErrorBody(body: unknown, status: number): string {
  if (isErrorBody(body)) {
    const { message } = body;
    if (Array.isArray(message) && message.length > 0) return message.join(". ");
    if (typeof message === "string" && message.trim()) return message;
  }
  return describeHttpStatus(status);
}

/** Wording for a failed response that carried no usable body (gateway page, proxy error). */
export function describeHttpStatus(status: number): string {
  const { common } = ERROR_MESSAGES;
  switch (status) {
    case 400:
      return common.badRequest;
    case 401:
      return common.sessionExpired;
    case 403:
      return common.forbidden;
    case 404:
      return common.notFound;
    case 409:
      return common.conflict;
    case 413:
      return common.payloadTooLarge;
    case 429:
      return common.tooManyRequests;
    case 502:
    case 503:
    case 504:
      return common.serviceUnavailable;
    default:
      return common.statusFallback(status);
  }
}

/** Message of any thrown value, or the given fallback. */
export function errorText(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
