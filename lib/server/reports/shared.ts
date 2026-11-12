import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { STAFF_ROLES } from "@/lib/constants/auth";
import type { ReportRange } from "@/utils/reports/date-range";
import type { Paging } from "./types";

export const inRange = (range: ReportRange) => ({ gte: range.start, lte: range.end });

export const pagingWindow = ({ page, limit }: Paging) => ({ skip: (page - 1) * limit, take: limit });

export const meta = ({ page, limit }: Paging, total: number) => ({ page, limit, total });

/** Shoppers only (no staff), not deleted. */
export const customerWhere: Prisma.UserWhereInput = {
  deletedAt: null,
  OR: [{ roleId: null }, { role: { name: { notIn: [...STAFF_ROLES] } } }],
};

export const paidOrdersIn = (range: ReportRange): Prisma.OrderWhereInput => ({
  paymentStatus: "paid",
  placedAt: inRange(range),
});

export const discountedOrdersIn = (range: ReportRange): Prisma.OrderWhereInput => ({
  OR: [{ discount: { gt: 0 } }, { productDiscount: { gt: 0 } }],
  placedAt: inRange(range),
});

/** Order → customer label inputs. */
export const orderCustomerSelect = {
  user: { select: { name: true } },
  shippingAddress: { select: { fullName: true } },
} as const;
