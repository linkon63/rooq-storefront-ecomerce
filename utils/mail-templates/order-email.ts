import type { OrderResponse } from "@/types/commerce/order";
import { escapeHtml } from "./escape-html";

/**
 * Order e-mails: the store's "new order" alert and the customer's
 * confirmation. Pure HTML builders — sending happens in lib/server/orders/mail.ts.
 */

const SHOP_TIME_ZONE = "Asia/Dhaka";

function money(value: number): string {
  return `৳${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function placedAt(order: OrderResponse): string {
  return new Date(order.placedAt).toLocaleString("en-US", { timeZone: SHOP_TIME_ZONE });
}

export function orderContact(order: OrderResponse) {
  const address = order.shippingAddress ?? order.address;
  return {
    name: order.user?.name ?? address?.fullName ?? "Guest customer",
    phone: order.user?.phone ?? address?.phone ?? "N/A",
    email: order.user?.email ?? address?.email ?? null,
    address: address
      ? [address.addressLine1, address.addressLine2, address.city, address.state, address.postalCode, address.country]
          .filter(Boolean)
          .join(", ")
      : "N/A",
  };
}

function itemRows(order: OrderResponse): string {
  return order.items
    .map((item) => {
      const options = [item.colorName, item.sizeLabel].filter(Boolean).join(" / ");
      const label = `${escapeHtml(item.productName)}${options ? ` <span style="color:#666">(${escapeHtml(options)})</span>` : ""}`;
      return `<tr>
  <td style="padding:10px;border-bottom:1px solid #eee">${label}<br><span style="color:#888;font-size:12px">SKU ${escapeHtml(item.sku)}</span></td>
  <td style="padding:10px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
  <td style="padding:10px;border-bottom:1px solid #eee;text-align:right">${money(item.unitPrice)}</td>
  <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${money(item.totalPrice)}</td>
</tr>`;
    })
    .join("");
}

function summary(order: OrderResponse): string {
  const lines = [
    `<p style="margin:4px 0">Subtotal: <strong>${money(order.subtotal)}</strong></p>`,
    order.productDiscount > 0 ? `<p style="margin:4px 0;color:#15803d">Offers: <strong>-${money(order.productDiscount)}</strong></p>` : "",
    order.discount > 0 ? `<p style="margin:4px 0;color:#b91c1c">Coupon${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ""}: <strong>-${money(order.discount)}</strong></p>` : "",
    `<p style="margin:4px 0">Delivery: <strong>${money(order.shippingCost)}</strong></p>`,
    order.tax > 0 ? `<p style="margin:4px 0">Tax: <strong>${money(order.tax)}</strong></p>` : "",
    `<p style="margin:8px 0 0;font-size:17px;font-weight:bold">Total: ${money(order.total)}</p>`,
  ];
  return `<div style="max-width:300px;margin-left:auto;text-align:right;font-size:14px">${lines.join("")}</div>`;
}

function layout(shopName: string, heading: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(heading)}</title></head>
<body style="font-family:Helvetica,Arial,sans-serif;line-height:1.6;color:#111;background:#f6f6f4;padding:20px">
<div style="max-width:650px;margin:0 auto;background:#fff;border:1px solid #e5e5e5">
  <div style="background:#111;color:#fff;padding:20px;text-align:center">
    <h1 style="margin:0;font-size:22px;letter-spacing:.08em">${escapeHtml(shopName)}</h1>
    <p style="margin:4px 0 0;font-size:14px;opacity:.85">${escapeHtml(heading)}</p>
  </div>
  <div style="padding:24px">${body}</div>
</div></body></html>`;
}

function itemsTable(order: OrderResponse): string {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
<thead><tr style="background:#f4f4f4;text-align:left">
  <th style="padding:10px">Item</th><th style="padding:10px;text-align:center">Qty</th>
  <th style="padding:10px;text-align:right">Unit</th><th style="padding:10px;text-align:right">Total</th>
</tr></thead><tbody>${itemRows(order)}</tbody></table>`;
}

/** Sent to the store inbox when an order is placed. */
export function newOrderStoreEmail(order: OrderResponse, shopName: string) {
  const contact = orderContact(order);
  const body = `<h2 style="margin-top:0;font-size:18px">Order ${escapeHtml(order.orderNumber)}</h2>
<p style="margin:4px 0;color:#666;font-size:13px">Placed ${escapeHtml(placedAt(order))}${order.invoiceNumber ? ` · Invoice ${escapeHtml(order.invoiceNumber)}` : ""}</p>
<div style="background:#fafafa;border-left:4px solid #111;padding:12px 16px;margin:16px 0">
  <p style="margin:3px 0"><strong>Name:</strong> ${escapeHtml(contact.name)}</p>
  <p style="margin:3px 0"><strong>Phone:</strong> ${escapeHtml(contact.phone)}</p>
  <p style="margin:3px 0"><strong>Email:</strong> ${escapeHtml(contact.email ?? "N/A")}</p>
  <p style="margin:3px 0"><strong>Delivery address:</strong> ${escapeHtml(contact.address)}</p>
  ${order.customerNote ? `<p style="margin:3px 0"><strong>Note:</strong> ${escapeHtml(order.customerNote)}</p>` : ""}
</div>${itemsTable(order)}${summary(order)}`;
  return {
    subject: `[New Order] #${order.orderNumber} - ${contact.name} (${contact.phone})`,
    html: layout(shopName, "New order received", body),
  };
}

/** Sent to the shopper (when an e-mail is known) as the order confirmation. */
export function orderConfirmationEmail(order: OrderResponse, shopName: string) {
  const contact = orderContact(order);
  const body = `<p>Hi ${escapeHtml(contact.name)},</p>
<p>Thank you for shopping with ${escapeHtml(shopName)}. We have received order <strong>${escapeHtml(order.orderNumber)}</strong> and will let you know when it ships.</p>
${itemsTable(order)}${summary(order)}
<p style="margin-top:24px;color:#666;font-size:13px">Delivering to: ${escapeHtml(contact.address)}</p>`;
  return {
    subject: `Your ${shopName} order ${order.orderNumber}`,
    html: layout(shopName, "Order confirmation", body),
  };
}
