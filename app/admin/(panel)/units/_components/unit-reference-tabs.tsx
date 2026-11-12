"use client";

import { useState } from "react";
import { UNIT_GUIDELINES, UNIT_TYPE_EXAMPLES } from "./unit-reference-content";

/** Examples / guidelines tabs under the unit form. */
export function UnitReferenceTabs() {
  const [tab, setTab] = useState<"examples" | "guidelines">("examples");
  return (
    <>
    {/* ── Reference tabs ───────────────────────────────────────────────── */}
    <div className="mt-6 inline-flex rounded-xl bg-slate-100 p-1.5">
      {(
        [
          ["examples", "Unit Type Examples"],
          ["guidelines", "Unit Guidelines"],
        ] as const
      ).map(([id, label]) => (
        <button
          className={`h-11 rounded-lg px-6 text-sm font-medium transition-colors ${
            tab === id
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
          key={id}
          onClick={() => setTab(id)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>

    {tab === "examples" ? (
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">Unit Type Examples</h2>
        <p className="mt-1 text-sm text-slate-500">
          Common unit types and their conversion relationships
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {UNIT_TYPE_EXAMPLES.map((example) => (
            <article
              className="rounded-xl border border-slate-200 bg-white p-6"
              key={example.title}
            >
              <h3 className="text-base font-semibold text-slate-900">{example.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{example.blurb}</p>
              <p className="mt-4 text-sm text-slate-700">
                <span className="font-semibold">Base:</span> {example.base}
              </p>
              <ul className="mt-2 space-y-1.5">
                {example.conversions.map((conversion) => (
                  <li
                    className="flex gap-2 text-sm text-slate-600 before:text-slate-400 before:content-['•']"
                    key={conversion}
                  >
                    {conversion}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    ) : (
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">Unit Guidelines</h2>
        <p className="mt-1 text-sm text-slate-500">
          How parent units and factors are meant to be filled in
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {UNIT_GUIDELINES.map((guideline) => (
            <article
              className="rounded-xl border border-slate-200 bg-white p-6"
              key={guideline.title}
            >
              <h3 className="text-base font-semibold text-slate-900">{guideline.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{guideline.body}</p>
            </article>
          ))}
        </div>
      </section>
    )}
    </>
  );
}
