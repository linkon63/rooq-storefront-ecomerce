import { escapeHtml } from "./escape-html";

export type ContactMessage = { fullName: string; phone: string; email: string | null; message: string };

/** The store-inbox mail for a storefront "Contact us" message. */
export function contactEmail(input: ContactMessage, shopName: string) {
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;line-height:1.6;color:#111;max-width:600px">
  <h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(shopName)} — new contact message</h1>
  <p style="margin:4px 0"><strong>Name:</strong> ${escapeHtml(input.fullName)}</p>
  <p style="margin:4px 0"><strong>Phone:</strong> ${escapeHtml(input.phone)}</p>
  <p style="margin:4px 0"><strong>Email:</strong> ${escapeHtml(input.email ?? "N/A")}</p>
  <div style="margin-top:16px;padding:16px;border:1px solid #e5e5e5;white-space:pre-wrap">${escapeHtml(input.message)}</div>
</div>`;
  return { subject: `[Website Contact] Message from ${input.fullName} (${input.phone})`, html };
}

/** The store-inbox mail for a new newsletter subscriber. */
export function newsletterEmail(email: string, shopName: string) {
  return {
    subject: "New Newsletter Subscription",
    html: `<div style="font-family:Helvetica,Arial,sans-serif;line-height:1.6;color:#111">
  <h1 style="font-size:20px">${escapeHtml(shopName)} — new newsletter subscriber</h1>
  <p><strong>Subscriber email:</strong> ${escapeHtml(email)}</p>
</div>`,
  };
}
