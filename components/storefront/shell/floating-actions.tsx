import { whatsappHref } from "@/utils/storefront/whatsapp";
import { ScrollTopButton } from "./scroll-top-button";
import { WhatsappButton } from "./whatsapp-button";

/** Bottom-right stack on every storefront page: back to top, and a WhatsApp chat with the shop. */
export function FloatingActions({ phone, shopName }: { phone: string | null; shopName: string }) {
  const href = whatsappHref(phone, `Hi ${shopName}, I have a question.`);
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-center gap-3 md:bottom-6 md:right-6">
      <ScrollTopButton />
      {href ? (
        <WhatsappButton href={href} />
      ) : null}
    </div>
  );
}
