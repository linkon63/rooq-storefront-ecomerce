"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { apiRequest, jsonInit } from "@/lib/admin/http";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { Unit } from "@/types/admin/catalog";
import { allowedParentUnits, unitConversionLabel, unitFactor } from "@/utils/admin/units";
import { errorText } from "@/utils/api-error";
import { AdminIcon } from "../../../_components/admin-icons";
import { UnitFields, type UnitFormState } from "./unit-fields";
import { UnitReferenceTabs } from "./unit-reference-tabs";

const LIST_HREF = "/admin/units";

const initialState = (unit?: Unit): UnitFormState => ({
  name: unit?.name ?? "",
  code: unit?.code ?? "",
  parentUnitId: unit?.parentUnitId ?? "",
  factor: unit ? String(unitFactor(unit)) : "1",
  description: unit?.description ?? "",
  isActive: unit?.isActive ?? true,
});

/** Request body. Description is always sent so clearing it clears it; a base unit is always factor 1. */
const toBody = (form: UnitFormState) => ({
  name: form.name.trim(),
  code: form.code.trim(),
  description: form.description.trim(),
  isActive: form.isActive,
  parentUnitId: form.parentUnitId || null,
  factor: form.parentUnitId ? Number(form.factor) : 1,
});

export default function UnitForm({ unit }: { unit?: Unit }) {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [form, setForm] = useState<UnitFormState>(() => initialState(unit));
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiRequest<Unit[]>("/units").then(setUnits, () => setUnits([]));
  }, []);

  const parentOptions = useMemo(() => allowedParentUnits(unit, units), [unit, units]);
  const parent = units.find((candidate) => candidate.id === form.parentUnitId);
  const preview =
    parent && Number(form.factor) > 0
      ? `1 ${form.name || "this unit"} = ${Number(form.factor).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${parent.name}`
      : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (form.parentUnitId && !(Number(form.factor) > 0)) return setError(ERROR_MESSAGES.unit.factorPositive);
    setIsSaving(true);
    try {
      await apiRequest<Unit>(unit ? `/units/${unit.id}` : "/units", jsonInit(unit ? "PATCH" : "POST", toBody(form)));
      router.push(LIST_HREF);
      router.refresh();
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.saveFailed));
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <header className="border-b border-slate-200 pb-7 pt-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700" href={LIST_HREF}>
              <AdminIcon className="h-4 w-4" name="arrow-left" />
              Back to unit of measurement list
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">{unit ? "Edit Units of Measurement" : "Add Units of Measurement"}</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">{unit ? "Update this unit of measurement" : "Add units of measurement here"}</p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link className="inline-flex h-11 items-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" href={LIST_HREF}>
              Cancel
            </Link>
            <button
              className="inline-flex h-11 items-center rounded-lg bg-blue-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:bg-slate-400 disabled:shadow-none"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </header>
      {error ? <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-8">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Units of Measurement Info</h2>
            <p className="mt-1.5 text-sm text-slate-500">Add Units information</p>
          </div>
          <UnitFields form={form} parentOptions={parentOptions} patch={(changes) => setForm((f) => ({ ...f, ...changes }))} preview={preview} />
        </div>
      </section>
      <UnitReferenceTabs />
      {unit && unitConversionLabel(unit) ? <p className="mt-6 text-sm text-slate-500">Currently saved as: {unitConversionLabel(unit)}</p> : null}
    </form>
  );
}
