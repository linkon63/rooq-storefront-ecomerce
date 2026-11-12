import "server-only";
import { Prisma } from "@/lib/generated/prisma/client";
import { STAFF_ROLES } from "@/lib/constants/auth";
import { metric, resolveDashboardRange, truncUnit, type Metric } from "@/utils/dashboard/date-range";
import { toNumber } from "@/utils/decimal";
import { mediaSrc } from "@/utils/media-url";
import { toLowStockAlert, type LowStockAlert } from "@/utils/mappers/dashboard";
import { prisma } from "../prisma";
import { findLowStockVariants, lowStockWhere, primaryImageSelect } from "./queries";
import type { DashboardQuery } from "./schemas";

const LOW_STOCK_ALERT_LIMIT = 8;
const RECENT_ORDER_LIMIT = 8;
const TOP_PRODUCT_LIMIT = 5;

/** Shoppers only — staff accounts are not "customers". */
const customerWhere: Prisma.UserWhereInput = {
  deletedAt: null,
  OR: [{ roleId: null }, { role: { name: { notIn: [...STAFF_ROLES] } } }],
};

type Window = { gte: Date; lte: Date };

function windowFigures(range: Window) {
  return Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid", placedAt: range } }),
    prisma.order.count({ where: { placedAt: range } }),
    prisma.order.count({ where: { status: "pending", placedAt: range } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "refunded", placedAt: range } }),
    prisma.user.count({ where: { ...customerWhere, createdAt: range } }),
  ]).then(([sales, orders, pending, refunds, customers]) => ({
    sales: toNumber(sales._sum.total),
    orders,
    pending,
    refunds: toNumber(refunds._sum.total),
    customers,
  }));
}

export type DashboardSummary = {
  range: { start: Date; end: Date };
  totalSales: Metric;
  totalOrders: Metric;
  pendingOrders: Metric;
  avgOrderValue: Metric;
  refundAmount: Metric;
  newCustomers: Metric;
  lowStockProducts: Metric;
  totalCustomers: Metric;
  totalProducts: Metric;
  openReturnRequests: Metric;
  backInStockRequests: Metric;
  lowStockAlerts: LowStockAlert[];
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    placedAt: Date;
    user: { id: string; name: string; email: string | null } | null;
  }[];
};

/** GET /dashboard/summary — KPIs with trends, fashion alerts, recent orders. */
export async function getSummary(query: DashboardQuery): Promise<DashboardSummary> {
  const { start, end, prevStart, prevEnd } = resolveDashboardRange(query);
  const [cur, prev, totalCustomers, totalProducts, lowStockCount, openReturns, backInStock, lowStock, recentOrders] =
    await Promise.all([
      windowFigures({ gte: start, lte: end }),
      windowFigures({ gte: prevStart, lte: prevEnd }),
      prisma.user.count({ where: customerWhere }),
      prisma.product.count({ where: { archivedAt: null } }),
      prisma.productVariant.count({ where: lowStockWhere() }),
      prisma.returnRequest.count({ where: { status: "REQUESTED" } }),
      prisma.backInStockRequest.count({ where: { status: "PENDING" } }),
      findLowStockVariants(LOW_STOCK_ALERT_LIMIT),
      prisma.order.findMany({
        take: RECENT_ORDER_LIMIT,
        where: { placedAt: { gte: start, lte: end } },
        orderBy: { placedAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          placedAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

  const avg = (sales: number, orders: number) => (orders ? Math.round(sales / orders) : 0);
  const pointInTime = (value: number): Metric => ({ value, trend: null });

  return {
    range: { start, end },
    totalSales: metric(cur.sales, prev.sales),
    totalOrders: metric(cur.orders, prev.orders),
    pendingOrders: metric(cur.pending, prev.pending),
    avgOrderValue: metric(avg(cur.sales, cur.orders), avg(prev.sales, prev.orders)),
    refundAmount: metric(cur.refunds, prev.refunds),
    newCustomers: metric(cur.customers, prev.customers),
    lowStockProducts: pointInTime(lowStockCount),
    totalCustomers: pointInTime(totalCustomers),
    totalProducts: pointInTime(totalProducts),
    openReturnRequests: pointInTime(openReturns),
    backInStockRequests: pointInTime(backInStock),
    lowStockAlerts: lowStock.map(toLowStockAlert),
    recentOrders: recentOrders.map((order) => ({ ...order, total: toNumber(order.total) })),
  };
}

/** GET /dashboard/sales-trend — paid revenue bucketed by day / month / year. */
export async function getSalesTrend(query: DashboardQuery) {
  const { start, end } = resolveDashboardRange(query);
  const unit = truncUnit(query.granularity);
  const rows = await prisma.$queryRaw<{ bucket: Date; total: number; orders: number }[]>(Prisma.sql`
    SELECT date_trunc(${unit}, placed_at) AS bucket,
           COALESCE(SUM(total), 0)::float AS total,
           COUNT(*)::int AS orders
    FROM orders
    WHERE payment_status = 'paid'
      AND placed_at BETWEEN ${start} AND ${end}
    GROUP BY 1
    ORDER BY 1
  `);
  return rows.map((row) => ({ date: row.bucket, total: Number(row.total), orders: Number(row.orders) }));
}

/** GET /dashboard/top-products — best sellers by units in paid orders. */
export async function getTopProducts(query: DashboardQuery) {
  const { start, end } = resolveDashboardRange(query);
  const grouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { productId: { not: null }, order: { paymentStatus: "paid", placedAt: { gte: start, lte: end } } },
    _sum: { quantity: true, totalPrice: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: query.limit ?? TOP_PRODUCT_LIMIT,
  });
  const ids = grouped.flatMap((group) => (group.productId ? [group.productId] : []));
  if (ids.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      slug: true,
      media: primaryImageSelect,
      variants: { where: { isActive: true }, select: { stock: true } },
    },
  });
  const byId = new Map(products.map((product) => [product.id, product]));

  return grouped.flatMap((group) => {
    const product = group.productId ? byId.get(group.productId) : undefined;
    if (!product) return [];
    return [{
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: mediaSrc(product.media[0]?.media),
      unitsSold: group._sum.quantity ?? 0,
      revenue: toNumber(group._sum.totalPrice),
      stock: product.variants.reduce((sum, variant) => sum + variant.stock, 0),
    }];
  });
}
