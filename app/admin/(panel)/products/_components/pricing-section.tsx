"use client";

import { discountPercent } from "@/utils/catalog/price";
import { numberOrNull } from "@/utils/catalog/form-values";
import { Field, Panel, TextInput } from "../../_catalog/field";
import type { SectionProps } from "./section-props";

export function PricingSection({ form, set }: Omit<SectionProps, "lookups">) {
  const price = numberOrNull(form.price);
  const compare = numberOrNull(form.compareAtPrice);
  const off = price !== null ? discountPercent(price, compare) : 0;
  const cost = numberOrNull(form.costPrice);
  const margin = price && cost !== null ? Math.round(((price - cost) / price) * 100) : null;
  return (
    <Panel title="Pricing" description="Base prices. A variant can override them; active product discounts apply on top.">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Price"><TextInput type="number" min={0} step="0.01" inputMode="decimal" value={form.price} onChange={(e) => set({ price: e.target.value })} required /></Field>
        <Field label="Compare-at price" hint={off ? `Shows as ${off}% off` : "Higher “was” price; leave empty when not on sale."}>
          <TextInput type="number" min={0} step="0.01" inputMode="decimal" value={form.compareAtPrice} onChange={(e) => set({ compareAtPrice: e.target.value })} />
        </Field>
        <Field label="Cost price" hint={margin !== null ? `Margin ${margin}%` : "For margin reports; never shown to shoppers."}>
          <TextInput type="number" min={0} step="0.01" inputMode="decimal" value={form.costPrice} onChange={(e) => set({ costPrice: e.target.value })} />
        </Field>
      </div>
    </Panel>
  );
}
