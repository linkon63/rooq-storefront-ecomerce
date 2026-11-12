import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { MAX_PAGE_SIZE } from "@/lib/constants/pagination";
import { isoDate, movementReason } from "@/utils/reports/format";
import type { ReportRange } from "@/utils/reports/date-range";
import { prisma } from "../prisma";
import { lowStockWhere } from "../dashboard/queries";
import { inRange, meta, pagingWindow } from "./shared";
import type { ExportDocument, Paging } from "./types";

const variantLabelSelect = {
  sku: true,
  stock: true,
  product: { select: { id: true, name: true } },
  color: { select: { name: true } },
  size: { select: { label: true } },
} as const;

const movementSelect = {
  id: true,
  type: true,
  quantity: true,
  stockAfter: true,
  reason: true,
  createdAt: true,
  variant: { select: variantLabelSelect },
} as const satisfies Prisma.StockMovementSelect;

export async function inventorySummary(range: ReportRange) {
  const where = { createdAt: inRange(range) };
  const [stockIn, stockOut, totalTransactions, lowStockAlerts] = await Promise.all([
    prisma.stockMovement.aggregate({ where: { ...where, quantity: { gt: 0 } }, _sum: { quantity: true } }),
    prisma.stockMovement.aggregate({ where: { ...where, quantity: { lt: 0 } }, _sum: { quantity: true } }),
    prisma.stockMovement.count({ where }),
    prisma.productVariant.count({ where: lowStockWhere() }),
  ]);
  return {
    totalStockIn: stockIn._sum.quantity ?? 0,
    totalStockOut: Math.abs(stockOut._sum.quantity ?? 0),
    totalTransactions,
    lowStockAlerts,
    period: { start: range.start, end: range.end },
  };
}

export async function getInventoryReport(range: ReportRange, paging: Paging) {
  const [summary, movements, lowStock] = await Promise.all([
    inventorySummary(range),
    prisma.stockMovement.findMany({
      where: { createdAt: inRange(range) },
      select: movementSelect,
      orderBy: { createdAt: "desc" },
      ...pagingWindow(paging),
    }),
    prisma.productVariant.findMany({
      where: lowStockWhere(),
      select: { ...variantLabelSelect, lowStockThreshold: true },
      orderBy: { stock: "asc" },
      take: MAX_PAGE_SIZE,
    }),
  ]);

  return {
    summary,
    stockChanges: {
      items: movements.map((movement) => ({
        id: movement.id,
        product: movement.variant.product.name,
        sku: movement.variant.sku,
        color: movement.variant.color.name,
        size: movement.variant.size.label,
        change: movement.quantity,
        reason: movementReason(movement.type),
        note: movement.reason,
        stockAfter: movement.stockAfter,
        currentStock: movement.variant.stock,
        date: movement.createdAt,
      })),
      meta: meta(paging, summary.totalTransactions),
    },
    lowStockAlerts: lowStock.map((variant) => ({
      product: variant.product.name,
      sku: variant.sku,
      color: variant.color.name,
      size: variant.size.label,
      currentStock: variant.stock,
      alertThreshold: variant.lowStockThreshold,
    })),
  };
}

export async function inventoryExport(range: ReportRange): Promise<ExportDocument> {
  const [summary, movements] = await Promise.all([
    inventorySummary(range),
    prisma.stockMovement.findMany({ where: { createdAt: inRange(range) }, select: movementSelect, orderBy: { createdAt: "desc" } }),
  ]);
  const label = (m: (typeof movements)[number]) => `${m.variant.product.name} (${m.variant.color.name} / ${m.variant.size.label})`;
  return {
    title: "Inventory Report",
    filename: "inventory-report",
    range,
    summary: [
      ["Stock In", String(summary.totalStockIn)],
      ["Stock Out", String(summary.totalStockOut)],
      ["Transactions", String(summary.totalTransactions)],
      ["Low Stock", String(summary.lowStockAlerts)],
    ],
    tables: [
      {
        formats: ["csv"],
        headers: ["Date", "Product", "SKU", "Change", "Reason", "Note", "Stock After", "Current Stock"],
        rows: movements.map((m) => [
          isoDate(m.createdAt), label(m), m.variant.sku, String(m.quantity), movementReason(m.type),
          m.reason ?? "", String(m.stockAfter), String(m.variant.stock),
        ]),
      },
      {
        formats: ["pdf"],
        headers: ["Date", "Product", "SKU", "Change", "Reason"],
        rows: movements.map((m) => [isoDate(m.createdAt), label(m), m.variant.sku, String(m.quantity), movementReason(m.type)]),
      },
    ],
  };
}
