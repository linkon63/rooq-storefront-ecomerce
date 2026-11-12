import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { prisma } from "@/lib/server/prisma";
import { badRequest, conflict, notFound } from "@/lib/server/http-error";
import { normalizeCouponCode, toCouponResponse, toCouponState, type CouponRow } from "@/utils/mappers/coupon";
import { couponDiscount, couponProblem, type CouponProblem } from "@/utils/orders/pricing";
import { roundMoney } from "@/utils/catalog/price";
import type { ApplyCouponInput, CreateCouponInput, UpdateCouponInput } from "./schemas";

type Db = Pick<Prisma.TransactionClient, "coupon">;

const toDate = (value: string | null | undefined) => (value === undefined ? undefined : value === null ? null : new Date(value));

function problemMessage(problem: CouponProblem, row: CouponRow): string {
  switch (problem) {
    case "inactive":
      return ERROR_MESSAGES.coupon.inactive;
    case "notStarted":
      return ERROR_MESSAGES.coupon.notStarted;
    case "expired":
      return ERROR_MESSAGES.coupon.expired;
    case "usageLimit":
      return ERROR_MESSAGES.coupon.usageLimit;
    case "minOrder":
      return ERROR_MESSAGES.coupon.minOrder(`৳${Number(row.minOrderAmount ?? 0).toLocaleString("en-US")}`);
  }
}

async function findByCodeRow(code: string, db: Db = prisma): Promise<CouponRow | null> {
  return db.coupon.findFirst({ where: { code: { equals: normalizeCouponCode(code), mode: "insensitive" } } });
}

async function assertCodeFree(code: string, exceptId?: string) {
  const existing = await findByCodeRow(code);
  if (existing && existing.id !== exceptId) throw conflict(ERROR_MESSAGES.coupon.codeExists(normalizeCouponCode(code)));
}

export async function createCoupon(input: CreateCouponInput) {
  await assertCodeFree(input.code);
  const row = await prisma.coupon.create({
    data: {
      code: normalizeCouponCode(input.code),
      type: input.type,
      value: input.value,
      maxUsage: input.maxUsage ?? null,
      minOrderAmount: input.minOrderAmount ?? null,
      isActive: input.isActive ?? true,
      startsAt: toDate(input.startsAt) ?? null,
      expiresAt: toDate(input.expiresAt) ?? null,
    },
  });
  return toCouponResponse(row);
}

/** Newest expiry first, then newest created (old: orderBy expiresAt desc). */
export async function listCoupons() {
  const rows = await prisma.coupon.findMany({ orderBy: [{ expiresAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }] });
  return rows.map(toCouponResponse);
}

export async function getCouponByCode(code: string) {
  const row = await findByCodeRow(code);
  if (!row) throw notFound(ERROR_MESSAGES.coupon.notFoundByCode(code));
  return toCouponResponse(row);
}

async function requireCoupon(id: string): Promise<CouponRow> {
  const row = await prisma.coupon.findUnique({ where: { id } });
  if (!row) throw notFound(ERROR_MESSAGES.coupon.notFound(id));
  return row;
}

export async function updateCoupon(id: string, input: UpdateCouponInput) {
  const current = await requireCoupon(id);
  if (input.code) await assertCodeFree(input.code, id);

  const type = input.type ?? current.type;
  const value = input.value ?? Number(current.value);
  if (type === "percentage" && value > 100) throw badRequest(ERROR_MESSAGES.coupon.percentageTooHigh);

  const row = await prisma.coupon.update({
    where: { id },
    data: {
      code: input.code ? normalizeCouponCode(input.code) : undefined,
      type: input.type,
      value: input.value,
      maxUsage: input.maxUsage,
      minOrderAmount: input.minOrderAmount,
      isActive: input.isActive,
      startsAt: toDate(input.startsAt),
      expiresAt: toDate(input.expiresAt),
    },
  });
  return toCouponResponse(row);
}

/** Orders keep their `couponCode` text; the FK is SetNull. */
export async function deleteCoupon(id: string) {
  await requireCoupon(id);
  await prisma.coupon.delete({ where: { id } });
  return { message: SUCCESS_MESSAGES.commerce.couponDeleted };
}

/** POST /coupons/apply — a quote only; nothing is redeemed. */
export async function applyCoupon(input: ApplyCouponInput) {
  const row = await findByCodeRow(input.code);
  if (!row) throw notFound(ERROR_MESSAGES.coupon.notFoundByCode(input.code));
  const problem = couponProblem(toCouponState(row), input.subtotal, new Date());
  if (problem) throw badRequest(problemMessage(problem, row));

  const discount = couponDiscount({ type: row.type, value: Number(row.value) }, input.subtotal);
  return { coupon: toCouponResponse(row), discount, total: roundMoney(Math.max(input.subtotal - discount, 0)) };
}

/**
 * Validates and redeems a coupon inside an order transaction: returns what it
 * takes off `base` (the subtotal after product offers) and counts the use.
 * The usage bump is conditional, so two checkouts racing for the last use
 * cannot both win.
 */
export async function redeemCoupon(
  tx: Db,
  code: string | undefined,
  base: number,
): Promise<{ couponId: string; code: string; discount: number } | null> {
  if (!code?.trim()) return null;
  const row = await findByCodeRow(code, tx);
  if (!row) throw badRequest(ERROR_MESSAGES.coupon.invalid);
  const problem = couponProblem(toCouponState(row), base, new Date());
  if (problem) throw badRequest(problemMessage(problem, row));

  const claimed = await tx.coupon.updateMany({
    where: { id: row.id, ...(row.maxUsage !== null ? { usedCount: { lt: row.maxUsage } } : {}) },
    data: { usedCount: { increment: 1 } },
  });
  if (claimed.count === 0) throw badRequest(ERROR_MESSAGES.coupon.usageLimit);

  return { couponId: row.id, code: row.code, discount: couponDiscount({ type: row.type, value: Number(row.value) }, base) };
}

/** Gives a use back when an order that redeemed the coupon is cancelled. */
export async function releaseCoupon(tx: Db, couponId: string | null): Promise<void> {
  if (!couponId) return;
  await tx.coupon.updateMany({ where: { id: couponId, usedCount: { gt: 0 } }, data: { usedCount: { decrement: 1 } } });
}
