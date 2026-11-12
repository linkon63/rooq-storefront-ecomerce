import "server-only";
import type { NextResponse } from "next/server";
import { AUTH_COOKIE, REMEMBER_ME_MAX_AGE } from "@/lib/constants/auth";

const baseCookie = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
});

/** httpOnly access_token cookie — session cookie unless rememberMe (7 days). */
export function setAuthCookie(response: NextResponse, token: string, rememberMe?: boolean): NextResponse {
  response.cookies.set(AUTH_COOKIE, token, {
    ...baseCookie(),
    ...(rememberMe ? { maxAge: REMEMBER_ME_MAX_AGE } : {}),
  });
  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set(AUTH_COOKIE, "", { ...baseCookie(), maxAge: 0 });
  return response;
}
