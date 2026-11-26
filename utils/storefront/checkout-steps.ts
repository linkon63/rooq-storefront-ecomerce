export type CheckoutStep = 1 | 2 | 3;

export const CHECKOUT_STEPS: readonly { step: CheckoutStep; label: string }[] = [
  { step: 1, label: "Address" },
  { step: 2, label: "Payment" },
  { step: 3, label: "Review" },
];

export function checkoutStepFrom(raw: string | null): CheckoutStep {
  return raw === "2" ? 2 : raw === "3" ? 3 : 1;
}
