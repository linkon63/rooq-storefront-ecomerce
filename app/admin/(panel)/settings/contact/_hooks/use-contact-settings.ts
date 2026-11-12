"use client";

import { useCallback, useEffect, useState } from "react";
import type { SettingsSocialContact } from "@/types/admin/settings";
import { getContactEntries, packContactEntries } from "@/utils/admin/settings-contacts";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { ContactRow } from "@/utils/settings/contact-entries";
import { useSettingsLoading, useSettingsSaving } from "../../../../_hooks/use-settings";
import type { SocialKey } from "../_components/social-fields";

type Hours = { openingTime: string; closingTime: string };

export function useContactSettings() {
  const { loading, error, loadSettings } = useSettingsLoading();
  const { saving, saveSettings } = useSettingsSaving();
  const [emails, setEmails] = useState<ContactRow[]>(() => getContactEntries(null));
  const [phones, setPhones] = useState<ContactRow[]>(() => getContactEntries(null));
  const [social, setSocial] = useState<SettingsSocialContact>({});
  const [hours, setHours] = useState<Hours>({ openingTime: "", closingTime: "" });

  const load = useCallback(async () => {
    const data = await loadSettings();
    if (!data) return;
    setEmails(getContactEntries(data.email));
    setPhones(getContactEntries(data.contactNumber));
    setSocial(data.socialContact ?? {});
    setHours({ openingTime: data.openingTime ?? "", closingTime: data.closingTime ?? "" });
  }, [loadSettings]);

  useEffect(() => {
    load();
  }, [load]);

  const setSocialLink = (key: SocialKey, value: string) => setSocial((prev) => ({ ...prev, [key]: value }));
  const setHour = (field: keyof Hours, value: string) => setHours((prev) => ({ ...prev, [field]: value }));

  function save() {
    return saveSettings(
      "/settings",
      {
        email: packContactEntries(emails),
        contactNumber: packContactEntries(phones),
        socialContact: social,
        openingTime: hours.openingTime || null,
        closingTime: hours.closingTime || null,
      },
      { successMessage: SUCCESS_MESSAGES.common.saved, onSuccess: load },
    );
  }

  return { loading, error, saving, emails, setEmails, phones, setPhones, social, setSocialLink, hours, setHour, save };
}
