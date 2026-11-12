import type { GeneralForm } from "@/utils/settings/general-form";
import { FieldLabel, Input } from "../../_components/settings-ui";
import type { SetGeneralField } from "../_hooks/use-general-settings";
import { SelectField } from "./select-field";
import { SettingsRow } from "./settings-row";

const CURRENCIES = ["BDT", "USD", "EUR", "GBP", "INR", "SAR", "AED"].map((code) => ({ value: code, label: code }));
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "bn", label: "Bengali" },
  { value: "ar", label: "Arabic" },
];

export function BasicInfoSection({ form, setField }: { form: GeneralForm; setField: SetGeneralField }) {
  return (
    <SettingsRow hint="Store name, currency and language." label="Basic info">
      <div className="space-y-4">
        <div>
          <FieldLabel required>Shop name</FieldLabel>
          <Input onChange={(value) => setField("shopName", value)} placeholder="Rooq" required value={form.shopName} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel required>Currency</FieldLabel>
            <SelectField id="currency" onChange={(value) => setField("currency", value)} options={CURRENCIES} value={form.currency} />
          </div>
          <div>
            <FieldLabel required>Language</FieldLabel>
            <SelectField id="language" onChange={(value) => setField("language", value)} options={LANGUAGES} value={form.language} />
          </div>
        </div>
      </div>
    </SettingsRow>
  );
}
