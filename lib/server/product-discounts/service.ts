import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { MAX_DISCOUNT_PERCENT } from "@/lib/constants/content";
import { buildPaginationMeta, pageWindow, type PaginationMeta } from "@/utils/pagination";
import {
  fixedDiscountViolations,
  isInvalidWindow,
  lowestSellingPrice,
  toProductDiscountDetail,
  toProductDiscountResponse,
  type ProductDiscountDetailResponse,
  type DiscountTypeValue,
  type ProductDiscountResponse,
} from "@/utils/mappers/product-discount";
import { badRequest, notFound } from "../http-error";
import { prisma } from "../prisma";
import { productDiscountDetailSelect, productDiscountSelect } from "./select";
import type {
  CreateProductDiscountInput,
  ListProductDiscountsQuery,
  UpdateProductDiscountInput,
} from "./schemas";

export type ProductDiscountListItem = ProductDiscountResponse & { _count: { products: number } };
export type ProductDiscountDetail = ProductDiscountDetailResponse;

async function validateProductsExist(productIds: readonly string[]): Promise<void> {
  const unique = [...new Set(productIds)];
  const count = await prisma.product.count({ where: { id: { in: unique } } });
  if (count !== unique.length) throw badRequest(ERROR_MESSAGES.product.invalidIds);
}

/** Percentage ≤ 100; a fixed amount must stay below every linked product's cheapest price. */
async function validateValue(type: DiscountTypeValue, value: number, productIds: readonly string[]): Promise<void> {
  if (type === "percentage") {
    if (value > MAX_DISCOUNT_PERCENT) throw badRequest(ERROR_MESSAGES.discount.percentageTooHigh(MAX_DISCOUNT_PERCENT));
    return;
  }
  const products = await prisma.product.findMany({
    where: { id: { in: [...productIds] } },
    select: { id: true, price: true, variants: { where: { isActive: true }, select: { price: true } } },
  });
  const violations = fixedDiscountViolations(
    value,
    products.map((product) => ({
      productId: product.id,
      lowestPrice: lowestSellingPrice({
        price: Number(product.price),
        variantPrices: product.variants.map((variant) => (variant.price === null ? null : Number(variant.price))),
      }),
    })),
  );
  if (violations.length > 0) throw badRequest(ERROR_MESSAGES.discount.fixedExceedsPrice(value, violations.length));
}

export async function createProductDiscount(input: CreateProductDiscountInput): Promise<ProductDiscountDetail> {
  const { productIds, ...data } = input;
  if (isInvalidWindow(data.startDate, data.endDate)) throw badRequest(ERROR_MESSAGES.discount.invalidWindow);
  await validateProductsExist(productIds);
  await validateValue(data.type, data.value, productIds);

  const row = await prisma.productDiscount.create({
    data: { ...data, products: { create: [...new Set(productIds)].map((productId) => ({ productId })) } },
    select: productDiscountDetailSelect,
  });
  return toProductDiscountDetail(row);
}

export async function listProductDiscounts(
  query: ListProductDiscountsQuery,
): Promise<{ data: ProductDiscountListItem[]; meta: PaginationMeta }> {
  const { page, limit, skip, take } = pageWindow(query.page, query.limit);
  const where: Prisma.ProductDiscountWhereInput = {};
  if (query.search) where.name = { contains: query.search, mode: "insensitive" };
  if (query.status) where.status = query.status;

  const [rows, total] = await prisma.$transaction([
    prisma.productDiscount.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: { ...productDiscountSelect, _count: { select: { products: true } } },
      skip,
      take,
    }),
    prisma.productDiscount.count({ where }),
  ]);
  return {
    data: rows.map((row) => ({ ...toProductDiscountResponse(row), _count: row._count })),
    meta: buildPaginationMeta({ page, limit, total }),
  };
}

export async function getProductDiscount(id: string): Promise<ProductDiscountDetail> {
  const row = await prisma.productDiscount.findUnique({ where: { id }, select: productDiscountDetailSelect });
  if (!row) throw notFound(ERROR_MESSAGES.discount.notFound(id));
  return toProductDiscountDetail(row);
}

export async function updateProductDiscount(id: string, input: UpdateProductDiscountInput): Promise<ProductDiscountDetail> {
  const existing = await prisma.productDiscount.findUnique({
    where: { id },
    select: { type: true, value: true, startDate: true, endDate: true, products: { select: { productId: true } } },
  });
  if (!existing) throw notFound(ERROR_MESSAGES.discount.notFound(id));

  const { productIds, ...data } = input;
  const startDate = data.startDate !== undefined ? data.startDate : existing.startDate;
  const endDate = data.endDate !== undefined ? data.endDate : existing.endDate;
  if (isInvalidWindow(startDate, endDate)) throw badRequest(ERROR_MESSAGES.discount.invalidWindow);
  if (productIds) await validateProductsExist(productIds);

  if (data.type !== undefined || data.value !== undefined || productIds) {
    await validateValue(
      data.type ?? existing.type,
      data.value ?? Number(existing.value),
      productIds ?? existing.products.map((link) => link.productId),
    );
  }

  const row = await prisma.productDiscount.update({
    where: { id },
    data: {
      ...data,
      ...(productIds
        ? { products: { deleteMany: {}, create: [...new Set(productIds)].map((productId) => ({ productId })) } }
        : {}),
    },
    select: productDiscountDetailSelect,
  });
  return toProductDiscountDetail(row);
}

/** Links cascade; campaigns that advertised it fall back to "no discount". */
export async function deleteProductDiscount(id: string): Promise<{ message: string }> {
  const existing = await prisma.productDiscount.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw notFound(ERROR_MESSAGES.discount.notFound(id));
  await prisma.$transaction([
    prisma.campaign.updateMany({ where: { discountId: id }, data: { hasDiscount: false, discountId: null } }),
    prisma.productDiscount.delete({ where: { id } }),
  ]);
  return { message: SUCCESS_MESSAGES.common.deleted("Product discount") };
}
