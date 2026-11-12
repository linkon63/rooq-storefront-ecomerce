"use client";

import { PRODUCT_STATUSES, PRODUCT_STATUS_LABELS } from "@/lib/constants/catalog";
import { slugify } from "@/utils/slug";
import type { ProductStatus } from "@/types/catalog-admin";
import { CheckboxField, Field, Panel, SelectInput, TextArea, TextInput } from "../../_catalog/field";
import type { SectionProps } from "./section-props";

export function BasicsSection({ form, set }: Omit<SectionProps, "lookups">) {
  return (
    <Panel title="Basics">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Product name" className="md:col-span-2">
          <TextInput value={form.name} onChange={(e) => set({ name: e.target.value })} required placeholder="Linen camp-collar shirt" />
        </Field>
        <Field label="Web address (slug)" hint={`/product/${form.slug || slugify(form.name) || "…"}`}>
          <TextInput value={form.slug} onChange={(e) => set({ slug: e.target.value })} placeholder={slugify(form.name)} spellCheck={false} />
        </Field>
        <Field label="Style code" hint="Shared by every variant; seeds the SKUs (e.g. RQ-SH-014).">
          <TextInput value={form.styleCode} onChange={(e) => set({ styleCode: e.target.value.toUpperCase() })} spellCheck={false} />
        </Field>
        <Field label="Status" hint="Only active products appear in the shop.">
          <SelectInput value={form.status} onChange={(e) => set({ status: e.target.value as ProductStatus })}>
            {PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{PRODUCT_STATUS_LABELS[s]}</option>)}
          </SelectInput>
        </Field>
        <div className="flex items-end pb-2"><CheckboxField label="Feature on the home page" checked={form.isFeatured} onChange={(isFeatured) => set({ isFeatured })} /></div>
        <Field label="Short description" className="md:col-span-2" hint="One or two lines under the price.">
          <TextArea rows={2} value={form.shortDescription} onChange={(e) => set({ shortDescription: e.target.value })} />
        </Field>
        <Field label="Description" className="md:col-span-2"><TextArea rows={6} value={form.description} onChange={(e) => set({ description: e.target.value })} /></Field>
      </div>
    </Panel>
  );
}
