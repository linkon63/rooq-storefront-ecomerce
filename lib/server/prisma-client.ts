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
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}
