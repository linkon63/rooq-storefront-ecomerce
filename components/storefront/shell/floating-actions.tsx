import { ScrollTopButton } from "./scroll-top-button";

/** Bottom-right stack on every storefront page: back to top. Chat and call live with Tulo the panda (bottom-left). */
export function FloatingActions() {
  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-center gap-3 md:bottom-6 md:right-6">
      <ScrollTopButton />
    </div>
  );
}
