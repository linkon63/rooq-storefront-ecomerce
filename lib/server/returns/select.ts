import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { mediaRefSelect } from "@/lib/server/media/select";
import { colorRefSelect, sizeRefSelect } from "@/lib/server/catalog/selects";

/** Everything `toReturnResponse()` needs. */
export const returnInclude = {
  order: { select: { id: true, orderNumber: true, placedAt: true } },
  user: { select: { id: true, name: true, email: true } },
  items: {
    orderBy: { createdAt: "asc" },
    include: {
      orderItem: {
        select: {
          id: true,
          productName: true,
          sku: true,
          colorName: true,
          sizeLabel: true,
          unitPrice: true,
          quantity: true,
          imageMedia: { select: mediaRefSelect },
        },
      },
      exchangeVariant: { select: { id: true, sku: true, color: { select: colorRefSelect }, size: { select: sizeRefSelect } } },
    },
  },
} as const satisfies Prisma.ReturnRequestInclude;

/** The order facts a return is judged against: lines, delivery date, earlier claims. */
export const returnableOrderSelect = {
  id: true,
  userId: true,
  status: true,
  orderNumber: true,
  total: true,
  items: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      productId: true,
      variantId: true,
      productName: true,
      sku: true,
      colorName: true,
      sizeLabel: true,
      quantity: true,
      unitPrice: true,
      imageMedia: { select: mediaRefSelect },
      returnItems: { select: { quantity: true, returnRequest: { select: { status: true } } } },
    },
  },
  shipments: { where: { deliveredAt: { not: null } }, select: { deliveredAt: true }, orderBy: { deliveredAt: "desc" }, take: 1 },
  statusLogs: { where: { status: "delivered" }, select: { createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
} as const satisfies Prisma.OrderSelect;

export type ReturnableOrderRow = Prisma.OrderGetPayload<{ select: typeof returnableOrderSelect }>;
