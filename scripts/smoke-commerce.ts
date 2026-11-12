/**
 * Commerce smoke test — calls the real cart / order / shipment / return /
 * coupon / wholesale / wishlist route handlers in-process (no `next dev`).
 * Creates throwaway users, orders and a coupon, then removes every row it
 * wrote and puts the variant's stock back exactly as it was.
 *
 *   pnpm exec tsx --conditions=react-server scripts/smoke-commerce.ts
 */
import "dotenv/config";
// Never e-mail the real store inbox from a test run: sendMail() becomes a logged dry run.
delete process.env.RESEND_API_KEY;
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { prisma } from "../lib/server/prisma";
import { signAccessToken } from "../lib/server/auth/jwt";
import * as cart from "../app/api/v1/cart/route";
import * as cartItems from "../app/api/v1/cart/items/route";
import * as orders from "../app/api/v1/orders/route";
import * as guestOrders from "../app/api/v1/orders/guest/route";
import * as posOrders from "../app/api/v1/orders/pos/route";
import * as orderStatus from "../app/api/v1/orders/[id]/status/route";
import * as orderCancel from "../app/api/v1/orders/[id]/cancel/route";
import * as returnable from "../app/api/v1/orders/[id]/returnable/route";
import * as shipments from "../app/api/v1/shipments/route";
import * as shipmentDelivered from "../app/api/v1/shipments/[id]/delivered/route";
import * as returns from "../app/api/v1/returns/route";
import * as returnStatus from "../app/api/v1/returns/[id]/status/route";
import * as coupons from "../app/api/v1/coupons/route";
import * as couponApply from "../app/api/v1/coupons/apply/route";
import * as couponOne from "../app/api/v1/coupons/[id]/route";
import * as wishlist from "../app/api/v1/wishlist/route";
import * as wholesale from "../app/api/v1/wholesale-requests/route";
import * as wholesaleStatus from "../app/api/v1/wholesale-requests/[id]/status/route";
import * as wholesaleConvert from "../app/api/v1/wholesale-requests/[id]/convert/route";

const BASE = "http://localhost:3002/api/v1";
const stamp = Date.now();
type Json = Record<string, unknown>;
const ctx = <P extends Record<string, string>>(params: P = {} as P) => ({ params: Promise.resolve(params) });

