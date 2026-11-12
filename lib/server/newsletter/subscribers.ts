import "server-only";
import { prisma } from "../prisma";

/** Newsletter subscribers live in the `newsletter_subscribers` table (email is unique, lower-cased). */

/** True when the address is subscribed and has not opted out. */
export async function hasSubscriber(email: string): Promise<boolean> {
  const row = await prisma.newsletterSubscriber.findUnique({
    where: { email },
    select: { unsubscribedAt: true },
  });
  return row !== null && row.unsubscribedAt === null;
}

/** Subscribes (or re-subscribes) an address. Idempotent — safe under concurrent sign-ups. */
export async function addSubscriber(email: string, source = "storefront"): Promise<void> {
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email, source },
    update: { unsubscribedAt: null },
  });
}
