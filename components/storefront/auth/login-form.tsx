"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { useAppDispatch } from "@/lib/store/hooks";
import { authViewChanged } from "@/lib/store/slices/session-slice";
import { signIn } from "@/lib/store/slices/session-thunks";
import { errorText } from "@/utils/api-error";
import { TextField } from "../shared/text-field";

export function LoginForm({ onSignedIn }: { onSignedIn?: () => void }) {
  const dispatch = useAppDispatch();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!identifier.trim() || !password) {
      setError(ERROR_MESSAGES.ui.requiredFields);
      return;
    }
    setSending(true);
    setError(null);
    try {
      await dispatch(signIn(identifier.trim(), password, remember));
      toast.success(SUCCESS_MESSAGES.storefront.signedIn);
      onSignedIn?.();
    } catch (caught) {
      setError(errorText(caught, ERROR_MESSAGES.storefront.signInFailed));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        id="login-identifier"
        label="Email or phone"
        required
        autoComplete="username"
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
      />
      <TextField
        id="login-password"
        label="Password"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="size-4 accent-[var(--color-ink)]" />
          Keep me signed in
        </label>
        <button type="button" onClick={() => dispatch(authViewChanged("forgot"))} className="underline underline-offset-4">
          Forgot password?
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-dye-deep">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={sending} className="h-12 rounded bg-ink text-sm font-semibold text-chalk hover:bg-ink-soft disabled:opacity-60">
        Sign in
      </button>
    </form>
  );
}
