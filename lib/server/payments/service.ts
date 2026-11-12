import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { CurrentUser } from "@/lib/server/auth/current-user";
import { notFound } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import { isStaff } from "@/lib/server/orders/queries";
import { toPaymentResponse } from "@/utils/mappers/payment";
import type { PaymentResponse } from "@/types/commerce/order";
import type { ConfirmPaymentInput, InitiatePaymentInput, ManualPaymentInput } from "./schemas";

/** The order, when `user` may act on it (owner or staff); 404 otherwise. */
async function accessibleOrder(orderId: string, user: CurrentUser) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, total: true, userId: true } });
  if (!order || (!isStaff(user) && order.userId !== user.id)) throw notFound(ERROR_MESSAGES.order.notFound(orderId));
  return order;
}

/** POST /payments/initiate — a pending payment for the order total. */
export async function initiatePayment(input: InitiatePaymentInput, user: CurrentUser): Promise<PaymentResponse> {
  const order = await accessibleOrder(input.orderId, user);
  const row = await prisma.payment.create({
    data: { orderId: order.id, amount: order.total, method: input.method, status: "pending" },
  });
  return toPaymentResponse(row);
}

/** POST /payments/manual (staff) — record money taken outside a gateway. */
export async function createManualPayment(input: ManualPaymentInput): Promise<PaymentResponse> {
  const order = await prisma.order.findUnique({ where: { id: input.orderId }, select: { id: true } });
  if (!order) throw notFound(ERROR_MESSAGES.order.notFound(input.orderId));
  const row = await prisma.payment.create({
    data: { orderId: order.id, amount: input.amount, method: input.method, transactionId: input.transactionId ?? null },
  });
  return toPaymentResponse(row);
}

/** POST /payments/confirm (staff) — settles a payment; success marks the order paid. */
export async function confirmPayment(input: ConfirmPaymentInput): Promise<PaymentResponse> {
  const payment = await prisma.payment.findUnique({ where: { id: input.paymentId }, select: { id: true, orderId: true } });
  if (!payment) throw notFound(ERROR_MESSAGES.payment.notFound(input.paymentId));

  const row = await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: input.status,
        transactionId: input.transactionId,
        paidAt: input.status === "success" ? new Date() : undefined,
      },
    });
    if (input.status === "success") {
      await tx.order.update({ where: { id: payment.orderId }, data: { paymentStatus: "paid" } });
    }
    return updated;
  });
  return toPaymentResponse(row);
}

/** GET /payments/order/:orderId — owner or staff. */
export async function orderPayments(orderId: string, user: CurrentUser): Promise<PaymentResponse[]> {
  await accessibleOrder(orderId, user);
  const rows = await prisma.payment.findMany({
    where: { orderId },
    orderBy: [{ paidAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  });
  return rows.map(toPaymentResponse);
}

/** POST /payments/webhook — placeholder acknowledgement until a gateway is integrated. */
export function acknowledgeWebhook(payload: unknown) {
  return { received: true, payload };
}
