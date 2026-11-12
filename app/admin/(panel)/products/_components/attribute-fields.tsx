"use client";

import type { Attribute } from "@/types/admin/catalog";
import { Field, SelectInput } from "../../_catalog/field";

/** One select per descriptive attribute (Neckline, Sleeve length…); one value each. */
export function AttributeFields({ attributes, selected, onChange }: { attributes: Attribute[]; selected: string[]; onChange: (ids: string[]) => void }) {
  if (!attributes.length) return null;
  const choose = (attribute: Attribute, valueId: string) => {
    const others = selected.filter((id) => !attribute.values?.some((v) => v.id === id));
    onChange(valueId ? [...others, valueId] : others);
  };
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {attributes.map((attribute) => (
        <Field key={attribute.id} label={attribute.name}>
          <SelectInput value={attribute.values?.find((v) => selected.includes(v.id))?.id ?? ""} onChange={(e) => choose(attribute, e.target.value)}>
            <option value="">Not set</option>
            {attribute.values?.map((v) => <option key={v.id} value={v.id}>{v.value}</option>)}
          </SelectInput>
        </Field>
      ))}
    </div>
  );
}
