import "server-only";
import type { InvoiceDocument } from "@/types/commerce/invoice";
import { addressParts, formatInvoiceDate, INVOICE_ZONE_LABELS } from "@/utils/orders/invoice-summary";
import { COLOR, CONTENT_WIDTH, label, PAGE, RIGHT, rule, type Doc } from "./layout";

const LOGO_BOX: [number, number] = [150, 66];
const DETAILS_WIDTH = 210;

/** Logo and shop contact on the left; "INVOICE" with its numbers on the right. */
export function drawLetterhead(doc: Doc, invoice: InvoiceDocument): number {
  const { shop } = invoice;
  const top = PAGE.margin;
  if (shop.logo) {
    doc.image(shop.logo, PAGE.margin, top, { fit: LOGO_BOX });
  } else {
    doc.font("Helvetica-Bold").fontSize(22).fillColor(COLOR.ink).text(shop.name, PAGE.margin, top + 18);
  }

  let y = top + LOGO_BOX[1] + 8;
  doc.font("Helvetica-Bold").fontSize(10).fillColor(COLOR.ink).text(shop.name, PAGE.margin, y);
  y = doc.y + 1;
  doc.font("Helvetica").fontSize(8.5).fillColor(COLOR.muted);
  for (const line of [shop.address, shop.phone, shop.email].filter((value): value is string => Boolean(value))) {
    doc.text(line, PAGE.margin, y, { width: 240 });
    y = doc.y;
  }
  doc.fillColor(COLOR.ink).text(shop.website.label, PAGE.margin, y, { link: shop.website.href, underline: true });
  const leftBottom = doc.y;

  const x = RIGHT - DETAILS_WIDTH;
  doc.font("Helvetica-Bold").fontSize(24).fillColor(COLOR.ink).text("INVOICE", x, top + 4, { width: DETAILS_WIDTH, align: "right", characterSpacing: 3 });
  const zone = invoice.deliveryZone ? (INVOICE_ZONE_LABELS[invoice.deliveryZone] ?? invoice.deliveryZone) : null;
  const rows: [string, string][] = [
    ...(invoice.invoiceNumber ? [["Invoice No.", invoice.invoiceNumber] as [string, string]] : []),
    ["Order No.", invoice.orderNumber],
    ["Date", formatInvoiceDate(invoice.placedAt.toISOString())],
    ["Payment", "Cash on Delivery"],
    ...(zone ? [["Delivery", zone] as [string, string]] : []),
  ];
  let rowY = top + 42;
  for (const [name, value] of rows) {
    doc.font("Helvetica").fontSize(8.5).fillColor(COLOR.muted).text(name, x, rowY, { width: 80 });
    doc.font("Helvetica-Bold").fillColor(COLOR.text).text(value, x + 80, rowY, { width: DETAILS_WIDTH - 80, align: "right" });
    rowY += 14;
  }

  const bottom = Math.max(leftBottom, rowY) + 12;
  rule(doc, bottom, COLOR.ink, 1.5);
  return bottom + 16;
}

/** Billed to (name, phone, email) and the delivery address side by side. */
export function drawParties(doc: Doc, invoice: InvoiceDocument, top: number): number {
  const { customer } = invoice;
  const half = CONTENT_WIDTH / 2;
  const zone = invoice.deliveryZone ? INVOICE_ZONE_LABELS[invoice.deliveryZone] : undefined;

  label(doc, "Billed to", PAGE.margin, top);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(COLOR.text).text(customer.fullName, PAGE.margin, top + 14, { width: half - 16 });
  doc.font("Helvetica").fontSize(9).fillColor(COLOR.muted).text(customer.phone, { width: half - 16 });
  if (customer.email) doc.text(customer.email, { width: half - 16 });
  const leftBottom = doc.y;

  const x = PAGE.margin + half;
  label(doc, "Delivery address", x, top);
  const street = [customer.addressLine1, customer.addressLine2].filter(Boolean).join(", ");
  const place = addressParts([customer.state ?? undefined, customer.city], zone).join(", ");
  const city = [place, customer.postalCode].filter(Boolean).join(" - ");
  doc.font("Helvetica").fontSize(9).fillColor(COLOR.text).text([street, city, "Bangladesh"].filter(Boolean).join("\n"), x, top + 14, { width: half, lineGap: 1.5 });

  return Math.max(leftBottom, doc.y) + 20;
}
