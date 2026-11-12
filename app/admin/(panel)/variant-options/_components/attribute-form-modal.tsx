"use client";

import { useState } from "react";
import { FormField, INPUT_CLASS } from "../../../_components/form-field";
import { FormModal } from "../../../_components/form-modal";
import type { AttributeForm } from "../_hooks/use-attributes";
import { AttributeValuesEditor } from "./attribute-values-editor";

type Props = { initial: AttributeForm; busy: boolean; error: string; onClose: () => void; onSave: (form: AttributeForm) => void };

export function AttributeFormModal({ initial, busy, error, onClose, onSave }: Props) {
  const [form, setForm] = useState<AttributeForm>(initial);
  const editing = Boolean(form.id);
  return (
    <FormModal
      busy={busy}
      description="Set the option group and the values shoppers can filter by."
      error={error}
      onClose={onClose}
      onSubmit={() => onSave(form)}
      submitIcon={editing ? "check" : "plus"}
      submitLabel={editing ? "Update Option" : "Add Option"}
      title={editing ? "Edit Variant Option" : "Add Variant Option"}
    >
      <FormField label="Name">
        <input autoFocus className={INPUT_CLASS} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Fabric" required value={form.name} />
      </FormField>
      <AttributeValuesEditor disabled={busy} onChange={(values) => setForm((f) => ({ ...f, values }))} values={form.values} />
    </FormModal>
  );
}
