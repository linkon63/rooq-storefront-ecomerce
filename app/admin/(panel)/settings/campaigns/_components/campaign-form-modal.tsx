"use client";

import { useState, type FormEvent } from "react";
import { AdminIcon } from "../../../../_components/admin-shell";
import type { CampaignSection } from "@/types/admin/content";
import type { ProductDiscount } from "@/types/product-discount";
import type { CampaignFormState } from "@/utils/mappers/campaign-form";
import { FieldLabel, Input, StatusToggle, Textarea } from "../../_components/settings-ui";
import { CampaignDiscountField } from "./campaign-discount-field";
import { CampaignImagesField } from "./campaign-images-field";

type Props = {
  initial: CampaignFormState;
  sections: CampaignSection[];
  discounts: ProductDiscount[];
  onClose: () => void;
  onSave: (form: CampaignFormState) => Promise<boolean>;
};

const selectClass =
  "h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100";

export function CampaignFormModal({ initial, sections, discounts, onClose, onSave }: Props) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<CampaignFormState>) => setForm((p) => ({ ...p, ...patch }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const saved = await onSave(form);
    setSaving(false);
    if (saved) onClose();
  }

  return (
    <div aria-labelledby="campaign-modal-title" aria-modal="true" className="modal-backdrop fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6" role="dialog">
      <form className="modal-panel flex max-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl" onSubmit={submit}>
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900" id="campaign-modal-title">
              {form.id ? "Edit campaign" : "Add campaign"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Artwork, copy and the offer a home page block points to.</p>
          </div>
          <button aria-label="Close" className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-slate-300 text-slate-600" disabled={saving} onClick={onClose} type="button">
            <AdminIcon className="h-4 w-4" name="x" />
          </button>
        </header>

        <div className="modal-body flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel required>Section</FieldLabel>
              <select className={selectClass} onChange={(e) => set({ sectionId: e.target.value })} required value={form.sectionId}>
                <option value="">Select a section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.page})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <div className="flex h-12 items-center gap-3">
                <StatusToggle active={form.status === "active"} onChange={(v) => set({ status: v ? "active" : "inactive" })} />
                <span className="text-sm font-medium text-slate-600">{form.status === "active" ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>
          <div>
            <FieldLabel required>Title</FieldLabel>
            <Input onChange={(title) => set({ title })} placeholder="The Summer Edit" required value={form.title} />
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            <Textarea onChange={(description) => set({ description })} placeholder="Linen and light layers for long days…" rows={3} value={form.description} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Button link</FieldLabel>
              <Input onChange={(linkUrl) => set({ linkUrl })} placeholder="/shop?collection=summer-edit" value={form.linkUrl} />
            </div>
            <div>
              <FieldLabel>Button label</FieldLabel>
              <Input onChange={(linkLabel) => set({ linkLabel })} placeholder="Shop the edit" value={form.linkLabel} />
            </div>
          </div>
          <CampaignImagesField
            existing={form.existingImages}
            files={form.images}
            onExistingChange={(existingImages) => set({ existingImages })}
            onFilesChange={(images) => set({ images })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Starts</FieldLabel>
              <Input onChange={(startAt) => set({ startAt })} type="datetime-local" value={form.startAt} />
            </div>
            <div>
              <FieldLabel>Ends</FieldLabel>
              <Input onChange={(endAt) => set({ endAt })} type="datetime-local" value={form.endAt} />
            </div>
          </div>
          <CampaignDiscountField discounts={discounts} onChange={(discountId) => set({ discountId })} value={form.discountId} />
        </div>

        <footer className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button className="h-11 cursor-pointer rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50" disabled={saving} onClick={onClose} type="button">
            Cancel
          </button>
          <button className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-md bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400" disabled={saving} type="submit">
            <AdminIcon className="h-4 w-4" name={form.id ? "check" : "plus"} />
            {saving ? "Saving…" : form.id ? "Update campaign" : "Add campaign"}
          </button>
        </footer>
      </form>
    </div>
  );
}
