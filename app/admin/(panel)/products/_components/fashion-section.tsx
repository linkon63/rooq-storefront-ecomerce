"use client";

import { FITS, FIT_LABELS, OCCASIONS, OCCASION_LABELS, PATTERNS, PATTERN_LABELS, SEASONS, SEASON_LABELS } from "@/lib/constants/catalog";
import type { Fit, Pattern, Season } from "@/types/catalog-admin";
import { Field, Panel, SelectInput, TextArea, TextInput } from "../../_catalog/field";
import { ChipGroup } from "../../_catalog/chip-group";
import type { SectionProps } from "./section-props";
import { AttributeFields } from "./attribute-fields";

export function FashionSection({ form, set, lookups }: SectionProps) {
  return (
    <Panel title="Fit & fabric" description="Shown on the product page and used by the shop filters.">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Fit">
          <SelectInput value={form.fit} onChange={(e) => set({ fit: e.target.value as Fit | "" })}>
            <option value="">Not set</option>
            {FITS.map((f) => <option key={f} value={f}>{FIT_LABELS[f]}</option>)}
          </SelectInput>
        </Field>
        <Field label="Season">
          <SelectInput value={form.season} onChange={(e) => set({ season: e.target.value as Season | "" })}>
            <option value="">Not set</option>
            {SEASONS.map((s) => <option key={s} value={s}>{SEASON_LABELS[s]}</option>)}
          </SelectInput>
        </Field>
        <Field label="Pattern">
          <SelectInput value={form.pattern} onChange={(e) => set({ pattern: e.target.value as Pattern | "" })}>
            <option value="">Not set</option>
            {PATTERNS.map((p) => <option key={p} value={p}>{PATTERN_LABELS[p]}</option>)}
          </SelectInput>
        </Field>
        <Field label="Material" hint="Main fabric, e.g. Linen"><TextInput value={form.material} onChange={(e) => set({ material: e.target.value })} /></Field>
        <Field label="Composition" className="md:col-span-2" hint="e.g. 95% Cotton, 5% Elastane"><TextInput value={form.composition} onChange={(e) => set({ composition: e.target.value })} /></Field>
        <Field label="Model info" className="md:col-span-3" hint="e.g. Model is 180 cm and wears size M"><TextInput value={form.modelInfo} onChange={(e) => set({ modelInfo: e.target.value })} /></Field>
        <Field label="Care instructions" className="md:col-span-3"><TextArea rows={2} value={form.careInstructions} onChange={(e) => set({ careInstructions: e.target.value })} /></Field>
        <Field label="Feature bullets" className="md:col-span-3" hint="One per line."><TextArea rows={3} value={form.features} onChange={(e) => set({ features: e.target.value })} /></Field>
        <div className="md:col-span-3">
          <ChipGroup label="Occasions" options={OCCASIONS.map((o) => ({ value: o, label: OCCASION_LABELS[o] }))} selected={form.occasions} onChange={(occasions) => set({ occasions })} />
        </div>
        <div className="md:col-span-3"><AttributeFields attributes={lookups.attributes} selected={form.attributeValueIds} onChange={(attributeValueIds) => set({ attributeValueIds })} /></div>
      </div>
    </Panel>
  );
}
