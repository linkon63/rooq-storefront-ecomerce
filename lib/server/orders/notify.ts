import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { NotificationType } from "@/lib/generated/prisma/enums";
import { STAFF_ROLES } from "@/lib/constants/auth";
import { prisma } from "@/lib/server/prisma";

type Db = Pick<Prisma.TransactionClient, "notification" | "user">;

export type NotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
};

/** In-app notification for one user (DB only, no email). */
export async function notifyUser(input: NotificationInput, db: Db = prisma): Promise<void> {
  await db.notification.create({ data: input });
}

/** Same notification for every active staff account (admin + superadmin). */
export async function notifyStaff(input: Omit<NotificationInput, "userId">, db: Db = prisma): Promise<void> {
  const staff = await db.user.findMany({
    where: { role: { name: { in: [...STAFF_ROLES] } }, isActive: true, deletedAt: null },
    select: { id: true },
  });
  if (!staff.length) return;
  await db.notification.createMany({ data: staff.map((user) => ({ ...input, userId: user.id })) });
}

/**
 * Notifications are a courtesy: a failure is logged and never undoes the
 * order, return or request that triggered it.
 */
export async function safely(task: () => Promise<void>, label: string): Promise<void> {
  try {
    await task();
  } catch (error) {
    console.error(`[notify] ${label} failed`, error);
  }
}
