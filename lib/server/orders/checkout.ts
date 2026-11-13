import "server-only";
import { after } from "next/server";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { DEFAULT_DELIVERY_ZONE, ORDER_NOTES, POS_ADDRESS_LINE, POS_WALK_IN_NAME } from "@/lib/constants/orders";
import type { CurrentUser } from "@/lib/server/auth/current-user";
import { badRequest, notFound } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import { markAbandonedCartsRecovered } from "@/lib/server/abandoned-carts/service";
import type { OrderAddressRow } from "@/utils/mappers/order";
import type { OrderResponse } from "@/types/commerce/order";
import { buildOrderLines } from "./lines";
import { sendOrderMails } from "./mail";
import { ORDER_TX_OPTIONS, placeOrder } from "./place";
import { loadOrder } from "./queries";
import { loadDeliverySettings } from "./shipping";
import type { CreateGuestOrderInput, CreateOrderInput, CreatePosOrderInput } from "./schemas";

/** The order is placed: a failure to tidy the abandoned-cart list must not fail checkout. */
async function closeAbandonedCarts(phone: string, orderNumber: string): Promise<void> {
  await markAbandonedCartsRecovered(phone, orderNumber).catch((error) => console.error("[abandoned-carts] recover failed", error));
}

/** Mails go out after the response so checkout never waits on the provider. */
function mailAfterResponse(order: OrderResponse): void {
  const run = () => sendOrderMails(order).catch((error) => console.error("[mail] order mails failed", error));
  try {
    after(run);
  } catch {
    void run();
  }
}

/** POST /orders — places an order from the signed-in customer's cart (all lines, or the `items` picked). */
export async function createOrderFromCart(user: CurrentUser, input: CreateOrderInput): Promise<OrderResponse> {
  const [cart, address] = await Promise.all([
    prisma.cart.findUnique({ where: { userId: user.id }, include: { items: true } }),
    prisma.address.findFirst({ where: { id: input.addressId, userId: user.id } }),
  ]);
  if (!cart || cart.items.length === 0) throw badRequest(ERROR_MESSAGES.cart.empty);
  if (!address) throw notFound(ERROR_MESSAGES.address.notFound);

  let cartItems = cart.items;
  if (input.items?.length) {
    const picked = new Set(input.items.map((item) => item.variantId));
    cartItems = cart.items.filter((item) => picked.has(item.variantId));
    if (!cartItems.length) throw badRequest(ERROR_MESSAGES.cart.noSelectedItems);
  }

  const shippingAddress: OrderAddressRow = {
    email: user.email,
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
  };

  const orderId = await prisma.$transaction(async (tx) => {
    const lines = await buildOrderLines(
      tx,
      cartItems.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      { requireSellable: true },
    );
    const id = await placeOrder(tx, {
      lines,
      userId: user.id,
      addressId: address.id,
      shippingAddress,
      shipping: { zone: input.deliveryZone ?? DEFAULT_DELIVERY_ZONE },
      couponCode: input.couponCode,
      customerNote: input.customerNote,
      logNote: ORDER_NOTES.created,
      stockReason: ORDER_NOTES.created,
    });
    await tx.cartItem.deleteMany({ where: { id: { in: cartItems.map((item) => item.id) } } });
    return id;
  }, ORDER_TX_OPTIONS);

  const order = await loadOrder(orderId);
  mailAfterResponse(order);
  await closeAbandonedCarts(shippingAddress.phone, order.orderNumber);
  return order;
}

/** POST /orders/guest — public checkout without an account. */
export async function createGuestOrder(input: CreateGuestOrderInput): Promise<OrderResponse> {
  const { address } = input;
  const shippingAddress: OrderAddressRow = {
    email: address.email || null,
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 || null,
    city: address.city || address.state || "Dhaka",
    state: address.state || "Dhaka",
    postalCode: address.postalCode || null,
    country: address.country || "Bangladesh",
  };

  const orderId = await prisma.$transaction(async (tx) => {
    const lines = await buildOrderLines(tx, input.items, { requireSellable: true });
    return placeOrder(tx, {
      lines,
      userId: null,
      shippingAddress,
      shipping: { zone: input.deliveryZone ?? DEFAULT_DELIVERY_ZONE },
      couponCode: input.couponCode,
      customerNote: input.customerNote,
      logNote: ORDER_NOTES.guestPlaced,
      stockReason: ORDER_NOTES.guestPlaced,
    });
  }, ORDER_TX_OPTIONS);

  const order = await loadOrder(orderId);
  mailAfterResponse(order);
  await closeAbandonedCarts(shippingAddress.phone, order.orderNumber);
  return order;
}

/**
 * POST /orders/pos — an in-store sale rung up by staff: delivered and paid on
 * the spot, stock taken immediately, payment recorded. No delivery charge.
 */
export async function createPosOrder(staff: CurrentUser, input: CreatePosOrderInput): Promise<OrderResponse> {
  const settings = await loadDeliverySettings();
  const customer = input.customer;
  const shippingAddress: OrderAddressRow | null =
    customer?.name || customer?.phone
      ? {
          email: customer.email ?? null,
          fullName: customer.name || POS_WALK_IN_NAME,
          phone: customer.phone ?? "",
          addressLine1: POS_ADDRESS_LINE,
          addressLine2: null,
          city: settings.branchName ?? POS_ADDRESS_LINE,
          state: null,
          postalCode: null,
          country: "Bangladesh",
        }
      : null;

  const orderId = await prisma.$transaction(async (tx) => {
    const lines = await buildOrderLines(tx, input.items, { requireSellable: true });
    return placeOrder(tx, {
      lines,
      userId: null,
      shippingAddress,
      shipping: { fixed: 0 },
      couponCode: input.couponCode,
      manualDiscount: input.discount,
      status: "delivered",
      paymentStatus: "paid",
      customerNote: input.note,
      logNote: ORDER_NOTES.posSale,
      stockReason: ORDER_NOTES.posSale,
      changedById: staff.id,
      payment: { method: input.paymentMethod, transactionId: input.transactionId },
    });
  }, ORDER_TX_OPTIONS);

  return loadOrder(orderId);
}
