"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useSheetDrag } from "@/hooks/use-sheet-drag";
import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";

/** `adaptive`: bottom sheet on phones, centred dialog from md. `search`: 80% bottom sheet on phones, right panel from md. */
type Placement = "center" | "right" | "bottom" | "left" | "adaptive" | "search";

const PANEL: Record<Placement, string> = {
  center:
    "left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 max-h-[calc(100dvh-2rem)] rounded",
  right: "right-0 top-0 h-dvh w-full max-w-md data-[state=open]:animate-[sheet-in-right_.32s_var(--ease-cloth)]",
  left: "left-0 top-0 h-dvh w-[86%] max-w-sm data-[state=open]:animate-[sheet-in-left_.32s_var(--ease-cloth)]",
  bottom:
    "bottom-0 left-0 w-full max-h-[88dvh] rounded-t-lg data-[state=open]:animate-[sheet-in-up_.32s_var(--ease-cloth)]",
  search:
    "bottom-0 left-0 h-[80dvh] w-full rounded-t-lg max-md:data-[state=open]:animate-[sheet-in-up_.32s_var(--ease-cloth)] md:left-auto md:right-0 md:h-dvh md:max-w-md md:rounded-none md:data-[state=open]:animate-[sheet-in-right_.32s_var(--ease-cloth)]",
  adaptive:
    "bottom-0 left-0 w-full max-h-[88dvh] rounded-t-lg max-md:data-[state=open]:animate-[sheet-in-up_.32s_var(--ease-cloth)] md:bottom-auto md:left-1/2 md:top-1/2 md:w-[calc(100%-2rem)] md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:max-h-[calc(100dvh-2rem)] md:rounded",
};

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Visually hide the title (still read by screen readers). */
  hideTitle?: boolean;
  description?: string;
  placement?: Placement;
  children: ReactNode;
  className?: string;
};

/**
 * Dialog and sheet in one primitive (Radix: focus trap, Esc, scroll lock,
 * aria wiring). `placement` picks a centred modal or an edge sheet.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  hideTitle = false,
  description,
  placement = "center",
  children,
  className = "",
}: ModalProps) {
  const { panel, handle } = useSheetDrag(() => onOpenChange(false));
  const draggable = placement === "bottom" || placement === "adaptive" || placement === "search";
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-[2px] data-[state=open]:animate-[fade-in_.2s_ease-out]" />
        <Dialog.Content
          ref={panel}
          className={`storefront-root fixed z-50 flex flex-col overflow-hidden bg-paper shadow-sheet focus:outline-none ${PANEL[placement]} ${className}`}
          {...(description ? {} : { "aria-describedby": undefined })}
        >
          {draggable ? (
            <div aria-hidden {...handle} className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-2.5 md:hidden">
              <span className="h-1 w-10 rounded-full bg-line" />
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4 border-b border-selvedge px-4 py-3 md:px-6">
            <Dialog.Title className={hideTitle ? "sr-only" : "font-wide text-lg font-bold"}>{title}</Dialog.Title>
            <Dialog.Close
              className="-mr-2 ml-auto grid size-11 place-items-center rounded text-ink hover:bg-chalk"
              aria-label="Close"
            >
              <FiX aria-hidden className="size-5" />
            </Dialog.Close>
          </div>
          {description ? <Dialog.Description className="sr-only">{description}</Dialog.Description> : null}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
