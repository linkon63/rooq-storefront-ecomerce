import { HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import { HiOutlineMapPin } from "react-icons/hi2";

import {
  FALLBACK_ADDRESS,
  FALLBACK_EMAILS,
  FALLBACK_PHONES,
  telHref,
} from "@/lib/shop-contact";

/**
 * The policy pages print the support details inside their prose, so they read
 * the shop defaults directly rather than the (admin-editable) settings row —
 * legal copy is reviewed by hand anyway. Everything else on the storefront
 * resolves through `resolveShopContact`.
 */
export const SUPPORT_PHONE = FALLBACK_PHONES[0].value;
export const SUPPORT_PHONE_TEL = telHref(SUPPORT_PHONE).replace("tel:", "");
export const SUPPORT_EMAIL = FALLBACK_EMAILS[0].value;
export const SUPPORT_ADDRESS = FALLBACK_ADDRESS;

/**
 * Closing block for Privacy and Terms — the three ways to reach a human,
 * repeated verbatim on both pages so a customer never has to hunt for them.
 */
export default function LegalContactCard({
  heading,
  intro,
}: {
  heading: string;
  intro: string;
}) {
  return (
    <div>
      <h2 className="font-display text-[22px] font-semibold text-[#1f2a17] sm:text-[26px]">
        {heading}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-gray-700">{intro}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <a
          href={`tel:${SUPPORT_PHONE_TEL}`}
          className="flex items-start gap-3 rounded-xl border border-[#4a9e2f]/20 bg-[#f4f7ee]/60 p-4 transition-colors hover:border-[#4a9e2f]"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4a9e2f]/10 text-[#4a9e2f]">
            <HiOutlinePhone size={18} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-[#1f2a17]">Phone &amp; WhatsApp</span>
            <span className="mt-0.5 block text-sm text-gray-600">{SUPPORT_PHONE}</span>
          </span>
        </a>

        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="flex items-start gap-3 rounded-xl border border-[#4a9e2f]/20 bg-[#f4f7ee]/60 p-4 transition-colors hover:border-[#4a9e2f]"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4a9e2f]/10 text-[#4a9e2f]">
            <HiOutlineMail size={18} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-[#1f2a17]">Email</span>
            <span className="mt-0.5 block break-all text-sm text-gray-600">{SUPPORT_EMAIL}</span>
          </span>
        </a>

        <div className="flex items-start gap-3 rounded-xl border border-[#4a9e2f]/20 bg-[#f4f7ee]/60 p-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4a9e2f]/10 text-[#4a9e2f]">
            <HiOutlineMapPin size={18} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-[#1f2a17]">Office</span>
            <span className="mt-0.5 block text-sm text-gray-600">{SUPPORT_ADDRESS}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
