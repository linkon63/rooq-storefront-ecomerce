"use client";

import { AdminIcon } from "../../../../_components/admin-shell";
import { addRow, removeRow, updateRow, type ContactRow } from "@/utils/settings/contact-entries";
import { FieldLabel, Input, SettingsCard } from "../../_components/settings-ui";
import { CardBody } from "./card-body";

/** Editable list of titled contact values (emails or phone numbers). */
export function ContactEntriesCard({
  title,
  hint,
  valueLabel,
  titlePlaceholder,
  valuePlaceholder,
  inputType,
  max,
  rows,
  onChange,
}: {
  title: string;
  hint: string;
  valueLabel: string;
  titlePlaceholder: string;
  valuePlaceholder: string;
  inputType: "email" | "tel";
  max: number;
  rows: ContactRow[];
  onChange: (rows: ContactRow[]) => void;
}) {
  return (
    <SettingsCard title={title}>
      <CardBody heading={title} hint={hint}>
        {rows.map((row, index) => (
          <div className="flex items-end gap-3" key={index}>
            <div className="flex-1">
              <FieldLabel>Label {index === 0 ? "(primary)" : `(${index + 1})`}</FieldLabel>
              <Input onChange={(v) => onChange(updateRow(rows, index, "title", v))} placeholder={titlePlaceholder} value={row.title} />
            </div>
            <div className="flex-1">
              <FieldLabel>{valueLabel}</FieldLabel>
              <Input onChange={(v) => onChange(updateRow(rows, index, "value", v))} placeholder={valuePlaceholder} type={inputType} value={row.value} />
            </div>
            {index > 0 ? (
              <button
                aria-label={`Remove ${valueLabel.toLowerCase()} ${index + 1}`}
                className="mb-0.5 grid h-12 w-12 shrink-0 place-items-center rounded-md border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                onClick={() => onChange(removeRow(rows, index))}
                type="button"
              >
                <AdminIcon className="h-4 w-4" name="x" />
              </button>
            ) : null}
          </div>
        ))}
        {rows.length < max ? (
          <button className="text-sm font-black text-slate-800 transition hover:underline" onClick={() => onChange(addRow(rows, max))} type="button">
            Add another
          </button>
        ) : null}
      </CardBody>
    </SettingsCard>
  );
}
