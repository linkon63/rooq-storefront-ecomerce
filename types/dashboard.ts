/** Wire types for /api/v1/dashboard/* (admin). */

export type DashboardPeriod = "today" | "yesterday" | "week" | "month" | "custom";
export type ChartGranularity = "daily" | "monthly" | "yearly";

/** A variant at or under its low-stock threshold (dashboard alert card). */
export type LowStockAlert = {
  variantId: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  isOutOfStock: boolean;
  product: { id: string; name: string; slug: string };
  color: { name: string; hex: string };
  size: { label: string };
  imageUrl: string | null;
};
