import "server-only";
import type { NextRequest } from "next/server";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { HttpError } from "./http-error";

const hits = new Map<string, number[]>();

/** Best-effort client address behind a proxy (first x-forwarded-for entry). */
export function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

/**
 * Per-instance sliding-window limiter for public write endpoints. It is a
 * brake against casual spam, not a security boundary (each serverless
 * instance keeps its own counter). Throws 429 once `limit` hits land in `windowMs`.
 */
export function assertWithinRateLimit(scope: string, key: string, limit: number, windowMs: number): void {
  const id = `${scope}:${key}`;
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) throw new HttpError(429, ERROR_MESSAGES.common.tooManyRequests);
  recent.push(now);
  hits.set(id, recent);
  if (hits.size > 5000) for (const [stale, times] of hits) if (times.every((time) => now - time >= windowMs)) hits.delete(stale);
}
