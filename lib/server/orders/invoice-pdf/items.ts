import "server-only";
import type { InvoiceDocument } from "@/types/commerce/invoice";
import { COLOR, CONTENT_WIDTH, money, PAGE, RIGHT, rule, type Doc } from "./layout";

/** Column x offsets and widths: #, item, qty, unit price, amount. */
const COLS = [
  { x: 0, w: 22, align: "center" },
  { x: 26, w: 255, align: "left" },
  { x: 285, w: 40, align: "center" },
  { x: 329, w: 85, align: "right" },
  { x: 418, w: CONTENT_WIDTH - 418, align: "right" },
] as const;
const HEAD = ["#", "Item", "Qty", "Unit price", "Amount"];
const BOTTOM_LIMIT = PAGE.height - PAGE.margin - 40;

function head(doc: Doc, y: number): number {
  doc.rect(PAGE.margin, y, CONTENT_WIDTH, 22).fill(COLOR.band);
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(COLOR.ink);
  HEAD.forEach((text, index) => {
    const col = COLS[index];
    doc.text(text.toUpperCase(), PAGE.margin + col.x, y + 8, { width: col.w, align: col.align, characterSpacing: 0.8 });
  });
  return y + 28;
}

/** One row per line; a long order carries on onto a new page under a repeated head. */
export function drawItems(doc: Doc, items: InvoiceDocument["items"], top: number): number {
  let y = head(doc, top);
  items.forEach((item, index) => {
    if (y > BOTTOM_LIMIT) {
      doc.addPage();
      y = head(doc, PAGE.margin);
    }
    const discounted = item.listPrice > item.unitPrice;
    const at = (col: number) => PAGE.margin + COLS[col].x;
    doc.font("Helvetica").fontSize(9).fillColor(COLOR.faint).text(String(index + 1), at(0), y, { width: COLS[0].w, align: "center" });
    doc.font("Helvetica-Bold").fillColor(COLOR.text).text(item.name, at(1), y, { width: COLS[1].w });
    if (item.caption) doc.font("Helvetica").fontSize(7.5).fillColor(COLOR.muted).text(item.caption, at(1), doc.y + 1, { width: COLS[1].w });
    const nameBottom = doc.y;
    doc.font("Helvetica").fontSize(9).fillColor(COLOR.text).text(String(item.quantity), at(2), y, { width: COLS[2].w, align: "center" });
    doc.text(money(item.unitPrice), at(3), y, { width: COLS[3].w, align: "right" });
    if (discounted) {
      doc.fontSize(7.5).fillColor(COLOR.faint).text(money(item.listPrice), at(3), y + 12, { width: COLS[3].w, align: "right", strike: true });
    }
    doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.ink).text(money(item.unitPrice * item.quantity), at(4), y, { width: COLS[4].w, align: "right" });
    y = Math.max(nameBottom, y + (discounted ? 22 : 12)) + 8;
    rule(doc, y - 4);
  });
  return y + 6;
}

const TOTALS_WIDTH = 220;

/** Subtotal, discounts, delivery and what the rider collects. */
export function drawTotals(doc: Doc, totals: InvoiceDocument["totals"], top: number): number {
  if (top > BOTTOM_LIMIT - 90) {
    doc.addPage();
    top = PAGE.margin;
  }
  const x = RIGHT - TOTALS_WIDTH;
  const rows: [string, string, string][] = [["Subtotal", money(totals.subtotal), COLOR.text]];
  if (totals.productDiscount > 0) rows.push(["Product discount", `- ${money(totals.productDiscount)}`, COLOR.accent]);
  if (totals.couponDiscount > 0) rows.push(["Coupon discount", `- ${money(totals.couponDiscount)}`, COLOR.accent]);
  rows.push(["Delivery charge", totals.shipping > 0 ? money(totals.shipping) : "Free", COLOR.text]);

  let y = top;
  for (const [name, value, color] of rows) {
    doc.font("Helvetica").fontSize(9).fillColor(COLOR.muted).text(name, x, y, { width: 110 });
    doc.font("Helvetica-Bold").fillColor(color).text(value, x + 110, y, { width: TOTALS_WIDTH - 110, align: "right" });
    y += 15;
  }
  doc.moveTo(x, y).lineTo(RIGHT, y).lineWidth(1.5).strokeColor(COLOR.ink).stroke();
  y += 8;
  doc.font("Helvetica-Bold").fontSize(11).fillColor(COLOR.ink).text("Payable on delivery", x, y, { width: 120 });
  doc.text(money(totals.total), x + 110, y, { width: TOTALS_WIDTH - 110, align: "right" });
  return y + 30;
}
