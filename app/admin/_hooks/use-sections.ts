"use client";

import { useCallback, useEffect, useState } from "react";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { createSection, deleteSection, getCampaignSections, updateSection } from "@/lib/admin-api/content";
import type { CampaignSection, SectionInput } from "@/types/admin/content";

export type Section = CampaignSection;

const messageOf = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

/** Sections campaigns are filed under (home hero, banners, lookbook…), with CRUD. */
export function useSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSections = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setSections(await getCampaignSections());
    } catch (err) {
      setError(messageOf(err, ERROR_MESSAGES.section.loadFailed));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSections();
  }, [loadSections]);

  /** Each mutation resolves to an error message, or null on success. */
  async function run(action: () => Promise<unknown>): Promise<string | null> {
    try {
      await action();
      await loadSections();
      return null;
    } catch (err) {
      return messageOf(err, ERROR_MESSAGES.ui.saveFailed);
    }
  }

  return {
    sections,
    isLoading,
    error,
    loadSections,
    addSection: (input: SectionInput) => run(() => createSection(input)),
    editSection: (id: string, input: Partial<SectionInput>) => run(() => updateSection(id, input)),
    removeSection: (id: string) => run(() => deleteSection(id)),
  };
}
