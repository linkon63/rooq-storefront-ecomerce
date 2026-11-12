import "server-only";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/constants/auth";

/**
 * The access token on a request: `Authorization: Bearer …` first, then the
 * httpOnly `access_token` cookie. (The old backend read the cookie first, so
 * a stale storefront cookie shadowed the admin's Bearer token — fixed here.)
 */
export function tokenFromRequest(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    const value = header.slice(7).trim();
    if (value) return value;
  }
  return request.cookies.get(AUTH_COOKIE)?.value || null;
}
