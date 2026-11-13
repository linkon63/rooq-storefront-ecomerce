import type { ReactNode } from "react";

const TONES = {
  ink: "bg-ink text-chalk",
  dye: "bg-dye text-chalk",
  paper: "bg-paper text-ink",
  warn: "bg-paper text-dye-deep",
} as const;

export type LabelTone = keyof typeof TONES;

/** Woven-label badge (New, Sale −20%, Only 3 left). See the design plan. */
export function LabelTag({ tone = "ink", children }: { tone?: LabelTone; children: ReactNode }) {
  return <span className={`woven-label ${TONES[tone]}`}>{children}</span>;
}
