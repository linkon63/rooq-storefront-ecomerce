"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { COLLECTION_TYPES, COLLECTION_TYPE_LABELS } from "@/lib/constants/catalog";
import { errorText } from "@/utils/error-text";
import { fromDateTimeInput, textOrNull, toDateTimeInput } from "@/utils/catalog/form-values";
import type { AdminCollectionDetail, CollectionType } from "@/types/catalog-admin";
import { Button } from "../../_catalog/button";
import { CheckboxField, Field, Panel, SelectInput, TextArea, TextInput } from "../../_catalog/field";
import { ErrorBlock } from "../../_catalog/data-states";
import { ProductPicker, type PickedProduct } from "../../_catalog/product-picker";
import { UploadedImageField } from "../../_catalog/uploaded-image-field";
import { toPicked } from "./picked";

export function CollectionForm({ collection, onSaved }: { collection: AdminCollectionDetail | null; onSaved: (saved: AdminCollectionDetail) => void }) {
  const router = useRouter();
  const [name, setName] = useState(collection?.name ?? "");
  const [type, setType] = useState<CollectionType>(collection?.type ?? "COLLECTION");
  const [description, setDescription] = useState(collection?.description ?? "");
  const [isActive, setIsActive] = useState(collection?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(collection?.isFeatured ?? false);
  const [startsAt, setStartsAt] = useState(toDateTimeInput(collection?.startsAt));
  const [endsAt, setEndsAt] = useState(toDateTimeInput(collection?.endsAt));
  const [coverImageUrl, setCover] = useState<string | null>(collection?.coverImageUrl ?? null);
  const [metaTitle, setMetaTitle] = useState(collection?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(collection?.metaDescription ?? "");
  const [products, setProducts] = useState<PickedProduct[]>(collection ? toPicked(collection.productIds, collection.products, "Hidden product (not live)") : []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError(ERROR_MESSAGES.ui.requiredFields);
    setSaving(true);
    setError(null);
    try {
      const saved = await catalogApi.collections.save(collection?.id ?? null, {
        name: name.trim(), type, description: textOrNull(description), isActive, isFeatured,
        startsAt: fromDateTimeInput(startsAt), endsAt: fromDateTimeInput(endsAt), coverImageUrl,
        productIds: products.map((p) => p.id), metaTitle: textOrNull(metaTitle), metaDescription: textOrNull(metaDescription),
      });
      toast.success(SUCCESS_MESSAGES.catalog.saved("Collection"));
      if (collection) onSaved(saved);
      else router.replace(`/admin/collections/${saved.id}`);
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.saveFailed));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      {error ? <ErrorBlock message={error} /> : null}
      <Panel title="Details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name"><TextInput value={name} onChange={(e) => setName(e.target.value)} required /></Field>
          <Field label="Type" hint="Lookbooks add styled scenes (looks) on top of the product grid.">
            <SelectInput value={type} onChange={(e) => setType(e.target.value as CollectionType)}>
              {COLLECTION_TYPES.map((t) => <option key={t} value={t}>{COLLECTION_TYPE_LABELS[t]}</option>)}
            </SelectInput>
          </Field>
          <Field label="Description" className="md:col-span-2"><TextArea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
          <Field label="Visible from" hint="Leave empty to show straight away."><TextInput type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></Field>
          <Field label="Visible until"><TextInput type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></Field>
          <div className="flex flex-wrap gap-6 md:col-span-2">
            <CheckboxField label="Active" checked={isActive} onChange={setIsActive} />
            <CheckboxField label="Featured on the home page" checked={isFeatured} onChange={setIsFeatured} />
          </div>
        </div>
      </Panel>
      <Panel title="Cover image"><UploadedImageField label="Upload cover" url={coverImageUrl} onChange={setCover} /></Panel>
      <Panel title="Products" description="Shown in this order on the collection page."><ProductPicker value={products} onChange={setProducts} /></Panel>
      <Panel title="Search engines">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Meta title"><TextInput value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} /></Field>
          <Field label="Meta description"><TextInput value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} /></Field>
        </div>
      </Panel>
      <div className="flex justify-end gap-2">
        <Button tone="secondary" onClick={() => router.push("/admin/collections")}>Back to collections</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save collection"}</Button>
      </div>
    </form>
  );
}
