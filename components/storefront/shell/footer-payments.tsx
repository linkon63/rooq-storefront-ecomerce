import { FaLock } from "react-icons/fa6";
import { PAYMENT_METHODS } from "@/utils/storefront/payment-methods";

/** "We accept" strip: gateway names, secured by SSLCommerz. */
export function FooterPayments({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <FaLock aria-hidden className="size-3" /> {title}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {PAYMENT_METHODS.map((name) => (
          <li key={name} className="rounded border border-chalk/25 px-2.5 py-1 text-xs text-chalk/85">
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
