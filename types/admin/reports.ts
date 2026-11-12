export type SalesReportSummary = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  period: { start: string; end: string };
};

export type ProductBreakdown = {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  revenue: number;
};

export type SalesReportOrder = {
  orderId: string;
  orderNumber: string;
  customer: string;
  total: number;
  discount: number;
  /** What product offers took off this order. */
  productDiscount?: number;
  placedAt: string;
  items: {
    product: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

export type SalesReport = {
  summary: SalesReportSummary;
  productBreakdown: ProductBreakdown[];
  orders: { items: SalesReportOrder[]; meta: PaginationMeta };
};

export type UserReportUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  registeredAt: string;
};

export type UserReport = {
  summary: {
    totalNewUsers: number;
    totalCustomers: number;
    newCustomersThisWeek: number;
    period: { start: string; end: string };
  };
  users: { items: UserReportUser[]; meta: PaginationMeta };
};

export type CouponBreakdown = {
  id: string;
  code: string;
  type: string;
  value: number;
  usedCount: number;
  /** null = unlimited. */
  maxUsage: number | null;
  minOrderAmount?: number | null;
  isActive?: boolean;
  expiresAt: string | null;
};

export type DiscountedOrder = {
  orderId: string;
  orderNumber: string;
  customer: string;
  discountAmount: number;
  couponDiscount?: number;
  productDiscount?: number;
  orderTotal: number;
  placedAt: string;
};

export type ProductDiscountBreakdown = {
  discountId: string;
  discountName: string;
  type: string;
  value: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  products: {
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }[];
};

export type DiscountReport = {
  summary: {
    totalDiscountGiven: number;
    totalCouponDiscount?: number;
    totalProductDiscount?: number;
    ordersWithDiscount: number;
    totalCoupons: number;
    period: { start: string; end: string };
  };
  couponBreakdown: CouponBreakdown[];
  discountedOrders: { items: DiscountedOrder[]; meta: PaginationMeta };
  productDiscountBreakdown: ProductDiscountBreakdown[];
};

export type ReportOverviewSales = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  period: { start: string; end: string };
};

export type ReportOverviewCustomers = {
  totalNewUsers: number;
  totalCustomers: number;
  newCustomersThisWeek: number;
  period: { start: string; end: string };
};

export type ReportOverviewDiscounts = {
  totalDiscountGiven: number;
  ordersWithDiscount: number;
  totalCoupons: number;
  period: { start: string; end: string };
};

export type ReportOverviewInventory = {
  totalStockIn: number;
  totalStockOut: number;
  totalTransactions: number;
  lowStockAlerts: number;
  period: { start: string; end: string };
};

export type InventoryVariant = {
  id: string | null;
  sku: string | null;
  price: string | null;
  cost: string | null;
  stockQuantity: number;
  stockAlertThreshold: number;
  isDefault: boolean;
  product: {
    id: string;
    name: string;
    slug: string;
    status: string;
    media?: { media: { url: string } }[];
  };
};

export type PaginatedInventory = {
  data: InventoryVariant[];
  meta: { page: number; limit: number; total: number };
};

export type InventoryLog = {
  id: string;
  change: number;
  reason: "sale" | "restock" | "return" | "correction" | "manual";
  referenceId?: string | null;
  note?: string | null;
  createdAt: string;
  variantId: string;
};

export type InventoryLogResponse = InventoryLog & {
  variant: {
    sku: string;
    product: { id: string; name: string };
  };
};

export type AdjustInventoryPayload = {
  variantId: string;
  change: number;
  reason: "sale" | "restock" | "return" | "correction" | "manual";
  referenceId?: string;
  note?: string;
};

export type ReportOverviewPurchases = {
  totalPurchases: number;
  totalUnits: number;
  totalCost: number;
  period: { start: string; end: string };
};

export type ReportOverview = {
  period: { start: string; end: string };
  sales: ReportOverviewSales;
  customers: ReportOverviewCustomers;
  discounts: ReportOverviewDiscounts;
  inventory: ReportOverviewInventory;
  purchases: ReportOverviewPurchases;
};

export type ReportParams = { startDate?: string; endDate?: string; page?: number; limit?: number };
