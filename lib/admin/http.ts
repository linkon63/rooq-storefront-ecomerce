import { sendRequest, ApiError } from "@/lib/api";
import { ADMIN_TOKEN_COOKIE, REMEMBER_ME_MAX_AGE } from "@/lib/constants/auth";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { API_PREFIX } from "@/lib/constants/storefront";
import type { AdminUser } from "@/types/admin/catalog";
import { compressFormImages } from "@/lib/compress-image";

/**
 * Admin browser client. Same transport and error mapping as the storefront
 * client (`sendRequest` in lib/api.ts); only the token differs — the admin
 * sends `admin_access_token` (a cookie scoped to /admin) as a Bearer header.
 */

const ADMIN_USER_COOKIE = "admin_user";
const ADMIN_COOKIE_PATH = "/admin";
const DEFAULT_TIMEOUT_MS = 10_000;

export type RequestOptions = RequestInit & {
  /** Send the admin token (default true). */
  auth?: boolean;
  /** Abort after this many ms (default 10 s; uploads and bulk edits need longer). */
  timeoutMs?: number;
};

export enum ReportFormat {
  JSON = "json",
  CSV = "csv",
  PDF = "pdf",
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie.split("; ").find((entry) => entry.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.slice(name.length + 1)) : null;
}

export function getAdminToken(): string | null {
  return readCookie(ADMIN_TOKEN_COOKIE);
}

export function setAdminSession(accessToken: string, user: AdminUser): void {
  const attrs = `path=${ADMIN_COOKIE_PATH}; max-age=${REMEMBER_ME_MAX_AGE}; SameSite=Lax`;
  document.cookie = `${ADMIN_TOKEN_COOKIE}=${encodeURIComponent(accessToken)}; ${attrs}`;
  document.cookie = `${ADMIN_USER_COOKIE}=${encodeURIComponent(JSON.stringify(user))}; ${attrs}`;
}

export function clearAdminSession(): void {
  document.cookie = `${ADMIN_TOKEN_COOKIE}=; path=${ADMIN_COOKIE_PATH}; max-age=0; SameSite=Lax`;
  document.cookie = `${ADMIN_USER_COOKIE}=; path=${ADMIN_COOKIE_PATH}; max-age=0; SameSite=Lax`;
}

/** `{ method, JSON body }` — the init every JSON write uses. */
export function jsonInit(method: "POST" | "PATCH" | "PUT", body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

function authHeaders(init: HeadersInit | undefined, auth: boolean): Headers {
  const headers = new Headers(init);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  const token = auth ? getAdminToken() : null;
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

/**
 * JSON request to `/api/v1<path>`. Throws `ApiError` with a toast-safe message.
 * Images in a FormData body are shrunk in the browser first (compressImage).
 */
export async function apiRequest<T>(
  path: string,
  { auth = true, headers, timeoutMs = DEFAULT_TIMEOUT_MS, body, ...options }: RequestOptions = {},
): Promise<T> {
  const payload = body instanceof FormData ? await compressFormImages(body) : body;
  return sendRequest<T>(`${API_PREFIX}${path}`, { ...options, body: payload, headers: authHeaders(headers, auth) }, timeoutMs);
}

/** Raw response (file downloads). Throws `ApiError` on a non-2xx status. */
export async function apiRequestRaw(path: string, { auth = true, headers, ...options }: RequestOptions = {}): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${API_PREFIX}${path}`, { ...options, headers: authHeaders(headers, auth) });
  } catch {
    throw new ApiError(ERROR_MESSAGES.ui.network, 0);
  }
  if (!response.ok) throw new ApiError(ERROR_MESSAGES.ui.downloadFailed(response.status), response.status);
  return response;
}
