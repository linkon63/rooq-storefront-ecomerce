"use client";

import { useState } from "react";
import { slugify } from "@/utils/slug";
import { CheckboxField } from "../../../_components/checkbox-field";
import { FormField, INPUT_CLASS, TEXTAREA_CLASS } from "../../../_components/form-field";
import { FormModal } from "../../../_components/form-modal";

export type TagForm = { id?: string; name: string; slug: string; description: string; isActive: boolean };
export const EMPTY_TAG_FORM: TagForm = { name: "", slug: "", description: "", isActive: true };

type Props = { initial: TagForm; busy: boolean; error: string; onClose: () => void; onSave: (form: TagForm) => void };

export function TagFormModal({ initial, busy, error, onClose, onSave }: Props) {
  const [form, setForm] = useState<TagForm>(initial);
  const editing = Boolean(form.id);
  return (
    <FormModal
      busy={busy}
      description="Searchable labels shoppers can filter by."
      error={error}
      onClose={onClose}
      onSubmit={() => onSave(form)}
      submitIcon={editing ? "check" : "plus"}
      submitLabel={editing ? "Update Tag" : "Add Tag"}
      title={editing ? "Edit Tag" : "Add Tag"}
    >
      <FormField label="Name">
        <input autoFocus className={INPUT_CLASS} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.id ? f.slug : slugify(e.target.value) }))} required value={form.name} />
      </FormField>
      <FormField label="Slug">
        <input className={INPUT_CLASS} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required value={form.slug} />
      </FormField>
      <FormField label="Description">
        <textarea className={`min-h-24 ${TEXTAREA_CLASS}`} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} value={form.description} />
      </FormField>
      <CheckboxField checked={form.isActive} label="Active tag" onChange={(isActive) => setForm((f) => ({ ...f, isActive }))} />
    </FormModal>
  );
}
