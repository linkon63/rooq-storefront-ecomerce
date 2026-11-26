import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";

/** The phone's share sheet for the current page; copies the link where there is none. */
export async function shareLink(title: string): Promise<void> {
  const url = window.location.href;
  try {
    if (navigator.share) await navigator.share({ title, url });
    else {
      await navigator.clipboard.writeText(url);
      toast.success(SUCCESS_MESSAGES.storefront.linkCopied);
    }
  } catch (error) {
    // Closing the share sheet is not a failure.
    if (!(error instanceof DOMException && error.name === "AbortError")) toast.error(ERROR_MESSAGES.storefront.shareFailed);
  }
}
