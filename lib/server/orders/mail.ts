import "server-only";
import { STORE_NAME } from "@/lib/constants/store";
import { sendMail } from "@/lib/server/mail/client";
import { newOrderStoreEmail, orderConfirmationEmail, orderContact } from "@/utils/mail-templates/order-email";
import type { OrderResponse } from "@/types/commerce/order";

/**
 * The store alert + the customer confirmation for a new order. Call it from
 * `after()` so the shopper never waits on the mail provider; failures are
 * logged, never thrown.
 */
export async function sendOrderMails(order: OrderResponse): Promise<void> {
  const storeInbox = process.env.STORE_EMAIL;
  const contact = orderContact(order);
  const jobs: Promise<boolean>[] = [];

  if (storeInbox) jobs.push(sendMail({ to: storeInbox, ...newOrderStoreEmail(order, STORE_NAME) }));
  if (contact.email) jobs.push(sendMail({ to: contact.email, ...orderConfirmationEmail(order, STORE_NAME) }));

  const results = await Promise.allSettled(jobs);
  for (const result of results) {
    if (result.status === "rejected") console.error(`[mail] order ${order.orderNumber}`, result.reason);
  }
}
