"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MobileAppBarView } from "./mobile-app-bar-view";

function MobileAppBarWithParams() {
  return <MobileAppBarView accountTab={useSearchParams().get("tab")} />;
}

/** MobileAppBarView with the account `?tab=` in the URL; static HTML shows it without. */
export function MobileAppBar() {
  return (
    <Suspense fallback={<MobileAppBarView accountTab={null} />}>
      <MobileAppBarWithParams />
    </Suspense>
  );
}
