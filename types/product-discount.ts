import type { DiscountProductSummary } from "@/types/admin/content";

export type ProductDiscount = {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  startDate: string | null;
  endDate: string | null;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt?: string;
  _count?: { products: number };
  products?: Array<{ discountId: string; productId: string; product: DiscountProductSummary }>;
};

export type PaginatedDiscounts = {
  data: ProductDiscount[];
  meta: { page: number; limit: number; total: number; totalPages?: number };
};

export type DiscountForm = {
  id?: string;
  name: string;
  type: "percentage" | "fixed";
  value: string;
  productIds: string[];
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
};
