"use client";

import { useState, type FormEvent } from "react";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { subscribeNewsletter } from "@/lib/storefront-api";
import type { Messages } from "@/lib/i18n/messages";
import { isValidEmail } from "@/utils/storefront/forms";

/** One field: "New drops, first." */
export function NewsletterForm({ t }: { t: Messages["newsletter"] }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidEmail(email)) return setError(ERROR_MESSAGES.storefront.emailInvalid);
    setStatus("sending");
    setError(null);
    try {
      await subscribeNewsletter(email.trim());
      setStatus("done");
    } catch {
      setStatus("idle");
      setError(ERROR_MESSAGES.storefront.newsletterFailed);
    }
  }

  if (status === "done") return <p role="status" className="text-sm">{SUCCESS_MESSAGES.storefront.newsletterJoined}</p>;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-sm flex-col gap-2">
      <label htmlFor="newsletter-email" className="text-sm font-semibold">
        {t.label}
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "newsletter-error" : undefined}
          className="h-11 min-w-0 flex-1 rounded border border-chalk/30 bg-transparent px-3 text-base text-chalk placeholder:text-chalk/50"
        />
        <button type="submit" disabled={status === "sending"} className="h-11 rounded bg-dye px-4 text-sm font-semibold text-chalk hover:bg-dye-deep disabled:opacity-60">
          {t.join}
        </button>
      </div>
      {error ? (
        <p id="newsletter-error" role="alert" className="text-sm text-dye">
          {error}
        </p>
      ) : null}
    </form>
  );
}
