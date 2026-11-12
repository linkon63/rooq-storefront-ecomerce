import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { Notification, Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "../prisma";
import { notFound } from "../http-error";
import type { CreateNotificationInput } from "./schemas";

type NotificationDb = Pick<Prisma.TransactionClient, "notification">;

/**
 * Creates one in-app notification. Other services (orders, returns,
 * back-in-stock) call this inside their own transaction by passing `db`.
 */
export function createNotification(input: CreateNotificationInput, db: NotificationDb = prisma): Promise<Notification> {
  return db.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type ?? "SYSTEM",
      link: input.link ?? null,
    },
  });
}

export function listNotifications(userId: string): Promise<Notification[]> {
  return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

async function findOwned(userId: string, id: string): Promise<Notification> {
  const notification = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notification) throw notFound(ERROR_MESSAGES.notification.notFound(id));
  return notification;
}

export async function markRead(userId: string, id: string): Promise<Notification> {
  const notification = await findOwned(userId, id);
  if (notification.isRead) return notification;
  return prisma.notification.update({ where: { id }, data: { isRead: true, readAt: new Date() } });
}

/** `{ count }` — what Prisma's updateMany answered in the old endpoint. */
export function markAllRead(userId: string): Promise<{ count: number }> {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() } });
}

export async function removeNotification(userId: string, id: string): Promise<{ message: string }> {
  await findOwned(userId, id);
  await prisma.notification.delete({ where: { id } });
  return { message: SUCCESS_MESSAGES.common.deleted("Notification") };
}
