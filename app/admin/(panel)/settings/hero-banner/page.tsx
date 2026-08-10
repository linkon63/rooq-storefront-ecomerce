"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import { ConfirmModal } from "../../../_components/confirm-modal";
import { useDiscounts } from "../../../_hooks/use-discounts";
import { apiRequest, resolveImageUrl, type Campaign } from "../../../../../lib/admin-api";
import type { Section } from "../../../_hooks/use-sections";
import { FieldLabel, SaveButton, SettingsCard, StatusToggle } from "../_components/settings-ui";

/**
 * The two stacked banners beside the hero slider on the storefront home page.
 *
 * They are stored as ordinary campaigns filed under the banner section, which
 * is what the storefront reads — this screen just narrows the campaign form
 * down to the one job: two images, each pointing at an offer.
 */
const BANNER_SECTION_TITLE = "Banner Campaign";
const SLOT_COUNT = 2;

/** Titles are what keeps slot 1 and slot 2 apart across reloads. */
const slotTitle = (index: number) => `Hero Banner ${index + 1}`;

type Slot = {
  /** Campaign backing this slot, absent until the first save. */
  id?: string;
  imageUrl: string;
  file: File | null;
  preview: string | null;
  discountId: string;
  active: boolean;
};

const emptySlot = (): Slot => ({
  imageUrl: "",
  file: null,
  preview: null,
  discountId: "",
  active: true,
});

function isBannerSection(title?: string | null): boolean {
  return (title ?? "").toLowerCase().includes("banner");
}

