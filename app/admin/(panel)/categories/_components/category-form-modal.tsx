"use client";

import { useState } from "react";
import type { CategoryRow } from "@/utils/admin/category-tree";
import { slugify } from "@/utils/slug";
import { CheckboxField } from "../../../_components/checkbox-field";
import { FormField, INPUT_CLASS } from "../../../_components/form-field";
import { FormModal } from "../../../_components/form-modal";
import { ImagePickField } from "../../../_components/image-pick-field";
import type { CategoryForm } from "../_hooks/use-categories";

type Props = { initial: CategoryForm; rows: CategoryRow[]; busy: boolean; error: string; onClose: () => void; onSave: (form: CategoryForm) => void };

export function CategoryFormModal({ initial, rows, busy, error, onClose, onSave }: Props) {
  const [form, setForm] = useState<CategoryForm>(initial);
  const editing = Boolean(form.id);

  return (
    <FormModal
      busy={busy}
      description="Build root and nested category records."
      error={error}
      onClose={onClose}
      onSubmit={() => onSave(form)}
      submitIcon={editing ? "check" : "plus"}
      submitLabel={editing ? "Update Category" : "Add Category"}
      title={editing ? "Edit Category" : "Add Category"}
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
      <FormField label="Parent category">
        <select className={INPUT_CLASS} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))} value={form.parentId}>
          <option value="">Root category</option>
          {rows
            .filter((row) => row.id !== form.id)
            .map((row) => (
              <option key={row.id} value={row.id}>
                {"--".repeat(row.depth)} {row.name}
              </option>
            ))}
        </select>
      </FormField>
      <ImagePickField
        currentUrl={form.imageUrl}
        disabled={busy}
        file={form.image}
        label="Image"
        onPick={(image) => setForm((f) => ({ ...f, image, removeImage: false }))}
        onRemove={() => setForm((f) => ({ ...f, image: null, imageUrl: null, removeImage: true }))}
        placeholderIcon="category"
        removed={form.removeImage}
      />
      <CheckboxField
        checked={form.isComingSoon}
        label="Coming soon (shown in the storefront with a Soon tag)"
        onChange={(isComingSoon) => setForm((f) => ({ ...f, isComingSoon }))}
      />
    </FormModal>
  );
}
