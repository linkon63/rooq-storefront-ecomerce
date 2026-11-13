import { API_PREFIX } from "@/lib/constants/storefront";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

/** Same-origin URL of an order's invoice PDF; the phone it was placed with unlocks it. */
export function invoicePdfUrl(orderNumber: string, phone: string): string {
  return `${API_PREFIX}/orders/invoice?${new URLSearchParams({ order: orderNumber, phone })}`;
}

/**
 * Fetches the invoice PDF and saves it as a file, so a wrong phone shows a
 * message instead of opening an error page. Resolves to an error message, or
 * null once the download has started.
 */
export async function downloadInvoicePdf(orderNumber: string, phone: string): Promise<string | null> {
  try {
    const response = await fetch(invoicePdfUrl(orderNumber, phone));
    if (response.status === 404) return ERROR_MESSAGES.storefront.invoiceNotFound;
    if (!response.ok) return ERROR_MESSAGES.storefront.invoiceDownloadFailed;
    const url = URL.createObjectURL(await response.blob());
    const link = Object.assign(document.createElement("a"), { href: url, download: `invoice-${orderNumber}.pdf` });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return null;
  } catch {
    return ERROR_MESSAGES.storefront.invoiceDownloadFailed;
  }
}
