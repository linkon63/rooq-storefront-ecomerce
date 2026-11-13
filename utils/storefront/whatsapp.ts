/**
 * wa.me link for a shop phone number (pure). Bangladeshi local numbers
 * (01XXXXXXXXX) get the 880 country code; anything else keeps its digits.
 * Answers null when there is no usable number.
 */
export function whatsappHref(phone: string | null | undefined, text: string): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  const international = digits.length === 11 && digits.startsWith("01") ? `88${digits}` : digits;
  return `https://wa.me/${international}?text=${encodeURIComponent(text)}`;
}
