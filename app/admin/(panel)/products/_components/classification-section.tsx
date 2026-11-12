"use client";

import { DEPARTMENTS, DEPARTMENT_LABELS } from "@/lib/constants/catalog";
import type { Department } from "@/types/catalog-admin";
import { Field, Panel, SelectInput } from "../../_catalog/field";
import { ChipGroup } from "../../_catalog/chip-group";
import type { SectionProps } from "./section-props";

export function ClassificationSection({ form, set, lookups }: SectionProps) {
  const chartFromCategory = lookups.sizeCharts.find((chart) => chart.categories?.some((c) => c.id === form.categoryId));
  return (
    <Panel title="Organisation" description="Where the product lives in the shop and which filters find it.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Brand">
          <SelectInput value={form.brandId} onChange={(e) => set({ brandId: e.target.value })} required>
            <option value="">Choose a brand</option>
            {lookups.brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </SelectInput>
        </Field>
        <Field label="Category">
          <SelectInput value={form.categoryId} onChange={(e) => set({ categoryId: e.target.value })} required>
            <option value="">Choose a category</option>
            {lookups.categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </SelectInput>
        </Field>
        <Field label="Department">
          <SelectInput value={form.department} onChange={(e) => set({ department: e.target.value as Department })}>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{DEPARTMENT_LABELS[d]}</option>)}
          </SelectInput>
        </Field>
        <Field label="Size chart" hint={form.sizeChartId ? "Overrides the category's chart." : chartFromCategory ? `Uses the category chart: ${chartFromCategory.name}` : "No chart from the category."}>
          <SelectInput value={form.sizeChartId} onChange={(e) => set({ sizeChartId: e.target.value })}>
            <option value="">Use the category&apos;s chart</option>
            {lookups.sizeCharts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectInput>
        </Field>
        <Field label="Unit">
          <SelectInput value={form.unitId} onChange={(e) => set({ unitId: e.target.value })}>
            <option value="">None</option>
            {lookups.units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.code})</option>)}
          </SelectInput>
        </Field>
        <Field label="Supplier">
          <SelectInput value={form.supplierId} onChange={(e) => set({ supplierId: e.target.value })}>
            <option value="">None</option>
            {lookups.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </SelectInput>
        </Field>
        <div className="md:col-span-2">
          <ChipGroup label="Collections" options={lookups.collections.map((c) => ({ value: c.id, label: c.name }))} selected={form.collectionIds} onChange={(collectionIds) => set({ collectionIds })} empty="No collections yet." />
        </div>
        <div className="md:col-span-2">
          <ChipGroup label="Tags" options={lookups.tags.map((t) => ({ value: t.id, label: t.name }))} selected={form.tagIds} onChange={(tagIds) => set({ tagIds })} empty="No tags yet." />
        </div>
      </div>
    </Panel>
  );
}
