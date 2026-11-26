import { CHECKOUT_STEPS, type CheckoutStep } from "@/utils/storefront/checkout-steps";

/** Phones: where the shopper is; finished steps can be tapped to go back. */
export function CheckoutSteps({ current, onSelect }: { current: CheckoutStep; onSelect: (step: CheckoutStep) => void }) {
  return (
    <ol aria-label="Checkout steps" className="flex gap-2 md:hidden">
      {CHECKOUT_STEPS.map(({ step, label }) => (
        <li key={step} className="flex-1">
          <button
            type="button"
            disabled={step > current}
            aria-current={step === current ? "step" : undefined}
            onClick={() => onSelect(step)}
            className={`flex h-11 w-full items-center justify-center border-b-2 text-sm ${step <= current ? "border-ink font-semibold" : "border-line text-stone"}`}
          >
            {step}. {label}
          </button>
        </li>
      ))}
    </ol>
  );
}
