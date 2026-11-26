"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MobileAppBarView } from "./mobile-app-bar-view";

type Props = { logo: string | null; menuLabel: string };

function MobileAppBarWithParams(props: Props) {
  return <MobileAppBarView accountTab={useSearchParams().get("tab")} {...props} />;
}

/** MobileAppBarView with the account `?tab=` in the URL; static HTML shows it without. */
export function MobileAppBar(props: Props) {
  return (
    <Suspense fallback={<MobileAppBarView accountTab={null} {...props} />}>
      <MobileAppBarWithParams {...props} />
    </Suspense>
  );
}
