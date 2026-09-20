"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { validateNewsletterForm } from "@/utils/validateNewsletterForm";

/** The backdrop behind the sign-up form, and the height the band holds from md
 * up. The photo is wider than the band, so `object-cover` centres it on the
 * product row and trims the wall above and the table below. A minimum rather
 * than a fixed height, so nothing is clipped when the text wraps further —
 * large font settings, zoom, a narrow tablet. */
const BACKGROUND = "/images/getupdates.jpg";
const BAND_HEIGHT = "md:min-h-[350px]";

export default function NewsletterCta() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validation = validateNewsletterForm(email);
    if (!validation.success) {
      toast.error(validation.message);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/resend/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message ?? "You are on the list — thank you!");
        setEmail("");
      } else {
        toast.info(data.message ?? "We could not sign you up right now.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      // On phones the content sets the height; from md up the band is fixed.
      className={`relative isolate grid place-items-center overflow-hidden ${BAND_HEIGHT}`}
    >
      <Image
        src={BACKGROUND}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-[#1f2a17]/80" />

      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 text-center md:px-8 md:py-12 lg:py-14">
        <h2 className="font-display text-[22px] font-bold leading-tight md:font-semibold text-white md:text-[40px]">
          Get Latest Updates & Big Deals
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-[14px] text-white/85">
          Sign up to your newsletters for all the latest update and our exclusive promotion.
        </p>

        <form onSubmit={onSubmit} className="mt-5 flex justify-center" noValidate>
          {/* Side by side needs room for both: on a small phone the button ate
              the field until the placeholder was unreadable, so below sm the
              two stack and each takes the full width. */}
          <div className="flex w-full max-w-[520px] flex-col gap-2 rounded-2xl border border-white/40 bg-white/10 p-2 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-1">
            <label htmlFor="newsletter-email" className="sr-only">
              Your email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email address"
              /* 16px on phones: anything smaller makes iOS Safari zoom the page
                 in when the field is focused, and it does not zoom back out. */
              className="h-11 w-full min-w-0 rounded-full bg-transparent px-5 text-[16px] text-white outline-none placeholder:text-white/70 sm:flex-1 sm:text-[14px]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="font-display h-11 w-full shrink-0 whitespace-nowrap rounded-full bg-brand px-6 text-[15px] text-white transition-colors hover:bg-brand-dark disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? "Sending…" : "Subscribe Now"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
