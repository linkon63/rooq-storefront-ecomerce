"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants/auth";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { changePassword } from "@/lib/storefront-api";
import { errorText } from "@/utils/api-error";
import { TextField } from "../shared/text-field";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!current || !next) return setError(ERROR_MESSAGES.ui.requiredFields);
    if (next.length < PASSWORD_MIN_LENGTH) return setError(ERROR_MESSAGES.storefront.passwordTooShort(PASSWORD_MIN_LENGTH));
    if (next !== confirm) return setError(ERROR_MESSAGES.storefront.passwordMismatch);
    setSaving(true);
    setError(null);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      toast.success(SUCCESS_MESSAGES.storefront.passwordChanged);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (caught) {
      setError(errorText(caught, ERROR_MESSAGES.ui.saveFailed));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <h3 className="font-wide text-lg font-bold">Change password</h3>
      <TextField id="pw-current" label="Current password" type="password" required autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value)} />
      <TextField id="pw-new" label="New password" type="password" required autoComplete="new-password" value={next} onChange={(event) => setNext(event.target.value)} />
      <TextField id="pw-confirm" label="Repeat new password" type="password" required autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
      {error ? (
        <p role="alert" className="text-sm text-dye-deep">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={saving} className="h-11 w-fit rounded border border-ink px-6 text-sm font-semibold hover:bg-ink hover:text-chalk disabled:opacity-60">
        Change password
      </button>
    </form>
  );
}
