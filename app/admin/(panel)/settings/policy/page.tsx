"use client";

import { useState } from "react";
import { PageHeader } from "../../../_components/admin-shell";
import { ErrorBanner, SaveButton, SettingsCard } from "../_components/settings-ui";
import { usePolicies } from "./_hooks/use-policies";
import { POLICY_TABS, type PolicyKey } from "./_components/policy-tabs";
import { PolicyTabBar } from "./_components/policy-tab-bar";
import { PolicyEditor } from "./_components/policy-editor";

export default function PolicyPage() {
  const { drafts, loading, saving, error, update, save } = usePolicies();
  const [active, setActive] = useState<PolicyKey>("delivery");
  const label = POLICY_TABS.find((tab) => tab.key === active)?.label ?? "";

  return (
    <>
      <PageHeader
        action={
          <SaveButton onClick={save} saving={saving}>
            Save policies
          </SaveButton>
        }
        description="Delivery, returns, privacy and the other pages linked from the storefront footer."
        title="Policies"
      />
      <ErrorBanner message={error} />
      <SettingsCard title="Policies">
        <PolicyTabBar active={active} onSelect={setActive} />
        {loading ? (
          <p className="py-8 text-sm font-medium text-slate-400">Loading…</p>
        ) : (
          <PolicyEditor label={label} onChange={(field, value) => update(active, field, value)} policy={drafts[active]} />
        )}
      </SettingsCard>
    </>
  );
}
