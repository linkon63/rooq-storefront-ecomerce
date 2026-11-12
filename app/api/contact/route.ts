import { NextResponse } from "next/server";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { STORE_NAME } from "@/lib/constants/store";
import { sendMail } from "@/lib/server/mail/client";
import { contactEmail } from "@/utils/mail-templates/contact";

const contactSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().optional(),
  countryCode: z.string().trim().optional(),
  phoneNumber: z.string().trim().min(1),
  email: z.string().trim().optional(),
  message: z.string().trim().min(1).max(5000),
});

/** POST /api/contact — storefront "Contact us" form → store inbox. Answers `{ success, message }`. */
export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: ERROR_MESSAGES.contact.requiredFields }, { status: 400 });
  }

  const inbox = process.env.STORE_EMAIL || process.env.RESEND_TO_EMAIL;
  if (!inbox || !process.env.RESEND_API_KEY) {
    // Local development runs without mail credentials: log and accept.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ success: false, message: ERROR_MESSAGES.mail.notConfigured }, { status: 503 });
    }
    console.warn("[contact] mail not configured; message accepted as a dry run");
    return NextResponse.json({ success: true, message: SUCCESS_MESSAGES.commerce.contactSent });
  }

  const { firstName, lastName, countryCode, phoneNumber, email, message } = parsed.data;
  const mail = contactEmail(
    {
      fullName: `${firstName} ${lastName ?? ""}`.trim(),
      phone: `${countryCode ?? ""} ${phoneNumber}`.trim(),
      email: email || null,
      message,
    },
    STORE_NAME,
  );

  const sent = await sendMail({ to: inbox, ...mail, replyTo: email || undefined });
  if (!sent) {
    return NextResponse.json({ success: false, message: ERROR_MESSAGES.contact.sendFailed }, { status: 502 });
  }
  return NextResponse.json({ success: true, message: SUCCESS_MESSAGES.commerce.contactSent });
}
