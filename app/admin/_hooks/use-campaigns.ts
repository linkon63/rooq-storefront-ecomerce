"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { deleteCampaign, getCampaigns, saveCampaign, setCampaignStatus } from "@/lib/admin-api/content";
import type { Campaign } from "@/types/admin/content";
import { campaignFormData, type CampaignFormState } from "@/utils/mappers/campaign-form";

const messageOf = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

/** Every campaign (staff see inactive ones too) with save / status / delete. */
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setCampaigns(await getCampaigns());
    } catch (err) {
      setCampaigns([]);
      setError(messageOf(err, ERROR_MESSAGES.campaign.loadFailed));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Resolves to true when saved; failures are toasted. */
  async function save(form: CampaignFormState): Promise<boolean> {
    if (form.images.length === 0 && form.existingImages.length === 0) {
      toast.error(ERROR_MESSAGES.campaign.imageRequired);
      return false;
    }
    try {
      await saveCampaign(form.id, campaignFormData(form));
      await load();
      return true;
    } catch (err) {
      toast.error(messageOf(err, ERROR_MESSAGES.campaign.saveFailed));
      return false;
    }
  }

  async function toggleStatus(campaign: Campaign) {
    const status = campaign.status === "active" ? "inactive" : "active";
    setCampaigns((prev) => prev.map((item) => (item.id === campaign.id ? { ...item, status } : item)));
    try {
      await setCampaignStatus(campaign.id, status);
    } catch (err) {
      setCampaigns((prev) => prev.map((item) => (item.id === campaign.id ? { ...item, status: campaign.status } : item)));
      toast.error(messageOf(err, ERROR_MESSAGES.campaign.statusFailed));
    }
  }

  async function remove(campaign: Campaign): Promise<boolean> {
    try {
      await deleteCampaign(campaign.id);
      setCampaigns((prev) => prev.filter((item) => item.id !== campaign.id));
      return true;
    } catch (err) {
      toast.error(messageOf(err, ERROR_MESSAGES.campaign.deleteFailed));
      return false;
    }
  }

  return { campaigns, isLoading, error, load, save, toggleStatus, remove };
}
