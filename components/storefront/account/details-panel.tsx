"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { useAppDispatch } from "@/lib/store/hooks";
import { shopperUpdated } from "@/lib/store/slices/session-slice";
import { updateMe } from "@/lib/storefront-api";
import { errorText } from "@/utils/api-error";
import { TextField } from "../shared/text-field";
import { PasswordForm } from "./password-form";

/** Name, email and phone; password change; sign out. */
export function DetailsPanel() {
  const dispatch = useAppDispatch();
  const { user, logOut } = useSession();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return toast.error(ERROR_MESSAGES.ui.requiredFields);
    setSaving(true);
    try {
      dispatch(shopperUpdated(await updateMe({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined })));
      toast.success(SUCCESS_MESSAGES.storefront.profileSaved);
    } catch (caught) {
      toast.error(errorText(caught, ERROR_MESSAGES.storefront.profileSaveFailed));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form onSubmit={save} noValidate className="flex flex-col gap-4">
        <h3 className="font-wide text-lg font-bold">Your details</h3>
        <TextField id="me-name" label="Full name" required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
        <TextField id="me-email" label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextField id="me-phone" label="Mobile number" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <button type="submit" disabled={saving} className="h-11 w-fit rounded bg-ink px-6 text-sm font-semibold text-chalk disabled:opacity-60">
          Save details
        </button>
      </form>
      <div className="flex flex-col gap-10">
        <PasswordForm />
        <button type="button" onClick={() => void logOut().then(() => toast(SUCCESS_MESSAGES.storefront.signedOut))} className="h-11 w-fit rounded border border-ink px-6 text-sm font-semibold">
          Sign out
        </button>
      </div>
    </div>
  );
}
