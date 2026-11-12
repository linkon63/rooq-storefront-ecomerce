"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { DEPARTMENTS, DEPARTMENT_LABELS } from "@/lib/constants/catalog";
import { errorText } from "@/utils/error-text";
import { textOrNull } from "@/utils/catalog/form-values";
import { chartToFormState, formStateToRows } from "@/utils/catalog/size-chart-form";
import type { CategoryOption } from "@/utils/catalog/category-options";
import type { AdminSize, AdminSizeChart, Department } from "@/types/catalog-admin";
import { Button } from "../../_catalog/button";
import { CheckboxField, Field, Panel, SelectInput, TextArea, TextInput } from "../../_catalog/field";
import { ErrorBlock } from "../../_catalog/data-states";
import { ChartGrid } from "./chart-grid";
import { ChartPreview } from "./chart-preview";
import { SizePicker } from "../../_catalog/size-picker";
import { CategoryChecklist } from "./category-checklist";

type Props = { chart: AdminSizeChart | null; sizes: AdminSize[]; categories: CategoryOption[] };

export function SizeChartForm({ chart, sizes, categories }: Props) {
  const router = useRouter();
  const [name, setName] = useState(chart?.name ?? "");
  const [department, setDepartment] = useState<Department | "">(chart?.department ?? "");
  const [description, setDescription] = useState(chart?.description ?? "");
  const [howToMeasure, setHowToMeasure] = useState(chart?.howToMeasure ?? "");
  const [isActive, setIsActive] = useState(chart?.isActive ?? true);
  const [categoryIds, setCategoryIds] = useState<string[]>(chart?.categories?.map((c) => c.id) ?? []);
  const [grid, setGrid] = useState(() => chartToFormState(chart));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sizeMap = useMemo(() => new Map(sizes.map((size) => [size.id, size])), [sizes]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError(ERROR_MESSAGES.ui.requiredFields);
    setSaving(true);
    setError(null);
    try {
      const saved = await catalogApi.sizeCharts.save(chart?.id ?? null, {
        name: name.trim(),
        department: department || null,
        description: textOrNull(description),
        howToMeasure: textOrNull(howToMeasure),
        isActive,
        rows: formStateToRows(grid),
        categoryIds,
      });
      toast.success(SUCCESS_MESSAGES.catalog.saved("Size chart"));
      if (!chart) router.replace(`/admin/size-charts/${saved.id}`);
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.saveFailed));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 pb-10">
      {error ? <ErrorBlock message={error} /> : null}
      <Panel title="Chart details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" hint="e.g. Women's tops, Men's trousers, Unisex sneakers">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Department">
            <SelectInput value={department} onChange={(e) => setDepartment(e.target.value as Department | "")}>
              <option value="">Any</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{DEPARTMENT_LABELS[d]}</option>)}
            </SelectInput>
          </Field>
          <Field label="Intro" className="md:col-span-2"><TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></Field>
          <Field label="How to measure" className="md:col-span-2" hint="Shown under the table in the size guide.">
            <TextArea value={howToMeasure} onChange={(e) => setHowToMeasure(e.target.value)} rows={3} />
          </Field>
          <CheckboxField label="Active (shown on product pages)" checked={isActive} onChange={setIsActive} />
        </div>
      </Panel>
      <Panel title="Sizes" description="Pick the sizes this chart covers. Rows follow the size order set on the Sizes page.">
        <SizePicker sizes={sizes} selected={grid.sizeIds} onChange={(sizeIds) => setGrid({ ...grid, sizeIds })} />
      </Panel>
      <Panel title="Measurements (cm)" description="Enter body or garment measurements in centimetres; shoppers can switch to inches.">
        <ChartGrid state={grid} sizes={sizeMap} onChange={setGrid} />
      </Panel>
      <Panel title="Preview"><ChartPreview state={grid} sizes={sizeMap} /></Panel>
      <Panel title="Default for categories" description="Products in these categories use this chart unless the product picks its own.">
        <CategoryChecklist options={categories} selected={categoryIds} onChange={setCategoryIds} />
      </Panel>
      <div className="flex justify-end gap-2">
        <Button tone="secondary" onClick={() => router.push("/admin/size-charts")}>Back to charts</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save chart"}</Button>
      </div>
    </form>
  );
}