export default function HeroBannerPage() {
  const [slots, setSlots] = useState<Slot[]>(() => Array.from({ length: SLOT_COUNT }, emptySlot));
  const [sectionId, setSectionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);
  const fileInputs = useRef<(HTMLInputElement | null)[]>([]);

  const { discounts } = useDiscounts();

  // ── Load ───────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sections = await apiRequest<Section[]>("/campaigns/sections");
      const bannerSection = sections.find((s) => isBannerSection(s.title));
      setSectionId(bannerSection?.id ?? "");

      const campaigns = await apiRequest<Campaign[]>("/campaigns");
      const banners = campaigns
        .filter((c) => (bannerSection ? c.sectionId === bannerSection.id : isBannerSection(c.section?.title)))
        .sort((a, b) => a.title.localeCompare(b.title));

      setSlots(
        Array.from({ length: SLOT_COUNT }, (_, index) => {
          const campaign = banners[index];
          if (!campaign) return emptySlot();
          const image = (campaign.images ?? []).flatMap((entry) => entry.images ?? [])[0] ?? "";
          return {
            id: campaign.id,
            imageUrl: image,
            file: null,
            preview: null,
            discountId: campaign.discountId ?? "",
            active: campaign.status === "active",
          };
        }),
      );
    } catch {
      toast.error("Could not load the hero banners.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      for (const slot of slots) if (slot.preview) URL.revokeObjectURL(slot.preview);
    };
    // Revoking on unmount only — the picker revokes as it replaces previews.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Slot editing ───────────────────────────────────────────────────────────

  function patchSlot(index: number, patch: Partial<Slot>) {
    setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  }

  function pickFile(index: number, file: File) {
    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i !== index) return slot;
        if (slot.preview) URL.revokeObjectURL(slot.preview);
        return { ...slot, file, preview: URL.createObjectURL(file) };
      }),
    );
  }

  function clearImage(index: number) {
    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i !== index) return slot;
        if (slot.preview) URL.revokeObjectURL(slot.preview);
        return { ...slot, file: null, preview: null, imageUrl: "" };
      }),
    );
    const input = fileInputs.current[index];
    if (input) input.value = "";
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function save() {
    if (!sectionId) {
      toast.error(`No "${BANNER_SECTION_TITLE}" section found. Run the database seed first.`);
      return;
    }

    const pending = slots.filter((slot) => slot.file || slot.imageUrl || slot.id);
    if (pending.length === 0) {
      toast.error("Add at least one banner image.");
      return;
    }

    setSaving(true);
    try {
      for (const [index, slot] of slots.entries()) {
        const hasImage = Boolean(slot.file || slot.imageUrl);
        // An untouched empty slot is left alone; a cleared one is deleted below.
        if (!hasImage) {
          if (slot.id) await apiRequest(`/campaigns/${slot.id}`, { method: "DELETE" });
          continue;
        }

        const body = new FormData();
        body.append("title", slotTitle(index));
        body.append("sectionId", sectionId);
        body.append("status", slot.active ? "active" : "inactive");
        // Always sent, empty included, so clearing the offer clears the link.
        body.append("discountId", slot.discountId);
        if (slot.file) body.append("images", slot.file);

        if (slot.id) {
          body.append("keepImages", JSON.stringify(slot.file || !slot.imageUrl ? [] : [slot.imageUrl]));
          await apiRequest(`/campaigns/${slot.id}`, { method: "PATCH", body });
        } else {
          await apiRequest("/campaigns", { method: "POST", body });
        }
      }

      toast.success("Hero banners updated.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save the hero banners.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmRemove() {
    const index = removeIndex;
    setRemoveIndex(null);
    if (index === null) return;

    const slot = slots[index];
    if (!slot.id) {
      clearImage(index);
      return;
    }
    try {
      await apiRequest(`/campaigns/${slot.id}`, { method: "DELETE" });
      toast.success("Banner removed.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove the banner.");
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <PageHeader
        title="Hero Banner"
        description="The two banners shown beside the hero slider on the home page."
        action={
          <SaveButton onClick={save} saving={saving}>
            {saving ? "Saving..." : "Update"}
          </SaveButton>
        }
      />

      <SettingsCard
        title="Home Page Banners"
        description="Upload one image per slot. Recommended ratio 552 × 300. Pick an offer to send shoppers straight to those products."
      >
        {loading ? (
          <p className="text-sm font-medium text-slate-400">Loading banners...</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {slots.map((slot, index) => {
              const displayUrl = slot.preview ?? (slot.imageUrl ? resolveImageUrl(slot.imageUrl) : "");
              return (
                <div className="rounded-lg border border-slate-200 p-5" key={index}>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-black text-slate-800">Banner {index + 1}</p>
                    <div className="flex items-center gap-2">
                      <StatusToggle
                        active={slot.active}
                        onChange={(v) => patchSlot(index, { active: v })}
                      />
                      <span className="text-xs font-medium text-slate-500">
                        {slot.active ? "Visible" : "Hidden"}
                      </span>
                    </div>
                  </div>

                  <input
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) pickFile(index, file);
                    }}
                    ref={(el) => {
                      fileInputs.current[index] = el;
                    }}
                    type="file"
                  />

                  {displayUrl ? (
                    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt={`Banner ${index + 1}`} className="h-40 w-full object-cover" src={displayUrl} />
                      <button
                        aria-label={`Remove banner ${index + 1}`}
                        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600 cursor-pointer"
                        onClick={() => setRemoveIndex(index)}
                        type="button"
                      >
                        <AdminIcon className="h-3.5 w-3.5" name="x" />
                      </button>
                      <button
                        className="absolute bottom-2 right-2 rounded-md bg-white/90 px-3 py-1.5 text-xs font-black text-slate-700 shadow transition hover:bg-white cursor-pointer"
                        onClick={() => fileInputs.current[index]?.click()}
                        type="button"
                      >
                        Replace
                      </button>
                    </div>
                  ) : (
                    <button
                      className="grid h-40 w-full place-items-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-slate-400 hover:bg-slate-100 cursor-pointer"
                      onClick={() => fileInputs.current[index]?.click()}
                      type="button"
                    >
                      <span className="flex flex-col items-center gap-1.5">
                        <AdminIcon className="h-7 w-7 text-slate-300" name="plus" />
                        <span className="text-xs font-black text-slate-500">Upload banner image</span>
                      </span>
                    </button>
                  )}

                  <div className="mt-4">
                    <FieldLabel>Links To Offer or Discount</FieldLabel>
                    <select
                      className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      onChange={(e) => patchSlot(index, { discountId: e.target.value })}
                      value={slot.discountId}
                    >
                      <option value="">No offer — open the full shop</option>
                      {discounts.map((discount) => (
                        <option key={discount.id} value={discount.id}>
                          {discount.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs font-medium text-slate-400">
                      Clicking this banner opens the shop showing only this offer&apos;s products.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingsCard>

      <ConfirmModal
        cancelText="No"
        confirmText="Yes, Remove"
        isDestructive
        isOpen={removeIndex !== null}
        message="This banner will stop showing on the home page."
        onClose={() => setRemoveIndex(null)}
        onConfirm={confirmRemove}
        title="Remove Banner"
      />
    </>
  );
}
