"use client";

import { PageHeader } from "../../../_components/admin-shell";
import { ErrorBanner, SaveButton } from "../_components/settings-ui";
import { useContactSettings } from "./_hooks/use-contact-settings";
import { ContactEntriesCard } from "./_components/contact-entries-card";
import { BusinessHoursCard } from "./_components/business-hours-card";
import { SocialProfilesCard } from "./_components/social-profiles-card";

export default function ContactPage() {
  const c = useContactSettings();

  return (
    <>
      <PageHeader
        action={
          <SaveButton onClick={c.save} saving={c.saving}>
            Save contact details
          </SaveButton>
        }
        description="How shoppers reach you, and where they find you online."
        title="Contact & social"
      />
      <ErrorBanner message={c.error} />
      {c.loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 shadow-sm" aria-busy>
          <p className="text-sm font-medium text-slate-400">Loading…</p>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          <ContactEntriesCard
            hint="Up to two addresses. The first is used for order questions."
            inputType="email"
            max={2}
            onChange={c.setEmails}
            rows={c.emails}
            title="Email addresses"
            titlePlaceholder="Customer care"
            valueLabel="Email"
            valuePlaceholder="hello@rooq.com"
          />
          <ContactEntriesCard
            hint="Up to three numbers."
            inputType="tel"
            max={3}
            onChange={c.setPhones}
            rows={c.phones}
            title="Phone numbers"
            titlePlaceholder="Hotline"
            valueLabel="Number"
            valuePlaceholder="01XXXXXXXXX"
          />
          <BusinessHoursCard closingTime={c.hours.closingTime} onChange={c.setHour} openingTime={c.hours.openingTime} />
          <SocialProfilesCard onChange={c.setSocialLink} social={c.social} />
        </div>
      )}
    </>
  );
}
