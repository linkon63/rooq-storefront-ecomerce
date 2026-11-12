"use client";

import { useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { errorText } from "@/utils/error-text";
import { moveItem } from "@/utils/catalog/form-values";
import type { AdminColor, AdminProductMedia } from "@/types/catalog-admin";
import { Panel, SelectInput } from "../../_catalog/field";
import { ImageInput } from "../../_catalog/image-input";
import { GalleryItem } from "./gallery-item";

const byPosition = (items: AdminProductMedia[]) => [...items].sort((a, b) => a.position - b.position);

/** Product gallery; each image belongs to one colour or to all of them. */
export function GalleryPanel({ productId, initial, colors }: { productId: string; initial: AdminProductMedia[]; colors: AdminColor[] }) {
  const [items, setItems] = useState(() => byPosition(initial));
  const [uploadColor, setUploadColor] = useState("");
  const [uploading, setUploading] = useState(0);

  const fail = (fallback: string) => (err: unknown) => toast.error(errorText(err, fallback));

  async function upload(files: File[]) {
    setUploading(files.length);
    for (const file of files) {
      try {
        const hasPrimary = items.some((m) => m.isPrimary && (m.colorId ?? "") === uploadColor);
        const created = await catalogApi.media.upload(productId, file, { colorId: uploadColor || null, isPrimary: !hasPrimary });
        setItems((current) => byPosition([...current.filter((m) => m.id !== created.id), created]));
      } catch (err) {
        fail(ERROR_MESSAGES.upload.failed)(err);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    toast.success(SUCCESS_MESSAGES.catalog.imageUploaded);
  }

  async function update(item: AdminProductMedia, patch: { colorId?: string | null; isPrimary?: boolean }) {
    try {
      const saved = await catalogApi.media.update(item.id, patch);
      setItems((current) =>
        current.map((m) => {
          if (m.id === saved.id) return saved;
          return saved.isPrimary && m.colorId === saved.colorId ? { ...m, isPrimary: false } : m;
        }),
      );
    } catch (err) {
      fail(ERROR_MESSAGES.ui.saveFailed)(err);
    }
  }

  async function move(index: number, step: -1 | 1) {
    const next = moveItem(items, index, step).map((m, position) => ({ ...m, position }));
    setItems(next);
    await catalogApi.media.reorder(productId, next.map((m) => ({ id: m.id, position: m.position }))).then(setItems, fail(ERROR_MESSAGES.ui.saveFailed));
  }

  async function remove(item: AdminProductMedia) {
    try {
      await catalogApi.media.remove(item.id);
      setItems((current) => current.filter((m) => m.id !== item.id));
    } catch (err) {
      fail(ERROR_MESSAGES.ui.deleteFailed)(err);
    }
  }

  return (
    <Panel title="Gallery" description="Assign each image to a colour so the product page switches photos with the swatch. “All colours” images show for every colour.">
      <div className="grid gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-52">
            <SelectInput aria-label="Colour for new images" value={uploadColor} onChange={(e) => setUploadColor(e.target.value)}>
              <option value="">New images: all colours</option>
              {colors.map((c) => <option key={c.id} value={c.id}>New images: {c.name}</option>)}
            </SelectInput>
          </div>
          <ImageInput label={uploading ? `Uploading ${uploading}…` : "Add images"} multiple disabled={uploading > 0} onFiles={upload} />
        </div>
        {items.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((item, index) => (
              <GalleryItem
                key={item.id}
                item={item}
                colors={colors}
                first={index === 0}
                last={index === items.length - 1}
                onColor={(colorId) => update(item, { colorId })}
                onPrimary={() => update(item, { isPrimary: true })}
                onMove={(step) => move(index, step)}
                onDelete={() => remove(item)}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No images yet. Upload at least one per colour — the first becomes the card image.</p>
        )}
      </div>
    </Panel>
  );
}
