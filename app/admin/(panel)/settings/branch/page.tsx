"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "../../../_components/admin-shell";
import type { AppSettings } from "@/types/admin/settings";
import { useSettingsSaving, useSettingsLoading } from "../../../_hooks/use-settings";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import {
  SettingsCard,
  FieldLabel,
  Input,
  Textarea,
  SaveButton,
  ErrorBanner,
} from "../_components/settings-ui";

const MapPicker = dynamic(() => import("./map-picker"), { ssr: false });

export default function BranchPage() {
  const [settings, setSettings] = useState<AppSettings>({});
  const { saving, saveSettings } = useSettingsSaving();
  const { loading, error, loadSettings: loadData } = useSettingsLoading();

  const loadSettings = useCallback(async () => {
    const data = await loadData();
    if (data) setSettings(data);
  }, [loadData]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  async function save() {
    await saveSettings("/settings", {
      branchName: settings.branchName ?? null,
      branchAddress: settings.branchAddress ?? null,
      branchLat: settings.branchLat ?? null,
      branchLng: settings.branchLng ?? null,
    }, {
      successMessage: SUCCESS_MESSAGES.common.saved,
      onSuccess: loadSettings,
    });
  }

  return (
    <>
      <PageHeader
        title="Branch"
        description="The store address and map pin shown on the contact page."
        action={
          <SaveButton onClick={save} saving={saving}>
            Save Branch
          </SaveButton>
        }
      />

      <ErrorBanner message={error} />
      <SettingsCard title="Branch Settings">
        {loading ? (
          <p className="py-8 text-sm font-medium text-slate-400">Loading...</p>
        ) : (
          <div className="space-y-8">

            {/* ── Branch Info ── */}
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-[200px_1fr]">
              <div className="pt-1">
                <p className="text-sm font-black text-slate-800">Branch Info</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Name and address of the flagship store.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <FieldLabel>Branch Name</FieldLabel>
                  <Input
                    onChange={(v) => setSettings((p) => ({ ...p, branchName: v }))}
                    placeholder="e.g. Dhaka"
                    value={settings.branchName ?? ""}
                  />
                </div>
                <div>
                  <FieldLabel>Branch Address</FieldLabel>
                  <Textarea
                    onChange={(v) => setSettings((p) => ({ ...p, branchAddress: v }))}
                    placeholder="Enter full branch address"
                    rows={4}
                    value={settings.branchAddress ?? ""}
                  />
                </div>
              </div>
            </div>

            {/* ── Branch Location (Map) ── */}
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-[200px_1fr]">
              <div className="pt-1">
                <p className="text-sm font-black text-slate-800">Branch Location</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Click on the map to set branch location. Drag the marker to adjust.
                </p>
              </div>
              <div>
                <MapPicker
                  lat={settings.branchLat ?? null}
                  lng={settings.branchLng ?? null}
                  onChange={(lat, lng) => setSettings((p) => ({ ...p, branchLat: lat, branchLng: lng }))}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2" />

          </div>
        )}
      </SettingsCard>
    </>
  );
}
