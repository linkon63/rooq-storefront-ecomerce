import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import type {
  DeliveryZone,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/generated/prisma/enums";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { badRequest } from "@/lib/server/http-error";
import { redeemCoupon } from "@/lib/server/coupons/service";
import { roundMoney } from "@/utils/catalog/price";
import { orderTotal, shippingCharge, sumLines } from "@/utils/orders/pricing";
import type { OrderAddressRow } from "@/utils/mappers/order";
import type { OrderLineDraft } from "./lines";
import { issueInvoiceNumber, newOrderNumber } from "./numbers";
import { loadDeliverySettings } from "./shipping";
import { takeOrderStock } from "./stock";

type Tx = Prisma.TransactionClient;

/** Interactive-transaction limits for order writes (several queries per line). */
export const ORDER_TX_OPTIONS = { maxWait: 10_000, timeout: 30_000 } as const;

export type ShippingRule = { zone: DeliveryZone } | { fixed: number };

export type PlaceOrderInput = {
  lines: OrderLineDraft[];
  userId: string | null;
  addressId?: string | null;
  shippingAddress: OrderAddressRow | null;
  shipping: ShippingRule;
  couponCode?: string;
  /** Staff-granted reduction (wholesale / POS), added to the coupon discount. */
  manualDiscount?: number;
  tax?: number;
  orderType?: OrderType;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerNote?: string | null;
  /** Filed on the first status-log row ("Order created"). */
  logNote: string;
  /** Reason written on each SALE stock movement. */
  stockReason: string;
  changedById?: string | null;
  /** A settled payment recorded with the order (POS). */
  payment?: { method: PaymentMethod; transactionId?: string | null };
};

/**
 * Writes one order inside `tx`: totals, coupon redemption, invoice number,
 * frozen address, line snapshots, the first status log, the stock movements
 * and (POS) the payment. Any failure rolls all of it back. Returns the id.
 */
export async function placeOrder(tx: Tx, input: PlaceOrderInput): Promise<string> {
  const totals = sumLines(input.lines);
  const coupon = await redeemCoupon(tx, input.couponCode, totals.payable);
  const discount = roundMoney(Math.min((coupon?.discount ?? 0) + (input.manualDiscount ?? 0), totals.payable));

  let shippingCost: number;
  let deliveryZone: DeliveryZone | null = null;
  if ("zone" in input.shipping) {
    const settings = await loadDeliverySettings(tx);
    deliveryZone = input.shipping.zone;
    shippingCost = shippingCharge(deliveryZone, settings.rates, settings.freeShippingThreshold, totals.payable - discount);
  } else {
    shippingCost = roundMoney(input.shipping.fixed);
  }

  const tax = roundMoney(input.tax ?? 0);
  const total = orderTotal({ payable: totals.payable, discount, shippingCost, tax });
  if (total < 0) throw badRequest(ERROR_MESSAGES.order.negativeTotal);

  const status = input.status ?? "pending";
  const order = await tx.order.create({
    data: {
      orderNumber: newOrderNumber(),
      invoiceNumber: await issueInvoiceNumber(tx),
      status,
      paymentStatus: input.paymentStatus ?? "unpaid",
      orderType: input.orderType ?? "retail",
      deliveryZone,
      subtotal: totals.subtotal,
      productDiscount: totals.productDiscount,
      discount,
      shippingCost,
      tax,
      total,
      couponId: coupon?.couponId ?? null,
      couponCode: coupon?.code ?? null,
      customerNote: input.customerNote ?? null,
      userId: input.userId,
      addressId: input.addressId ?? null,
      shippingAddress: input.shippingAddress ? { create: input.shippingAddress } : undefined,
      items: {
        create: input.lines.map((line) => ({
          productName: line.productName,
          productSlug: line.productSlug,
          sku: line.sku,
          colorName: line.colorName,
          colorHex: line.colorHex,
          sizeLabel: line.sizeLabel,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          listPrice: line.listPrice,
          discountAmount: line.discountAmount,
          totalPrice: line.totalPrice,
          productId: line.productId,
          variantId: line.variantId,
          imageMediaId: line.imageMediaId,
        })),
      },
      statusLogs: { create: { status, note: input.logNote, changedById: input.changedById ?? null } },
      payments: input.payment
        ? {
            create: {
              amount: total,
              method: input.payment.method,
              transactionId: input.payment.transactionId ?? null,
              status: "success",
              paidAt: new Date(),
            },
          }
        : undefined,
    },
    select: { id: true },
  });

  await takeOrderStock(tx, input.lines, { orderId: order.id, reason: input.stockReason, userId: input.changedById });
  return order.id;
}
