import { jwtVerify } from "jose";

/**
 * Signature + expiry check for proxy.ts. Deliberately DB-free (the proxy runs
 * on every /admin navigation); the role check still happens in the admin
 * shell via /auth/me and on every API call.
 */
export async function isTokenValid(token: string | undefined): Promise<boolean> {
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}
