import "server-only";
import { createPrismaClient, type AppPrismaClient } from "./prisma-client";

const globalForPrisma = globalThis as unknown as { __rooqPrisma?: AppPrismaClient };

/**
 * The one PrismaClient for the app. Cached on globalThis so Next's dev-mode
 * hot reloads do not open a new connection pool on every edit.
 */
export const prisma: AppPrismaClient = globalForPrisma.__rooqPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__rooqPrisma = prisma;
}
