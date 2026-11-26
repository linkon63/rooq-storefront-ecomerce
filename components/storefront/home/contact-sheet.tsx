"use client";

import { ContactForm } from "../contact/contact-form";
import { Modal } from "../shared/modal";

export type ContactSheetProps = { open: boolean; onOpenChange: (open: boolean) => void };

export function ContactSheet({ open, onOpenChange }: ContactSheetProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Send us a message" placement="right">
      <ContactForm />
    </Modal>
  );
}
