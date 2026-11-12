"use client";

import { useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { errorText } from "@/utils/error-text";
import { textOrNull } from "@/utils/catalog/form-values";
import type { AdminLook } from "@/types/catalog-admin";
import { Button } from "../../_catalog/button";
import { Field, TextArea, TextInput } from "../../_catalog/field";
import { ProductPicker, type PickedProduct } from "../../_catalog/product-picker";
import { UploadedImageField } from "../../_catalog/uploaded-image-field";
import { toPicked } from "./picked";

type Props = { collectionId: string; look: AdminLook | null; onDone: () => void };

/** Create or edit one "shop the look" scene: an image plus the products worn in it. */
export function LookEditor({ collectionId, look, onDone }: Props) {
  const [title, setTitle] = useState(look?.title ?? "");
  const [description, setDescription] = useState(look?.description ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(look?.imageUrl ?? null);
  const [products, setProducts] = useState<PickedProduct[]>(look ? toPicked(look.productIds, look.products, "Hidden product") : []);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const body = { title: textOrNull(title), description: textOrNull(description), imageUrl, productIds: products.map((p) => p.id) };
      if (look) await catalogApi.collections.updateLook(look.id, body);
      else await catalogApi.collections.addLook(collectionId, body);
      toast.success(SUCCESS_MESSAGES.catalog.saved("Look"));
      onDone();
    } catch (err) {
      toast.error(errorText(err, ERROR_MESSAGES.ui.saveFailed));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 rounded-lg border border-blue-200 bg-blue-50/40 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Weekend in linen" /></Field>
        <Field label="Caption"><TextArea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
      </div>
      <UploadedImageField label="Upload look image" url={imageUrl} onChange={setImageUrl} />
      <p className="text-sm font-medium text-slate-700">Products in this look</p>
      <ProductPicker value={products} onChange={setProducts} />
      <div className="flex justify-end gap-2">
        <Button tone="secondary" onClick={onDone}>Cancel</Button>
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : look ? "Save look" : "Add look"}</Button>
      </div>
    </div>
  );
}
