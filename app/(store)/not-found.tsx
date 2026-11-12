import { EmptyState } from "@/components/storefront/shared/empty-state";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

export default function StoreNotFound() {
  return (
    <div className="page-gutter">
      <EmptyState title="Page not found" body={ERROR_MESSAGES.storefront.pageNotFound} action={{ label: "Shop new in", href: "/new" }} />
    </div>
  );
}
