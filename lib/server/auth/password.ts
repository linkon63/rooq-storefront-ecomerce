import "server-only";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { BCRYPT_ROUNDS } from "@/lib/constants/auth";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** URL-safe random token (password reset, guest cart). */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** sha256 hex — how reset/session tokens are stored. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
