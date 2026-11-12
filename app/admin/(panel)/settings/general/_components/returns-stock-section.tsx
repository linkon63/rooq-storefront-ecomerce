import type { GeneralForm } from "@/utils/settings/general-form";
import type { SetGeneralField } from "../_hooks/use-general-settings";
import { NumberField } from "./money-field";
import { SettingsRow } from "./settings-row";

export function ReturnsStockSection({ form, setField }: { form: GeneralForm; setField: SetGeneralField }) {
  return (
    <SettingsRow
      hint="How long after delivery shoppers can ask for a return or exchange, and when a size counts as running low."
      label="Returns & stock"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="Return window (days)" onChange={(v) => setField("returnWindowDays", v)} value={form.returnWindowDays} />
        <NumberField label="Low-stock alert at (units)" onChange={(v) => setField("lowStockThreshold", v)} value={form.lowStockThreshold} />
      </div>
    </SettingsRow>
  );
}
