import "server-only";
import type { NextRequest } from "next/server";
import type { Prisma } from "@/lib/generated/prisma/client";
import { MAX_PAGE_SIZE } from "@/lib/constants/pagination";
import { prisma } from "../prisma";

type ActivityDb = Pick<Prisma.TransactionClient, "activityLog">;

export type LogActivityInput = {
  action: string;
  userId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
};

/** Client IP from the proxy headers Vercel / nginx set. */
export function requestIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;
}

/**
 * Appends one audit row. Never throws — an audit failure must not undo the
 * change it describes — unless it runs inside a caller's transaction (`db`).
 */
export async function logActivity(input: LogActivityInput, db?: ActivityDb): Promise<void> {
  const data = {
    action: input.action,
    userId: input.userId ?? null,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    metadata: input.metadata,
    ipAddress: input.ipAddress ?? null,
  };
  if (db) {
    await db.activityLog.create({ data });
    return;
  }
  try {
    await prisma.activityLog.create({ data });
  } catch (error) {
    console.error("[activity-log] write failed", error);
  }
}

const userRef = { select: { id: true, name: true, email: true } } as const;

/** GET /activity-logs — newest first, capped at `limit` (default and max 200). */
export function listActivityLogs(limit = MAX_PAGE_SIZE) {
  return prisma.activityLog.findMany({
    include: { user: userRef },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, MAX_PAGE_SIZE),
  });
}

/** GET /activity-logs/user/:userId */
export function listActivityLogsByUser(userId: string, limit = MAX_PAGE_SIZE) {
  return prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, MAX_PAGE_SIZE),
  });
}
