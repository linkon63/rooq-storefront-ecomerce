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
  const client = new PrismaClient({ adapter }).$extends({
    query: {
      $allOperations: async ({ args, query }) => withConnectRetry(() => query(args)),
    },
  });
  // The extension keeps the same API surface; cast keeps `AppPrismaClient` stable.
  return client as unknown as PrismaClient;
}

const TRANSIENT_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024", "P2037"]);
const TRANSIENT_MESSAGE = /failed to connect|upstream|econnreset|econnrefused|terminated|timeout|too many/i;

function isTransient(error: unknown): boolean {
  const e = error as { code?: unknown; message?: unknown };
  if (typeof e?.code === "string" && TRANSIENT_CODES.has(e.code)) return true;
  return typeof e?.message === "string" && TRANSIENT_MESSAGE.test(e.message);
}

/** Retries a query a few times when the hosted DB drops or refuses the connection. */
async function withConnectRetry<T>(run: () => Promise<T>, attempts = 4): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await run();
    } catch (error) {
      if (i >= attempts || !isTransient(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 150 * i));
    }
  }
}
