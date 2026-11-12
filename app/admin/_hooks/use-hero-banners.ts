"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SECTION_TITLES } from "@/lib/constants/content";
import { deleteCampaign, getCampaignSections, getCampaigns, saveCampaign } from "@/lib/admin-api/content";
import { campaignImageUrls } from "@/utils/admin/content";
import { HERO_BANNER_SLOTS } from "@/lib/constants/hero-banners";
import { emptyHeroSlot, findBannerSection, heroSlotFormData, type HeroBannerSlotState } from "@/utils/mappers/hero-banner";

const messageOf = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

/** The three hero banner slots, each stored as a campaign in the "Banner Campaign" section. */
export function useHeroBanners() {
  const [slots, setSlots] = useState<HeroBannerSlotState[]>(() => HERO_BANNER_SLOTS.map(emptyHeroSlot));
  const [sectionId, setSectionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sections, campaigns] = await Promise.all([getCampaignSections(), getCampaigns()]);
      const section = findBannerSection(sections, SECTION_TITLES.banner);
      setSectionId(section?.id ?? "");
      const banners = campaigns.filter((c) => (section ? c.sectionId === section.id : false));
      setSlots(
        HERO_BANNER_SLOTS.map(({ title }) => {
          const campaign = banners.find((c) => c.title === title);
          if (!campaign) return emptyHeroSlot();
          return {
            id: campaign.id,
            imageUrl: campaignImageUrls(campaign)[0] ?? "",
            file: null,
            preview: null,
            discountId: campaign.discountId ?? "",
            active: campaign.status === "active",
          };
        }),
      );
    } catch (err) {
      toast.error(messageOf(err, ERROR_MESSAGES.campaign.bannersLoadFailed));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patchSlot = useCallback((index: number, patch: Partial<HeroBannerSlotState>) => {
    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i !== index) return slot;
        if (slot.preview && "preview" in patch && patch.preview !== slot.preview) URL.revokeObjectURL(slot.preview);
        return { ...slot, ...patch };
      }),
    );
  }, []);

  async function save(): Promise<boolean> {
    if (!sectionId) {
      toast.error(ERROR_MESSAGES.campaign.bannerSectionMissing(SECTION_TITLES.banner));
      return false;
    }
    if (!slots.some((slot) => slot.file || slot.imageUrl || slot.id)) {
      toast.error(ERROR_MESSAGES.campaign.bannerImageRequired);
      return false;
    }
    setSaving(true);
    try {
      for (const [index, slot] of slots.entries()) {
        if (!slot.file && !slot.imageUrl) {
          if (slot.id) await deleteCampaign(slot.id);
          continue;
        }
        await saveCampaign(slot.id, heroSlotFormData(slot, HERO_BANNER_SLOTS[index].title, sectionId));
      }
      await load();
      return true;
    } catch (err) {
      toast.error(messageOf(err, ERROR_MESSAGES.campaign.bannersSaveFailed));
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function removeSlot(index: number): Promise<boolean> {
    const slot = slots[index];
    if (!slot?.id) {
      patchSlot(index, { file: null, preview: null, imageUrl: "" });
      return true;
    }
    try {
      await deleteCampaign(slot.id);
      await load();
      return true;
    } catch (err) {
      toast.error(messageOf(err, ERROR_MESSAGES.campaign.bannerRemoveFailed));
      return false;
    }
  }

  return { slots, loading, saving, patchSlot, save, removeSlot };
}
