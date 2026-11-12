"use client";

import { EmptyState } from "@/components/storefront/shared/empty-state";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

export default function StoreError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page-gutter">
      <EmptyState tone="error" title="This page did not load" body={ERROR_MESSAGES.ui.loadFailed}>
        <button type="button" onClick={reset} className="h-11 rounded bg-ink px-5 text-sm font-semibold text-chalk">
          Try again
        </button>
      </EmptyState>
    </div>
  );
}
