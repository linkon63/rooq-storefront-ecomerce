import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { CurrentUser } from "@/lib/server/auth/current-user";
import { notFound } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import { isStaffRole } from "@/utils/roles";
import { pageWindow, buildPaginationMeta } from "@/utils/pagination";
import { toOrderResponse } from "@/utils/mappers/order";
import type { OrderResponse, PaginatedOrdersResponse } from "@/types/commerce/order";
import type { ListOrdersQuery } from "./schemas";
import { orderInclude } from "./select";

type Db = Pick<Prisma.TransactionClient, "order">;

export const isStaff = (user: Pick<CurrentUser, "role"> | null | undefined) => isStaffRole(user?.role?.name);

/** One order as the API answers it; 404 when it does not exist. */
export async function loadOrder(id: string, db: Db = prisma): Promise<OrderResponse> {
  const row = await db.order.findUnique({ where: { id }, include: orderInclude });
  if (!row) throw notFound(ERROR_MESSAGES.order.notFound(id));
  return toOrderResponse(row);
}

/**
 * GET /orders/:id. Staff see any order; a customer only their own (another
 * customer's order answers 404 so ids cannot be probed).
 */
export async function getOrderFor(id: string, user: CurrentUser): Promise<OrderResponse> {
  const order = await loadOrder(id);
  if (!isStaff(user) && order.userId !== user.id) throw notFound(ERROR_MESSAGES.order.notFound(id));
  return order;
}

function searchWhere(search: string): Prisma.OrderWhereInput {
  const contains = { contains: search, mode: "insensitive" as const };
  return {
    OR: [
      { orderNumber: contains },
      { invoiceNumber: contains },
      { couponCode: contains },
      { user: { name: contains } },
      { user: { phone: contains } },
      { user: { email: contains } },
      { shippingAddress: { is: { fullName: contains } } },
      { shippingAddress: { is: { phone: contains } } },
      { shippingAddress: { is: { email: contains } } },
    ],
  };
}

/** GET /orders (staff): search, filters, pagination — newest first. */
export async function listOrders(query: ListOrdersQuery): Promise<PaginatedOrdersResponse> {
  const { page, limit, skip, take } = pageWindow(query.page, query.limit);
  const where: Prisma.OrderWhereInput = {
    ...(query.search ? searchWhere(query.search) : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
    ...(query.orderType ? { orderType: query.orderType } : {}),
    ...(query.from || query.to ? { placedAt: { gte: query.from, lte: query.to } } : {}),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.order.findMany({ where, include: orderInclude, orderBy: { placedAt: "desc" }, skip, take }),
    prisma.order.count({ where }),
  ]);
  return { data: rows.map(toOrderResponse), meta: buildPaginationMeta({ page, limit, total }) };
}

/** GET /orders/my-orders — the signed-in customer's orders, newest first (array, like the old API). */
export async function myOrders(userId: string): Promise<OrderResponse[]> {
  const rows = await prisma.order.findMany({ where: { userId }, include: orderInclude, orderBy: { placedAt: "desc" } });
  return rows.map(toOrderResponse);
}
