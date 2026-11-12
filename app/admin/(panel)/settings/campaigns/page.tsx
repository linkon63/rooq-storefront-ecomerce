"use client";

import { useMemo, useState } from "react";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import { ConfirmModal } from "../../../_components/confirm-modal";
import { useCampaigns } from "../../../_hooks/use-campaigns";
import { useDiscounts } from "../../../_hooks/use-discounts";
import { useSections } from "../../../_hooks/use-sections";
import type { Campaign } from "@/types/admin/content";
import { campaignImageUrls } from "@/utils/admin/content";
import { campaignToForm, emptyCampaignForm, type CampaignFormState } from "@/utils/mappers/campaign-form";
import { SaveButton, SettingsCard } from "../_components/settings-ui";
import { CampaignFormModal } from "./_components/campaign-form-modal";
import { CampaignTable } from "./_components/campaign-table";
import { SectionsCard } from "./_components/sections-card";

export default function CampaignsPage() {
  const { campaigns, isLoading, error, save, toggleStatus, remove } = useCampaigns();
  const sections = useSections();
  const { discounts } = useDiscounts();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CampaignFormState | null>(null);
  const [toDelete, setToDelete] = useState<Campaign | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return campaigns;
    return campaigns.filter((c) => `${c.title} ${c.section?.title ?? ""}`.toLowerCase().includes(query));
  }, [campaigns, search]);

  async function confirmDelete() {
    if (toDelete && (await remove(toDelete))) setToDelete(null);
  }

  return (
    <>
      <PageHeader
        action={<SaveButton onClick={() => setEditing(emptyCampaignForm(new Date()))}>Add campaign</SaveButton>}
        description="Hero slides, banners and lookbook blocks on the home page, each linked to an offer."
        title="Campaigns"
      />

      <div className="space-y-6">
        <SettingsCard title="Campaign list">
          {error && <p className="mb-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite" className="text-sm font-medium text-slate-500">
              {filtered.length} campaign{filtered.length === 1 ? "" : "s"}
            </p>
            <label className="flex h-10 w-full max-w-xs items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
              <AdminIcon className="h-4 w-4 shrink-0 text-slate-400" name="search" />
              <span className="sr-only">Search campaigns</span>
              <input className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none" onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or section" type="search" value={search} />
            </label>
          </div>
          <CampaignTable
            campaigns={filtered}
            isLoading={isLoading}
            onDelete={setToDelete}
            onEdit={(c) => setEditing(campaignToForm(c, campaignImageUrls(c), new Date()))}
            onToggle={toggleStatus}
          />
        </SettingsCard>

        <SectionsCard {...sections} />
      </div>

      {editing && (
        <CampaignFormModal
          discounts={discounts}
          initial={editing}
          key={editing.id ?? "new"}
          onClose={() => setEditing(null)}
          onSave={save}
          sections={sections.sections}
        />
      )}

      <ConfirmModal
        cancelText="Keep"
        confirmText="Delete campaign"
        isDestructive
        isOpen={toDelete !== null}
        message={`Delete "${toDelete?.title}"? Its images are removed too. This cannot be undone.`}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete campaign"
      />
    </>
  );
}
