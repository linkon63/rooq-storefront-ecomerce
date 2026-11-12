"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { SIZE_GROUPS, SIZE_GROUP_LABELS } from "@/lib/constants/catalog";
import { errorText } from "@/utils/error-text";
import type { AdminSize, SizeGroup } from "@/types/catalog-admin";
import { Modal } from "../../_catalog/modal";
import { Button } from "../../_catalog/button";
import { CheckboxField, Field, SelectInput, TextInput } from "../../_catalog/field";
import { ErrorBlock } from "../../_catalog/data-states";

type Props = { size: AdminSize | null; defaultGroup: SizeGroup; onClose: () => void; onSaved: () => void };

export function SizeFormModal({ size, defaultGroup, onClose, onSaved }: Props) {
  const [label, setLabel] = useState(size?.label ?? "");
  const [sizeGroup, setSizeGroup] = useState<SizeGroup>(size?.sizeGroup ?? defaultGroup);
  const [isActive, setIsActive] = useState(size?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!label.trim()) return setError(ERROR_MESSAGES.ui.requiredFields);
    setSaving(true);
    setError(null);
    try {
      await catalogApi.sizes.save(size?.id ?? null, { label: label.trim(), sizeGroup, isActive });
      toast.success(SUCCESS_MESSAGES.catalog.saved("Size"));
      onSaved();
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.saveFailed));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={size ? `Edit size ${size.label}` : "New size"}
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="size-form" disabled={saving}>{saving ? "Saving…" : "Save size"}</Button>
        </>
      }
    >
      <form id="size-form" onSubmit={submit} className="grid gap-4">
        {error ? <ErrorBlock message={error} /> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Label" hint="As shoppers see it: XS, M, 32, 42, One Size.">
            <TextInput value={label} onChange={(e) => setLabel(e.target.value)} required autoFocus />
          </Field>
          <Field label="Size group">
            <SelectInput value={sizeGroup} onChange={(e) => setSizeGroup(e.target.value as SizeGroup)}>
              {SIZE_GROUPS.map((group) => <option key={group} value={group}>{SIZE_GROUP_LABELS[group]}</option>)}
            </SelectInput>
          </Field>
        </div>
        <CheckboxField label="Active (available for new variants)" checked={isActive} onChange={setIsActive} />
      </form>
    </Modal>
  );
}
