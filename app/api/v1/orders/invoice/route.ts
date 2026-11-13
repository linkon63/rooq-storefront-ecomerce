import { route } from "@/lib/server/http";
import { parseQuery } from "@/lib/server/validation";
import { invoiceQuery } from "@/lib/server/orders/schemas";
import { loadInvoiceOrder } from "@/lib/server/orders/invoice-data";
import { loadInvoiceShop } from "@/lib/server/orders/invoice-shop";
import { renderInvoicePdf } from "@/lib/server/orders/invoice-pdf/render";

/**
 * GET /api/v1/orders/invoice?order=&phone= — the order's invoice as a PDF
 * download. Public (guests have no account): the phone the order was placed
 * with is the key, so an order number alone opens nothing.
 */
export const GET = route(async (request) => {
  const { order, phone } = parseQuery(request, invoiceQuery);
  const [invoice, shop] = await Promise.all([loadInvoiceOrder(order, phone), loadInvoiceShop()]);
  const pdf = await renderInvoicePdf({ ...invoice, shop });
  const filename = `${invoice.invoiceNumber ?? invoice.orderNumber}.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
});
