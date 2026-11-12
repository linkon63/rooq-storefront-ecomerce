export const POLICY_TABS = [
  { key: "delivery", label: "Delivery" },
  { key: "return", label: "Returns & exchanges" },
  { key: "refund", label: "Refunds" },
  { key: "cancellation", label: "Cancellations" },
  { key: "privacy", label: "Privacy" },
  { key: "terms", label: "Terms & conditions" },
] as const;

export type PolicyKey = (typeof POLICY_TABS)[number]["key"];

export const MAX_TITLE_LENGTH = 128;
