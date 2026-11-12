"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "../../../_components/admin-shell";
import { ConfirmModal } from "../../../_components/confirm-modal";
import { useDiscounts } from "../../../_hooks/use-discounts";
import { useHeroBanners } from "../../../_hooks/use-hero-banners";
import { HERO_BANNER_SLOTS } from "@/lib/constants/hero-banners";
import { SaveButton, SettingsCard } from "../_components/settings-ui";
import { BannerSlotCard } from "./_components/banner-slot-card";

/**
 * The three artwork blocks of the storefront home hero, stored as campaigns in
 * the "Banner Campaign" section; the campaign title ties a campaign to its block.
 */
export default function HeroBannerPage() {
  const { slots, loading, saving, patchSlot, save, removeSlot } = useHeroBanners();
  const { discounts } = useDiscounts();
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  async function update() {
    if (await save()) toast.success("Hero banners updated.");
  }

  async function confirmRemove() {
    const index = removeIndex;
    setRemoveIndex(null);
    if (index !== null) await removeSlot(index);
  }

  return (
    <>
      <PageHeader
        action={
          <SaveButton onClick={update} saving={saving}>
            {saving ? "Saving…" : "Update"}
          </SaveButton>
        }
        description="The three banners at the top of the home page: the large one on the left and the two beside it."
        title="Hero Banner"
      />
      <SettingsCard
        description="Upload one image per block. The diagram on each card shows which block of the home page it fills. Pick an offer to send shoppers straight to those products."
        title="Home page banners"
      >
        {loading ? (
          <p className="text-sm font-medium text-slate-400">Loading banners…</p>
        ) : (
          <div className="grid gap-6 2xl:grid-cols-3">
            {slots.map((slot, index) => (
              <BannerSlotCard
                discounts={discounts}
                info={HERO_BANNER_SLOTS[index]}
                key={HERO_BANNER_SLOTS[index].key}
                onPatch={(patch) => patchSlot(index, patch)}
                onRemove={() => setRemoveIndex(index)}
                slot={slot}
              />
            ))}
          </div>
        )}
      </SettingsCard>
      <ConfirmModal
        cancelText="Keep"
        confirmText="Remove banner"
        isDestructive
        isOpen={removeIndex !== null}
        message={
          removeIndex !== null && HERO_BANNER_SLOTS[removeIndex].key === "main"
            ? "This banner will stop showing in the home page slider."
            : "This banner will stop showing on the home page. The default artwork will show in its place."
        }
        onClose={() => setRemoveIndex(null)}
        onConfirm={confirmRemove}
        title="Remove banner"
      />
    </>
  );
}
