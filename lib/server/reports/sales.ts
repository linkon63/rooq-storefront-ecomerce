import "server-only";
import { toNumber } from "@/utils/decimal";
import { fixed2, isoDate, orderCustomerName, reportMoney } from "@/utils/reports/format";
import { round2, type ReportRange } from "@/utils/reports/date-range";
import { prisma } from "../prisma";
import { meta, orderCustomerSelect, paidOrdersIn, pagingWindow } from "./shared";
import type { ExportDocument, Paging } from "./types";

export async function salesSummary(range: ReportRange) {
  const totals = await prisma.order.aggregate({ where: paidOrdersIn(range), _sum: { total: true }, _count: true });
  const totalRevenue = toNumber(totals._sum.total);
  const totalOrders = totals._count;
  return {
    totalRevenue: round2(totalRevenue),
    totalOrders,
    avgOrderValue: round2(totalOrders ? totalRevenue / totalOrders : 0),
    period: { start: range.start, end: range.end },
  };
}

async function productBreakdown(range: ReportRange) {
  const groups = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: paidOrdersIn(range) },
    _sum: { quantity: true, totalPrice: true },
    _max: { productName: true, sku: true },
    orderBy: { _sum: { totalPrice: "desc" } },
  });
  return groups.map((group) => ({
    productId: group.productId ?? "",
    productName: group._max.productName ?? "",
    sku: group._max.sku ?? "",
    quantity: group._sum.quantity ?? 0,
    revenue: round2(toNumber(group._sum.totalPrice)),
  }));
}

export async function getSalesReport(range: ReportRange, paging: Paging) {
  const where = paidOrdersIn(range);
  const [summary, breakdown, orders] = await Promise.all([
    salesSummary(range),
    productBreakdown(range),
    prisma.order.findMany({
      where,
      orderBy: { placedAt: "desc" },
      ...pagingWindow(paging),
      select: {
        id: true,
        orderNumber: true,
        total: true,
        discount: true,
        productDiscount: true,
        placedAt: true,
        ...orderCustomerSelect,
        items: { select: { productName: true, sku: true, quantity: true, unitPrice: true, totalPrice: true } },
      },
    }),
  ]);

  return {
    summary,
    productBreakdown: breakdown,
    orders: {
      items: orders.map((order) => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customer: orderCustomerName(order),
        total: toNumber(order.total),
        discount: toNumber(order.discount),
        productDiscount: toNumber(order.productDiscount),
        placedAt: order.placedAt,
        items: order.items.map((item) => ({
          product: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: toNumber(item.unitPrice),
          totalPrice: toNumber(item.totalPrice),
        })),
      })),
      meta: meta(paging, summary.totalOrders),
    },
  };
}

export async function salesExport(range: ReportRange): Promise<ExportDocument> {
  const [summary, orders] = await Promise.all([
    salesSummary(range),
    prisma.order.findMany({
      where: paidOrdersIn(range),
      orderBy: { placedAt: "desc" },
      select: {
        orderNumber: true,
        total: true,
        discount: true,
        placedAt: true,
        ...orderCustomerSelect,
        items: { select: { productName: true, sku: true, quantity: true, unitPrice: true, totalPrice: true } },
      },
    }),
  ]);

  return {
    title: "Sales Report",
    filename: "sales-report",
    range,
    summary: [
      ["Total Revenue", reportMoney(summary.totalRevenue)],
      ["Total Orders", String(summary.totalOrders)],
      ["Avg Order Value", reportMoney(summary.avgOrderValue)],
    ],
    tables: [
      {
        formats: ["csv"],
        headers: ["Order Number", "Customer", "Total", "Discount", "Date", "Product", "SKU", "Qty", "Unit Price", "Item Total"],
        rows: orders.flatMap((order) =>
          order.items.map((item) => [
            order.orderNumber,
            orderCustomerName(order),
            fixed2(toNumber(order.total)),
            fixed2(toNumber(order.discount)),
            isoDate(order.placedAt),
            item.productName,
            item.sku,
            String(item.quantity),
            fixed2(toNumber(item.unitPrice)),
            fixed2(toNumber(item.totalPrice)),
          ]),
        ),
      },
      {
        formats: ["pdf"],
        headers: ["Order", "Customer", "Total", "Discount", "Date"],
        rows: orders.map((order) => [
          order.orderNumber,
          orderCustomerName(order),
          reportMoney(toNumber(order.total)),
          reportMoney(toNumber(order.discount)),
          isoDate(order.placedAt),
        ]),
      },
    ],
  };
}
