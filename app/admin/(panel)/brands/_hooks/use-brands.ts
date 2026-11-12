"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/admin/http";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { Brand } from "@/types/admin/catalog";
import { errorText } from "@/utils/api-error";
import { slugify } from "@/utils/slug";

export type BrandForm = { id?: string; name: string; slug: string; logo: File | null; logoUrl: string | null; removeLogo: boolean };

export const EMPTY_BRAND_FORM: BrandForm = { name: "", slug: "", logo: null, logoUrl: null, removeLogo: false };

export const brandToForm = (brand: Brand): BrandForm => ({
  id: brand.id,
  name: brand.name,
  slug: brand.slug,
  logo: null,
  logoUrl: brand.logoUrl ?? null,
  removeLogo: false,
});

/** Multipart body for POST/PATCH /brands (`logo` file; `logoUrl=""` removes the logo). */
function toFormData(form: BrandForm): FormData {
  const body = new FormData();
  body.append("name", form.name);
  body.append("slug", form.slug || slugify(form.name));
  if (form.logo) body.append("logo", form.logo);
  if (form.id && form.removeLogo && !form.logo) body.append("logoUrl", "");
  return body;
}

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      setBrands(await apiRequest<Brand[]>("/brands"));
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.loadFailed));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(form: BrandForm): Promise<boolean> {
    setError("");
    setIsSaving(true);
    try {
      await apiRequest<Brand>(form.id ? `/brands/${form.id}` : "/brands", { method: form.id ? "PATCH" : "POST", body: toFormData(form) });
      await load();
      return true;
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.saveFailed));
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(brand: Brand): Promise<boolean> {
    setError("");
    try {
      await apiRequest(`/brands/${brand.id}`, { method: "DELETE" });
      await load();
      return true;
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.deleteFailed));
      return false;
    }
  }

  return { brands, isLoading, isSaving, error, setError, save, remove };
}
