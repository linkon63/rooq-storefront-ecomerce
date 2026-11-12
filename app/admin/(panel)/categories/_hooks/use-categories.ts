"use client";

import { useCallback, useEffect, useState } from "react";
import { reorderCategories } from "@/lib/admin-api/catalog";
import { apiRequest } from "@/lib/admin/http";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { Category } from "@/types/admin/catalog";
import { flattenForReorder, type CategoryRow } from "@/utils/admin/category-tree";
import { errorText } from "@/utils/api-error";
import { slugify } from "@/utils/slug";

export type CategoryForm = {
  id?: string;
  name: string;
  slug: string;
  parentId: string;
  image: File | null;
  imageUrl: string | null;
  removeImage: boolean;
};

export const EMPTY_CATEGORY_FORM: CategoryForm = { name: "", slug: "", parentId: "", image: null, imageUrl: null, removeImage: false };

export const categoryToForm = (category: CategoryRow): CategoryForm => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  parentId: category.parentId ?? "",
  image: null,
  imageUrl: category.imageUrl ?? null,
  removeImage: false,
});

/** Validation message, or null when the form can be sent. */
function formProblem(form: CategoryForm): string | null {
  if (!form.name.trim()) return ERROR_MESSAGES.validation.required("Name");
  if (!(form.slug || slugify(form.name)).trim()) return ERROR_MESSAGES.validation.required("Slug");
  return null;
}

function toFormData(form: CategoryForm): FormData {
  const body = new FormData();
  body.append("name", form.name.trim());
  body.append("slug", form.slug || slugify(form.name));
  if (form.image) body.append("image", form.image);
  if (form.id && form.removeImage && !form.image) body.append("imageUrl", "");
  if (form.parentId) body.append("parentId", form.parentId);
  else if (form.id) body.append("parentId", "");
  return body;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      setCategories(await apiRequest<Category[]>("/category"));
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.loadFailed));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(form: CategoryForm): Promise<boolean> {
    const problem = formProblem(form);
    if (problem) {
      setError(problem);
      return false;
    }
    setError("");
    setIsSaving(true);
    try {
      await apiRequest<Category>(form.id ? `/category/${form.id}` : "/category", { method: form.id ? "PATCH" : "POST", body: toFormData(form) });
      await load();
      return true;
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.saveFailed));
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(category: Category): Promise<boolean> {
    setError("");
    try {
      await apiRequest(`/category/${category.id}`, { method: "DELETE" });
      await load();
      return true;
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.deleteFailed));
      return false;
    }
  }

  /** Optimistically applies a new tree, then persists it; rolls back on failure. */
  async function reorder(nextTree: Category[]) {
    const previous = categories;
    setCategories(nextTree);
    setIsReordering(true);
    setError("");
    try {
      setCategories(await reorderCategories(flattenForReorder(nextTree)));
    } catch (err) {
      setCategories(previous);
      setError(errorText(err, ERROR_MESSAGES.ui.saveFailed));
    } finally {
      setIsReordering(false);
    }
  }

  return { categories, isLoading, isSaving, isReordering, error, setError, save, remove, reorder };
}
