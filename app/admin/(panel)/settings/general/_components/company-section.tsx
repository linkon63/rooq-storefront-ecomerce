import type { GeneralForm } from "@/utils/settings/general-form";
import { FieldLabel, Input } from "../../_components/settings-ui";
import type { SetGeneralField } from "../_hooks/use-general-settings";
import { SettingsRow } from "./settings-row";

export function CompanySection({ form, setField }: { form: GeneralForm; setField: SetGeneralField }) {
  return (
    <SettingsRow hint="Footer copyright line. The year updates itself." label="Copyright & company">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Copyright year</FieldLabel>
            <p className="flex h-12 items-center rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-500">
              {new Date().getFullYear()}
            </p>
          </div>
          <div>
            <FieldLabel>Parent company</FieldLabel>
            <Input onChange={(value) => setField("parentCompany", value)} placeholder="Company name" value={form.parentCompany} />
          </div>
        </div>
        <div>
          <FieldLabel>Parent company link</FieldLabel>
          <Input onChange={(value) => setField("parentCompanyLink", value)} placeholder="https://" type="url" value={form.parentCompanyLink} />
        </div>
      </div>
    </SettingsRow>
  );
}
