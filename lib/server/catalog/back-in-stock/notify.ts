import "server-only";
import { prisma } from "@/lib/server/prisma";
import { sendMail } from "@/lib/server/mail/client";
import { STORE_NAME } from "@/lib/constants/store";
import { backInStockEmail } from "@/utils/mail-templates/back-in-stock";

function productUrl(slug: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  return `${base}/product/${slug}`;
}

/**
 * Emails every PENDING request for a variant when it is in stock and marks
 * the ones Resend accepted as NOTIFIED. Requests whose mail was not sent
 * (no RESEND_API_KEY, provider error) stay PENDING for the next run.
 */
export async function notifyBackInStock(variantId: string): Promise<number> {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: {
      stock: true,
      isActive: true,
      color: { select: { name: true } },
      size: { select: { label: true } },
      product: { select: { name: true, slug: true, status: true, archivedAt: true } },
    },
  });
  if (!variant || variant.stock <= 0 || !variant.isActive) return 0;

  const [requests, setting] = await Promise.all([
    prisma.backInStockRequest.findMany({ where: { variantId, status: "PENDING" }, select: { id: true, email: true } }),
    prisma.setting.findFirst({ select: { shopName: true }, orderBy: { createdAt: "asc" } }),
  ]);
  if (!requests.length) return 0;

  const mail = backInStockEmail({
    shopName: setting?.shopName ?? STORE_NAME,
    productName: variant.product.name,
    colorName: variant.color.name,
    sizeLabel: variant.size.label,
    productUrl: productUrl(variant.product.slug),
  });
  const results = await Promise.all(requests.map(async (request) => ((await sendMail({ to: request.email, ...mail })) ? request.id : null)));
  const sent = results.filter((id): id is string => id !== null);
  if (sent.length) {
    await prisma.backInStockRequest.updateMany({
      where: { id: { in: sent }, status: "PENDING" },
      data: { status: "NOTIFIED", notifiedAt: new Date() },
    });
  }
  return sent.length;
}
