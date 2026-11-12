/** Wire types for the reports that the original admin-api.ts did not cover. */
import type { PaginationMeta } from "@/types/admin/reports";

export type ReportPeriod = { start: string; end: string };

export type InventoryStockChange = {
  id: string;
  product: string;
  sku: string;
  color: string;
  size: string;
  change: number;
  reason: string;
  note: string | null;
  stockAfter: number;
  currentStock: number;
  date: string;
};

export type InventoryLowStockRow = {
  product: string;
  sku: string;
  color: string;
  size: string;
  currentStock: number;
  alertThreshold: number;
};

export type InventoryReport = {
  summary: {
    totalStockIn: number;
    totalStockOut: number;
    totalTransactions: number;
    lowStockAlerts: number;
    period: ReportPeriod;
  };
  stockChanges: { items: InventoryStockChange[]; meta: PaginationMeta };
  lowStockAlerts: InventoryLowStockRow[];
};

export type PurchaseRow = {
  id: string;
  product: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  note: string | null;
  date: string;
};

export type PurchaseReport = {
  summary: { totalPurchases: number; totalUnits: number; totalCost: number; period: ReportPeriod };
  purchases: { items: PurchaseRow[]; meta: PaginationMeta };
};

/** Report endpoints under /api/v1/reports. */
export type ReportEndpoint = "sales" | "users" | "inventory" | "purchases" | "discounts" | "overview";
