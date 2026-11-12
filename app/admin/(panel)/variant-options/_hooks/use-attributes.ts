"use client";

import { apiRequest, jsonInit } from "@/lib/admin/http";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { Attribute } from "@/types/admin/catalog";
import { errorText } from "@/utils/api-error";
import { useCrudResource } from "../../../_hooks/use-crud-resource";
import { useState } from "react";

export type AttributeValueForm = { id?: string; value: string };
export type AttributeForm = { id?: string; name: string; values: AttributeValueForm[] };

export const EMPTY_ATTRIBUTE_FORM: AttributeForm = { name: "", values: [{ value: "" }] };

export const attributeToForm = (option: Attribute): AttributeForm => ({
  id: option.id,
  name: option.name,
  values: option.values?.length ? option.values.map((item) => ({ id: item.id, value: item.value })) : [{ value: "" }],
});

const cleanValues = (values: AttributeValueForm[]) =>
  values.map((item) => ({ ...item, value: item.value.trim() })).filter((item) => item.value.length > 0);

/** Attribute groups (`/attributes`) and their values (`/attribute-values`). */
export function useAttributes() {
  const crud = useCrudResource<Attribute>("/attributes");
  const [isSaving, setIsSaving] = useState(false);

  /** Deletes dropped values, renames kept ones, creates new ones. */
  async function syncValues(attributeId: string, previous: Attribute | null, values: AttributeValueForm[]) {
    const next = cleanValues(values);
    const keep = new Set(next.map((item) => item.id).filter(Boolean));
    await Promise.all((previous?.values ?? []).filter((item) => !keep.has(item.id)).map((item) => apiRequest(`/attribute-values/${item.id}`, { method: "DELETE" })));
    await Promise.all(
      next.map((item) =>
        item.id
          ? apiRequest(`/attribute-values/${item.id}`, jsonInit("PATCH", { value: item.value }))
          : apiRequest(`/attributes/${attributeId}/values`, jsonInit("POST", { value: item.value })),
      ),
    );
  }

  async function save(form: AttributeForm): Promise<boolean> {
    crud.setError("");
    setIsSaving(true);
    try {
      const previous = crud.rows.find((option) => option.id === form.id) ?? null;
      const saved = await apiRequest<Attribute>(form.id ? `/attributes/${form.id}` : "/attributes", jsonInit(form.id ? "PATCH" : "POST", { name: form.name.trim() }));
      await syncValues(saved.id, previous, form.values);
      await crud.load();
      return true;
    } catch (err) {
      crud.setError(errorText(err, ERROR_MESSAGES.ui.saveFailed));
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(option: Attribute): Promise<boolean> {
    crud.setError("");
    try {
      await Promise.all((option.values ?? []).map((item) => apiRequest(`/attribute-values/${item.id}`, { method: "DELETE" })));
      return await crud.remove(option.id);
    } catch (err) {
      crud.setError(errorText(err, ERROR_MESSAGES.ui.deleteFailed));
      return false;
    }
  }

  return { rows: crud.rows, isLoading: crud.isLoading, error: crud.error, setError: crud.setError, isSaving, save, remove };
}
