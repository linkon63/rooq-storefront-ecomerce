import "server-only";
import PDFDocument from "pdfkit";
import type { InvoiceDocument } from "@/types/commerce/invoice";
import { drawFooter, drawNote } from "./footer";
import { drawLetterhead, drawParties } from "./header";
import { drawItems, drawTotals } from "./items";
import { PAGE } from "./layout";

/** The customer's invoice as an A4 PDF (pdfkit, core Helvetica, clickable links). */
export function renderInvoicePdf(invoice: InvoiceDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const title = `Invoice ${invoice.invoiceNumber ?? invoice.orderNumber}`;
    const doc = new PDFDocument({ size: "A4", margin: PAGE.margin, info: { Title: title, Author: invoice.shop.name } });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let y = drawLetterhead(doc, invoice);
    y = drawParties(doc, invoice, y);
    y = drawItems(doc, invoice.items, y);
    y = drawTotals(doc, invoice.totals, y);
    y = drawNote(doc, invoice.note, y);
    drawFooter(doc, invoice, y);
    doc.end();
  });
}
