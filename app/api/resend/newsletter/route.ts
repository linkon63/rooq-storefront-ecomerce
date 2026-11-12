import { NextResponse } from "next/server";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { STORE_NAME } from "@/lib/constants/store";
import { sendMail } from "@/lib/server/mail/client";
import { addSubscriber, hasSubscriber } from "@/lib/server/newsletter/subscribers";
import { newsletterEmail } from "@/utils/mail-templates/contact";

const bodySchema = z.object({ email: z.email().trim() });

/** POST /api/resend/newsletter — storefront newsletter sign-up. Answers `{ success, message }`. */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: ERROR_MESSAGES.newsletter.emailRequired }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  if (await hasSubscriber(email)) {
    return NextResponse.json({ success: false, message: ERROR_MESSAGES.newsletter.alreadySubscribed }, { status: 400 });
  }

  const inbox = process.env.RESEND_TO_EMAIL || process.env.STORE_EMAIL;
  if (inbox) {
    await sendMail({ to: inbox, ...newsletterEmail(email, STORE_NAME) });
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, message: ERROR_MESSAGES.newsletter.notConfigured }, { status: 503 });
  }

  await addSubscriber(email);
  return NextResponse.json({ success: true, message: SUCCESS_MESSAGES.commerce.newsletterSubscribed });
}
