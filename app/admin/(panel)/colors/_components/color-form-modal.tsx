"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { errorText } from "@/utils/error-text";
import { isHexColor } from "@/utils/color";
import { textOrNull } from "@/utils/catalog/form-values";
import type { AdminColor } from "@/types/catalog-admin";
import { Modal } from "../../_catalog/modal";
import { Button } from "../../_catalog/button";
import { CheckboxField, Field, TextInput } from "../../_catalog/field";
import { ErrorBlock } from "../../_catalog/data-states";

export function ColorFormModal({ color, onClose, onSaved }: { color: AdminColor | null; onClose: () => void; onSaved: (color: AdminColor) => void }) {
  const [name, setName] = useState(color?.name ?? "");
  const [hex, setHex] = useState(color?.hex ?? "#1F2937");
  const [family, setFamily] = useState(color?.family ?? "");
  const [sortOrder, setSortOrder] = useState(String(color?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(color?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError(ERROR_MESSAGES.ui.requiredFields);
    if (!isHexColor(hex)) return setError(ERROR_MESSAGES.validation.invalidHex);
    setSaving(true);
    setError(null);
    try {
      const saved = await catalogApi.colors.save(color?.id ?? null, { name: name.trim(), hex, family: textOrNull(family), sortOrder: Number(sortOrder) || 0, isActive });
      toast.success(SUCCESS_MESSAGES.catalog.saved("Colour"));
      onSaved(saved);
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.saveFailed));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={color ? `Edit ${color.name}` : "New colour"}
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="color-form" disabled={saving}>{saving ? "Saving…" : "Save colour"}</Button>
        </>
      }
    >
      <form id="color-form" onSubmit={submit} className="grid gap-4">
        {error ? <ErrorBlock message={error} /> : null}
        <Field label="Name" hint="Shown on swatches and in the colour filter, e.g. Sage, Navy.">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </Field>
        <div className="grid grid-cols-[auto_1fr] items-end gap-3">
          <input type="color" aria-label="Pick colour" value={isHexColor(hex) ? hex : "#000000"} onChange={(e) => setHex(e.target.value.toUpperCase())} className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300" />
          <Field label="Hex value">
            <TextInput value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#RRGGBB" spellCheck={false} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Colour family" hint="Groups shades in the shop filter (Navy → Blue).">
            <TextInput value={family} onChange={(e) => setFamily(e.target.value)} />
          </Field>
          <Field label="Sort order">
            <TextInput type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </Field>
        </div>
        <CheckboxField label="Active (available for new variants)" checked={isActive} onChange={setIsActive} />
      </form>
    </Modal>
  );
}
