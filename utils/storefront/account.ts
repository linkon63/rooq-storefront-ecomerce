import { ACCOUNT_TABS, type AccountTab } from "@/lib/constants/storefront";

/** `?tab=` value → a known account tab (orders by default). */
export function accountTabFrom(value: string | null): AccountTab {
  return ACCOUNT_TABS.some((tab) => tab.key === value) ? (value as AccountTab) : "orders";
}
