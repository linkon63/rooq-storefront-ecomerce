"use client";

import type { SettingsSocialContact } from "@/types/admin/settings";
import { FieldLabel, SettingsCard } from "../../_components/settings-ui";
import { CardBody } from "./card-body";
import { SOCIAL_FIELDS, type SocialKey } from "./social-fields";

export function SocialProfilesCard({
  social,
  onChange,
}: {
  social: SettingsSocialContact;
  onChange: (key: SocialKey, value: string) => void;
}) {
  return (
    <SettingsCard title="Social profiles">
      <CardBody heading="Social profiles" hint="Links shown in the storefront footer. Leave a field empty to hide it.">
        {SOCIAL_FIELDS.map(({ key, label, placeholder, bg, Icon }) => (
          <div key={key}>
            <FieldLabel>{label}</FieldLabel>
            <div className="flex items-center overflow-hidden rounded-md border border-slate-200 bg-white transition focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100">
              <span aria-hidden className={`grid h-12 w-12 shrink-0 place-items-center text-white ${bg}`}>
                <Icon className="h-5 w-5" />
              </span>
              <input
                aria-label={`${label} URL`}
                className="h-12 flex-1 bg-transparent px-3 text-sm font-medium text-slate-800 outline-none"
                onChange={(event) => onChange(key, event.target.value)}
                placeholder={placeholder}
                type="url"
                value={social[key] ?? ""}
              />
            </div>
          </div>
        ))}
      </CardBody>
    </SettingsCard>
  );
}
