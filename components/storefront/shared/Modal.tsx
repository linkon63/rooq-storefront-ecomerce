"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { IoClose } from "react-icons/io5";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  buttonTitle?: string;
  onButtonClick?: () => void;
  children?: React.ReactNode;
  noPadding?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  buttonTitle,
  onButtonClick,
  children,
  noPadding = false,
}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm 
          data-[state=open]:animate-in data-[state=closed]:animate-out 
          data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-500" 
        />
        
        <Dialog.Content 
          onOpenAutoFocus={(e) => e.preventDefault()} 
          className="fixed left-[50%] top-[50%] z-[101] w-full max-w-[92vw] md:max-w-fit 
          translate-x-[-50%] translate-y-[-50%] outline-none 
          data-[state=open]:animate-in data-[state=closed]:animate-out 
          data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 
          data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 
          data-[state=open]:slide-in-from-top-[48%] duration-500 ease-out"
        >
          <VisuallyHidden.Root>
            <Dialog.Title>{title || "Newsletter Modal"}</Dialog.Title>
            <Dialog.Description>{description || "Sign up for updates"}</Dialog.Description>
          </VisuallyHidden.Root>

          <div className="relative rounded-2xl shadow-2xl overflow-hidden bg-white">
            {/* Close Button */}
            <div className="absolute top-3 right-3 z-[110]">
              <Dialog.Close asChild>
                <button
                  className="flex items-center justify-center transition-all cursor-pointer bg-black/20 hover:bg-black/50 text-white rounded-full p-1.5 backdrop-blur-md"
                  aria-label="Close"
                >
                  <IoClose size={22} />
                </button>
              </Dialog.Close>
            </div>

            <div className={`${noPadding ? 'p-0' : 'p-6'} flex flex-col items-center`}>
              {title && (
                <h2 className="text-xl font-semibold text-gray-900 mb-4 w-full">{title}</h2>
              )}

              <div className="w-full">
                
                {description && (
                  <p className="text-gray-600 mb-4 text-sm md:text-base leading-relaxed">
                    {description}
                  </p>
                )}

                {children}
              </div>

              {buttonTitle && (
                <div className="mt-6 flex justify-end w-full px-6 pb-4">
                  <button
                    onClick={onButtonClick || onClose}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    {buttonTitle}
                  </button>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}