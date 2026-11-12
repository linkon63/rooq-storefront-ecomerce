export const POLICY_PAGE_TITLES = {
  delivery: "Delivery",
  return: "Returns and exchanges",
  refund: "Refunds",
  cancellation: "Cancellations",
  privacy: "Privacy policy",
  terms: "Terms and conditions",
} as const;

export type PolicyKey = keyof typeof POLICY_PAGE_TITLES;

export function isPolicyKey(value: string): value is PolicyKey {
  return value in POLICY_PAGE_TITLES;
}
