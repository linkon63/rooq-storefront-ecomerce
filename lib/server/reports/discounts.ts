import "server-only";
import { toNumber, toNumberOrNull } from "@/utils/decimal";
import { fixed2, isoDate, orderCustomerName, reportMoney } from "@/utils/reports/format";
import { round2, type ReportRange } from "@/utils/reports/date-range";
import { prisma } from "../prisma";
import { discountedOrdersIn, meta, orderCustomerSelect, paidOrdersIn, pagingWindow } from "./shared";
import type { ExportDocument, Paging } from "./types";

const discountedOrderSelect = {
  id: true,
  orderNumber: true,
  discount: true,
  productDiscount: true,
  total: true,
  placedAt: true,
  ...orderCustomerSelect,
} as const;

function couponsActiveSince(range: ReportRange) {
  return prisma.coupon.findMany({
    where: { OR: [{ expiresAt: null }, { expiresAt: { gte: range.start } }] },
    orderBy: { usedCount: "desc" },
  });
}

export async function discountsSummary(range: ReportRange) {
  const [totals, totalCoupons] = await Promise.all([
    prisma.order.aggregate({ where: discountedOrdersIn(range), _sum: { discount: true, productDiscount: true }, _count: true }),
    prisma.coupon.count({ where: { OR: [{ expiresAt: null }, { expiresAt: { gte: range.start } }] } }),
  ]);
  const coupon = toNumber(totals._sum.discount);
  const product = toNumber(totals._sum.productDiscount);
  return {
    // Coupons and product offers are both money the shop gave away.
    totalDiscountGiven: round2(coupon + product),
    totalCouponDiscount: round2(coupon),
    totalProductDiscount: round2(product),
    ordersWithDiscount: totals._count,
    totalCoupons,
    period: { start: range.start, end: range.end },
  };
}

/** Which product offers applied to products sold (paid) in the window. */
async function productDiscountBreakdown(range: ReportRange) {
  const sold = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { productId: { not: null }, order: paidOrdersIn(range) },
    _sum: { quantity: true, totalPrice: true },
    _max: { productName: true },
  });
  const soldById = new Map(
    sold.flatMap((group) =>
      group.productId
        ? [[group.productId, {
            productId: group.productId,
            productName: group._max.productName ?? "",
            totalSold: group._sum.quantity ?? 0,
            revenue: round2(toNumber(group._sum.totalPrice)),
          }] as const]
        : [],
    ),
  );
  if (soldById.size === 0) return [];

  const links = await prisma.discountProduct.findMany({
    where: { productId: { in: [...soldById.keys()] } },
    include: { discount: true },
  });
  const groups = new Map<string, { discount: (typeof links)[number]["discount"]; products: NonNullable<ReturnType<typeof soldById.get>>[] }>();
  for (const link of links) {
    const product = soldById.get(link.productId);
    if (!product) continue;
    const group = groups.get(link.discountId) ?? { discount: link.discount, products: [] };
    group.products.push(product);
    groups.set(link.discountId, group);
  }
  return [...groups.values()].map(({ discount, products }) => ({
    discountId: discount.id,
    discountName: discount.name,
    type: discount.type,
    value: toNumber(discount.value),
    status: discount.status,
    startDate: discount.startDate,
    endDate: discount.endDate,
    products,
  }));
}

export async function getDiscountReport(range: ReportRange, paging: Paging) {
  const [summary, coupons, orders, breakdown] = await Promise.all([
    discountsSummary(range),
    couponsActiveSince(range),
    prisma.order.findMany({
      where: discountedOrdersIn(range),
      select: discountedOrderSelect,
      orderBy: { placedAt: "desc" },
      ...pagingWindow(paging),
    }),
    productDiscountBreakdown(range),
  ]);

  return {
    summary,
    couponBreakdown: coupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: toNumber(coupon.value),
      usedCount: coupon.usedCount,
      maxUsage: coupon.maxUsage,
      minOrderAmount: toNumberOrNull(coupon.minOrderAmount),
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt,
    })),
    discountedOrders: {
      items: orders.map((order) => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customer: orderCustomerName(order),
        discountAmount: round2(toNumber(order.discount) + toNumber(order.productDiscount)),
        couponDiscount: toNumber(order.discount),
        productDiscount: toNumber(order.productDiscount),
        orderTotal: toNumber(order.total),
        placedAt: order.placedAt,
      })),
      meta: meta(paging, summary.ordersWithDiscount),
    },
    productDiscountBreakdown: breakdown,
  };
}

export async function discountsExport(range: ReportRange): Promise<ExportDocument> {
  const [summary, coupons, orders] = await Promise.all([
    discountsSummary(range),
    couponsActiveSince(range),
    prisma.order.findMany({ where: discountedOrdersIn(range), select: discountedOrderSelect, orderBy: { placedAt: "desc" } }),
  ]);
  const discountOf = (o: (typeof orders)[number]) => toNumber(o.discount) + toNumber(o.productDiscount);
  return {
    title: "Discount Report",
    filename: "discount-report",
    range,
    summary: [
      ["Total Discount Given", reportMoney(summary.totalDiscountGiven)],
      ["Orders with Discount", String(summary.ordersWithDiscount)],
      ["Total Coupons", String(summary.totalCoupons)],
    ],
    tables: [
      {
        heading: "Coupons",
        headers: ["Code", "Type", "Value", "Used", "Max Usage", "Expires"],
        rows: coupons.map((c) => [
          c.code, c.type, fixed2(toNumber(c.value)), String(c.usedCount),
          c.maxUsage === null ? "Unlimited" : String(c.maxUsage), c.expiresAt ? isoDate(c.expiresAt) : "Never",
        ]),
      },
      {
        heading: "Discounted Orders",
        headers: ["Order", "Customer", "Coupon", "Offer", "Total", "Date"],
        rows: orders.map((o) => [
          o.orderNumber, orderCustomerName(o), fixed2(toNumber(o.discount)), fixed2(toNumber(o.productDiscount)),
          fixed2(toNumber(o.total)), isoDate(o.placedAt),
        ]),
        formats: ["csv"],
      },
      {
        heading: "Discounted Orders",
        headers: ["Order", "Customer", "Discount", "Total", "Date"],
        rows: orders.map((o) => [o.orderNumber, orderCustomerName(o), reportMoney(discountOf(o)), reportMoney(toNumber(o.total)), isoDate(o.placedAt)]),
        formats: ["pdf"],
      },
    ],
  };
}
