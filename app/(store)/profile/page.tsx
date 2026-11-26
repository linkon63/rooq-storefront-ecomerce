import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountView } from "@/components/storefront/account/account-view";
import { PhoneMenu } from "@/components/storefront/account/phone-menu";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function ProfilePage() {
  return (
    <div className="page-gutter pt-4 md:pt-12">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="max-md:pt-4 max-md:!mb-4 mb-6 font-display font-expanded text-[clamp(2rem,7vw,3.5rem)] font-extrabold leading-none">Your account</h1>
        <Suspense fallback={null}>
          <AccountView phoneMenu={<PhoneMenu />} />
        </Suspense>
      </div>
    </div>
  );
}
