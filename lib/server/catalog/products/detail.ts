import "server-only";
import { prisma } from "@/lib/server/prisma";
import { notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { COMPLETE_THE_LOOK_LIMIT, RELATED_PRODUCTS_LIMIT } from "@/lib/constants/catalog";
import { categoryChain } from "@/utils/catalog/category-tree";
import { buildFitSummary } from "@/utils/catalog/fit-summary";
import { toNum, toNumOrNull } from "@/utils/mappers/catalog-refs";
import { toProductDetail, type DeliveryInfo, type ProductDetail } from "@/utils/mappers/product-detail";
import type { ProductCard } from "@/utils/mappers/product-card";
import { loadCategoryNodes } from "../categories/nodes";
import { findActiveSizeChart, resolveSizeChartId } from "../size-charts/queries";
import { findProductCards } from "./list";
import { productDetailSelect } from "./detail-select";

export type DetailOptions = { admin: boolean; includeArchived?: boolean };

const DEFAULT_DELIVERY: DeliveryInfo = { chargeInside: 0, chargeNearCity: 0, chargeOutside: 0, freeShippingThreshold: null, returnWindowDays: 14 };

async function deliveryInfo(): Promise<DeliveryInfo> {
  const setting = await prisma.setting.findFirst({
    select: { deliveryChargeInside: true, deliveryChargeNearCity: true, deliveryChargeOutside: true, freeShippingThreshold: true, returnWindowDays: true },
    orderBy: { createdAt: "asc" },
  });
  if (!setting) return DEFAULT_DELIVERY;
  return {
    chargeInside: toNum(setting.deliveryChargeInside),
    chargeNearCity: toNum(setting.deliveryChargeNearCity),
    chargeOutside: toNum(setting.deliveryChargeOutside),
    freeShippingThreshold: toNumOrNull(setting.freeShippingThreshold),
    returnWindowDays: setting.returnWindowDays,
  };
}

async function fitCounts(productId: string) {
  const groups = await prisma.review.groupBy({
    by: ["fitFeedback"],
    where: { productId, status: "APPROVED" },
    _count: { _all: true },
  });
  return buildFitSummary(groups.map((g) => ({ fitFeedback: g.fitFeedback, count: g._count._all })));
}

/** Same category, in-stock first. */
async function relatedProducts(productId: string, categoryId: string): Promise<ProductCard[]> {
  const cards = await findProductCards({ categoryId, id: { not: productId } }, { take: RELATED_PRODUCTS_LIMIT * 2 });
  return cards.sort((a, b) => Number(b.inStock) - Number(a.inStock)).slice(0, RELATED_PRODUCTS_LIMIT);
}

/** Other products styled with this one in any lookbook scene. */
function completeTheLook(productId: string): Promise<ProductCard[]> {
  return findProductCards(
    { id: { not: productId }, lookItems: { some: { look: { items: { some: { productId } } } } } },
    { take: COMPLETE_THE_LOOK_LIMIT },
  );
}

async function loadDetail(where: { id: string } | { slug: string }, options: DetailOptions): Promise<ProductDetail | null> {
  const now = new Date();
  const visibility = options.admin
    ? options.includeArchived ? {} : { archivedAt: null }
    : { status: "active" as const, archivedAt: null };
  const row = await prisma.product.findFirst({ where: { ...where, ...visibility }, select: productDetailSelect(now, options.admin) });
  if (!row) return null;

  const [categories, fit, delivery, related, look] = await Promise.all([
    loadCategoryNodes(),
    fitCounts(row.id),
    deliveryInfo(),
    relatedProducts(row.id, row.categoryId),
    completeTheLook(row.id),
  ]);
  const sizeChart = await findActiveSizeChart(resolveSizeChartId(row, categories));

  return toProductDetail(row, {
    admin: options.admin,
    breadcrumbs: categoryChain(categories, row.categoryId).map(({ slug, name }) => ({ slug, name })),
    sizeChart,
    rating: { average: toNum(row.ratingAvg), count: row.ratingCount, fit },
    delivery,
    related,
    completeTheLook: look,
  });
}

export async function getProductById(id: string, options: DetailOptions): Promise<ProductDetail> {
  const product = await loadDetail({ id }, options);
  if (!product) throw notFound(ERROR_MESSAGES.product.notFound(id));
  return product;
}

/** Storefront product page (server components call this directly). */
export async function getProductDetail(slug: string, options: DetailOptions = { admin: false }): Promise<ProductDetail> {
  const product = await loadDetail({ slug }, options);
  if (!product) throw notFound(ERROR_MESSAGES.product.notFoundBySlug(slug));
  return product;
}

/** GET /products/:id/size-chart — the resolved chart, or null. */
export async function getProductSizeChart(id: string) {
  const product = await prisma.product.findFirst({ where: { id, archivedAt: null }, select: { sizeChartId: true, categoryId: true } });
  if (!product) throw notFound(ERROR_MESSAGES.product.notFound(id));
  return findActiveSizeChart(resolveSizeChartId(product, await loadCategoryNodes()));
}
