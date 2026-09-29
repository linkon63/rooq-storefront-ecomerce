"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import { ConfirmModal } from "../../../_components/confirm-modal";
import { useDiscounts } from "../../../_hooks/use-discounts";
import { apiRequest, resolveImageUrl, type Campaign } from "../../../../../lib/admin-api";
import { ImageSizeHint } from "../../../_components/admin-ui";
import { pickImages } from "../../../../../lib/admin-image-upload";
import { HERO_BANNER_SLOTS, type HeroBannerSlot } from "../../../../../lib/hero-banners";
import type { Section } from "../../../_hooks/use-sections";
import { FieldLabel, SaveButton, SettingsCard, StatusToggle } from "../_components/settings-ui";

/**
 * The three artwork blocks of the storefront home hero: the main banner on the
 * left and the two stacked beside it (see `HERO_BANNER_SLOTS`).
 *
 * They are stored as ordinary campaigns filed under the banner section, which
 * is what the storefront reads — this screen just narrows the campaign form
 * down to the one job: an image per block, each pointing at an offer. The
 * campaign title is what ties a campaign to its block.
 */
const BANNER_SECTION_TITLE = "Banner Campaign";

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
  const [slots, setSlots] = useState<Slot[]>(() => HERO_BANNER_SLOTS.map(emptySlot));
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
      const banners = campaigns.filter((c) =>
        bannerSection ? c.sectionId === bannerSection.id : isBannerSection(c.section?.title),
      );

      setSlots(
        HERO_BANNER_SLOTS.map(({ title }) => {
          const campaign = banners.find((c) => c.title === title);
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
        body.append("title", HERO_BANNER_SLOTS[index].title);
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
        description="The three banners at the top of the home page: the large one on the left and the two beside it."
        action={
          <SaveButton onClick={save} saving={saving}>
            {saving ? "Saving..." : "Update"}
          </SaveButton>
        }
      />

      <SettingsCard
        title="Home Page Banners"
        description="Upload one image per block. The diagram on each card shows which block of the home page it fills. Pick an offer to send shoppers straight to those products."
      >
        {loading ? (
          <p className="text-sm font-medium text-slate-400">Loading banners...</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {slots.map((slot, index) => {
              const slotInfo = HERO_BANNER_SLOTS[index];
              const displayUrl = slot.preview ?? (slot.imageUrl ? resolveImageUrl(slot.imageUrl) : "");
              return (
                <div className="flex flex-col rounded-lg border border-slate-200 p-5" key={slotInfo.key}>
                  <div className="mb-4 flex items-start gap-3">
                    <HeroLayoutDiagram active={slotInfo.key} />
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-800">{slotInfo.label}</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">{slotInfo.placement}</p>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center justify-between">
                    <p className="mt-1 text-xs font-semibold text-slate-600">
                      Recommended size {slotInfo.size} px
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
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
                      const [file] = pickImages(e.target) ?? [];
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
                      <img alt={slotInfo.label} className="h-40 w-full object-cover" src={displayUrl} />
                      <button
                        aria-label={`Remove ${slotInfo.label.toLowerCase()}`}
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
                        <ImageSizeHint className="mt-1" />
                      </span>
                    </button>
                  )}

                  <div className="mt-auto pt-4">
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
        message={
          removeIndex !== null && HERO_BANNER_SLOTS[removeIndex].key === "main"
            ? "This banner will stop showing in the home page slider."
            : "This banner will stop showing on the home page. The default artwork will show in its place."
        }
        onClose={() => setRemoveIndex(null)}
        onConfirm={confirmRemove}
        title="Remove Banner"
      />
    </>
  );
}

/**
 * A thumbnail of the home hero — the large block on the left, two stacked on
 * the right, in the storefront's proportions — with this slot's block filled in.
 */
function HeroLayoutDiagram({ active }: { active: HeroBannerSlot["key"] }) {
  const block = (key: HeroBannerSlot["key"]) =>
    `rounded-[3px] ${key === active ? "bg-blue-600" : "bg-slate-200"}`;
  return (
    <div
      aria-hidden
      className="grid h-11 w-20 shrink-0 grid-cols-[minmax(0,1fr)_32%] grid-rows-2 gap-1 rounded-md border border-slate-200 bg-white p-1"
    >
      <div className={`row-span-2 ${block("main")}`} />
      <div className={block("top")} />
      <div className={block("bottom")} />
    </div>
  );
}
