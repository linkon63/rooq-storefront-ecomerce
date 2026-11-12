"use client";

import { Field, Panel, TextArea, TextInput } from "../../_catalog/field";
import type { SectionProps } from "./section-props";

export function SeoSection({ form, set }: Omit<SectionProps, "lookups">) {
  return (
    <Panel title="Search engines">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Meta title"><TextInput value={form.metaTitle} onChange={(e) => set({ metaTitle: e.target.value })} placeholder={form.name} /></Field>
        <Field label="Meta keywords"><TextInput value={form.metaKeywords} onChange={(e) => set({ metaKeywords: e.target.value })} /></Field>
        <Field label="Meta description" className="md:col-span-2"><TextArea rows={2} value={form.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} /></Field>
      </div>
    </Panel>
  );
}
