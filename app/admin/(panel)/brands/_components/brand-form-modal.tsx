"use client";

import { useState } from "react";
import { slugify } from "@/utils/slug";
import { FormField, INPUT_CLASS } from "../../../_components/form-field";
import { FormModal } from "../../../_components/form-modal";
import type { BrandForm } from "../_hooks/use-brands";
import { ImagePickField } from "../../../_components/image-pick-field";

type Props = { initial: BrandForm; busy: boolean; error: string; onClose: () => void; onSave: (form: BrandForm) => void };

export function BrandFormModal({ initial, busy, error, onClose, onSave }: Props) {
  const [form, setForm] = useState<BrandForm>(initial);
  const editing = Boolean(form.id);

  return (
    <FormModal
      busy={busy}
      description="Name, slug, and optional logo."
      error={error}
      onClose={onClose}
      onSubmit={() => onSave(form)}
      submitIcon={editing ? "check" : "plus"}
      submitLabel={editing ? "Update Brand" : "Add Brand"}
      title={editing ? "Edit Brand" : "Add Brand"}
    >
      <FormField label="Name">
        <input
          autoFocus
          className={INPUT_CLASS}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.id ? f.slug : slugify(e.target.value) }))}
          required
          value={form.name}
        />
      </FormField>
      <FormField label="Slug">
        <input className={INPUT_CLASS} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required value={form.slug} />
      </FormField>
      <ImagePickField
        currentUrl={form.logoUrl}
        disabled={busy}
        file={form.logo}
        label="Logo"
        onPick={(logo) => setForm((f) => ({ ...f, logo, removeLogo: false }))}
        onRemove={() => setForm((f) => ({ ...f, logo: null, logoUrl: null, removeLogo: true }))}
        placeholderIcon="brand"
        removed={form.removeLogo}
      />
    </FormModal>
  );
}
