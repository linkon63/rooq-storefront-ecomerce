import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

export type AppPrismaClient = PrismaClient;

/**
 * Builds a PrismaClient on the pg driver adapter. Kept free of "server-only"
 * so scripts (seed, smoke tests) can share it; app code imports `prisma` from
 * lib/server/prisma instead.
 */
export function createPrismaClient(connectionString = process.env.DATABASE_URL): PrismaClient {
  if (!connectionString) {
    throw new Error(ERROR_MESSAGES.config.databaseUrlMissing);
  }
  const adapter = new PrismaPg({
    connectionString,
    // Small pool: the hosted Postgres caps connections (P2037), and every
    // serverless instance plus local dev opens its own pool.
    max: Number(process.env.DATABASE_POOL_MAX ?? 3),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
  return new PrismaClient({ adapter });
}
