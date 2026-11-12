"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { errorText } from "@/utils/error-text";
import { EMPTY_PRODUCT_FORM, formToPayload, missingProductFields, productToForm, type ProductFormState } from "@/utils/catalog/product-form";
import type { AdminProduct } from "@/types/catalog-admin";
import { Button } from "../../_catalog/button";
import { ErrorBlock } from "../../_catalog/data-states";
import type { ProductLookups } from "./lookups";
import { BasicsSection } from "./basics-section";
import { ClassificationSection } from "./classification-section";
import { FashionSection } from "./fashion-section";
import { PricingSection } from "./pricing-section";
import { SeoSection } from "./seo-section";

type Props = { product: AdminProduct | null; lookups: ProductLookups; onSaved: (product: AdminProduct) => void };

export function ProductForm({ product, lookups, onSaved }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormState>(() => (product ? productToForm(product) : EMPTY_PRODUCT_FORM));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<ProductFormState>) => setForm((current) => ({ ...current, ...patch }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    const missing = missingProductFields(form);
    if (missing.length) return setError(`${ERROR_MESSAGES.ui.requiredFields} (${missing.join(", ")})`);
    setSaving(true);
    setError(null);
    try {
      const payload = formToPayload(form);
      const saved = product ? await catalogApi.products.update(product.id, payload) : await catalogApi.products.create(payload);
      toast.success(SUCCESS_MESSAGES.catalog.productSaved);
      if (product) {
        setForm(productToForm(saved));
        onSaved(saved);
      } else router.replace(`/admin/products/${saved.id}/edit`);
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.saveFailed));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      {error ? <ErrorBlock message={error} /> : null}
      <BasicsSection form={form} set={set} />
      <PricingSection form={form} set={set} />
      <ClassificationSection form={form} set={set} lookups={lookups} />
      <FashionSection form={form} set={set} lookups={lookups} />
      <SeoSection form={form} set={set} />
      <div className="sticky bottom-0 z-10 -mx-1 flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/95 px-1 py-3 backdrop-blur">
        {!product ? <span className="mr-auto text-sm text-slate-500">Save first, then add sizes, colours and photos.</span> : null}
        <Button tone="secondary" onClick={() => router.push("/admin/products")}>Back to products</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : product ? "Save product" : "Create product"}</Button>
      </div>
    </form>
  );
}
