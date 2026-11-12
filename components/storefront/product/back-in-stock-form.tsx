"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { requestBackInStock } from "@/lib/shop-api";
import { errorText } from "@/utils/api-error";
import { isValidEmail } from "@/utils/storefront/forms";
import { useProductSelection } from "./selection-context";

/** "Back in stock? We'll email you." Shown when the chosen size is sold out. */
export function BackInStockForm() {
  const { meta } = useProductSelection();
  const { user } = useSession();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedFor, setSavedFor] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const variant = meta.variant;

  if (meta.problem !== "soldOut" || !variant) return null;
  const size = meta.sizes.find((entry) => entry.id === variant.sizeId);

  if (savedFor === variant.id) {
    return (
      <p role="status" className="rounded border border-ink px-4 py-3 text-sm">
        {SUCCESS_MESSAGES.storefront.backInStockSaved}
      </p>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!variant) return;
    const address = (email || user?.email || "").trim();
    if (!isValidEmail(address)) {
      setError(ERROR_MESSAGES.storefront.emailInvalid);
      return;
    }
    setSending(true);
    setError(null);
    try {
      await requestBackInStock(variant.id, address);
      setSavedFor(variant.id);
      toast.success(SUCCESS_MESSAGES.storefront.backInStockSaved);
    } catch (caught) {
      setError(errorText(caught, ERROR_MESSAGES.storefront.backInStockFailed));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded border border-line bg-chalk p-4">
      <p className="text-sm font-semibold">
        {size ? `Size ${size.label} is sold out.` : "This size is sold out."} We can email you when it is back.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="bis-email" className="sr-only">
          Email address
        </label>
        <input
          id="bis-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={user?.email ?? "you@example.com"}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "bis-error" : undefined}
          className="h-11 flex-1 rounded border border-line bg-paper px-3 text-base"
        />
        <button
          type="submit"
          disabled={sending}
          className="h-11 rounded bg-ink px-5 text-sm font-semibold text-chalk hover:bg-ink-soft disabled:opacity-60"
        >
          Notify me
        </button>
      </div>
      {error ? (
        <p id="bis-error" role="alert" className="mt-2 text-sm text-dye-deep">
          {error}
        </p>
      ) : null}
    </form>
  );
}
