"use client";

import { useState, type FormEvent } from "react";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { forgotPassword } from "@/lib/storefront-api";
import { errorText } from "@/utils/api-error";
import { isValidEmail } from "@/utils/storefront/forms";
import { TextField } from "../shared/text-field";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidEmail(email)) return setError(ERROR_MESSAGES.storefront.emailInvalid);
    setSending(true);
    setError(null);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (caught) {
      setError(errorText(caught, ERROR_MESSAGES.ui.generic));
    } finally {
      setSending(false);
    }
  }

  if (sent) return <p role="status">{SUCCESS_MESSAGES.auth.resetTokenMaybe}. Check your inbox for the reset link.</p>;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-stone">Enter the email on your account and we will send a reset link.</p>
      <TextField id="forgot-email" label="Email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} error={error} />
      <button type="submit" disabled={sending} className="h-12 rounded bg-ink text-sm font-semibold text-chalk hover:bg-ink-soft disabled:opacity-60">
        Send reset link
      </button>
    </form>
  );
}
