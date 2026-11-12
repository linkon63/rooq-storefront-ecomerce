"use client";

import { formatHour } from "@/utils/business-hours";
import { FieldLabel, Input, SettingsCard } from "../../_components/settings-ui";
import { CardBody } from "./card-body";

export function BusinessHoursCard({
  openingTime,
  closingTime,
  onChange,
}: {
  openingTime: string;
  closingTime: string;
  onChange: (field: "openingTime" | "closingTime", value: string) => void;
}) {
  return (
    <SettingsCard title="Business hours">
      <CardBody heading="Opening and closing" hint="Shown in the storefront header, footer and contact page.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Opens</FieldLabel>
            <Input onChange={(v) => onChange("openingTime", v)} type="time" value={openingTime} />
          </div>
          <div>
            <FieldLabel>Closes</FieldLabel>
            <Input onChange={(v) => onChange("closingTime", v)} type="time" value={closingTime} />
          </div>
        </div>
        <p className="text-xs font-medium text-slate-500">
          {openingTime && closingTime
            ? `Shoppers will see ${formatHour(openingTime)} – ${formatHour(closingTime)}.`
            : "Leave both blank to hide opening hours on the storefront."}
        </p>
      </CardBody>
    </SettingsCard>
  );
}
