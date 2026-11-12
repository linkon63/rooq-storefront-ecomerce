import { escapeHtml } from "./escape-html";

export function backInStockEmail(params: {
  shopName: string;
  productName: string;
  colorName: string;
  sizeLabel: string;
  productUrl: string;
}) {
  const shop = escapeHtml(params.shopName);
  const product = escapeHtml(params.productName);
  const variant = `${escapeHtml(params.colorName)}, size ${escapeHtml(params.sizeLabel)}`;
  const url = escapeHtml(params.productUrl);
  return {
    subject: `${params.productName} is back in your size`,
    html: `<div style="font-family:Helvetica,Arial,sans-serif;line-height:1.6;color:#111;max-width:520px">
  <h1 style="font-size:20px;margin:0 0 16px">It's back: ${product}</h1>
  <p>The ${variant} you asked about is in stock again at ${shop}. Popular sizes go quickly, so we can't hold it for you.</p>
  <p><a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;text-decoration:none">Shop it now</a></p>
  <p style="color:#666;font-size:13px">You're receiving this because you asked to be told when this size returned. We'll only email you once.</p>
</div>`,
  };
}
