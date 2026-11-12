"use client";

import { useState, type FormEvent } from "react";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { sendContactMessage } from "@/lib/storefront/contact-api";
import { errorText } from "@/utils/api-error";
import { isValidEmail, isValidPhone } from "@/utils/storefront/forms";
import { TextField } from "../shared/text-field";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return setError(ERROR_MESSAGES.ui.requiredFields);
    if (!isValidPhone(phone)) return setError(ERROR_MESSAGES.storefront.phoneInvalid);
    if (email && !isValidEmail(email)) return setError(ERROR_MESSAGES.storefront.emailInvalid);
    setState("sending");
    setError(null);
    try {
      await sendContactMessage({ firstName: name.trim(), phoneNumber: phone.trim(), email: email.trim() || undefined, message: message.trim() });
      setState("sent");
    } catch (caught) {
      setError(errorText(caught, ERROR_MESSAGES.storefront.contactFailed));
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <p role="status" className="self-start rounded bg-paper p-6">
        {SUCCESS_MESSAGES.storefront.messageSent}
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded bg-paper p-5 md:p-8">
      <TextField id="contact-name" label="Your name" required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
      <TextField id="contact-phone" label="Mobile number" type="tel" required autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
      <TextField id="contact-email" label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Message
        <textarea required rows={5} value={message} onChange={(event) => setMessage(event.target.value)} maxLength={5000} className="rounded border border-line bg-paper px-3 py-2.5 text-base font-normal" />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-dye-deep">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={state === "sending"} className="h-12 rounded bg-ink text-sm font-semibold text-chalk disabled:opacity-60">
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
