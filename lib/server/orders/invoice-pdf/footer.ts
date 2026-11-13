import "server-only";
import { whatsappHref } from "@/lib/shop-contact";
import type { InvoiceDocument } from "@/types/commerce/invoice";
import { COLOR, CONTENT_WIDTH, label, PAGE, rule, type Doc } from "./layout";

/** The shopper's order note, when they left one. */
export function drawNote(doc: Doc, note: string | null, top: number): number {
  if (!note) return top;
  label(doc, "Order note", PAGE.margin, top);
  doc.font("Helvetica").fontSize(9).fillColor(COLOR.text).text(note, PAGE.margin, top + 14, { width: CONTENT_WIDTH });
  return doc.y + 18;
}

/** Thank-you, where to reach the shop (every link clickable), and the validity line. */
export function drawFooter(doc: Doc, invoice: InvoiceDocument, top: number) {
  const { shop } = invoice;
  if (top > PAGE.height - PAGE.margin - 110) {
    doc.addPage();
    top = PAGE.margin;
  }
  rule(doc, top);
  let y = top + 12;
  doc.font("Helvetica-Bold").fontSize(10).fillColor(COLOR.ink).text(`Thank you for shopping with ${shop.name}.`, PAGE.margin, y);
  y = doc.y + 4;
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(COLOR.muted)
    .text("Please check the items and sizes before paying the rider. Keep this invoice: a return or exchange is settled against the invoice number above.", PAGE.margin, y, {
      width: CONTENT_WIDTH,
    });
  y = doc.y + 10;

  const links: [string, string, string][] = [
    ["Facebook", `${shop.name} on Facebook`, shop.facebookUrl],
    ["WhatsApp", shop.whatsapp, whatsappHref(shop.whatsapp)],
    ["Website", shop.website.label, shop.website.href],
  ];
  const width = CONTENT_WIDTH / links.length;
  links.forEach(([name, text, href], index) => {
    const x = PAGE.margin + index * width;
    label(doc, name, x, y, width - 8);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.ink).text(text, x, y + 12, { width: width - 8, link: href, underline: true });
  });

  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(COLOR.faint)
    .text("This is a computer-generated invoice and is valid without a signature.", PAGE.margin, y + 44, { width: CONTENT_WIDTH, align: "center" });
}
