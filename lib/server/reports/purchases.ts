import "server-only";
import { toNumber } from "@/utils/decimal";
import { fixed2, isoDate, reportMoney } from "@/utils/reports/format";
import { paginateList, round2, type ReportRange } from "@/utils/reports/date-range";
import { prisma } from "../prisma";
import { inRange } from "./shared";
import type { ExportDocument, Paging } from "./types";

/** Restock movements with the unit cost in force (variant override → product cost). */
async function restocks(range: ReportRange) {
  const rows = await prisma.stockMovement.findMany({
    where: { type: "RESTOCK", createdAt: inRange(range) },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      quantity: true,
      reason: true,
      createdAt: true,
      variant: {
        select: {
          sku: true,
          costPrice: true,
          product: { select: { name: true, costPrice: true } },
          color: { select: { name: true } },
          size: { select: { label: true } },
        },
      },
    },
  });
  return rows.map((row) => {
    const unitCost = toNumber(row.variant.costPrice ?? row.variant.product.costPrice);
    return {
      id: row.id,
      product: `${row.variant.product.name} (${row.variant.color.name} / ${row.variant.size.label})`,
      sku: row.variant.sku,
      quantity: row.quantity,
      unitCost,
      totalCost: round2(row.quantity * unitCost),
      note: row.reason,
      date: row.createdAt,
    };
  });
}

function summarise(range: ReportRange, rows: Awaited<ReturnType<typeof restocks>>) {
  return {
    totalPurchases: rows.length,
    totalUnits: rows.reduce((sum, row) => sum + row.quantity, 0),
    totalCost: round2(rows.reduce((sum, row) => sum + row.totalCost, 0)),
    period: { start: range.start, end: range.end },
  };
}

export async function purchasesSummary(range: ReportRange) {
  return summarise(range, await restocks(range));
}

export async function getPurchaseReport(range: ReportRange, paging: Paging) {
  const rows = await restocks(range);
  return { summary: summarise(range, rows), purchases: paginateList(rows, paging.page, paging.limit) };
}

export async function purchasesExport(range: ReportRange): Promise<ExportDocument> {
  const rows = await restocks(range);
  const summary = summarise(range, rows);
  return {
    title: "Purchase Report",
    filename: "purchase-report",
    range,
    summary: [
      ["Total Purchases", String(summary.totalPurchases)],
      ["Total Units", String(summary.totalUnits)],
      ["Total Cost", reportMoney(summary.totalCost)],
    ],
    tables: [
      {
        formats: ["csv"],
        headers: ["Date", "Product", "SKU", "Qty", "Unit Cost", "Total Cost", "Note"],
        rows: rows.map((r) => [isoDate(r.date), r.product, r.sku, String(r.quantity), fixed2(r.unitCost), fixed2(r.totalCost), r.note ?? ""]),
      },
      {
        formats: ["pdf"],
        headers: ["Date", "Product", "SKU", "Qty", "Unit Cost", "Total Cost"],
        rows: rows.map((r) => [isoDate(r.date), r.product, r.sku, String(r.quantity), reportMoney(r.unitCost), reportMoney(r.totalCost)]),
      },
    ],
  };
}
