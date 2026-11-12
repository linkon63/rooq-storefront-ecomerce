import type { GeneralForm } from "@/utils/settings/general-form";
import { FieldLabel, Input, Textarea } from "../../_components/settings-ui";
import type { SetGeneralField } from "../_hooks/use-general-settings";
import { SettingsRow } from "./settings-row";
import { ToggleRow } from "./toggle-row";

export function StorefrontSection({ form, setField }: { form: GeneralForm; setField: SetGeneralField }) {
  return (
    <>
      <SettingsRow hint="The announcement bar and what the catalogue shows." label="Storefront">
        <div className="space-y-4">
          <ToggleRow
            active={form.isTopBarVisible}
            description="Shows the slogan in the bar above the header."
            onChange={(value) => setField("isTopBarVisible", value)}
            title="Show announcement bar"
          />
          <div>
            <FieldLabel>Announcement text</FieldLabel>
            <Input onChange={(value) => setField("slogan", value)} placeholder="Free delivery over ৳5,000" value={form.slogan} />
          </div>
          <ToggleRow
            active={form.hideOutOfStock}
            description="Products with no size in stock leave the shop listing until restocked."
            onChange={(value) => setField("hideOutOfStock", value)}
            title="Hide sold-out products"
          />
          <ToggleRow
            active={form.showCertifications}
            description="The certificates strip on the homepage."
            onChange={(value) => setField("showCertifications", value)}
            title="Show certifications"
          />
        </div>
      </SettingsRow>
      <SettingsRow hint="The paragraph under the logo in the storefront footer." label="Footer">
        <FieldLabel>Description</FieldLabel>
        <Textarea
          onChange={(value) => setField("footerDescription", value)}
          placeholder="What the brand stands for, in a sentence or two."
          rows={4}
          value={form.footerDescription}
        />
      </SettingsRow>
    </>
  );
}
