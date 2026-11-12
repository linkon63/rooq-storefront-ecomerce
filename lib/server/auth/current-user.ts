import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { ADMIN_TOKEN_COOKIE, AUTH_COOKIE, CUSTOMER_TOKEN_COOKIE } from "@/lib/constants/auth";
import { prisma } from "../prisma";
import { roleSummarySelect } from "../users/select";
import { verifyAccessToken } from "./jwt";
import { tokenFromRequest } from "./token";

/** Same select as the old JwtStrategy.validate(). */
export const currentUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: { select: roleSummarySelect },
  createdAt: true,
  updatedAt: true,
} as const;

export type CurrentUser = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: { id: string; name: string; permissions: { id: string; name: string }[] } | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Loads the active (not disabled / deleted) user a token belongs to. */
export async function userFromToken(token: string | null | undefined): Promise<CurrentUser | null> {
  if (!token) return null;
  const userId = await verifyAccessToken(token);
  if (!userId) return null;
  return prisma.user.findFirst({
    where: { id: userId, isActive: true, deletedAt: null },
    select: currentUserSelect,
  });
}

/** Route handlers: user from Bearer header or access_token cookie. */
export function getCurrentUser(request: NextRequest): Promise<CurrentUser | null> {
  return userFromToken(tokenFromRequest(request));
}

/**
 * Server Components / Server Actions: the signed-in shopper, deduplicated per
 * request with React.cache. Reads Bearer, then access_token, then the
 * client-set customer_access_token cookie.
 */
export const getSessionUser = cache(async (): Promise<CurrentUser | null> => {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  const header = headerList.get("authorization");
  const bearer = header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
  const token =
    bearer || cookieStore.get(AUTH_COOKIE)?.value || cookieStore.get(CUSTOMER_TOKEN_COOKIE)?.value || null;
  return userFromToken(token);
});

/** Server Components under /admin: the staff user from the admin_access_token cookie. */
export const getAdminSessionUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieStore = await cookies();
  return userFromToken(cookieStore.get(ADMIN_TOKEN_COOKIE)?.value);
});
