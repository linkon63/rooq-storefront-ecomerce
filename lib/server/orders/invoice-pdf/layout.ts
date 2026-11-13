import "server-only";

export type Doc = PDFKit.PDFDocument;

export const PAGE = { margin: 48, width: 595.28, height: 841.89 } as const;
export const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;
export const RIGHT = PAGE.width - PAGE.margin;

export const COLOR = {
  ink: "#1f3a2e",
  text: "#292524",
  muted: "#78716c",
  faint: "#a8a29e",
  line: "#e7e5e4",
  accent: "#9b1b48",
  band: "#f5f5f4",
} as const;

/** Core Helvetica has no ৳, so amounts print as "Tk 1,250.00". */
export function money(value: number): string {
  return `Tk ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function rule(doc: Doc, y: number, color: string = COLOR.line, width = 0.75) {
  doc.moveTo(PAGE.margin, y).lineTo(RIGHT, y).lineWidth(width).strokeColor(color).stroke();
}

export function label(doc: Doc, text: string, x: number, y: number, width?: number) {
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(COLOR.accent).text(text.toUpperCase(), x, y, { width, characterSpacing: 1.2 });
}
