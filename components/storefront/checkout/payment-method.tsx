/** The only payment method for now: cash on delivery, shown pre-selected. */
export function PaymentMethod() {
  return (
    <section aria-labelledby="checkout-payment" className="flex flex-col gap-3">
      <h2 id="checkout-payment" className="font-wide text-lg font-bold">
        Payment
      </h2>
      <label className="flex items-start gap-3 rounded border-2 border-ink bg-paper p-4 text-sm">
        <input type="radio" name="payment" checked readOnly className="mt-0.5 size-4 accent-ink" />
        <span>
          <strong>Cash on Delivery (COD)</strong>
          <span className="block text-stone">Pay the rider when your parcel arrives. You can check the items at the door first.</span>
        </span>
      </label>
    </section>
  );
}
