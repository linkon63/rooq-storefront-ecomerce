"use client";

import Link from "next/link";
import type { HeroMode } from "@/types/admin/hero";

const OPTIONS: { mode: HeroMode; title: string; body: string }[] = [
  { mode: "SLIDER", title: "Slider", body: "Your slides glide across the hero. A slide linked to a product shows that product's card in the corner." },
  { mode: "CAMPAIGN", title: "Campaign", body: "One banner from the live campaign in the Hero Campaign section: its image, title, text and button." },
];

type Props = { mode: HeroMode; busy: boolean; onChange: (mode: HeroMode) => void };

/** Chooses what the home hero shows. Falls back to the other one when the chosen one is empty. */
export function HeroModeCard({ mode, busy, onChange }: Props) {
  return (
    <div className="grid gap-3">
    <div className="grid gap-3 md:grid-cols-2" role="radiogroup" aria-label="What the home hero shows">
      {OPTIONS.map((option) => {
        const checked = option.mode === mode;
        return (
          <button
            key={option.mode}
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={busy}
            onClick={() => !checked && onChange(option.mode)}
            className={`rounded-lg border p-4 text-left transition ${checked ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-slate-200 hover:bg-slate-50"}`}
          >
            <span className="block text-base font-black text-slate-900">{option.title}</span>
            <span className="mt-1 block text-sm font-medium text-slate-600">{option.body}</span>
          </button>
        );
      })}
    </div>
      <p className="text-sm font-medium text-slate-500">
        Campaign mode uses the live campaign in the Hero Campaign section.{" "}
        <Link href="/admin/settings/campaigns" className="font-bold text-blue-700 hover:underline">
          Edit hero campaigns
        </Link>
      </p>
    </div>
  );
}
