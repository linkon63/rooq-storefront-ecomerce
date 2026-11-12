import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/constants/pagination";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PageWindow = { page: number; limit: number; skip: number; take: number };

/** Clamp raw page/limit and derive Prisma's skip/take. */
export function pageWindow(page?: number, limit?: number): PageWindow {
  const safePage = Number.isFinite(page) && page && page > 0 ? Math.floor(page) : DEFAULT_PAGE;
  const safeLimit =
    Number.isFinite(limit) && limit && limit > 0 ? Math.min(Math.floor(limit), MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit, take: safeLimit };
}

export function buildPaginationMeta({ page, limit, total }: { page: number; limit: number; total: number }): PaginationMeta {
  return { page, limit, total, totalPages: limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1 };
}