function req(path: string, init: { method?: string; body?: unknown; token?: string } = {}) {
  const headers = new Headers();
  if (init.token) headers.set("authorization", `Bearer ${init.token}`);
  if (init.body !== undefined) headers.set("content-type", "application/json");
  return new NextRequest(`${BASE}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

async function expect(res: Response, status: number, label: string): Promise<Json> {
  const body = (await res.json().catch(() => ({}))) as Json;
  assert.equal(res.status, status, `${label}: ${res.status} ${JSON.stringify(body)}`);
  console.log(`  ✓ ${label}`);
  return body;
}

const stockOf = async (id: string) => (await prisma.productVariant.findUniqueOrThrow({ where: { id }, select: { stock: true } })).stock;

async function main() {
  const variant = await prisma.productVariant.findFirst({
    where: { isActive: true, stock: { gte: 6 }, product: { status: "active", archivedAt: null } },
    select: { id: true, productId: true, stock: true, product: { select: { soldCount: true } } },
  });
  assert.ok(variant, "needs one active variant with stock >= 6 (run the seed)");
  const [customerRole, adminRole] = await Promise.all([
    prisma.role.findFirstOrThrow({ where: { name: "user" } }),
    prisma.role.findFirstOrThrow({ where: { name: "admin" } }),
  ]);
  const customer = await prisma.user.create({ data: { name: "Smoke Shopper", email: `smoke+c${stamp}@rooq.local`, roleId: customerRole.id } });
  const staff = await prisma.user.create({ data: { name: "Smoke Staff", email: `smoke+a${stamp}@rooq.local`, roleId: adminRole.id } });
  const address = await prisma.address.create({
    data: { userId: customer.id, fullName: "Smoke Shopper", phone: "01700000000", addressLine1: "Road 1", city: "Dhaka" },
  });
  const [ct, st] = await Promise.all([signAccessToken(customer.id), signAccessToken(staff.id)]);
  const orderIds: string[] = [];
  const references: string[] = [];
  let couponId: string | null = null;

  try {
    console.log("cart → order");
    await expect(await cartItems.POST(req("/cart/items", { method: "POST", token: ct, body: { variantId: variant.id, quantity: 2 } }), ctx()), 201, "add to cart");
    const bag = await expect(await cart.GET(req("/cart", { token: ct }), ctx()), 200, "get cart");
    assert.equal((bag.items as Json[]).length, 1);
    const order = await expect(await orders.POST(req("/orders", { method: "POST", token: ct, body: { addressId: address.id } }), ctx()), 201, "place order");
    orderIds.push(order.id as string);
    assert.equal(await stockOf(variant.id), variant.stock - 2, "stock decremented");
    assert.equal((order.items as Json[])[0].sizeLabel !== undefined, true);
    const sale = await prisma.stockMovement.count({ where: { orderId: order.id as string, type: "SALE" } });
    assert.equal(sale, 1, "SALE movement written");
    await expect(await orders.GET(req(`/orders?search=${order.orderNumber as string}`, { token: ct }), ctx()), 403, "customer cannot list all orders");
    const list = await expect(await orders.GET(req(`/orders?search=${order.orderNumber as string}`, { token: st }), ctx()), 200, "admin lists orders");
    assert.equal((list.data as Json[]).length, 1);
    await expect(await orderCancel.DELETE(req(`/orders/${order.id}/cancel`, { method: "DELETE", token: ct }), ctx({ id: order.id as string })), 200, "customer cancels");
    assert.equal(await stockOf(variant.id), variant.stock, "cancel restocked");

    console.log("guest + POS");
    const guest = await expect(
      await guestOrders.POST(req("/orders/guest", { method: "POST", body: { address: { fullName: "Guest", phone: "01800000000", addressLine1: "Road 2" }, items: [{ variantId: variant.id, quantity: 1 }] } }), ctx()),
      201,
      "guest order",
    );
    orderIds.push(guest.id as string);
    const pos = await expect(await posOrders.POST(req("/orders/pos", { method: "POST", token: st, body: { items: [{ variantId: variant.id, quantity: 1 }] } }), ctx()), 201, "POS sale");
    orderIds.push(pos.id as string);
    assert.equal(pos.status, "delivered");
    assert.equal(pos.paymentStatus, "paid");

    console.log("ship → deliver → return");
    await expect(await cartItems.POST(req("/cart/items", { method: "POST", token: ct, body: { variantId: variant.id, quantity: 2 } }), ctx()), 201, "add again");
    const second = await expect(await orders.POST(req("/orders", { method: "POST", token: ct, body: { addressId: address.id } }), ctx()), 201, "second order");
    orderIds.push(second.id as string);
    const sid = second.id as string;
    await expect(await orderStatus.PATCH(req(`/orders/${sid}/status`, { method: "PATCH", token: st, body: { status: "processing" } }), ctx({ id: sid })), 200, "processing");
    await expect(await orderStatus.PATCH(req(`/orders/${sid}/status`, { method: "PATCH", token: st, body: { status: "pending", note: "x" } }), ctx({ id: sid })), 200, "back to pending allowed");
    const shipment = await expect(await shipments.POST(req("/shipments", { method: "POST", token: st, body: { orderId: sid, courierName: "Pathao" } }), ctx()), 201, "create shipment");
    const delivered = await expect(
      await shipmentDelivered.PATCH(req(`/shipments/${shipment.id}/delivered`, { method: "PATCH", token: st }), ctx({ id: shipment.id as string })),
      200,
      "mark delivered",
    );
    assert.ok(delivered.deliveredAt);
    const eligibility = await expect(await returnable.GET(req(`/orders/${sid}/returnable`, { token: ct }), ctx({ id: sid })), 200, "returnable");
    assert.equal(eligibility.eligible, true, JSON.stringify(eligibility));
    const line = (eligibility.items as Json[])[0];
    const ret = await expect(
      await returns.POST(req("/returns", { method: "POST", token: ct, body: { orderId: sid, resolution: "REFUND", items: [{ orderItemId: line.orderItemId, quantity: 2, reason: "TOO_SMALL" }] } }), ctx()),
      201,
      "open return",
    );
    const rid = ret.id as string;
    references.push(ret.requestNumber as string);
    const before = await stockOf(variant.id);
    await expect(await returnStatus.PATCH(req(`/returns/${rid}/status`, { method: "PATCH", token: st, body: { status: "REFUNDED" } }), ctx({ id: rid })), 400, "cannot skip approval");
    await expect(await returnStatus.PATCH(req(`/returns/${rid}/status`, { method: "PATCH", token: st, body: { status: "APPROVED" } }), ctx({ id: rid })), 200, "approve + restock");
    assert.equal(await stockOf(variant.id), before + 2, "return restocked");
    const refunded = await expect(await returnStatus.PATCH(req(`/returns/${rid}/status`, { method: "PATCH", token: st, body: { status: "REFUNDED" } }), ctx({ id: rid })), 200, "refund");
    assert.ok(Number(refunded.refundAmount) > 0);
    const after = await prisma.order.findUniqueOrThrow({ where: { id: sid }, select: { status: true, paymentStatus: true } });
    assert.equal(after.status, "returned", "fully returned order");
    assert.notEqual(after.paymentStatus, "unpaid");

    console.log("coupons + wishlist + wholesale");
    const code = `SMOKE${stamp}`;
    const coupon = await expect(await coupons.POST(req("/coupons", { method: "POST", token: st, body: { code, type: "percentage", value: 10 } }), ctx()), 201, "create coupon");
    couponId = coupon.id as string;
    const quote = await expect(await couponApply.POST(req("/coupons/apply", { method: "POST", body: { code: code.toLowerCase(), subtotal: 1000 } }), ctx()), 201, "apply coupon");
    assert.equal(quote.discount, 100);
    await expect(await couponOne.GET(req(`/coupons/${code}`), ctx({ id: code })), 200, "coupon by code");
    await expect(await couponOne.DELETE(req(`/coupons/${couponId}`, { method: "DELETE", token: st }), ctx({ id: couponId })), 200, "delete coupon");
    couponId = null;
    await expect(await wishlist.POST(req("/wishlist", { method: "POST", token: ct, body: { productId: variant.productId } }), ctx()), 201, "wishlist add");
    const saved = (await (await wishlist.GET(req("/wishlist", { token: ct }), ctx())).json()) as Json[];
    assert.equal(saved.length, 1);
    const wsr = await expect(
      await wholesale.POST(req("/wholesale-requests", { method: "POST", token: ct, body: { items: [{ productId: variant.productId, variantId: variant.id, requestedQuantity: 1 }] } }), ctx()),
      201,
      "wholesale request",
    );
    const wid = wsr.id as string;
    references.push(wsr.requestNumber as string);
    await expect(await wholesaleStatus.PATCH(req(`/wholesale-requests/${wid}/status`, { method: "PATCH", token: st, body: { status: "approved" } }), ctx({ id: wid })), 200, "approve request");
    const converted = await expect(
      await wholesaleConvert.POST(
        req(`/wholesale-requests/${wid}/convert`, { method: "POST", token: st, body: { addressId: address.id, items: [{ requestItemId: (wsr.items as Json[])[0].id, quantity: 1, unitPrice: 500 }] } }),
        ctx({ id: wid }),
      ),
      201,
      "convert to order",
    );
    orderIds.push(converted.id as string);
    assert.equal(converted.orderType, "wholesale");
    assert.equal(converted.total, 500);
  } finally {
    await prisma.wholesaleOrderRequest.deleteMany({ where: { userId: customer.id } });
    await prisma.returnRequest.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.stockMovement.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    if (couponId) await prisma.coupon.delete({ where: { id: couponId } });
    await prisma.notification.deleteMany({
      where: { OR: [{ userId: { in: [customer.id, staff.id] } }, ...references.map((ref) => ({ message: { contains: ref } }))] },
    });
    await prisma.user.deleteMany({ where: { id: { in: [customer.id, staff.id] } } });
    await prisma.productVariant.update({ where: { id: variant.id }, data: { stock: variant.stock } });
    await prisma.product.update({ where: { id: variant.productId }, data: { soldCount: variant.product.soldCount } });
    console.log("cleaned up");
  }
}

main()
  .then(() => console.log("commerce smoke: OK"))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
