import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { DEFAULT_JWT_EXPIRES_IN } from "@/lib/constants/auth";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

const ALG = "HS256";

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error(ERROR_MESSAGES.config.jwtSecretMissing);
  return new TextEncoder().encode(secret);
}

/** Access token with `{ sub: userId }`, same payload the Nest backend issued. */
export async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: ALG, typ: "JWT" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN)
    .sign(secretKey());
}

/** The user id inside a valid, unexpired token — or null. */
export async function verifyAccessToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: [ALG] });
    return typeof payload.sub === "string" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}
