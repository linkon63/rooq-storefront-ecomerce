"use client";

import { useState } from "react";
import { FiArrowUpRight, FiMail } from "react-icons/fi";
import { ContactForm } from "../contact/contact-form";
import { Modal } from "../shared/modal";

/**
 * Compact trigger on the home page that opens the contact form in a slide-over
 * sheet so the home page height never shifts and the HomeStitch thread stays intact.
 */
export function CollapsibleContactForm() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center justify-between gap-4 self-start rounded border border-line bg-paper px-5 py-4 text-left transition-colors hover:border-ink/40 hover:bg-selvedge/30"
      >
        <span className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-selvedge/60 text-ink">
            <FiMail aria-hidden className="size-4" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-ink">Send us a message</span>
            <span className="type-meta text-stone">Quick reply from our Dhaka studio</span>
          </span>
        </span>
        <FiArrowUpRight
          aria-hidden
          className="size-4 shrink-0 text-stone transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
        />
      </button>

      <Modal open={open} onOpenChange={setOpen} title="Send us a message" placement="right">
        <ContactForm />
      </Modal>
    </>
  );
}
