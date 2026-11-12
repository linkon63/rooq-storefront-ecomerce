import { STORE_CURRENCY } from "@/lib/constants/store";
import { currencySymbol } from "@/utils/storefront/money";

/** "৳2,450" — admin tables print "-" for an empty value. */
export function formatMoney(value?: string | number | null, symbol?: string): string {
  if (value === undefined || value === null || value === "") return "-";
  return `${symbol ?? currencySymbol(STORE_CURRENCY)}${Number(value).toLocaleString("en", { maximumFractionDigits: 2 })}`;
}

/**
 * Normalises an image URL from the API for `<img>` / `next/image`. Images are
 * served same-origin from `/api/v1/media/<id>`, so relative, data: and blob:
 * URLs pass through, absolute http(s) URLs (EXTERNAL media) pass through, and
 * a bare path gets a leading slash.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `/${url}`;
}
