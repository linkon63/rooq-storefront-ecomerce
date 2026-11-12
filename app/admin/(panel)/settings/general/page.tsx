"use client";

import { PageHeader } from "../../../_components/admin-shell";
import { ErrorBanner, SaveButton } from "../_components/settings-ui";
import { useGeneralSettings } from "./_hooks/use-general-settings";
import { BasicInfoSection } from "./_components/basic-info-section";
import { BrandImagesSection } from "./_components/brand-images-section";
import { StorefrontSection } from "./_components/storefront-section";
import { DeliverySection } from "./_components/delivery-section";
import { ReturnsStockSection } from "./_components/returns-stock-section";
import { CompanySection } from "./_components/company-section";

export default function GeneralSettingsPage() {
  const { loading, error, saving, saved, form, setField, images, save } = useGeneralSettings();

  return (
    <>
      <PageHeader
        action={
          <SaveButton onClick={save} saving={saving}>
            Save changes
          </SaveButton>
        }
        description="Store name, brand images, delivery and return rules."
        title="General"
      />
      <ErrorBanner message={error} />
      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 shadow-sm" aria-busy>
          <p className="text-sm font-medium text-slate-400">Loading settings…</p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
          <BasicInfoSection form={form} setField={setField} />
          <BrandImagesSection images={images} saved={saved} />
          <StorefrontSection form={form} setField={setField} />
          <DeliverySection form={form} setField={setField} />
          <ReturnsStockSection form={form} setField={setField} />
          <CompanySection form={form} setField={setField} />
        </div>
      )}
    </>
  );
}
