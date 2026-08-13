"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminIcon } from "../../../_components/admin-shell";
import {
  apiRequest,
  unitConversionLabel,
  unitFactor,
  type Unit,
} from "../../../../../lib/admin-api";

const LIST_HREF = "/admin/units";

const LABEL = "mb-2 block text-sm font-medium text-slate-700";
const FIELD =
  "h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-[15px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

/** Worked examples, mirroring the conversion tree the form builds. */
const UNIT_TYPE_EXAMPLES = [
  {
    title: "Count Units",
    blurb: "Units for counting items",
    base: "Piece (pcs)",
    conversions: ["1 Pair = 2 Pieces", "1 Dozen = 12 Pieces"],
  },
  {
    title: "Weight Units",
    blurb: "Units for measuring weight",
    base: "Gram (g)",
    conversions: ["1 Kilogram(kg) = 1000 g"],
  },
  {
    title: "Length Units",
    blurb: "Units for measuring length",
    base: "Centimeter (cm)",
    conversions: ["1 Meter(m) = 100 cm"],
  },
];

const UNIT_GUIDELINES = [
  {
    title: "Start with a base unit",
    body: "Leave Parent Unit empty for the smallest unit you count in — Gram, Millilitre, Piece. A base unit always has a factor of 1.",
  },
  {
    title: "Factor reads upward",
    body: "Factor is how many parent units one of this unit equals. Kilogram with parent Gram takes a factor of 1000, because 1 kg = 1000 g.",
  },
  {
    title: "Keep abbreviations short",
    body: "The abbreviation is what staff see in dropdowns and what seeds generated SKUs, so kg beats kilogram. It must be unique across all units.",
  },
  {
    title: "Chains are allowed, loops are not",
    body: "A unit may convert into a unit that itself has a parent. It may not point back at itself or at anything below it — that would make conversion endless.",
  },
];

type UnitFormState = {
  name: string;
  code: string;
  parentUnitId: string;
  factor: string;
  description: string;
  isActive: boolean;
};

export default function UnitForm({ unit }: { unit?: Unit }) {
  const router = useRouter();
  const isEdit = Boolean(unit);

  const [units, setUnits] = useState<Unit[]>([]);
  const [form, setForm] = useState<UnitFormState>({
    name: unit?.name ?? "",
    code: unit?.code ?? "",
    parentUnitId: unit?.parentUnitId ?? "",
    factor: unit ? String(unitFactor(unit)) : "1",
    description: unit?.description ?? "",
    isActive: unit?.isActive ?? true,
  });
  const [tab, setTab] = useState<"examples" | "guidelines">("examples");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiRequest<Unit[]>("/units")
      .then(setUnits)
      .catch(() => setUnits([]));
  }, []);

  /**
   * A unit cannot convert into itself or into anything that already converts
   * into it — the server rejects both, and hiding them keeps the dropdown from
   * offering a choice that can only fail.
   */
  const parentOptions = useMemo(() => {
    if (!unit) return units;

    const descendants = new Set<string>([unit.id]);
    let grew = true;

    while (grew) {
      grew = false;
      for (const candidate of units) {
        if (
          candidate.parentUnitId &&
          descendants.has(candidate.parentUnitId) &&
          !descendants.has(candidate.id)
        ) {
          descendants.add(candidate.id);
          grew = true;
        }
      }
    }

    return units.filter((candidate) => !descendants.has(candidate.id));
  }, [unit, units]);

  const selectedParent = units.find((candidate) => candidate.id === form.parentUnitId);

  // Echo the rule back in the operator's own words as they type it.
  const preview =
    selectedParent && Number(form.factor) > 0
      ? `1 ${form.name || "this unit"} = ${Number(form.factor).toLocaleString(undefined, {
          maximumFractionDigits: 6,
        })} ${selectedParent.name}`
      : null;

  function patch(changes: Partial<UnitFormState>) {
    setForm((current) => ({ ...current, ...changes }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const factor = Number(form.factor);

    if (form.parentUnitId && !(factor > 0)) {
      setError("Factor must be greater than zero.");
      return;
    }

    setIsSaving(true);

    try {
      await apiRequest<Unit>(isEdit ? `/units/${unit!.id}` : "/units", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim(),
          // Always sent, so emptying the box actually clears the stored value
          // instead of silently leaving the old text in place.
          description: form.description.trim(),
          isActive: form.isActive,
          // A base unit is always 1 of itself, so the factor input is ignored
          // rather than trusted when no parent is chosen.
          parentUnitId: form.parentUnitId || null,
          factor: form.parentUnitId ? factor : 1,
        }),
      });

      router.push(LIST_HREF);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save unit");
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <header className="pt-6 border-b border-slate-200 pb-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              href={LIST_HREF}
            >
              <AdminIcon className="h-4 w-4" name="arrow-left" />
              Back to unit of measurement list
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">
              {isEdit ? "Edit Units of Measurement" : "Add Units of Measurement"}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {isEdit ? "Update this unit of measurement" : "Add units of measurement here"}
            </p>
          </div>

          <div className="flex shrink-0 gap-3">
            <Link
              className="inline-flex h-11 items-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              href={LIST_HREF}
            >
              Cancel
            </Link>
            <button
              className="inline-flex h-11 items-center rounded-lg bg-blue-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:bg-slate-400 disabled:shadow-none"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </header>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {/* ── Info card ────────────────────────────────────────────────────── */}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-8">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Units of Measurement Info
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">Add Units information</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className={LABEL}>
                Name<span className="text-red-500">*</span>
              </span>
              <input
                autoFocus
                className={FIELD}
                onChange={(event) => patch({ name: event.target.value })}
                placeholder="Enter name"
                required
                value={form.name}
              />
            </label>

            <label className="block">
              <span className={LABEL}>
                Abbreviation<span className="text-red-500">*</span>
              </span>
              <input
                className={FIELD}
                onChange={(event) => patch({ code: event.target.value })}
                placeholder="Enter abbreviation"
                required
                value={form.code}
              />
            </label>

            <label className="block">
              <span className={LABEL}>Parent Unit</span>
              <select
                className={`${FIELD} cursor-pointer appearance-none bg-[length:18px] bg-[right_1rem_center] bg-no-repeat pr-11`}
                onChange={(event) => patch({ parentUnitId: event.target.value })}
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                }}
                value={form.parentUnitId}
              >
                <option value="">None — this is a base unit</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={LABEL}>
                Factor<span className="text-red-500">*</span>
              </span>
              <input
                className={`${FIELD} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
                disabled={!form.parentUnitId}
                min="0"
                onChange={(event) => patch({ factor: event.target.value })}
                required
                step="any"
                title={
                  form.parentUnitId
                    ? "How many parent units one of this unit equals"
                    : "A base unit is always 1 of itself"
                }
                type="number"
                value={form.parentUnitId ? form.factor : "1"}
              />
            </label>

            <label className="block md:col-span-2">
              <span className={LABEL}>Description</span>
              <textarea
                className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                onChange={(event) => patch({ description: event.target.value })}
                placeholder="Net weight in kilograms"
                value={form.description}
              />
            </label>

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  checked={form.isActive}
                  className="h-4 w-4 accent-blue-600"
                  onChange={(event) => patch({ isActive: event.target.checked })}
                  type="checkbox"
                />
                Active unit
              </label>

              {preview && (
                <p className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                  <AdminIcon className="h-4 w-4" name="info" />
                  {preview}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

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

      {isEdit && unit && unitConversionLabel(unit) && (
        <p className="mt-6 text-sm text-slate-500">
          Currently saved as: {unitConversionLabel(unit)}
        </p>
      )}
    </form>
  );
}
