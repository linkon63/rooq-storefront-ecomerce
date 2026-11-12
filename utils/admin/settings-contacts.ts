import type { SettingsContactEntry, SettingsContactJson } from "@/types/admin/settings";

/** Helper: extract entries array from the API's JSON object format */
export function getContactEntries(
  field: SettingsContactJson | null | undefined,
): SettingsContactEntry[] {
  if (!field) return [{ title: "", value: "" }];
  if (Array.isArray(field)) {
    // guard against old shape
    return field.length > 0 ? (field as unknown as SettingsContactEntry[]) : [{ title: "", value: "" }];
  }
  const entries = field.entries;
  return Array.isArray(entries) && entries.length > 0
    ? entries
    : [{ title: "", value: "" }];
}

/** Helper: pack entries array back into the API's JSON object format */
export function packContactEntries(entries: SettingsContactEntry[]): SettingsContactJson {
  return { entries };
}
