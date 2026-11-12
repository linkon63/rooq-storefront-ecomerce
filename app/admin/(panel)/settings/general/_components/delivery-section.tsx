import type { GeneralForm } from "@/utils/settings/general-form";
import type { SetGeneralField } from "../_hooks/use-general-settings";
import { NumberField } from "./money-field";
import { SettingsRow } from "./settings-row";

export function DeliverySection({ form, setField }: { form: GeneralForm; setField: SetGeneralField }) {
  const c = form.currency;
  return (
    <SettingsRow
      hint="The shopper picks a zone at checkout. Orders at or above the free-shipping amount ship free; leave it empty to always charge."
      label="Delivery"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <NumberField label={`Inside city (${c})`} onChange={(v) => setField("deliveryChargeInside", v)} value={form.deliveryChargeInside} />
        <NumberField label={`Near city (${c})`} onChange={(v) => setField("deliveryChargeNearCity", v)} value={form.deliveryChargeNearCity} />
        <NumberField label={`Outside city (${c})`} onChange={(v) => setField("deliveryChargeOutside", v)} value={form.deliveryChargeOutside} />
        <NumberField
          label={`Free shipping from (${c})`}
          onChange={(v) => setField("freeShippingThreshold", v)}
          placeholder="Never"
          value={form.freeShippingThreshold}
        />
      </div>
    </SettingsRow>
  );
}
