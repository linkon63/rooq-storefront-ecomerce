import type { OrderStatus, PaymentStatus as OrderPaymentStatus } from "@/types/commerce/order";
import type { ChartGranularity, DashboardPeriod, LowStockAlert } from "@/types/dashboard";

export type MetricValue = {
  value: number;
  trend: number | null;
};

export type DashboardRecentOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  total: number;
  placedAt: string;
  user: { id: string; name: string; email: string } | null;
};

export type DashboardSummary = {
  range: { start: string; end: string };
  totalSales: MetricValue;
  totalOrders: MetricValue;
  pendingOrders: MetricValue;
  avgOrderValue: MetricValue;
  refundAmount: MetricValue;
  newCustomers: MetricValue;
  lowStockProducts: MetricValue;
  totalCustomers: MetricValue;
  totalProducts: MetricValue;
  /** Return requests waiting for a decision (status REQUESTED). */
  openReturnRequests: MetricValue;
  /** Pending back-in-stock e-mail requests. */
  backInStockRequests: MetricValue;
  /** Lowest-stock variants first (max 8). */
  lowStockAlerts: LowStockAlert[];
  recentOrders: DashboardRecentOrder[];
};

export type SalesTrendPoint = {
  date: string;
  total: number;
  orders: number;
};

export type TopProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  unitsSold: number;
  revenue: number;
  stock: number;
};

// ─── Platform: dashboard, reports, settings, policies ──────────────────────

export type DashboardQuery = {
  period: DashboardPeriod;
  startDate?: string;
  endDate?: string;
  granularity?: ChartGranularity;
};
