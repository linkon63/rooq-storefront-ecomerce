import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { colorRefSelect, sizeRefSelect } from "@/lib/server/catalog/selects";
import { mediaRefSelect } from "@/lib/server/media/select";
import { customerRefSelect } from "@/lib/server/orders/select";

const itemsInclude = {
  orderBy: { createdAt: "asc" },
  include: {
    product: {
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        media: { select: { colorId: true, position: true, isPrimary: true, media: { select: mediaRefSelect } } },
      },
    },
    variant: {
      select: {
        id: true,
        sku: true,
        price: true,
        stock: true,
        colorId: true,
        color: { select: colorRefSelect },
        size: { select: sizeRefSelect },
      },
    },
  },
} as const satisfies Prisma.WholesaleOrderRequest$itemsArgs;

const orderRefSelect = { select: { id: true, orderNumber: true, status: true, total: true } } as const;

/** List rows. */
export const wholesaleInclude = {
  user: { select: customerRefSelect },
  items: itemsInclude,
  order: orderRefSelect,
} as const satisfies Prisma.WholesaleOrderRequestInclude;

/** Detail rows add the customer's saved addresses (the convert form picks one). */
export const wholesaleDetailInclude = {
  user: { select: { ...customerRefSelect, addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] } } },
  items: itemsInclude,
  order: orderRefSelect,
} as const satisfies Prisma.WholesaleOrderRequestInclude;
