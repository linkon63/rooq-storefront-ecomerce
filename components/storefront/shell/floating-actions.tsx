
import { DraggableFloat } from "./draggable-float";
import { PandaPalLoader } from "./panda-pal/panda-pal-loader";
import { ScrollTopButton } from "./scroll-top-button";

type FloatingActionsProps = {
  phone: string;
  telHref: string;
  whatsappHref: string;
};

/** Corner stack on every storefront page: Tulo the panda over the back-to-top button. Draggable on phones. */
export function FloatingActions({ phone, telHref, whatsappHref }: FloatingActionsProps) {
  return (
    <DraggableFloat className="pointer-events-none floating-actions fixed right-3 z-[60] flex flex-col items-center gap-1.5 md:bottom-5 md:right-5">
      <PandaPalLoader phone={phone} telHref={telHref} whatsappHref={whatsappHref} />
      <ScrollTopButton />
    </DraggableFloat>
  );
}
