"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants/auth";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { useAppDispatch } from "@/lib/store/hooks";
import { signUp } from "@/lib/store/slices/session-thunks";
import { errorText } from "@/utils/api-error";
import { registrationProblem, type RegistrationFields } from "@/utils/storefront/forms";
import { normalizeBdPhone } from "@/utils/phone";
import { TextField } from "../shared/text-field";

export function RegisterForm() {
  const dispatch = useAppDispatch();
  const [fields, setFields] = useState<RegistrationFields>({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const set = (key: keyof RegistrationFields) => (event: { target: { value: string } }) =>
    setFields((current) => ({ ...current, [key]: event.target.value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = registrationProblem(fields, PASSWORD_MIN_LENGTH);
    if (problem) return setError(problem);
    setSending(true);
    setError(null);
    try {
      await dispatch(
        signUp({ name: fields.name.trim(), email: fields.email.trim(), phone: normalizeBdPhone(fields.phone), password: fields.password }),
      );
      toast.success(SUCCESS_MESSAGES.storefront.accountCreated);
    } catch (caught) {
      setError(errorText(caught, ERROR_MESSAGES.storefront.registerFailed));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField id="reg-name" label="Full name" required autoComplete="name" value={fields.name} onChange={set("name")} />
      <TextField id="reg-email" label="Email" type="email" required autoComplete="email" inputMode="email" value={fields.email} onChange={set("email")} />
      <TextField id="reg-phone" label="Mobile number" type="tel" required autoComplete="tel" inputMode="tel" placeholder="01XXXXXXXXX" value={fields.phone} onChange={set("phone")} />
      <TextField
        id="reg-password"
        label="Password"
        type="password"
        required
        autoComplete="new-password"
        hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
        value={fields.password}
        onChange={set("password")}
      />
      {error ? (
        <p role="alert" className="text-sm text-dye-deep">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={sending} className="h-12 rounded bg-ink text-sm font-semibold text-chalk hover:bg-ink-soft disabled:opacity-60">
        Create account
      </button>
    </form>
  );
}
