import { escapeHtml } from "./escape-html";

export function passwordResetEmail(params: { name: string; resetUrl: string; shopName: string }) {
  const name = escapeHtml(params.name);
  const shop = escapeHtml(params.shopName);
  const url = escapeHtml(params.resetUrl);
  return {
    subject: `Reset your ${params.shopName} password`,
    html: `<div style="font-family:Helvetica,Arial,sans-serif;line-height:1.6;color:#111;max-width:520px">
  <h1 style="font-size:20px;margin:0 0 16px">Reset your password</h1>
  <p>Hi ${name},</p>
  <p>We received a request to reset the password for your ${shop} account. The link below is valid for one hour.</p>
  <p><a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;text-decoration:none">Choose a new password</a></p>
  <p style="color:#666;font-size:13px">If you did not ask for this, you can ignore this email.</p>
</div>`,
  };
}
