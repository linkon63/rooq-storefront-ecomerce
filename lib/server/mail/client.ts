import "server-only";
import { Resend } from "resend";

export type MailMessage = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

let client: Resend | null | undefined;

function resend(): Resend | null {
  if (client === undefined) {
    const key = process.env.RESEND_API_KEY;
    client = key ? new Resend(key) : null;
  }
  return client;
}

export const DEFAULT_FROM = "Rooq <onboarding@resend.dev>";

/**
 * Sends one email through Resend. Without RESEND_API_KEY it is a logged
 * dry run, so local development never needs mail credentials.
 * Returns true when Resend accepted the message.
 */
export async function sendMail(message: MailMessage): Promise<boolean> {
  const api = resend();
  if (!api) {
    console.warn(`[mail] dry run (RESEND_API_KEY missing): "${message.subject}" → ${String(message.to)}`);
    return false;
  }
  const { error } = await api.emails.send({
    from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
    to: Array.isArray(message.to) ? message.to : [message.to],
    subject: message.subject,
    html: message.html,
    replyTo: message.replyTo,
  });
  if (error) {
    console.error(`[mail] send failed: ${error.message}`);
    return false;
  }
  return true;
}
