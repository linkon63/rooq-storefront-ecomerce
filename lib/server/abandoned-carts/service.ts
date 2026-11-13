import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { notFound } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import type { AbandonedCartInput } from "@/types/commerce/abandoned-cart";
import { toAdminAbandonedCart } from "@/utils/mappers/abandoned-cart";
import { buildPaginationMeta, pageWindow } from "@/utils/pagination";
import { normalizeBdPhone, phoneVariants } from "@/utils/phone";
import type { AbandonedCartListQuery } from "./schemas";

/**
 * Saves (or refreshes) the shopper's checkout-in-progress, keyed by the
 * browser's token. A cart already recovered by an order is left alone.
 */
export async function saveAbandonedCart(input: AbandonedCartInput): Promise<{ saved: boolean }> {
  const existing = await prisma.abandonedCart.findUnique({ where: { token: input.token }, select: { status: true } });
  if (existing?.status === "RECOVERED") return { saved: false };
  const subtotal = Math.round(input.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
  const data = {
    fullName: input.fullName,
    phone: normalizeBdPhone(input.phone),
    email: input.email ?? null,
    city: input.city ?? null,
    items: input.items as unknown as Prisma.InputJsonValue,
    itemCount: input.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
  };
  await prisma.abandonedCart.upsert({ where: { token: input.token }, create: { token: input.token, ...data }, update: data });
  return { saved: true };
}

/** An order was placed with this phone: its open carts count as recovered. */
export async function markAbandonedCartsRecovered(phone: string, orderNumber: string): Promise<void> {
  await prisma.abandonedCart.updateMany({
    where: { phone: { in: phoneVariants(phone) }, status: "OPEN" },
    data: { status: "RECOVERED", orderNumber, recoveredAt: new Date() },
  });
}

export async function listAbandonedCarts(query: AbandonedCartListQuery) {
  const { page, limit, skip, take } = pageWindow(query.page, query.limit);
  const where: Prisma.AbandonedCartWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.search
      ? { OR: [{ fullName: { contains: query.search, mode: "insensitive" } }, { phone: { contains: normalizeBdPhone(query.search) || query.search } }] }
      : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.abandonedCart.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
    prisma.abandonedCart.count({ where }),
  ]);
  return { data: rows.map(toAdminAbandonedCart), meta: buildPaginationMeta({ page, limit, total }) };
}

export async function removeAbandonedCart(id: string): Promise<void> {
  const { count } = await prisma.abandonedCart.deleteMany({ where: { id } });
  if (!count) throw notFound(ERROR_MESSAGES.abandonedCart.notFound(id));
}
