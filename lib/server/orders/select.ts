import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { mediaRefSelect } from "@/lib/server/media/select";
import { colorRefSelect, sizeRefSelect } from "@/lib/server/catalog/selects";

/** The customer fields an order/return/wholesale response embeds. */
export const customerRefSelect = { id: true, name: true, email: true, phone: true } as const satisfies Prisma.UserSelect;

export const orderItemInclude = {
  imageMedia: { select: mediaRefSelect },
  product: { select: { id: true, name: true, slug: true } },
  variant: {
    select: { id: true, sku: true, isActive: true, color: { select: colorRefSelect }, size: { select: sizeRefSelect } },
  },
} as const satisfies Prisma.OrderItemInclude;

/** Everything `toOrderResponse()` (utils/mappers/order.ts) needs. */
export const orderInclude = {
  user: { select: customerRefSelect },
  address: true,
  shippingAddress: true,
  items: { include: orderItemInclude, orderBy: { createdAt: "asc" } },
  payments: { orderBy: { createdAt: "desc" } },
  shipments: { orderBy: { createdAt: "desc" } },
  statusLogs: { orderBy: { createdAt: "desc" }, include: { changedBy: { select: { id: true, name: true } } } },
} as const satisfies Prisma.OrderInclude;
