import "server-only";
import PDFDocument from "pdfkit";
import { STORE_NAME } from "@/lib/constants/store";
import { isoDate } from "@/utils/reports/format";
import type { ExportDocument, ExportTable } from "./types";

type Doc = PDFKit.PDFDocument;

const MARGIN = 50;
const ROW_HEIGHT = 18;
const INK = "#1e293b";
const COLORS = { header: INK, stripe: "#f8fafc", plain: "#ffffff", box: "#f1f5f9", boxBorder: "#cbd5e1" };

function addTitle(doc: Doc, report: ExportDocument) {
  doc.fillColor(INK).fontSize(22).text(report.title, { align: "center" });
  doc.fontSize(11).text(`${STORE_NAME} · ${isoDate(report.range.start)} to ${isoDate(report.range.end)}`, { align: "center" });
  doc.moveDown(2);
}

function addSummary(doc: Doc, items: ExportDocument["summary"]) {
  if (items.length === 0) return;
  const width = doc.page.width - MARGIN * 2;
  const gap = 10;
  const boxW = Math.min((width - gap * (items.length - 1)) / items.length, 180);
  const boxH = 50;
  const startX = MARGIN + (width - (items.length * boxW + (items.length - 1) * gap)) / 2;
  const y = doc.y;
  items.forEach(([label, value], index) => {
    const x = startX + index * (boxW + gap);
    doc.rect(x, y, boxW, boxH).fillAndStroke(COLORS.box, COLORS.boxBorder);
    doc.fillColor(INK).fontSize(9).text(label, x + 8, y + 6, { width: boxW - 16, align: "center" });
    doc.fontSize(13).text(value, x + 8, y + 22, { width: boxW - 16, align: "center" });
  });
  doc.x = MARGIN;
  doc.y = y + boxH + 20;
}

function drawRow(doc: Doc, cells: string[], y: number, fill: string, color: string) {
  const width = doc.page.width - MARGIN * 2;
  const colW = width / cells.length;
  doc.rect(MARGIN, y, width, ROW_HEIGHT).fill(fill);
  doc.fillColor(color).fontSize(8);
  cells.forEach((cell, index) => {
    doc.text(cell, MARGIN + index * colW + 4, y + 5, {
      width: colW - 8,
      height: ROW_HEIGHT - 6,
      ellipsis: true,
      lineBreak: false,
      align: index === 0 ? "left" : "right",
    });
  });
}

function addTable(doc: Doc, table: ExportTable) {
  if (table.heading) {
    doc.moveDown(1);
    doc.x = MARGIN;
    doc.fillColor(INK).fontSize(14).text(table.heading, { underline: true });
  }
  doc.moveDown(0.5);
  const bottom = () => doc.page.height - MARGIN - ROW_HEIGHT;
  drawRow(doc, table.headers, doc.y, COLORS.header, "#ffffff");
  doc.y += ROW_HEIGHT;
  table.rows.forEach((row, index) => {
    if (doc.y > bottom()) {
      doc.addPage();
      drawRow(doc, table.headers, doc.y, COLORS.header, "#ffffff");
      doc.y += ROW_HEIGHT;
    }
    drawRow(doc, row, doc.y, index % 2 === 0 ? COLORS.plain : COLORS.stripe, INK);
    doc.y += ROW_HEIGHT;
  });
  doc.x = MARGIN;
}

/** Renders an ExportDocument to an A4 PDF (pdfkit, core Helvetica). */
export function renderPdf(report: ExportDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: MARGIN, info: { Title: report.title, Author: STORE_NAME } });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    addTitle(doc, report);
    addSummary(doc, report.summary);
    for (const table of report.tables) {
      if (!table.formats || table.formats.includes("pdf")) addTable(doc, table);
    }
    doc.end();
  });
}
