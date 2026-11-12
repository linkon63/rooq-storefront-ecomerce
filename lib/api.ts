import { CUSTOMER_TOKEN_COOKIE } from "@/lib/constants/auth";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { API_PREFIX, API_TIMEOUT_MS } from "@/lib/constants/storefront";
import { messageFromErrorBody } from "@/utils/api-error";
import { withQuery, type QueryParams } from "@/utils/query-string";

/**
 * Browser client for the same-origin `/api/v1` routes. Sends the shopper's
 * token as a Bearer header (the httpOnly `access_token` cookie travels too),
 * parses JSON, and turns the `{ statusCode, message }` error body into an
 * `ApiError` whose message is safe to show in a toast.
 */

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: QueryParams;
  timeoutMs?: number;
};

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie.split("; ").find((entry) => entry.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.slice(name.length + 1)) : null;
}

export function getCustomerToken(): string | null {
  return readCookie(CUSTOMER_TOKEN_COOKIE);
}

export function setCustomerToken(token: string): void {
  document.cookie = `${CUSTOMER_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`;
}

export function clearCustomerToken(): void {
  document.cookie = `${CUSTOMER_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

function encodeBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  headers.set("Content-Type", "application/json");
  return JSON.stringify(body);
}

async function readPayload(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const type = response.headers.get("content-type") ?? "";
  if (type.includes("application/json")) return response.json().catch(() => null);
  return response.text();
}

/**
 * The one fetch transport both browser clients (storefront and admin) share:
 * timeout, JSON/text parsing, and the `{ statusCode, message }` → `ApiError`
 * mapping. Callers build the RequestInit (headers, body, auth).
 */
export async function sendRequest<T>(url: string, init: RequestInit, timeoutMs: number = API_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { credentials: "same-origin", ...init, signal: init.signal ?? controller.signal });
    const payload = await readPayload(response);
    if (!response.ok) throw new ApiError(messageFromErrorBody(payload, response.status), response.status);
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(ERROR_MESSAGES.ui.timeout, 0);
    }
    throw new ApiError(ERROR_MESSAGES.ui.network, 0);
  } finally {
    clearTimeout(timer);
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, query, timeoutMs = API_TIMEOUT_MS, headers: init, ...rest } = options;
  const headers = new Headers(init);
  headers.set("Accept", "application/json");
  const token = getCustomerToken();
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  const url = withQuery(`${API_PREFIX}${path}`, query ?? {});
  return sendRequest<T>(url, { ...rest, headers, body: encodeBody(body, headers) }, timeoutMs);
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
