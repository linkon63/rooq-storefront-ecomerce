"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getPolicies, updatePolicies } from "@/lib/admin-api/platform";
import type { AppPolicies, PolicyEntry } from "@/types/admin/settings";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { POLICY_TABS, type PolicyKey } from "../_components/policy-tabs";

type Drafts = Record<PolicyKey, PolicyEntry>;

const EMPTY: PolicyEntry = { title: "", content: "" };

function toDrafts(record: AppPolicies | null): Drafts {
  return Object.fromEntries(POLICY_TABS.map(({ key }) => [key, record?.[key] ?? EMPTY])) as Drafts;
}

const messageOf = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);

export function usePolicies() {
  const [drafts, setDrafts] = useState<Drafts>(() => toDrafts(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDrafts(toDrafts(await getPolicies()));
    } catch (err) {
      setError(messageOf(err, ERROR_MESSAGES.policy.loadFailed));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function update(key: PolicyKey, field: keyof PolicyEntry, value: string) {
    setDrafts((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  async function save() {
    setSaving(true);
    try {
      setDrafts(toDrafts(await updatePolicies(drafts)));
      toast.success(SUCCESS_MESSAGES.common.saved);
    } catch (err) {
      toast.error(messageOf(err, ERROR_MESSAGES.policy.saveFailed));
    } finally {
      setSaving(false);
    }
  }

  return { drafts, loading, saving, error, update, save };
}
