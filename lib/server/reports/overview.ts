import "server-only";
import { reportMoney } from "@/utils/reports/format";
import type { ReportRange } from "@/utils/reports/date-range";
import { salesSummary } from "./sales";
import { customersSummary } from "./customers";
import { discountsSummary } from "./discounts";
import { inventorySummary } from "./inventory";
import { purchasesSummary } from "./purchases";
import type { ExportDocument } from "./types";

/** GET /reports/overview — every report's summary block for one window. */
export async function getOverview(range: ReportRange) {
  const [sales, customers, discounts, inventory, purchases] = await Promise.all([
    salesSummary(range),
    customersSummary(range),
    discountsSummary(range),
    inventorySummary(range),
    purchasesSummary(range),
  ]);
  return { period: { start: range.start, end: range.end }, sales, customers, discounts, inventory, purchases };
}

export async function overviewExport(range: ReportRange): Promise<ExportDocument> {
  const o = await getOverview(range);
  const row = (section: string, metric: string, value: string) => [section, metric, value];
  return {
    title: "Report Overview",
    filename: "overview-report",
    range,
    summary: [
      ["Revenue", reportMoney(o.sales.totalRevenue)],
      ["Orders", String(o.sales.totalOrders)],
      ["New Customers", String(o.customers.totalNewUsers)],
    ],
    tables: [
      {
        headers: ["Section", "Metric", "Value"],
        rows: [
          row("Sales", "Total revenue", reportMoney(o.sales.totalRevenue)),
          row("Sales", "Total orders", String(o.sales.totalOrders)),
          row("Sales", "Avg order value", reportMoney(o.sales.avgOrderValue)),
          row("Customers", "New customers", String(o.customers.totalNewUsers)),
          row("Customers", "Total customers", String(o.customers.totalCustomers)),
          row("Discounts", "Total discount given", reportMoney(o.discounts.totalDiscountGiven)),
          row("Discounts", "Orders with discount", String(o.discounts.ordersWithDiscount)),
          row("Discounts", "Coupons", String(o.discounts.totalCoupons)),
          row("Inventory", "Stock in", String(o.inventory.totalStockIn)),
          row("Inventory", "Stock out", String(o.inventory.totalStockOut)),
          row("Inventory", "Low stock variants", String(o.inventory.lowStockAlerts)),
          row("Purchases", "Restocks", String(o.purchases.totalPurchases)),
          row("Purchases", "Units", String(o.purchases.totalUnits)),
          row("Purchases", "Total cost", reportMoney(o.purchases.totalCost)),
        ],
      },
    ],
  };
}
